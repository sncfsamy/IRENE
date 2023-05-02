import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import Input from "@components/forms/Input";
import Selector from "@components/Selector";
import Pagination from "@components/Pagination";
import { useLocation } from "react-router-dom";
import SharedContext from "../../contexts/sharedContext";

export default function Roles({
  setRoles,
  setSelected,
  setSelectedToDelete,
  selected,
  addOpenAddModal,
  addRemoveCallback,
  searchFilters,
  setSearchFilters,
}) {
  const [selectedRole, setSelectedRole] = useState({});
  const [lastChangedRole, setLastChangedRole] = useState();
  const [roleModification, setRoleModification] = useState({});
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [errors, setErrors] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [notification, setNotification] = useState();
  const location = useLocation();
  const { roles, customFetch, darkMode, setIsLoading, addToast } =
    useContext(SharedContext);
  const permissions = [
    { id: "manage_ideas_manager", name: "Valideur des idées de son équipe" },
    {
      id: "manage_ideas_ambassador",
      name: "Valideur des idées de son organisation",
    },
    { id: "manage_ideas_all", name: "Gestion de toutes les idées" },
    {
      id: "manage_challenges_ambassador",
      name: "Gestion des challenges de l'organisation",
    },
    { id: "manage_challenges_all", name: "Gestion de tous les challenges" },
    { id: "manage_users", name: "Gestion des utilisateurs" },
    { id: "manage_categories", name: "Gestion des catégories" },
    { id: "manage_organisations", name: "Gestion des organisations" },
    { id: "manage_teams", name: "Gestion des équipes" },
    { id: "manage_roles", name: "Gestion des roles" },
    { id: "manage_all", name: "Administrateur (accès complet)" },
  ];
  const handleChange = (e) => {
    const newRole = {
      ...selectedRole,
      ...roleModification,
    };
    if (e.target.id === "name") {
      newRole.name = e.target.value;
    } else {
      const rolePerms = [...rolePermissions];
      if (e.target.checked && !rolePerms.includes(e.target.dataset.id)) {
        rolePerms.push(e.target.dataset.id);
      } else if (!e.target.checked && rolePerms.includes(e.target.dataset.id)) {
        rolePerms.splice(rolePerms.indexOf(e.target.dataset.id), 1);
      }
      setRolePermissions(rolePerms);
      for (const perm in permissions) {
        if (permissions[perm]) {
          newRole[permissions[perm].id] = rolePerms.includes(
            permissions[perm].id
          );
        }
      }
    }
    setRoleModification(newRole);
  };
  const selectAll = () => {
    if (selected.length === roles.length) {
      setSelectedToDelete([]);
    } else {
      setSelectedToDelete(roles.map((role) => role.id_role));
    }
  };
  const handleClick = (e) => {
    setNotification();
    setLastChangedRole();
    setRoleModification({});
    const roleId = parseInt(
      e.target.parentElement.dataset.value ||
        e.target.parentElement.parentElement.dataset.value,
      10
    );
    const role = roles.find((r) => r.id_role === roleId) || roleModification;
    const rolePerms = [];
    for (const perm in role) {
      if (perm !== "id_role" && perm !== "name" && role[perm]) {
        rolePerms.push(perm);
      }
    }
    setSelectedRole(role);
    setRolePermissions(rolePerms);
  };
  const handleApply = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (
      addMode ||
      roleModification.name ||
      permissions.find((perm) => roleModification[perm.id])
    ) {
      setIsLoading(true);
      customFetch(
        `${import.meta.env.VITE_BACKEND_URL}/roles${
          addMode ? "" : `/${selectedRole.id_role}`
        }`,
        addMode ? "POST" : "PUT",
        roleModification
      )
        .then((response) => {
          if (response.errors) {
            setErrors(response.errors);
          } else {
            setNotification({
              success: true,
              add: addMode,
              role: roleModification,
            });
            const newElems = addMode ? [...roles] : [];
            let newRole = addMode
              ? { ...roleModification, id_role: response.id }
              : {};
            if (!addMode) {
              for (let i = 0; i < roles.length; i += 1) {
                if (roles[i].id_role === selectedRole.id_role) {
                  newElems[i] = { ...roles[i], ...roleModification };
                  newRole = newElems[i];
                } else {
                  newElems[i] = roles[i];
                }
              }
            } else {
              newElems.push(newRole);
            }
            setRoles(newElems);
            setLastChangedRole(newRole.id_role);
            setRoleModification({});
            $(".modal").modal("hide");
            addToast({
              title: addMode ? "Role créé" : "Role modifié",
              message: (
                <div>
                  Le role <b>{newRole.name}</b> a bien été{" "}
                  {addMode ? "créé" : "modifié"} !
                </div>
              ),
            });
          }
        })
        .catch((err) => {
          console.error(err);
          setLastChangedRole();
          setNotification({});
        })
        .finally(() => {
          setSelectedRole({});
          setIsLoading(false);
        });
    } else {
      setNotification();
      setLastChangedRole();
      setSelectedRole({});
    }
  };

  useEffect(() => {
    if (location.pathname === "/manage/roles") {
      setIsLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    addOpenAddModal("roles", () => {
      setAddMode(true);
      $("#actionModal").modal("show");
      $("#actionModal").on("hidden.bs.modal", () => {
        setAddMode(false);
      });
    });
    addRemoveCallback("roles", (deletedIds) => {
      if (deletedIds.length) {
        setRoles([
          ...roles.filter((role) => !deletedIds.includes(role.id_role)),
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
    let results = [...roles];
    if (
      searchFilters.has("search_terms") &&
      searchFilters.get("search_terms")
    ) {
      results = results.filter((element) =>
        element.name
          .toLowerCase()
          .includes(searchFilters.get("search_terms").toLowerCase())
      );
    }

    results = results.filter(
      (_, i) =>
        i >= (searchFilters.get("page") - 1) * searchFilters.get("limit") &&
        i < searchFilters.get("page") * searchFilters.get("limit")
    );

    setFilteredRoles(results);
    setIsLoading(false);
  }, [searchFilters, roles]);
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
                  `Suppression de ${notification.deleted} role${
                    notification.deleted > 1 ? "s" : ""
                  } `
                ) : (
                  <>
                    {notification.add ? "Création" : "Modification"} du role{" "}
                    <b>{notification.role.name} </b>
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
        total={
          searchFilters.has("search_terms") && searchFilters.get("search_terms")
            ? filteredRoles.length
            : roles.length
        }
      />
      <ul className="list-group">
        <li id="group1" className="list-group-item management-item management-item-group">
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
            <div className="management-item-main text-left">
              <h2 className="m-0 p-0 text-left">Nom</h2>
            </div>
            <div className="management-item-symbol text-left">
              <button
                className="btn btn-link"
                type="button"
                tabIndex="0"
                data-toggle="popover"
                data-trigger="focus"
                title="Utilisateurs"
                data-content="Nombre d'utilisateurs possédant ce role"
              >
                <span className="sr-only">
                  Nombre d'utilisateurs possédant ce role
                </span>
                <i className="icons-circle-account-connected" />
              </button>
            </div>
          </div>
        </li>
        {filteredRoles &&
          filteredRoles.map((role) => (
            <li
              id="group1"
              className={`list-group-item management-item management-item-group ${
                lastChangedRole === role.id_role ? "last-changed" : ""
              }`}
              key={role.id_role}
            >
              <div
                className="management-item-content py-0"
                data-value={role.id_role}
              >
                <div className="management-item-symbol ml-5 d-flex align-items-center">
                  <div className="custom-control custom-checkbox align-middle">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      value={role.id_role}
                      aria-label="Sélectionner pour suppression"
                      id={`delete_${role.id_role}`}
                      onChange={setSelected}
                      checked={selected.includes(role.id_role)}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor={`delete_${role.id_role}`}
                    >
                      <i
                        className="icons-menu-account icons-size-1x5 mt-n2 ml-n3 d-block"
                        aria-hidden="true"
                      />
                    </label>
                  </div>
                </div>
                <div
                  className="management-item-main text-left"
                  data-toggle="modal"
                  data-target="#actionModal"
                  aria-hidden="true"
                  onClick={handleClick}
                >
                  {role.name}
                </div>
                <div className="management-item-symbol text-left mr-1">
                  {role.users}
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
        <div
          className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
          role="document"
        >
          <div
            className="modal-content"
            style={{ overflowY: "scroll", maxHeight: "85%" }}
          >
            <div className="modal-header">
              <h5 className="h1 modal-title" id="actionModalLabel">
                {addMode
                  ? "Nouveau role"
                  : `Modification de
                ${selectedRole ? `${selectedRole.name}` : ""}`}{" "}
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
            <form onSubmit={handleApply}>
              <div className="modal-body mt-3">
                <Input
                  label="Nom"
                  required
                  placeHolder="Entrez le nom du role ici"
                  maxChars="255"
                  errorMessages={errors}
                  id="name"
                  value={
                    addMode
                      ? (roleModification && roleModification.name) || ""
                      : (roleModification && roleModification.name) ||
                        (selectedRole && selectedRole.name) ||
                        ""
                  }
                  onChange={handleChange}
                />
                <Selector
                  id="permissions"
                  label="Autorisations:"
                  values={permissions}
                  selectedValues={rolePermissions}
                  onChange={handleChange}
                  errorMessages={errors}
                />
              </div>
              <div className="modal-footer justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedRole();
                    setNotification();
                  }}
                  data-dismiss="modal"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  onClick={handleApply}
                  className={`btn btn-${
                    darkMode === 0 ? "warning" : "primary"
                  }`}
                  disabled={!roleModification?.name && !selectedRole?.name}
                >
                  {addMode ? "Créer" : "Appliquer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Pagination
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        total={
          searchFilters.has("search_terms") && searchFilters.get("search_terms")
            ? filteredRoles.length
            : roles.length
        }
      />
    </section>
  );
}

Roles.propTypes = {
  setRoles: PropTypes.func,
  selected: PropTypes.arrayOf(PropTypes.number),
  setSelected: PropTypes.func,
  setSelectedToDelete: PropTypes.func,
  addOpenAddModal: PropTypes.func,
  addRemoveCallback: PropTypes.func,
  searchFilters: PropTypes.instanceOf(URLSearchParams).isRequired,
  setSearchFilters: PropTypes.func,
};
Roles.defaultProps = {
  selected: [],
  setRoles: null,
  setSelected: null,
  setSelectedToDelete: null,
  addOpenAddModal: null,
  addRemoveCallback: null,
  setSearchFilters: null,
};
