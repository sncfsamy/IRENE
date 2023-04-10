import PropTypes from "prop-types";
import Ideas from "@components/management/Ideas";
import Categories from "@components/management/Categories";
import Challenges from "@components/management/Challenges";
import Organisations from "@components/management/Organisations";
import Users from "@components/management/Users";
import Roles from "@components/management/Roles";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Teams from "@components/management/Teams";
import SharedContext from "../contexts/sharedContext";
import Unauthorized from "./Error403";

export default function Manage({
  setOrganisations,
  setTeams,
  setRoles,
  setCategories,
}) {
  const { user, setIsLoading, customFetch, darkMode } =
    useContext(SharedContext);
  const [selectedToDelete, setSelectedToDelete] = useState([]);
  const location = useLocation();
  const { page } = useParams();
  const [searchFilters, setSearchFilters] = useSearchParams(
    new URLSearchParams({
      limit: localStorage.getItem("IRENE_MANAGE_ITEMS_PER_PAGE") || 20,
      page: 1,
    })
  );
  const navigate = useNavigate();
  const openAddModal = useRef({});
  const removeCallbacks = useRef({});
  const filtersParams = useRef({});
  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };
  const remove = () => {
    if (selectedToDelete.length) {
      $("#removeModal").modal("show");
    } else if (page) {
      $("#remove")
        .popover({
          content: "Aucun élément séléctionné !",
          delay: { show: 250, hide: 100 },
        })
        .popover("show");
      setTimeout(() => $("#remove").popover("dispose"), 2000);
    }
  };
  const newIdea = () => navigate(`${import.meta.env.VITE_FRONTEND_URI}/edit`);
  useEffect(() => {
    openAddModal.current.ideas = newIdea;
    openAddModal.current.manager = newIdea;
    openAddModal.current.ambassador = newIdea;
  }, []);
  const add = () => {
    if (page) {
      openAddModal.current[page]();
    }
  };
  const setSelected = (event) => {
    let updatedList = [...selectedToDelete];
    const idElem = parseInt(event.target.value, 10);
    if (event.target.checked) {
      updatedList = [...selectedToDelete, idElem];
    } else {
      updatedList.splice(selectedToDelete.indexOf(idElem), 1);
    }
    setSelectedToDelete(updatedList);
  };
  const addOpenAddModal = (sourcePage, fct) => {
    openAddModal.current[sourcePage] = fct;
  };
  const addRemoveCallback = (sourcePage, fct) => {
    removeCallbacks.current[sourcePage] = fct;
    if (sourcePage === "ideas") {
      filtersParams.current.manager = fct;
      filtersParams.current.ambassador = fct;
    }
  };
  const handleRemove = () => {
    setIsLoading(true);
    const component = ["manager", "ambassador"].includes(page) ? "ideas" : page;
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/${component}?${new URLSearchParams({
        ids: selectedToDelete,
      })}`,
      "DELETE"
    )
      .then(() => {
        removeCallbacks.current[component]([...selectedToDelete]);
        setSelectedToDelete([]);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn(err);
        removeCallbacks.current[component](false);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (location.pathname === "/manage") {
      setIsLoading(false);
    }
    setSearchFilters(
      new URLSearchParams({
        page: 1,
        limit: localStorage.getItem("IRENE_MANAGE_ITEMS_PER_PAGE") ?? 20,
      })
    );
    setSelectedToDelete([]);
    if (!page) {
      setIsLoading(false);
    }
  }, [location.pathname]);
  return (
    <main className="container flex-column align-items-center">
      {user.perms.manage_ideas_manager ||
      user.perms.manage_ideas_ambassador ||
      user.perms.manage_ideas_all ||
      user.perms.manage_challenges_ambassador ||
      user.perms.manage_challenges_all ||
      user.perms.manage_categories ||
      user.perms.manage_teams ||
      user.perms.manage_users ||
      user.perms.manage_organisations ||
      user.perms.manage_roles ||
      user.perms.manage_all ? (
        <div
          className="actionbar has-tabs position-static my-3"
          style={{ justifyContent: "center", height: "fit-content" }}
        >
          <div className="actionbar-head my-3">
            <h1 className="mb-0">Mon espace de gestion</h1>
            <ul className="toolbar mb-0 d-flex">
              <li className="toolbar-item">
                <button
                  type="button"
                  className={`btn btn-sm btn-transparent btn-color-gray toolbar-item-spacing ${
                    page ? "" : "disabled"
                  }`}
                  onClick={add}
                >
                  <span className="sr-only">Ajouter</span>
                  <i className="icons-add icons-size-1x25" />
                </button>
              </li>
              <li className="toolbar-item">
                <button
                  id="remove"
                  type="button"
                  className={`btn btn-sm btn-transparent btn-color-gray toolbar-item-spacing ${
                    selectedToDelete.length ? "" : "disabled"
                  }`}
                  onClick={remove}
                >
                  <span className="sr-only">Supprimer</span>
                  <i className="icons-close icons-size-1x25" />
                </button>
              </li>
              <li className="toolbar-item">
                <div className="btn-group dropdown">
                  <button
                    type="button"
                    className={`btn btn-sm btn-transparent btn-color-gray toolbar-item-spacing btn-options dropdown-toggle ${
                      page ? "" : "disabled"
                    }`}
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    aria-controls="search"
                  >
                    <span className="sr-only">Rechercher</span>
                    <i className="icons-search icons-size-1x75" />
                  </button>
                  <div
                    id="search"
                    className="dropdown-menu dropdown-menu-right"
                    style={{ width: "300px" }}
                  >
                    <form onSubmit={handleSearchSubmit} className="m-0 px-2">
                      <div className="input-group">
                        <div className="form-control-container">
                          <input
                            type="text"
                            className="form-control"
                            id="search_terms"
                            placeholder="Rechercher"
                            onChange={(e) => {
                              setSearchFilters((searchParams) => {
                                searchParams.set(
                                  "search_terms",
                                  e.target.value
                                );
                                searchParams.set("page", 1);
                                return searchParams;
                              });
                            }}
                            value={
                              searchFilters.has("search_terms")
                                ? searchFilters.get("search_terms")
                                : ""
                            }
                          />
                        </div>
                        <div className="input-group-append">
                          <button
                            type="submit"
                            className={`btn btn-${
                              darkMode === 0 ? "warning" : "primary"
                            }`}
                          >
                            <span className="d-none" aria-hidden="true">
                              Rechercher{" "}
                            </span>
                            <i className="icons-search" aria-hidden="false" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </li>
              <li className="toolbar-item">
                <button
                  className={`btn btn-sm btn-transparent btn-color-gray toolbar-item-spacing ${
                    page ? "" : "disabled"
                  }`}
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  aria-controls="filters"
                >
                  <span className="sr-only">Filtrer</span>
                  <i className="icons-filters icons-size-1x25" />
                </button>
                <div className="dropdown-menu dropdown-menu-right" id="filters">
                  <h6 className="dropdown-header">Elements par page</h6>
                  <button
                    className={`dropdown-item ${
                      searchFilters.has("limit") &&
                      parseInt(searchFilters.get("limit"), 10) !== 20
                        ? ""
                        : `text-${darkMode === 0 ? "warning" : "primary"}`
                    }`}
                    type="button"
                    onClick={() => {
                      setSearchFilters((searchParams) => {
                        searchParams.set("limit", 20);
                        searchParams.set("page", 1);
                        localStorage.setItem("IRENE_MANAGE_ITEMS_PER_PAGE", 20);
                        return searchParams;
                      });
                    }}
                  >
                    20
                  </button>
                  <button
                    className={`dropdown-item ${
                      !searchFilters.has("limit") ||
                      parseInt(searchFilters.get("limit"), 10) !== 50
                        ? ""
                        : `text-${darkMode === 0 ? "warning" : "primary"}`
                    }`}
                    type="button"
                    onClick={() => {
                      setSearchFilters((searchParams) => {
                        searchParams.set("limit", 50);
                        searchParams.set("page", 1);
                        localStorage.setItem("IRENE_MANAGE_ITEMS_PER_PAGE", 50);
                        return searchParams;
                      });
                    }}
                  >
                    50
                  </button>
                  <button
                    className={`dropdown-item ${
                      !searchFilters.has("limit") ||
                      parseInt(searchFilters.get("limit"), 10) !== 100
                        ? ""
                        : `text-${darkMode === 0 ? "warning" : "primary"}`
                    }`}
                    type="button"
                    onClick={() => {
                      setSearchFilters((searchParams) => {
                        searchParams.set("limit", 100);
                        searchParams.set("page", 1);
                        localStorage.setItem(
                          "IRENE_MANAGE_ITEMS_PER_PAGE",
                          100
                        );
                        return searchParams;
                      });
                    }}
                  >
                    100
                  </button>
                  <div className="dropdown-divider" />
                </div>
              </li>
            </ul>
          </div>
          <nav role="navigation" className="position-relative">
            <ul className="nav navtabs mb-0 dragscroll row">
              {user.perms.manage_ideas_all || user.perms.manage_all ? (
                <li className="navtabs-item pr-4">
                  <Link
                    to={`${import.meta.env.VITE_FRONTEND_URI}/manage/ideas`}
                    className={`${page === "ideas" ? "active" : ""}`}
                    title="Gestion de toutes les idées présentes sur IRENE"
                  >
                    Idées
                  </Link>
                </li>
              ) : (
                ""
              )}
              {user.perms.manage_ideas_manager || user.perms.manage_all ? (
                <li className="navtabs-item pr-4">
                  <Link
                    to={`${import.meta.env.VITE_FRONTEND_URI}/manage/manager`}
                    className={`${page === "manager" ? "active" : ""}`}
                    title="Gestion des idées des membres de votre équipe"
                  >
                    Idées équipe
                  </Link>
                </li>
              ) : (
                ""
              )}
              {user.perms.manage_ideas_ambassador || user.perms.manage_all ? (
                <li className="navtabs-item pr-4">
                  <Link
                    to={`${
                      import.meta.env.VITE_FRONTEND_URI
                    }/manage/ambassador`}
                    className={`${page === "ambassador" ? "active" : ""}`}
                    title="Gestion des idées de votre organisation"
                  >
                    Idées organisation
                  </Link>
                </li>
              ) : (
                ""
              )}
              {user.perms.manage_challenges_all ||
              user.perms.manage_challenges_ambassador ||
              user.perms.manage_all ? (
                <li className="navtabs-item pr-4">
                  <Link
                    to={`${
                      import.meta.env.VITE_FRONTEND_URI
                    }/manage/challenges`}
                    className={`${page === "challenges" ? "active" : ""}`}
                    title={`Gestion des challenges${
                      !user.perms.manage_challenges_all
                        ? " de votre organisation"
                        : ""
                    }`}
                  >
                    Challenges
                  </Link>
                </li>
              ) : (
                ""
              )}
              {user.perms.manage_categories || user.perms.manage_all ? (
                <li className="navtabs-item pr-4">
                  <Link
                    to={`${
                      import.meta.env.VITE_FRONTEND_URI
                    }/manage/categories`}
                    className={`${page === "categories" ? "active" : ""}`}
                    title="Gestion des catégories"
                  >
                    Catégories
                  </Link>
                </li>
              ) : (
                ""
              )}
              {user.perms.manage_users || user.perms.manage_all ? (
                <li className="navtabs-item pr-4">
                  <Link
                    to={`${import.meta.env.VITE_FRONTEND_URI}/manage/users`}
                    className={`${page === "users" ? "active" : ""}`}
                    title="Gestion des utilisateurs"
                  >
                    Utilisateurs
                  </Link>
                </li>
              ) : (
                ""
              )}
              {user.perms.manage_organisations || user.perms.manage_all ? (
                <li className="navtabs-item pr-4">
                  <Link
                    to={`${
                      import.meta.env.VITE_FRONTEND_URI
                    }/manage/organisations`}
                    className={`${page === "organisations" ? "active" : ""}`}
                    title="Gestion des organisations"
                  >
                    Organisations
                  </Link>
                </li>
              ) : (
                ""
              )}
              {user.perms.manage_teams || user.perms.manage_all ? (
                <li className="navtabs-item pr-4">
                  <Link
                    to={`${import.meta.env.VITE_FRONTEND_URI}/manage/teams`}
                    className={`${page === "teams" ? "active" : ""}`}
                    title="Gestion des équipes"
                  >
                    Equipes
                  </Link>
                </li>
              ) : (
                ""
              )}
              {user.perms.manage_roles || user.perms.manage_all ? (
                <li className="navtabs-item pr-4">
                  <Link
                    to={`${import.meta.env.VITE_FRONTEND_URI}/manage/roles`}
                    className={`${page === "roles" ? "active" : ""}`}
                    title="Gestion des roles"
                  >
                    Roles
                  </Link>
                </li>
              ) : (
                ""
              )}
            </ul>
          </nav>
          <div className="mb-4">
            {(page === "ideas" ||
              page === "manager" ||
              page === "ambassador") &&
            (user.perms.manage_ideas_all ||
              user.perms.manage_ideas_ambassador ||
              user.perms.manage_ideas_manager ||
              user.perms.manage_all) ? (
              <Ideas
                page={page}
                setSelected={setSelected}
                selected={selectedToDelete}
                setSelectedToDelete={setSelectedToDelete}
                addOpenAddModal={addOpenAddModal}
                addRemoveCallback={addRemoveCallback}
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
              />
            ) : (
              ""
            )}
            {(!(
              user.perms.manage_ideas_all ||
              user.perms.manage_ideas_ambassador ||
              user.perms.manage_ideas_manager ||
              user.perms.manage_all
            ) &&
              (page === "ideas" ||
            page === "manager" ||
            page === "ambassador")) ? (
              <Unauthorized />
            ) : (
              ""
            )}
            {page === "challenges" &&
            (user.perms.manage_challenges_ambassador ||
              user.perms.manage_challenges_all ||
              user.perms.manage_all) ? (
              <Challenges
                setSelected={setSelected}
                selected={selectedToDelete}
                setSelectedToDelete={setSelectedToDelete}
                addOpenAddModal={addOpenAddModal}
                addRemoveCallback={addRemoveCallback}
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
              />
            ) : (
              ""
            )}
            {!(
              user.perms.manage_challenges_ambassador ||
              user.perms.manage_challenges_all ||
              user.perms.manage_all
            ) && page === "challenges" ? (
              <Unauthorized />
            ) : (
              ""
            )}
            {page === "users" &&
            (user.perms.manage_users || user.perms.manage_all) ? (
              <Users
                setSelected={setSelected}
                selected={selectedToDelete}
                setSelectedToDelete={setSelectedToDelete}
                addOpenAddModal={addOpenAddModal}
                addRemoveCallback={addRemoveCallback}
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
              />
            ) : (
              ""
            )}
            {!(user.perms.manage_users || user.perms.manage_all) &&
            page === "users" ? (
              <Unauthorized />
            ) : (
              ""
            )}
            {page === "categories" &&
            (user.perms.manage_categories || user.perms.manage_all) ? (
              <Categories
                setCategories={setCategories}
                setSelected={setSelected}
                selected={selectedToDelete}
                setSelectedToDelete={setSelectedToDelete}
                addOpenAddModal={addOpenAddModal}
                addRemoveCallback={addRemoveCallback}
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
              />
            ) : (
              ""
            )}
            {!(user.perms.manage_categories || user.perms.manage_all) &&
            page === "categories" ? (
              <Unauthorized />
            ) : (
              ""
            )}
            {page === "organisations" &&
            (user.perms.manage_organisations || user.perms.manage_all) ? (
              <Organisations
                setOrganisations={setOrganisations}
                setTeams={setTeams}
                setSelected={setSelected}
                selected={selectedToDelete}
                setSelectedToDelete={setSelectedToDelete}
                addOpenAddModal={addOpenAddModal}
                addRemoveCallback={addRemoveCallback}
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
              />
            ) : (
              ""
            )}
            {!(user.perms.manage_organisations || user.perms.manage_all) &&
            page === "organisations" ? (
              <Unauthorized />
            ) : (
              ""
            )}
            {page === "teams" &&
            (user.perms.manage_teams || user.perms.manage_all) ? (
              <Teams
                setTeams={setTeams}
                setSelected={setSelected}
                selected={selectedToDelete}
                setSelectedToDelete={setSelectedToDelete}
                addOpenAddModal={addOpenAddModal}
                addRemoveCallback={addRemoveCallback}
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
              />
            ) : (
              ""
            )}
            {!(user.perms.manage_teams || user.perms.manage_all) &&
            page === "teams" ? (
              <Unauthorized />
            ) : (
              ""
            )}
            {page === "roles" &&
            (user.perms.manage_roles || user.perms.manage_all) ? (
              <Roles
                setRoles={setRoles}
                setSelected={setSelected}
                selected={selectedToDelete}
                setSelectedToDelete={setSelectedToDelete}
                addOpenAddModal={addOpenAddModal}
                addRemoveCallback={addRemoveCallback}
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
              />
            ) : (
              ""
            )}
            {!(user.perms.manage_roles || user.perms.manage_all) &&
            page === "roles" ? (
              <Unauthorized />
            ) : (
              ""
            )}
          </div>
        </div>
      ) : (
        <Unauthorized />
      )}
      <div
        className="modal fade"
        tabIndex="-1"
        role="dialog"
        id="removeModal"
        aria-labelledby="titleRemoveModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="h1 modal-title" id="titleRemoveModal">
                Suppression
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
            <div className="modal-body mt-3">
              Supprimer définitivement {selectedToDelete.length} élément
              {selectedToDelete.length > 1 ? "s" : ""} ?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                }}
                data-dismiss="modal"
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-dismiss="modal"
                onClick={handleRemove}
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

Manage.propTypes = {
  setCategories: PropTypes.func,
  setOrganisations: PropTypes.func,
  setRoles: PropTypes.func,
  setTeams: PropTypes.func,
};
Manage.defaultProps = {
  setCategories: null,
  setOrganisations: null,
  setRoles: null,
  setTeams: null,
};
