import PropTypes from "prop-types";
import Select from "@components/forms/Select";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Input from "@components/forms/Input";
import Pagination from "@components/Pagination";
import SharedContext from "../../contexts/sharedContext";

export default function Users({
  setSelected,
  setSelectedToDelete,
  selected,
  addOpenAddModal,
  addRemoveCallback,
  searchFilters,
  setSearchFilters,
}) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState();
  const [lastChangedUser, setLastChangedUser] = useState();
  const [userModification, setUserModification] = useState({});
  const [checkPassword, setCheckPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [notification, setNotification] = useState();
  const location = useLocation();
  const {
    roles,
    organisations,
    teams,
    customFetch,
    darkMode,
    setIsLoading,
    addToast,
  } = useContext(SharedContext);
  const formatted = {
    roles: roles.map((role) => {
      return { ...role, id: role.id_role };
    }),
    teams: teams.map((team) => {
      return { ...team, id: team.id_team };
    }),
    organisations: organisations.map((organisation) => {
      return { ...organisation, id: organisation.id_organisation };
    }),
  };
  const selectAll = () => {
    if (selected.length === users.length) {
      setSelectedToDelete([]);
    } else {
      setSelectedToDelete(users.map((u) => u.id_user));
    }
  };
  const handleChange = (e) => {
    if (addMode) {
      const { value, id } = e.target;
      setUserModification({ ...userModification, [id]: value });
    } else {
      const [element] = e.target.id.split("_");
      const { value } = e.target;
      setUserModification({ ...userModification, [`id_${element}`]: value });
    }
  };
  const handleClick = (e) => {
    if (e) {
      e.preventDefault();
    }
    setNotification();
    setLastChangedUser();
    setUserModification({});
    const userId = parseInt(
      e.target.parentElement.dataset.value ||
        e.target.parentElement.parentElement.dataset.value,
      10
    );
    setSelectedUser(users.find((user) => user.id_user === userId));
  };
  const handleApply = () => {
    if (
      addMode ||
      userModification.id_organisation ||
      userModification.id_role ||
      userModification.id_team
    ) {
      setIsLoading(true);
      customFetch(
        `${import.meta.env.VITE_BACKEND_URL}/users${
          addMode ? "" : `/${selectedUser.id_user}`
        }`,
        addMode ? "POST" : "PUT",
        userModification
      )
        .then((response) => {
          if (response.errors) {
            setErrors(response.errors);
          } else {
            setNotification({
              success: true,
              add: addMode,
              user: userModification,
            });
            const newUsers = addMode ? [...users] : [];
            let newElem = addMode
              ? { ...userModification, id_user: response.id }
              : {};
            if (!addMode) {
              for (let i = 0; i < users.length; i += 1) {
                if (users[i].id_user === selectedUser.id_user) {
                  newUsers[i] = { ...users[i], ...userModification };
                  newElem = newUsers[i];
                } else {
                  newUsers[i] = users[i];
                }
              }
            } else {
              newUsers.push(newElem);
            }
            setUsers(newUsers);
            setLastChangedUser(newElem.id_user);
            setUserModification({});
            setCheckPassword("");
            setSelectedUser();
            setIsLoading(false);
            setErrors([]);
            $(".modal").modal("hide");
            addToast({
              title: addMode ? "Utilisateur créé" : "Utilisateur modifié",
              message: (
                <div>
                  L'utilisateur{" "}
                  <b>
                    {newElem.firstname} {newElem.lastname}
                  </b>{" "}
                  a bien été {addMode ? "créé" : "modifié"} !
                </div>
              ),
            });
          }
        })
        .catch(() => {
          setNotification({});
          setCheckPassword("");
          setLastChangedUser();
        })
        .finally(() => {
          setSelectedUser();
          setIsLoading(false);
        });
    } else {
      setNotification();
      setCheckPassword("");
      setLastChangedUser();
      setSelectedUser();
    }
  };

  useEffect(() => {
    addOpenAddModal("users", () => {
      if (
        !userModification.id_organisation ||
        !userModification.id_team ||
        !userModification.id_role
      ) {
        setErrors([]);
        setUserModification({
          ...userModification,
          id_organisation: organisations[0].id_organisation,
          id_team: teams[0].id_team,
          id_role: roles[0].id_role,
        });
      }
      setAddMode(true);
      $("#actionModal").modal("show");
      $("#actionModal").on("hidden.bs.modal", () => {
        setAddMode(false);
      });
    });
    addRemoveCallback("users", (deletedIds) => {
      if (deletedIds.length) {
        setUsers([
          ...users.filter((user) => !deletedIds.includes(user.id_user)),
        ]);
        setNotification({
          success: true,
          delete: true,
          deleted: deletedIds.length,
        });
      } else {
        setNotification({});
      }
    });
  }, []);
  useEffect(() => {
    if (window.loadTimeout) {
      clearTimeout(window.loadTimeout);
    }
    window.loadTimeout = setTimeout(
      () => {
        setIsLoading(true);
        customFetch(
          `${import.meta.env.VITE_BACKEND_URL}/users?${searchFilters}`
        )
          .then((data) => {
            setUsers(data.users);
            setTotal(data.total);
            setIsLoading(false);
            clearTimeout(window.loadTimeout);
            window.loadTimeout = undefined;
          })
          .catch(() => {
            setIsLoading(true);
            clearTimeout(window.loadTimeout);
            window.loadTimeout = undefined;
          });
      },
      !searchFilters.get("search_terms") ? 0 : 600
    );
  }, [searchFilters]);
  useEffect(() => {
    const errorShowed = errors.find((error) => error.param === "checkpassword");
    if (
      userModification.password &&
      userModification.password !== checkPassword &&
      !errorShowed
    ) {
      setErrors([
        ...errors,
        {
          param: "checkpassword",
          msg: "Les mots de passe ne correspondent pas.",
        },
      ]);
    } else if (userModification.password === checkPassword && errorShowed) {
      setErrors([...errors.filter((error) => error.param !== "checkpassword")]);
    }
  }, [userModification, checkPassword]);
  useEffect(() => {
    if (location.pathname === "/manage/users") {
      setIsLoading(false);
    }
  }, [location.pathname]);

  return (
    <section>
      <p
        className={`text-${
          darkMode === 0 && notification && notification.success
            ? "warning"
            : ""
        }${
          darkMode !== 0 && notification && notification.success
            ? "primary"
            : ""
        }${
          notification && !notification.success ? "danger" : ""
        } pl-4 pt-2 pb-2 font-weight-medium`}
        style={{ minHeight: "20px" }}
      >
        {notification ? (
          <>
            {notification.success ? (
              <>
                <i className="icons-checked mr-2" aria-hidden="true" />
                {notification.delete ? (
                  `Suppression de ${notification.deleted} utilisateur${
                    notification.deleted > 1 ? "s" : ""
                  } `
                ) : (
                  <>
                    {notification.add ? "Création" : "Modification"} de{" "}
                    <b>
                      {notification.user.firstname} {notification.user.lastname}{" "}
                    </b>
                  </>
                )}
                effectuée
              </>
            ) : (
              "La modification n'a pas pu être appliquée ! Veuillez réessayer ultérieurement."
            )}{" "}
          </>
        ) : (
          ""
        )}
      </p>
      <Pagination
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        total={total}
      />
      <ul className="list-group">
        <li
          id="group1"
          className="list-group-item management-item management-item-group"
        >
          <div className="management-item-content management-item-group py-0">
            <div className="management-item-symbol ml-5 d-flex align-items-center">
              <div className="custom-control custom-checkbox align-middle">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  aria-label="Sélectionner/desélectionner tout pour suppression"
                  id="selectall"
                  onClick={selectAll}
                />
                <label className="custom-control-label" htmlFor="selectall">
                  &nbsp;&nbsp;
                </label>
              </div>
            </div>
            <div className="management-item-main">
              <h2 className="mb-0 text-base col col-lg-3">Nom</h2>
              <h2 className="mb-0 text-base col-lg-2 col-xl-1 mr-2 d-none d-lg-block">
                Matricule
              </h2>
              <span className="col-6 ml-2 col-lg-5 col-xl-6 d-none d-lg-block">
                <h2 className="m-0 p-0 text-left">Organisation / Equipe</h2>
              </span>
              <span className="col-">
                <h2 className="m-0 p-0 text-left">Role</h2>
              </span>
            </div>
          </div>
        </li>
        {users &&
          users.map((user) => (
            <li
              id="group1"
              className={`list-group-item management-item management-item-group ${
                lastChangedUser === user.id_user ? "last-changed" : ""
              }`}
              key={user.id_user}
            >
              <div
                className="management-item-content"
                data-value={user.id_user}
              >
                <div className="management-item-symbol ml-5 d-flex align-items-center">
                  <div className="custom-control custom-checkbox align-middle">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      value={user.id_user}
                      aria-label="Sélectionner pour suppression"
                      id={`delete_${user.id_user}`}
                      onChange={setSelected}
                      checked={selected.includes(user.id_user)}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor={`delete_${user.id_user}`}
                    >
                      <i
                        className="icons-circle-account-connected icons-size-1x5 mt-n1 ml-n3 d-block"
                        aria-hidden="true"
                      />
                    </label>
                  </div>
                </div>
                <div
                  className="management-item-main"
                  data-toggle="modal"
                  aria-hidden="true"
                  data-target="#actionModal"
                  onClick={handleClick}
                >
                  <h2 className="mb-0 text-base font-weight-normal col col-lg-3">
                    {user.firstname} {user.lastname}
                  </h2>
                  <h2 className="mb-0 text-base font-weight-normal col-lg-2 col-xl-1 mr-2 d-none d-lg-block text-break">
                    {user.registration_number}
                  </h2>
                  <span className="col-6 ml-2 col-lg-5 col-xl-6 d-none d-lg-block">
                    {
                      organisations.find(
                        (organisation) =>
                          organisation.id_organisation === user.id_organisation
                      ).name
                    }{" "}
                    / {teams.find((team) => team.id_team === user.id_team).name}{" "}
                    ({user.id_team})
                  </span>
                  <span className="col-">
                    {roles.find((role) => role.id_role === user.id_role).name}
                  </span>
                </div>
              </div>
            </li>
          ))}
      </ul>
      <div
        className="modal fade"
        id="actionModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="actionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="h1 modal-title" id="actionModalLabel">
                {addMode
                  ? "Nouvel utilisateur"
                  : `Modification de ${
                      (selectedUser && selectedUser.firstname) || ""
                    } ${(selectedUser && selectedUser.lastname) || ""}`}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Annuler"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body mb-4">
              {addMode ? (
                <>
                  <Input
                    id="firstname"
                    value={
                      (userModification && userModification.firstname) || ""
                    }
                    label="Prénom:"
                    onChange={handleChange}
                    required
                    errorMessages={errors}
                  />
                  <Input
                    id="lastname"
                    value={
                      (userModification && userModification.lastname) || ""
                    }
                    label="Nom:"
                    onChange={handleChange}
                    required
                    errorMessages={errors}
                  />
                  <Input
                    id="registration_number"
                    value={
                      (userModification &&
                        userModification.registration_number) ||
                      ""
                    }
                    label="Matricule:"
                    onChange={handleChange}
                    required
                    errorMessages={errors}
                  />
                  <Input
                    id="mail"
                    value={(userModification && userModification.mail) || ""}
                    type="email"
                    label="Adresse mail:"
                    onChange={handleChange}
                    required
                    errorMessages={errors}
                  />
                  <Input
                    id="password"
                    type="password"
                    value={
                      (userModification && userModification.password) || ""
                    }
                    label="Mot de passe:"
                    onChange={handleChange}
                    required
                    errorMessages={errors
                      .filter(
                        (error) =>
                          error.param === "password" ||
                          error.param === "checkpassword"
                      )
                      .map((error) => {
                        return { param: "password", msg: error.msg };
                      })}
                  />
                  <Input
                    id="checkpassword"
                    type="password"
                    label="Vérification du mot de passe:"
                    value={checkPassword}
                    onChange={(e) => setCheckPassword(e.target.value)}
                    required
                    errorMessages={errors}
                  />
                </>
              ) : (
                <>
                  <div>
                    Matricule:{" "}
                    {selectedUser && selectedUser.registration_number}
                  </div>
                  <div>
                    Mail:{" "}
                    <button
                      className="btn btn-link"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location = `mailto:${selectedUser.mail};`;
                      }}
                    >
                      {selectedUser && selectedUser.mail}
                    </button>
                  </div>
                </>
              )}
              <Select
                id={
                  addMode
                    ? "id_organisation"
                    : `organisation_${selectedUser && selectedUser.id_user}`
                }
                label=""
                ariaLabel="Organisation"
                selectedValue={
                  addMode
                    ? (userModification && userModification.id_organisation) ||
                      organisations[0].id_organisation
                    : (userModification && userModification.id_organisation) ||
                      (selectedUser && selectedUser.id_organisation) ||
                      organisations[0].id_organisation
                }
                values={formatted.organisations}
                setSelectedValue={handleChange}
              />
              <Select
                id={
                  addMode
                    ? "id_team"
                    : `team_${selectedUser && selectedUser.id_user}`
                }
                label=""
                ariaLabel="Team"
                selectedValue={
                  addMode
                    ? (userModification && userModification.id_team) ||
                      teams[0].id_team
                    : (userModification && userModification.id_team) ||
                      (selectedUser && selectedUser.id_team) ||
                      teams[0].id_team
                }
                values={
                  addMode
                    ? formatted.teams.filter(
                        (team) =>
                          userModification &&
                          team.id_organisation ===
                            userModification.id_organisation
                      )
                    : (selectedUser &&
                        formatted.teams.filter(
                          (team) =>
                            selectedUser &&
                            team.id_organisation ===
                              selectedUser.id_organisation
                        )) ||
                      formatted.teams
                }
                setSelectedValue={handleChange}
              />
              <Select
                id={
                  addMode
                    ? "id_role"
                    : `role_${selectedUser && selectedUser.id_user}`
                }
                label=""
                ariaLabel="Role"
                selectedValue={
                  addMode
                    ? (userModification && userModification.id_role) ||
                      roles[0].id_role
                    : (userModification && userModification.id_role) ||
                      (selectedUser && selectedUser.id_role) ||
                      roles[0].id_role
                }
                values={formatted.roles}
                setSelectedValue={handleChange}
              />
            </div>
            <div className="modal-footer justify-content-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedUser();
                  setNotification();
                }}
                data-dismiss="modal"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleApply}
                className={`btn btn-${darkMode === 0 ? "warning" : "primary"}`}
                disabled={
                  addMode
                    ? userModification.password !== checkPassword ||
                      !userModification.firstname ||
                      !userModification.lastname ||
                      !userModification.registration_number ||
                      !userModification.mail
                    : false
                }
              >
                {addMode ? "Créer" : "Appliquer les modifications"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Pagination
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        total={total}
      />
    </section>
  );
}

Users.propTypes = {
  selected: PropTypes.arrayOf(PropTypes.number),
  setSelected: PropTypes.func,
  setSelectedToDelete: PropTypes.func,
  addOpenAddModal: PropTypes.func,
  addRemoveCallback: PropTypes.func,
  searchFilters: PropTypes.instanceOf(URLSearchParams).isRequired,
  setSearchFilters: PropTypes.func,
};
Users.defaultProps = {
  selected: [],
  setSelected: null,
  setSelectedToDelete: null,
  addOpenAddModal: null,
  addRemoveCallback: null,
  setSearchFilters: null,
};
