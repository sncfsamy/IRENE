import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import SharedContext from "../contexts/sharedContext";
import Input from "./forms/Input";

export default function UserSearchSelect({ users, setUsers, label }) {
  const { darkMode, customFetch } = useContext(SharedContext);
  const [userSearchResults, setUserSearchResults] = useState([]); // utilisateurs en retour du back après recherche
  const [selectedUsers, setSelectedUsers] = useState([]); // utilisateurs sélectionnés pour le filtrage
  const [searchUserValue, setSearchUserValue] = useState(""); // valeur pour recherche utilisateur
  useEffect(() => {
    if (!users.length) {
      setSelectedUsers([]);
    } else if (
      users[0] &&
      typeof users[0] === "number" &&
      selectedUsers.find(
        (uf) =>
          !users.includes(uf.id_user) &&
          !users.find((user) => user && user.id_user === uf.id_user)
      )
    ) {
      customFetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/search?${new URLSearchParams(
          { users }
        )}`
      )
        .then((usersData) => setSelectedUsers(usersData))
        .catch();
    } else if (users[0] && typeof users[0] !== "number") {
      const newSelectedUsers = [];
      users.forEach((user) => {
        if (user && user.id_user) {
          newSelectedUsers.push(user);
        }
      });
      setSelectedUsers(newSelectedUsers);
    }
  }, [users]);
  const handleUserSelect = (e) => {
    const uid = parseInt(e.target.dataset.value, 10);
    const userToAdd = userSearchResults.find((u) => u.id_user === uid);
    if (
      userToAdd &&
      !selectedUsers.find((u) => u.id_user === userToAdd.id_user)
    ) {
      const newUserSearch = [...userSearchResults];
      const newUsersForSearch = [...selectedUsers, userToAdd];
      newUserSearch.splice(newUserSearch.find((user) => user.id_user === uid));
      setSelectedUsers(newUsersForSearch);
      setUserSearchResults(newUserSearch);
      setUsers(newUsersForSearch.map((user) => user.id_user));
      setSearchUserValue("");
    }
  };
  const handleUserDeselect = (e) => {
    const uid = parseInt(e.target.dataset.value, 10);
    const newSelectedUsers = selectedUsers.filter((u) => u.id_user !== uid);
    setSelectedUsers(newSelectedUsers);
    setUsers(newSelectedUsers.map((user) => user.id_user));
  };
  const handleUserSearch = (e) => {
    setSearchUserValue(e.target.value);
    if (window.searchUserTimeout) {
      clearTimeout(window.searchUserTimeout);
      window.searchUserTimeout = null;
    }
    if (e.target.value.length > 2) {
      window.searchUserTimeout = setTimeout(() => {
        customFetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/users/search?${new URLSearchParams({
            search_terms: e.target.value,
          })}`
        ).then((responseData) =>
          setUserSearchResults(
            responseData.filter(
              (u) => !selectedUsers.find((us) => us.id_user === u.id_user)
            )
          )
        );
      }, 600);
    } else {
      setUserSearchResults();
    }
  };

  return (
    <div className={`${darkMode < 2 ? "bg-light" : "bg-dark"} rounded`}>
      <div className="row-fluid h-10 my-0 py-0">
        {label ? (
          <label htmlFor="users" className="px-3 pt-3">
            {label}
          </label>
        ) : (
          ""
        )}
        <div className="d-flex flex-row" data-role="add">
          <Input
            label=""
            type="text"
            placeHolder="Saisir le nom d’un agent à rechercher"
            id="search_terms"
            withClearButton
            className="clear-option"
            formGroupClassName="w-100 m-0 p-0"
            labelClassName="sr-only"
            value={searchUserValue}
            onChange={handleUserSearch}
          />
        </div>
        {selectedUsers && selectedUsers.length ? (
          <>
            <div
              className="form-control-container form-chips-container p-3"
              style={{ backgroundColor: "transparent" }}
              data-component="chips"
            >
              {selectedUsers.map((u) => (
                <div className="chips-group" key={u.id_user}>
                  <span
                    className={`chips chips-label bg-${
                      darkMode === 0 ? "warning" : "primary"
                    }`}
                  >
                    {u.firstname} {u.lastname} &nbsp;
                  </span>
                  <button
                    type="button"
                    className={`chips chips-btn chips-only-icon bg-${
                      darkMode === 0 ? "warning" : "primary"
                    }`}
                    data-value={u.id_user}
                    onClick={handleUserDeselect}
                  >
                    <span
                      className={`sr-only bg-${
                        darkMode === 0 ? "warning" : "primary"
                      }`}
                    >
                      Supprimer {u.firstname} {u.lastname}
                    </span>
                    <i
                      className={`icons-close bg-${
                        darkMode === 0 ? "warning" : "primary"
                      }`}
                      aria-hidden="true"
                      data-value={u.id_user}
                      onClick={handleUserDeselect}
                    />
                  </button>
                </div>
              ))}
            </div>

            <label
              className="font-weight-medium mb-2 sr-only"
              htmlFor="receivers2"
            >
              Auteur, co-auteur
            </label>
            <select
              id="receivers2"
              className="sr-only"
              data-role="input"
              tabIndex="-1"
              aria-hidden="true"
              multiple
            />
          </>
        ) : (
          ""
        )}
      </div>
      <div className="row-fluid">
        {userSearchResults && userSearchResults.length ? (
          <div
            className="flex-fluid overflow-y p-3"
            role="list"
            data-role="menu"
          >
            {userSearchResults.map((u) => (
              <span
                className="select-menu-item"
                role="listitem"
                key={u.id_user}
              >
                <div className="chips-group" key={u.id_user}>
                  <span
                    className={`chips chips-label px-3 bg-${
                      darkMode === 0 ? "warning" : "primary"
                    }`}
                  >
                    {u.firstname} {u.lastname} &nbsp;
                  </span>
                  <button
                    type="button"
                    className={`chips chips-btn chips-only-icon bg-${
                      darkMode === 0 ? "warning" : "primary"
                    }`}
                    data-value={u.id_user}
                    onClick={handleUserSelect}
                  >
                    <span className="sr-only">
                      Ajouter {u.firstname} {u.lastname}
                    </span>
                    <i
                      className="icons-add"
                      aria-hidden="true"
                      data-value={u.id_user}
                      onClick={handleUserSelect}
                    />
                  </button>
                </div>
              </span>
            ))}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

UserSearchSelect.propTypes = {
  label: PropTypes.string,
  setUsers: PropTypes.func,
  users: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        id_user: PropTypes.number,
        firstname: PropTypes.string,
        lastname: PropTypes.string,
      }),
    ])
  ),
};
UserSearchSelect.defaultProps = {
  label: "",
  setUsers: null,
  users: [],
};
