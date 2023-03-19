import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategorieFilter from "@components/CategorieFilter";
import OrganisationFilter from "@components/OrganisationFilter";
import StatusFilter from "@components/StatusFilter";
import DatePicker from "../components/forms/DatePicker";
import SharedContext from "../contexts/sharedContext";
import defaultIdeaImg from "../assets/idea_default_picture.heif";

const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
const status = [
  "En cours de rédaction",
  "Attente valid. manager",
  "Attente valid. ambassadeur",
  "Cloturée avec succès",
  "Refusée",
];
const statusColor = [
  "rgba(0,171,185,.6)",
  "rgba(210,225,0,.6)",
  "rgba(128,128,0,.6)",
  "rgba(130,190,0,.6)",
  "rgba(205,0,55,.6)",
];
const maxPaginationButtons = 5;
const initialSearchFilter = {
  keywords: "",
  page: 1,
  organisations: [],
  categories: [],
  status: [],
};
export default function InnovationSearch() {
  const { token, user, categories, organisations, darkMode } =
    useContext(SharedContext);
  const [ideasData, setIdeasData] = useState(); // idées venant du back
  const [searchFilters, setSearchFilters] = useState(initialSearchFilter); // filtres de recherche envoyés pour le get
  const [userSearchResults, setUserSearchResults] = useState([]); // utilisateurs en retour du back après recherche
  const [selectedUsers, setSelectedUsers] = useState([]); // utilisateurs sélectionnés pour le filtrage
  const [searchUserValue, setSearchUserValue] = useState(""); // valeur pour recherche utilisateur
  const [paginationButtons, setPaginationButtons] = useState([]); // boutons de pagination (calculés après le get)
  const search = (e) => {
    if (e) e.preventDefault();
    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/ideas?${new URLSearchParams(
        searchFilters
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((responseData) => {
        const totalPages = Math.ceil(responseData.total / 20);
        setIdeasData({ ...responseData, totalPages });
        const paginationButtonsArray = [];
        const numberPaginationButtonsMoreAndLess = Math.floor(
          (maxPaginationButtons - 1) / 2
        );
        let lastPageShowedInPagination =
          searchFilters.page + numberPaginationButtonsMoreAndLess <= totalPages
            ? searchFilters.page + numberPaginationButtonsMoreAndLess
            : totalPages;
        let firstPageShowedInPagination =
          searchFilters.page - numberPaginationButtonsMoreAndLess >= 1
            ? searchFilters.page - numberPaginationButtonsMoreAndLess
            : 1;
        while (
          lastPageShowedInPagination - firstPageShowedInPagination <
            maxPaginationButtons &&
          totalPages > lastPageShowedInPagination
        ) {
          if (firstPageShowedInPagination > 1) firstPageShowedInPagination -= 1;
          else if (lastPageShowedInPagination < totalPages)
            lastPageShowedInPagination += 1;
        }
        for (
          let i = firstPageShowedInPagination;
          i <= lastPageShowedInPagination;
          i += 1
        ) {
          paginationButtonsArray.push(
            <li
              key={i}
              className={`page-item ${
                searchFilters.page === i ? "active" : ""
              }`}
            >
              <button
                type="button"
                className="page-link"
                onClick={() =>
                  searchFilters.page !== i &&
                  setSearchFilters({ ...searchFilters, page: i })
                }
              >
                {i}
              </button>
            </li>
          );
        }
        setPaginationButtons(paginationButtonsArray);
      });
  };
  useEffect(() => {
    search();
  }, [searchFilters.page]);
  const reset = () => {
    setSelectedUsers([]);
    setSearchFilters(initialSearchFilter);
  };
  const handleChangeSearchFilters = (e) => {
    let { value } = e.target;
    const { id } = e.target;
    if (id === "user_id") {
      value = selectedUsers.map((u) => u.id);
    }
    setSearchFilters({ ...searchFilters, [id]: value });
  };
  const handleUserSelect = (e) => {
    const uid = parseInt(e.target.dataset.value, 10);
    const userToAdd = userSearchResults.find((u) => u.id === uid);
    if (userToAdd && !selectedUsers.find((u) => u.id === userToAdd.id)) {
      const newUserSearch = [...userSearchResults];
      const newUsersForSearch = [...selectedUsers, userToAdd];
      newUserSearch.splice(newUserSearch.find(({ id }) => id === uid));
      setSelectedUsers(newUsersForSearch);
      setSearchFilters({
        ...searchFilters,
        user_id: newUsersForSearch.map(({ id }) => id),
      });
      setUserSearchResults(newUserSearch);
      setSearchUserValue("");
    }
  };
  const handleUserDeselect = (e) => {
    const uid = parseInt(e.target.dataset.value, 10);
    const newSelectedUsers = selectedUsers.filter((u) => u.id !== uid);
    setSelectedUsers(newSelectedUsers);
    setSearchFilters({
      ...searchFilters,
      user_id: newSelectedUsers.map((u) => u.id),
    });
  };
  const handleUserSearch = (e) => {
    setSearchUserValue(e.target.value);
    if (window.searchUserTimeout) {
      clearTimeout(window.searchUserTimeout);
      window.searchUserTimeout = null;
    }
    if (e.target.value.length > 2) {
      window.searchUserTimeout = setTimeout(() => {
        fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/users/search?${new URLSearchParams({
            search_terms: e.target.value,
          })}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => response.json())
          .then((responseData) =>
            setUserSearchResults(
              responseData.filter(
                (u) => !selectedUsers.find((us) => us.id === u.id)
              )
            )
          );
      }, 600);
    } else {
      setUserSearchResults();
    }
  };

  const handleCheckCategorie = (event) => {
    let updatedList = [...(searchFilters.categories || [])];
    const value = parseInt(event.target.dataset.id, 10);
    const checked = !updatedList.includes(value);
    if (event.target.dataset.id === "-1") {
      if (updatedList.length < categories.length) {
        updatedList = categories.map((categorie) => categorie.id);
      } else {
        updatedList = [];
      }
    } else if (checked) {
      !updatedList.includes(value) && updatedList.push(value);
      if (
        !categories.find((categorie) => categorie.id === value)
          .id_parent_categorie
      ) {
        updatedList = [
          ...updatedList,
          ...categories
            .filter((catToFilter) => {
              if (
                !updatedList.includes(catToFilter.id) &&
                catToFilter.id_parent_categorie === value
              ) {
                return true;
              }
              return false;
            })
            .map((cat) => cat.id),
        ];
      }
    } else {
      updatedList.includes(value) &&
        updatedList.splice(updatedList.indexOf(value), 1);
      if (
        !categories.find((categorie) => categorie.id === value)
          .id_parent_categorie
      ) {
        categories.forEach((catToFilter) => {
          if (
            updatedList.includes(catToFilter.id) &&
            categories.find((categorie) => categorie.id === catToFilter.id)
              .id_parent_categorie === value
          ) {
            updatedList.splice(updatedList.indexOf(catToFilter.id), 1);
          }
        });
      }
    }
    setSearchFilters({ ...searchFilters, categories: updatedList });
  };
  const handleCheckOrganisation = (event) => {
    let updatedList = [...(searchFilters.organisations || [])];
    const value = parseInt(event.target.dataset.id, 10);
    const checked = !updatedList.includes(value);
    if (event.target.dataset.id === "-1") {
      if (updatedList.length < organisations.length) {
        updatedList = organisations.map((organisation) => organisation.id);
      } else {
        updatedList = [];
      }
    } else if (checked) {
      !updatedList.includes(value) && updatedList.push(value);
    } else {
      updatedList.includes(value) &&
        updatedList.splice(updatedList.indexOf(value), 1);
    }
    setSearchFilters({ ...searchFilters, organisations: updatedList });
  };
  const handleCheckStatus = (event) => {
    let updatedList = [...(searchFilters.status || [])];
    const value = parseInt(event.target.dataset.id, 10);
    const checked = !updatedList.includes(value);
    if (event.target.dataset.id === "-1") {
      if (updatedList.length < status.length) {
        updatedList = status.map((_, i) => i);
      } else {
        updatedList = [];
      }
    } else if (checked) {
      !updatedList.includes(value) && updatedList.push(value);
    } else {
      updatedList.includes(value) &&
        updatedList.splice(updatedList.indexOf(value), 1);
    }
    setSearchFilters({ ...searchFilters, status: updatedList });
  };
  return (
    <main className="container mx-auto px-3 mt-3">
      <h1 className="display-1">Innovations</h1>
      <div className="row h-100">
        <div className="mr-3 w-100 mb-3">
          <button
            id="dLabel"
            type="button"
            data-toggle="collapse"
            data-target="#filters"
            aria-expanded="false"
            aria-controls="filters"
            className="btn btn-secondary float-right"
          >
            Recherche/Filtrage
          </button>
        </div>
        <div
          className={`collapse justify-content-center pt-1 px-5 pb-0 mb-3 h-auto rounded ${
            darkMode === 0 ? "bg-white" : ""
          }${darkMode === 1 ? "bg-light" : ""}`}
          aria-labelledby="dLabel"
          id="filters"
        >
          <div>
            <form onSubmit={search} className="h-100">
              <section className="row-fluid h-50 mb-4">
                <div className="row-fluid">
                  <label className="lead" htmlFor="user_id">
                    Recherche par innovateur
                  </label>
                </div>
                <div className="row-fluid h-10">
                  <div
                    className="form-control-container form-chips-container h-10 mb-4"
                    data-component="chips"
                  >
                    {selectedUsers && selectedUsers.length ? (
                      selectedUsers.map((u) => (
                        <div className="chips-group" key={u.id}>
                          <span
                            className={`chips chips-label px-3 bg-${
                              darkMode === 0 ? "warning" : "primary"
                            }`}
                          >
                            <Link to={`/user/${u.id}`} className="text-dark">
                              {u.firstname} {u.lastname}
                            </Link>
                          </span>
                          <button
                            type="button"
                            className={`chips chips-btn chips-only-icon bg-${
                              darkMode === 0 ? "warning" : "primary"
                            }`}
                            data-value={u.id}
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
                              data-value={u.id}
                              onClick={handleUserDeselect}
                            />
                          </button>
                        </div>
                      ))
                    ) : (
                      <button
                        type="button"
                        className="page-link"
                        onClick={() =>
                          document.getElementById("user_id").focus()
                        }
                      >
                        Aucun innovateur sélectionné
                      </button>
                    )}
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
                  </div>
                </div>
                <div className="row-fluid">
                  <div
                    className="flex-fluid overflow-y"
                    role="list"
                    data-role="menu"
                  >
                    {userSearchResults &&
                      userSearchResults.map((u) => (
                        <span
                          className="select-menu-item"
                          role="listitem"
                          key={u.id}
                        >
                          <div className="chips-group" key={u.id}>
                            <span
                              className={`chips chips-label px-3 bg-${
                                darkMode === 0 ? "warning" : "primary"
                              }`}
                            >
                              <Link to={`/user/${u.id}`} className="text-dark">
                                {u.firstname} {u.lastname}
                              </Link>
                            </span>
                            <button
                              type="button"
                              className={`chips chips-btn chips-only-icon bg-${
                                darkMode === 0 ? "warning" : "primary"
                              }`}
                              data-value={u.id}
                              onClick={handleUserSelect}
                            >
                              <span className="sr-only">
                                Ajouter {u.firstname} {u.lastname}
                              </span>
                              <i
                                className="icons-add"
                                aria-hidden="true"
                                data-value={u.id}
                                onClick={handleUserSelect}
                              />
                            </button>
                          </div>
                        </span>
                      ))}
                  </div>
                  <div className="d-flex pt-4 flex-row" data-role="add">
                    <div className="form-control-container w-100">
                      <label htmlFor="user_id" className="sr-only">
                        Saisir le nom d’un agent à rechercher
                      </label>
                      <input
                        id="user_id"
                        type="text"
                        className="form-control form-control"
                        data-role="add-input"
                        placeholder="Rechercher un agent"
                        value={searchUserValue}
                        onChange={handleUserSearch}
                        autoComplete="off"
                      />
                      <span className="form-control-state" />
                    </div>
                  </div>
                </div>
                <div className="row-fluid pt-4">
                  <OrganisationFilter
                    values={searchFilters.organisations}
                    onChange={handleCheckOrganisation}
                    label="Filtrer par entité(s)"
                  />
                </div>
                <div className="row-fluid pt-4">
                  <CategorieFilter
                    values={searchFilters.categories}
                    onChange={handleCheckCategorie}
                    label="Filtrer par catégorie(s)"
                  />
                </div>
                <div className="row-fluid pt-4">
                  <StatusFilter
                    values={searchFilters.status}
                    onChange={handleCheckStatus}
                    label="Filtrer par status de l'innovation"
                  />
                </div>
              </section>
              <section className="row">
                <section className="col-md row-">
                  <span className="lead text-center">Par date de création</span>
                  <div className="row">
                    <div className="col-lg row-">
                      <DatePicker
                        id="created_at_from"
                        label="À partir du"
                        value={searchFilters.created_at_from}
                        fonction={handleChangeSearchFilters}
                      />
                    </div>
                    <div className="col-lg row-">
                      <DatePicker
                        id="created_at_to"
                        label="Jusqu'au"
                        value={searchFilters.created_at_to}
                        fonction={handleChangeSearchFilters}
                      />
                    </div>
                  </div>
                </section>
                <section className="col-md row-">
                  <div className="row lead text-center">
                    Par date de finalisation
                  </div>
                  <div className="row">
                    <div className="col-lg row-">
                      <DatePicker
                        id="finished_at_from"
                        label="À partir du"
                        value={searchFilters.finished_at_from}
                        fonction={handleChangeSearchFilters}
                      />
                    </div>
                    <div className="col-lg row-">
                      <DatePicker
                        id="finished_at_to"
                        label="Jusqu'au"
                        value={searchFilters.finished_at_to}
                        fonction={handleChangeSearchFilters}
                      />
                    </div>
                  </div>
                </section>
              </section>
              <section className="row">
                {user.role_id >= 2 ? (
                  <section className="col-md row-">
                    <div className="row lead text-center">
                      Par date de validation manager
                    </div>
                    <div className="row">
                      <div className="col-lg row-">
                        <DatePicker
                          id="manager_validated_at_from"
                          label="À partir du"
                          value={searchFilters.manager_validated_at_from}
                          fonction={handleChangeSearchFilters}
                        />
                      </div>
                      <div className="col-lg row-">
                        <DatePicker
                          id="manager_validated_at_to"
                          label="Jusqu'au"
                          value={searchFilters.manager_validated_at_to}
                          fonction={handleChangeSearchFilters}
                        />
                      </div>
                    </div>
                  </section>
                ) : undefined}
                {user.role_id >= 3 ? (
                  <section className="col">
                    <span className="row lead text-center">
                      Par date de validation ambassadeur
                    </span>
                    <div className="row">
                      <div className="col-lg row-">
                        <DatePicker
                          id="ambassador_validated_at_from"
                          label="À partir du"
                          value={searchFilters.ambassador_validated_at_from}
                          fonction={handleChangeSearchFilters}
                        />
                      </div>
                      <div className="col-lg row-">
                        <DatePicker
                          id="ambassador_validated_at_to"
                          label="Jusqu'au"
                          value={searchFilters.ambassador_validated_at_to}
                          fonction={handleChangeSearchFilters}
                        />
                      </div>
                    </div>
                  </section>
                ) : undefined}
              </section>
            </form>
            <button
              type="button"
              className={`btn btn-${
                darkMode === 0 ? "warning" : "primary"
              } float-right m-2`}
              onClick={search}
            >
              <span>Rechercher/Filtrer </span>
              <i className="icons-search" aria-hidden="false" />
            </button>
            <button
              type="button"
              className="btn btn-secondary float-right m-2"
              onClick={reset}
            >
              <span>Réinitialiser </span>
              <i className="icons-close" aria-hidden="false" />
            </button>
          </div>
        </div>
      </div>
      <div
        className={`row list-group ${
          darkMode < 2 ? "bg-light" : "bg-dark"
        } rounded`}
      >
        {ideasData && ideasData.ideas.length ? (
          <>
            <ul className="p-0">
              {ideasData.ideas.map((idea, i) => (
                <li
                  className={`list-group-item management-item p-0 ${
                    i === 0 ? "rounded-top" : ""
                  }  ${
                    i === ideasData.ideas.length - 1 ? "rounded-bottom" : ""
                  }`}
                  key={idea.id}
                >
                  <Link
                    to={`/${
                      idea.user_id === user.id && idea.status === 0
                        ? "edit"
                        : "innovation"
                    }/${idea.id}`}
                  >
                    <div className="management-item-content w-100 h-auto">
                      <div
                        className="management-item-symbol rounded-left w-auto col-md-4"
                        style={{
                          background: `center / cover no-repeat url(${defaultIdeaImg})`,
                        }}
                      >
                        <span
                          className="w-100 my-auto p-1 mt-auto position-absolute text-white text-center"
                          style={{
                            left: 0,
                            bottom: 0,
                            borderBottomLeftRadius: ".4375rem",
                            backgroundColor: statusColor[idea.status],
                          }}
                        >
                          {status[idea.status]}
                        </span>
                      </div>
                      <div
                        className={`management-item-main m-0 p-0 ${
                          darkMode < 2 ? "bg-light" : "bg-dark"
                        } rounded-right`}
                      >
                        <h1
                          className="text-center py-1 bg-cyan mx-auto"
                          style={{ borderTopRightRadius: ".4375rem" }}
                        >
                          {idea.name}
                        </h1>
                        <ul className="meta-list font-weight-medium ml-2">
                          <li className="meta-list-item text-secondary">
                            Par{" "}
                            {`${
                              ideasData.users.find((u) => u.id === idea.user_id)
                                .firstname
                            } ${
                              ideasData.users.find((u) => u.id === idea.user_id)
                                .lastname
                            }`}{" "}
                            (
                            {
                              organisations.find(
                                (org) =>
                                  org.id ===
                                  ideasData.users.find(
                                    (u) => u.id === idea.user_id
                                  ).organisation_id
                              ).name
                            }
                            )
                          </li>
                          <li className="meta-list-item separator text-secondary">
                            👁️‍🗨️ {idea.views}
                          </li>
                          <li className="meta-list-item separator text-secondary">
                            Créée le{" "}
                            {new Date(idea.created_at).toLocaleDateString(
                              "fr-FR",
                              dateOptions
                            )}
                          </li>
                        </ul>
                        <ul className="meta-list font-weight-medium ml-2">
                          {user.role_id > 1 && idea.finished_at && (
                            <li className="meta-list-item text-secondary">
                              Finalisée le{" "}
                              {new Date(idea.finished_at).toLocaleDateString(
                                "fr-FR",
                                dateOptions
                              )}
                            </li>
                          )}
                        </ul>
                        <ul className="meta-list font-weight-medium ml-2">
                          {user.role_id > 1 && idea.manager_validated_at && (
                            <li className="meta-list-item text-secondary">
                              Validée manager le{" "}
                              {new Date(
                                idea.manager_validated_at
                              ).toLocaleDateString("fr-FR", dateOptions)}
                            </li>
                          )}
                        </ul>
                        <ul className="meta-list font-weight-medium ml-2">
                          {user.role_id > 2 && idea.ambassador_validated_at && (
                            <li className="meta-list-item text-secondary">
                              Validée ambassadeur le{" "}
                              {new Date(
                                idea.ambassador_validated_at
                              ).toLocaleDateString("fr-FR", dateOptions)}
                            </li>
                          )}
                        </ul>
                        <p className="mb-0 d-none d-lg-block mt-3 ml-3 text-secondary">
                          {idea.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <nav role="navigation" className="mt-4" aria-label="Pagination">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item page-skip ${
                    searchFilters.page === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() =>
                      searchFilters.page !== 1 &&
                      setSearchFilters({ ...searchFilters, page: 1 })
                    }
                  >
                    <i
                      className="icons-arrow-double icons-rotate-180 icons-size-x5"
                      aria-hidden="true"
                    />
                    <span className="d-none d-sm-inline ml-2">Début</span>
                  </button>
                </li>
                <li
                  className={`page-item page-skip ${
                    searchFilters.page === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() =>
                      searchFilters.page !== 1 &&
                      setSearchFilters({
                        ...searchFilters,
                        page:
                          searchFilters.page - 1 >= 1
                            ? searchFilters.page - 1
                            : 1,
                      })
                    }
                  >
                    <i
                      className="icons-arrow-prev icons-size-x5"
                      aria-hidden="true"
                    />
                    <span className="d-none d-sm-inline ml-2">Précédent</span>
                  </button>
                </li>
                {paginationButtons.map((p) => p)}
                <li
                  className={`page-item page-skip ${
                    searchFilters.page === ideasData.totalPages ||
                    ideasData.totalPages === 1
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() =>
                      ideasData.totalPages > 1 &&
                      ideasData.totalPages !== searchFilters.page &&
                      setSearchFilters({
                        ...searchFilters,
                        page:
                          searchFilters.page + 1 <= ideasData.totalPages
                            ? searchFilters.page + 1
                            : ideasData.total,
                      })
                    }
                  >
                    <span className="d-none d-sm-inline mr-2">Suivant</span>
                    <i
                      className="icons-arrow-next icons-size-x5"
                      aria-hidden="true"
                    />
                  </button>
                </li>
                <li
                  className={`page-item page-skip ${
                    searchFilters.page === ideasData.totalPages ||
                    ideasData.totalPages === 1
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() =>
                      ideasData.totalPages > 1 &&
                      ideasData.totalPages !== searchFilters.page &&
                      setSearchFilters({
                        ...searchFilters,
                        page: ideasData.totalPages,
                      })
                    }
                  >
                    <span className="d-none d-sm-inline mr-2">Fin</span>
                    <i
                      className="icons-arrow-double icons-size-x5"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              </ul>
            </nav>
          </>
        ) : (
          <div className="p-3">
            Aucune innovation ne correspond à vos critères de recherche.
          </div>
        )}
      </div>
    </main>
  );
}
