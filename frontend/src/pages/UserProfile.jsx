import Textarea from "@components/forms/Textarea";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SharedContext from "../contexts/sharedContext";

export default function UserProfile({ setUser }) {
  const { user, token, baseURL, darkMode } = useContext(SharedContext);
  const { id } = useParams();
  const [manager, setManager] = useState();
  const [localUser, setLocalUser] = useState(id === user.id && user);
  // const [errors, setErrors] = useState([]);
  const [savedCorrectly, setSavedCorrectly] = useState(false);
  const handleChange = (e) => {
    let { value } = e.target;
    if (e.target.id === "mail_notification") {
      value = e.target.checked;
    }
    setLocalUser({ ...localUser, [e.target.id]: value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${baseURL}/users/${user.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(localUser),
    })
      .then((response) => {
        if (response.ok) {
          setUser(localUser);
          setSavedCorrectly(true);
        } /* else if (response.errors) {
          // setErrors(response.errors);
        } */
      })
      .catch((error) => console.warn(error));
  };
  useEffect(() => {
    if (id) {
      fetch(`${baseURL}/users/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((userData) => setLocalUser(userData))
        .catch((err) => console.warn(err));
    } else {
      setLocalUser(user);
    }
  }, []);
  useEffect(() => {
    if (localUser && localUser.id_manager) {
      fetch(`${baseURL}/users/${localUser.id_manager}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((managerData) => setManager(managerData))
        .catch((err) => console.warn(err));
    }
  }, [localUser]);
  return (
    <main className="container">
      <div
        className={`${
          darkMode === 2 ? "bg-dark" : "bg-white"
        } w-100 h-100 py-3`}
      >
        {localUser && (
          <section className="row bg-cyan mx-5 my-4 p-3 justify-content-center align-items-center">
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
              <h1>Matricule: {localUser.registration_number}</h1>
              <h1 className="text-break">
                Mail:{" "}
                <Link
                  className="text-warning"
                  to="#"
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
                </Link>
              </h1>
              {manager && (
                <h1>
                  Responsable:{" "}
                  <Link to={`/user/${manager.id}`}>
                    {manager.firstname} {manager.lastname}
                  </Link>
                </h1>
              )}
            </div>
          </section>
        )}
        {localUser && localUser.id === user.id && (
          <section className="m-3 p-3">
            <form onSubmit={handleSubmit}>
              {savedCorrectly && (
                <div className="form-control mb-3 is-valid bg-success">
                  <h2 className="text-uppercase is-valid">Bien noté !</h2>
                  <ul className="mt-1 mb-0 text-dark">
                    <li>Vos modifications ont correctement été enregistrées</li>
                  </ul>
                </div>
              )}
              <span className="lead">
                Cochez la/les case(s) correspondante(s):
              </span>
              <div className="custom-control custom-checkbox pt-3 pb-1">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="mail_notification"
                  checked={localUser.mail_notification}
                  onChange={handleChange}
                />
                <label
                  className="custom-control-label"
                  htmlFor="mail_notification"
                >
                  J'accepte de recevoir des notifications par mail
                </label>
              </div>
              <div className="custom-control custom-checkbox pb-3">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="rgpd_agreement"
                  disabled
                  checked={localUser.rgpd_agreement}
                />
                <label
                  className="custom-control-label"
                  htmlFor="rgpd_agreement"
                >
                  J'accepte les conditions d'utilisation de mes données
                  personnelles ci-dessous tel que le nécessite le RGPD
                </label>
              </div>
              <Textarea
                id="skills"
                onChange={handleChange}
                label="Compétences"
                placeholder="Indiquez ici vos compétences que vous souhaitez mettre à disposition d'éventuels innovateurs"
                value={localUser.skills}
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
