import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CategorieFilter from "@components/CategorieFilter";
import OrganisationFilter from "@components/OrganisationFilter";
import StatusFilter from "@components/StatusFilter";
import Pagination from "@components/Pagination";
import UserSearchSelect from "@components/UserSearchSelect";
import Ordering from "@components/Ordering";
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
  "Attente d'approfondissement",
  "Refusée",
];
const statusColor = [
  "rgba(0,171,185,.6)",
  "rgba(210,225,0,.6)",
  "rgba(128,128,0,.6)",
  "rgba(130,190,0,.6)",
  "rgba(0,171,185,.6)",
  "rgba(205,0,55,.6)",
];
const initialSearchFilter = {
  organisations: [],
  categories: [],
  status: [],
  users: [],
  page: 1,
  limit: 20,
};
export default function InnovationSearch() {
  const {
    user,
    categories,
    organisations,
    darkMode,
    setIsLoading,
    customFetch,
  } = useContext(SharedContext);
  const [searchParams, setSearchParams] = useSearchParams();
  let newSearchFilter = initialSearchFilter;
  const [ideasData, setIdeasData] = useState(); // idées venant du back
  if (searchParams.has("page")) {
    newSearchFilter = {
      ...newSearchFilter,
      page: parseInt(searchParams.get("page"), 10),
    };
  } else searchParams.set("page", 1);
  if (searchParams.has("users") && searchParams.get("users").length) {
    newSearchFilter = {
      ...newSearchFilter,
      users: searchParams.get("users").split(","),
    };
  }
  if (searchParams.has("status") && searchParams.get("status").length) {
    newSearchFilter = {
      ...newSearchFilter,
      status: searchParams.get("status").split(","),
    };
  }
  if (
    searchParams.has("organisations") &&
    searchParams.get("organisations").length
  ) {
    newSearchFilter = {
      ...newSearchFilter,
      organisations: searchParams.get("organisations").split(","),
    };
  }
  if (searchParams.has("categories") && searchParams.get("categories").length) {
    newSearchFilter = {
      ...newSearchFilter,
      organisations: searchParams.get("categories").split(","),
    };
  }
  if (searchParams.has("order_by") && searchParams.get("order_by").length) {
    newSearchFilter = {
      ...newSearchFilter,
      order_by: searchParams.get("order_by"),
    };
  } else
    newSearchFilter = {
      ...newSearchFilter,
      order_by: 0,
    };
  if (searchParams.has("order") && searchParams.get("order").length) {
    newSearchFilter = {
      ...newSearchFilter,
      order: searchParams.get("order"),
    };
  } else
    newSearchFilter = {
      ...newSearchFilter,
      order: 0,
    };
  const [searchFilters, setSearchFilters] = useState(newSearchFilter); // filtres de recherche envoyés pour le get
  const [selectedUsers, setSelectedUsers] = useState([]); // utilisateurs sélectionnés pour le filtrage
  const noteStarOffColor = darkMode === 2 ? "text-light" : "text-dark";
  const search = (e) => {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);
    const cleanedSearchFilter = {};
    for (const param in searchFilters) {
      if (searchFilters[param] && searchFilters[param].length)
        cleanedSearchFilter[param] = searchFilters[param];
    }
    const searchParamsConcatenated = new URLSearchParams({
      ...Object.fromEntries(searchParams),
      ...cleanedSearchFilter,
    });
    setSearchParams(searchParamsConcatenated);
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/ideas?${searchParamsConcatenated}`
    )
      .then((responseData) => {
        const totalPages = Math.ceil(responseData.total / 20);
        setIdeasData({
          ...responseData,
          ideas: responseData.ideas.map((idea) => {
            return {
              ...idea,
              final_note: idea.noted_by
                ? Math.floor(idea.note / idea.noted_by)
                : 0,
              poster:
                typeof idea.poster === "string"
                  ? JSON.parse(idea.poster)
                  : idea.poster,
            };
          }),
          totalPages,
        });
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };
  useEffect(() => {
    search();
  }, [searchParams.get("page")]);
  const reset = () => {
    setSearchFilters(initialSearchFilter);
    setSelectedUsers([]);
    setSearchParams(new URLSearchParams(initialSearchFilter));
  };
  const handleChangeSearchFilters = (e) => {
    let { value } = e.target;
    const { id } = e.target;
    if (id === "users") {
      value = selectedUsers.map((u) => u.id_user);
    } else if (id.includes("_to")) {
      const newDate = new Date(value * 1000);
      newDate.setHours(23, 59, 59, 999);
      value = Math.floor(newDate.getTime() / 1000);
    }
    setSearchFilters({ ...searchFilters, [id]: value });
  };

  const handleCheckCategorie = (event) => {
    let updatedList = [...(searchFilters.categories || [])];
    const value = parseInt(event.target.dataset.id, 10);
    const checked = !updatedList.includes(value);
    if (event.target.dataset.id === "-1") {
      if (updatedList.length < categories.length) {
        updatedList = categories.map((categorie) => categorie.id_categorie);
      } else {
        updatedList = [];
      }
    } else if (checked) {
      if (!updatedList.includes(value)) updatedList.push(value);
      if (
        !categories.find((categorie) => categorie.id_categorie === value)
          .id_parent_categorie
      ) {
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
      }
    } else {
      if (updatedList.includes(value))
        updatedList.splice(updatedList.indexOf(value), 1);
      if (
        !categories.find((categorie) => categorie.id_categorie === value)
          .id_parent_categorie
      ) {
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
        updatedList = organisations.map(
          (organisation) => organisation.id_organisation
        );
      } else {
        updatedList = [];
      }
    } else if (checked) {
      if (!updatedList.includes(value)) updatedList.push(value);
    } else if (updatedList.includes(value))
      updatedList.splice(updatedList.indexOf(value), 1);
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
      if (!updatedList.includes(value)) updatedList.push(value);
    } else if (updatedList.includes(value))
      updatedList.splice(updatedList.indexOf(value), 1);
    setSearchFilters({ ...searchFilters, status: updatedList });
  };
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [searchFilters.page]);
  return (
    <main className="container mx-auto px-3 mt-3">
      <h1 className="display-1">
        <i className="icons-document icons-size-3x mx-2" aria-hidden="true" />
        Innovations
      </h1>
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
          className={`collapse justify-content-center pt-1 p-4 m-2 h-auto rounded ${
            darkMode === 0 ? "bg-white" : ""
          }`}
          style={{
            backgroundColor: `${darkMode === 2 ? "#4d4f53" : ""}${
              darkMode === 1 ? "#e9e9e9" : ""
            }`,
          }}
          aria-labelledby="dLabel"
          id="filters"
        >
          <div>
            <form onSubmit={search} className="h-100">
              <section className="row-fluid h-50 mb-4">
                <div className="row-fluid">
                  <label htmlFor="user_id">Recherche par innovateur(s)</label>
                </div>

                <UserSearchSelect
                  label=""
                  users={searchFilters.users || []}
                  setUsers={(val) => {
                    setSearchFilters({
                      ...searchFilters,
                      users: val,
                    });
                  }}
                />
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
                <section className="col-md row- my-2">
                  <span className="lead">Par date de création</span>
                  <div className="row my-2">
                    <div className="col-lg row-">
                      <DatePicker
                        id="created_at_from"
                        label="À partir du"
                        value={searchFilters.created_at_from}
                        onChange={handleChangeSearchFilters}
                      />
                    </div>
                    <div className="col-lg row-">
                      <DatePicker
                        id="created_at_to"
                        label="Jusqu'au"
                        value={searchFilters.created_at_to}
                        onChange={handleChangeSearchFilters}
                      />
                    </div>
                  </div>
                </section>
                <section className="col-md row- my-2">
                  <div className="lead">Par date de finalisation</div>
                  <div className="row my-2">
                    <div className="col-lg row-">
                      <DatePicker
                        id="finished_at_from"
                        label="À partir du"
                        value={searchFilters.finished_at_from}
                        onChange={handleChangeSearchFilters}
                      />
                    </div>
                    <div className="col-lg row-">
                      <DatePicker
                        id="finished_at_to"
                        label="Jusqu'au"
                        value={searchFilters.finished_at_to}
                        onChange={handleChangeSearchFilters}
                      />
                    </div>
                  </div>
                </section>
              </section>
              <section className="row">
                {user.perms.manage_ideas_manager ||
                user.perms.manage_ideas_ambassador ||
                user.perms.manage_idea_all ||
                user.perms.manage_all ? (
                  <section className="col-md row- my-2">
                    <div className="lead">Par date de validation manager</div>
                    <div className="row my-2">
                      <div className="col-lg row-">
                        <DatePicker
                          id="manager_validated_at_from"
                          label="À partir du"
                          value={searchFilters.manager_validated_at_from}
                          onChange={handleChangeSearchFilters}
                        />
                      </div>
                      <div className="col-lg row-">
                        <DatePicker
                          id="manager_validated_at_to"
                          label="Jusqu'au"
                          value={searchFilters.manager_validated_at_to}
                          onChange={handleChangeSearchFilters}
                        />
                      </div>
                    </div>
                  </section>
                ) : undefined}
                {user.perms.manage_ideas_ambassador ||
                user.perms.manage_idea_all ||
                user.perms.manage_all ? (
                  <section className="col my-2">
                    <span className="lead">
                      Par date de validation ambassadeur
                    </span>
                    <div className="row my-2">
                      <div className="col-lg row-">
                        <DatePicker
                          id="ambassador_validated_at_from"
                          label="À partir du"
                          value={searchFilters.ambassador_validated_at_from}
                          onChange={handleChangeSearchFilters}
                        />
                      </div>
                      <div className="col-lg row-">
                        <DatePicker
                          id="ambassador_validated_at_to"
                          label="Jusqu'au"
                          value={searchFilters.ambassador_validated_at_to}
                          onChange={handleChangeSearchFilters}
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
        className={`list-group m-0 p-0 ${
          darkMode < 2 ? "bg-light" : "bg-dark"
        } rounded`}
      >
        {ideasData && ideasData.authors && ideasData.ideas.length ? (
          <>
            <Ordering
              searchFilters={searchParams}
              setSearchFilters={setSearchParams}
              orderElements={[
                "Date de création",
                "Date de finalisation",
                "Organisation",
                "Status",
                "Date de validation manager",
                "Date de validation ambassadeur",
              ]}
              executor={search}
            />
            <Pagination
              searchFilters={searchParams}
              setSearchFilters={setSearchParams}
              total={ideasData.total ?? 0}
            />
            <ul className="p-0 m-0">
              {ideasData.ideas
                .filter((idea) =>
                  ideasData.authors.find(
                    (author) =>
                      author.id_idea === idea.id_idea && author.is_author
                  )
                )
                .map((idea, i) => (
                  <li
                    className={`list-group-item management-item p-0 m-0 ${
                      i === 0 ? "rounded-top" : ""
                    }  ${
                      i === ideasData.ideas.length - 1 ? "rounded-bottom" : ""
                    }`}
                    key={idea.id_idea}
                  >
                    <Link
                      to={`${import.meta.env.VITE_FRONTEND_URI}/${
                        ideasData.authors.find(
                          (author) =>
                            author.id_idea === idea.id_idea && author.is_author
                        ).id_user === user.id_user &&
                        (idea.status === 0 || idea.status === 5)
                          ? "edit"
                          : "innovation"
                      }/${idea.id_idea}`}
                    >
                      <div className="management-item-content w-100 h-auto m-0">
                        <div
                          className="management-item-symbol rounded-left w-auto col-md-4"
                          style={{
                            background: `center / cover no-repeat url(${
                              (idea.poster &&
                                `${
                                  import.meta.env.VITE_BACKEND_URL
                                }/uploads/idea_${
                                  idea.id_idea
                                }/${idea.poster.file_name.replace(
                                  /\.[^/.]+$/,
                                  ""
                                )}-150.heif`) ||
                              defaultIdeaImg
                            })`,
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
                            {idea.name[0].toUpperCase()}
                            {idea.name.substring(1)}
                          </h1>
                          <ul className="meta-list font-weight-medium ml-2">
                            <li className="meta-list-item text-secondary">
                              Par{" "}
                              {`${
                                ideasData.authors.find(
                                  (author) =>
                                    author.id_idea === idea.id_idea &&
                                    author.is_author
                                ).firstname
                              } ${
                                ideasData.authors.find(
                                  (author) =>
                                    author.id_idea === idea.id_idea &&
                                    author.is_author
                                ).lastname
                              }`}{" "}
                              {ideasData.authors.find(
                                (author) =>
                                  author.id_idea === idea.id_idea &&
                                  !author.is_author
                              )
                                ? "et "
                                : ""}
                              {ideasData.authors
                                .filter(
                                  (author) =>
                                    author.id_idea === idea.id_idea &&
                                    !author.is_author
                                )
                                .map((author, j, arr) => (
                                  <span key={author.id_user}>
                                    {j === 0 ? "" : ","}
                                    {author.firstname} {author.lastname}
                                    {j === arr.length - 1 ? " " : ""}
                                  </span>
                                ))}
                              (
                              {
                                organisations.find(
                                  (organisation) =>
                                    organisation.id_organisation ===
                                    ideasData.authors.find(
                                      (author) =>
                                        author.id_idea === idea.id_idea &&
                                        author.is_author
                                    ).id_organisation
                                ).name
                              }
                              )
                            </li>
                            <li className="meta-list-item separator text-secondary">
                              <i
                                data-id="1"
                                className={`icons-bookmark icons-size-1x ${
                                  idea.final_note >= 1
                                    ? "text-warning"
                                    : noteStarOffColor
                                }`}
                                aria-hidden="true"
                              />
                              <i
                                data-id="2"
                                className={`icons-bookmark icons-size-1x ${
                                  idea.final_note >= 2
                                    ? "text-warning"
                                    : noteStarOffColor
                                }`}
                                aria-hidden="true"
                              />
                              <i
                                data-id="3"
                                className={`icons-bookmark icons-size-1x ${
                                  idea.final_note >= 3
                                    ? "text-warning"
                                    : noteStarOffColor
                                }`}
                                aria-hidden="true"
                              />
                              <i
                                data-id="4"
                                className={`icons-bookmark icons-size-1x ${
                                  idea.final_note >= 4
                                    ? "text-warning"
                                    : noteStarOffColor
                                }`}
                                aria-hidden="true"
                              />
                              <i
                                data-id="5"
                                className={`icons-bookmark icons-size-1x ${
                                  idea.final_note >= 5
                                    ? "text-warning"
                                    : noteStarOffColor
                                }`}
                                aria-hidden="true"
                              />
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
                            {user.role_id > 2 &&
                              idea.ambassador_validated_at && (
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
            <Pagination
              searchFilters={searchParams}
              setSearchFilters={setSearchParams}
              total={ideasData.total ?? 0}
            />
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
