import Textarea from "@components/forms/Textarea";
import Selector from "@components/Selector";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SharedContext from "../contexts/sharedContext";

export default function UserProfile() {
  const {
    user,
    categories,
    organisations,
    teams,
    darkMode,
    customFetch,
    setIsLoading,
  } = useContext(SharedContext);
  const { id } = useParams();
  const [localUser, setLocalUser] = useState(id === user.id_user && user);
  const [errors, setErrors] = useState([]);
  const [savedCorrectly, setSavedCorrectly] = useState(false);
  const handleChange = (e) => {
    let { value } = e.target;
    if (e.target.id === "mail_notification") {
      value = e.target.checked;
    }
    setLocalUser({ ...localUser, [e.target.id]: value });
  };
  const handleChangeCategories = (event) => {
    let updatedList = [...localUser.categories];
    const value = parseInt(event.target.dataset.id, 10);
    const parentCategorie = categories.find(
      (categorie) => categorie.id_categorie === value
    ).id_parent_categorie;
    if (event.target.checked) {
      if (!updatedList.includes(value)) updatedList.push(value);
      if (!parentCategorie) {
        updatedList = [
          ...updatedList,
          ...categories
            .filter((catToFilter) => {
              if (
                !updatedList.includes(catToFilter.id_categorie) &&
                catToFilter.id_parent_categorie === value
              ) {
                return true;
              }
              return false;
            })
            .map((cat) => cat.id_categorie),
        ];
      } else if (
        updatedList.filter(
          (categorie) =>
            categories.find((cat) => cat.id_categorie === categorie)
              .id_parent_categorie === parentCategorie
        ).length ===
        categories.filter(
          (categorie) => categorie.id_parent_categorie === parentCategorie
        ).length
      ) {
        updatedList.push(parentCategorie);
      }
    } else {
      if (localUser.categories.includes(value))
        updatedList.splice(localUser.categories.indexOf(value), 1);
      if (!parentCategorie) {
        categories.forEach((catToFilter) => {
          if (
            updatedList.includes(catToFilter.id_categorie) &&
            categories.find(
              (categorie) => categorie.id_categorie === catToFilter.id_categorie
            ).id_parent_categorie === value
          ) {
            updatedList.splice(
              updatedList.indexOf(catToFilter.id_categorie),
              1
            );
          }
        });
      } else if (updatedList.includes(parentCategorie)) {
        updatedList.splice(updatedList.indexOf(parentCategorie), 1);
      }
    }
    setLocalUser({ ...localUser, categories: updatedList });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/${user.id_user}`,
      "PUT",
      localUser
    )
      .then((response) => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        if (response.errors) {
          setSavedCorrectly(false);
          setErrors(response.errors);
        } else {
          setSavedCorrectly(true);
          setErrors([]);
        }
      })
      .catch((error) => {
        console.warn(error);
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        setSavedCorrectly(false);
        setErrors([
          "Nous rencontrons actuellement un problème !",
          "Merci de réessayer ultérieurement.",
        ]);
      });
  };
  useEffect(() => {
    if (id) {
      customFetch(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`)
        .then((userData) => {
          setLocalUser(userData);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn(err);
          setIsLoading(false);
        });
    } else {
      setLocalUser(user);
    }
    setIsLoading(false);
  }, [id]);
  useEffect(() => {
    if (localUser.id_user === user.id_user) {
      setLocalUser(user);
    } // avoid RGPD to come on userProfile page
  }, [user]);

  return (
    <main className="container">
      <div
        className={`${
          darkMode === 2 ? "bg-primary" : "bg-white"
        } w-100 h-100 py-3`}
      >
        {localUser && (
          <section
            className={`row ${darkMode === 0 ? "bg-cyan" : ""} ${
              darkMode === 1 ? "bg-primary" : ""
            } ${
              darkMode === 2 ? "bg-gray" : ""
            } mx-5 my-4 p-3 justify-content-center align-items-center`}
          >
            <div
              className="col-4 d-none d-md-none d-lg-block d-xl-block align-middle"
              style={{ fontSize: "250px" }}
            >
              <i
                className="icons-circle-account-connected"
                aria-hidden="true"
                alt={`Photo de ${localUser.firstname} ${localUser.lastname}`}
              />
            </div>
            <div
              className="col-4 d-none d-sm-none d-md-block d-lg-none d-xl-none"
              style={{ fontSize: "180px" }}
            >
              <i
                className="icons-circle-account-connected"
                aria-hidden="true"
                alt={`Photo de ${localUser.firstname} ${localUser.lastname}`}
              />
            </div>
            <div
              className="col-5 d-none d-sm-block d-md-none d-lg-none d-xl-none"
              style={{ fontSize: "130px" }}
            >
              <i
                className="icons-circle-account-connected"
                aria-hidden="true"
                alt={`Photo de ${localUser.firstname} ${localUser.lastname}`}
              />
            </div>
            <div
              className="col-sm row-fluid d-block d-sm-none text-center w-100"
              style={{ fontSize: "150px" }}
            >
              <i
                className="icons-circle-account-connected"
                aria-hidden="true"
                alt={`Photo de ${localUser.firstname} ${localUser.lastname}`}
              />
            </div>
            <div className="col m-2 pt-5 pl-0 ml-0 text-left">
              <h1
                className="font-weight-medium d-none d-sm-block"
                style={{ fontSize: "40px" }}
              >
                {localUser.firstname} {localUser.lastname}
              </h1>
              <h2
                className="font-weight-medium d-block d-sm-none"
                style={{ fontSize: "24px" }}
              >
                {localUser.firstname} {localUser.lastname}
              </h2>
              <h2>
                {
                  organisations.find(
                    (organisation) =>
                      organisation.id_organisation === localUser.id_organisation
                  ).name
                }{" "}
                /{" "}
                {teams.find((team) => team.id_team === localUser.id_team).name}
              </h2>
              <br />
              <h2>Matricule: {localUser.registration_number}</h2>
              <h2 className="text-break">
                Mail:{" "}
                <button
                  className="btn btn-link"
                  type="button"
                  onClick={(e) => {
                    window.location.href = `mailto:${localUser.mail}`;
                    e.preventDefault();
                  }}
                >
                  {localUser.mail}
                  <i
                    className="icons-external-link icons-size-1x25 ml-2"
                    aria-hidden="true"
                  />
                </button>
              </h2>
              {localUser.managers &&
                localUser.managers.find(
                  (manager) => manager.id_user === parseInt(id, 10)
                ) === undefined &&
                (id ||
                  localUser.managers.find(
                    (manager) => manager.id_user === user.id_user
                  ) === undefined) && (
                  <h2>
                    Responsable{localUser.managers.length > 1 ? "s" : ""}:{" "}
                    {localUser.managers.map((manager, i) => (
                      <span key={manager.id_user}>
                        {i > 0 ? "," : ""}
                        <Link
                          to={`${import.meta.env.VITE_FRONTEND_URI}/user/${
                            manager.id_user
                          }`}
                        >
                          {manager.firstname} {manager.lastname}
                        </Link>
                      </span>
                    ))}
                  </h2>
                )}
              <br />
              <h3>
                <Link
                  to={`${import.meta.env.VITE_FRONTEND_URI}/search?users=${
                    localUser.id_user
                  }`}
                >
                  Consulter {localUser.id_user === user.id_user ? "m" : "s"}es
                  innovations
                </Link>
              </h3>
            </div>
          </section>
        )}
        {localUser && localUser.id_user === user.id_user && (
          <section
            className={`m-3 p-3 ${darkMode === 2 ? "bg-dark" : ""}${
              darkMode === 1 ? "bg-light" : ""
            } `}
          >
            <form onSubmit={handleSubmit}>
              {savedCorrectly ? (
                <div className="form-control mb-3 is-valid bg-success">
                  <h2 className="text-uppercase is-valid">Bien noté !</h2>
                  <ul className="mt-1 mb-0 text-dark">
                    <li>Vos modifications ont correctement été enregistrées</li>
                  </ul>
                </div>
              ) : (
                ""
              )}
              {errors.length ? (
                <div className="form-control mb-3 bg-warning">
                  <h2 className="text-uppercase">
                    Oups ! Nous avons un problème:
                  </h2>
                  <ul className="mt-1 mb-0 text-dark">
                    {errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                ""
              )}
              <Textarea
                id="skills"
                onChange={handleChange}
                label="Compétences"
                placeholder="Indiquez ici vos compétences que vous souhaitez mettre à disposition d'éventuels innovateurs"
                value={localUser.skills}
              />
              <span className="lead">
                Cochez la/les case(s) correspondante(s):
              </span>
              <div className="custom-control custom-checkbox pt-3 pb-3">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="rgpd_agreement"
                  disabled
                  checked={localUser.rgpd_agreement}
                />
                <label
                  className="custom-control-label btn-link text-warning"
                  htmlFor="rgpd_agreement"
                >
                  J'accepte les conditions d'utilisation de mes données
                  personnelles ci-dessous tel que le nécessite le RGPD
                </label>
              </div>
              <div className="custom-control custom-checkbox pb-3">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="mail_notification"
                  checked={localUser.mail_notification}
                  onChange={handleChange}
                />
                <label
                  className="custom-control-label btn-link"
                  htmlFor="mail_notification"
                >
                  J'accepte de recevoir des notifications par mail
                </label>
              </div>
              <Selector
                id="categorie_subscribe"
                className="px-3"
                label="Sélectionnez les catégories auxquelles vous souhaitez souscrire pour la newsletter:"
                values={categories.map((categorie) => {
                  return {
                    id: categorie.id_categorie,
                    name: categorie.name,
                    id_parent: categorie.id_parent_categorie,
                  };
                })}
                selectedValues={localUser.categories}
                onChange={handleChangeCategories}
                disabled={!localUser.mail_notification}
                errorMessages={[]}
              />
              <div className="w-100 text-right">
                <button className="btn btn-warning m-3" type="submit">
                  Enregistrer
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
