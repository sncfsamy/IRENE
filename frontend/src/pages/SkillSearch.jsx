import { useContext, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import backgroundImage from "@assets/skills-background.heif";
import Pagination from "@components/Pagination";
import SharedContext from "../contexts/sharedContext";

export default function SkillSearch() {
  const { organisations, teams, darkMode, setIsLoading, customFetch } =
    useContext(SharedContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerms, setSearchTerms] = useState(
    searchParams.has("search_terms") ? searchParams.get("search_terms") : ""
  );
  const [iconHover, setIconHover] = useState();
  const [searchResults, setSearchResults] = useState([]);
  const hoverIcon = (e) => {
    setIconHover(e.target.dataset.target);
  };
  const search = () => {
    setIsLoading(true);
    if (!searchParams.has("page")) {
      searchParams.set("page", 1);
      setSearchParams(searchParams);
    }
    customFetch(`${import.meta.env.VITE_BACKEND_URL}/skills?${searchParams}`)
      .then((results) => {
        setSearchResults(results);
        if (results.length === 0) {
          setSearchResults();
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn(err);
        setIsLoading(false);
      });
  };
  const blurIcon = () => {
    setIconHover();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerms.length >= 3) {
      searchParams.set("search_terms", searchTerms);
      if (!searchParams.has("page")) searchParams.set("page", 1);
      setSearchParams(searchParams);
    } else {
      setIsLoading(false);
      setSearchResults([]);
    }
  };
  useEffect(() => setIsLoading(false), []);
  useEffect(() => {
    if (searchTerms) {
      search();
    }
  }, [searchParams.get("page"), searchParams.get("search_terms")]);
  return (
    <main className="container d-flex flex-column mt-3 h-100">
      <h1 className="display-1">
        <i
          className="icons-circle-account-connected icons-size-3x mx-2"
          aria-hidden="true"
        />
        Recherche de compétences
      </h1>
      <div
        className={`p-2 my-3 rounded ${darkMode === 0 ? "bg-white" : ""}`}
        style={{
          backgroundColor: `${darkMode === 2 ? "#4d4f53" : ""}${
            darkMode === 1 ? "#e9e9e9" : ""
          }`,
        }}
      >
        <div
          className={`p-3 ${
            darkMode < 2 ? "bg-light" : "bg-gray-dark"
          } rounded`}
        >
          <h2>Compétences:</h2>
          <p className="m-0">
            Besoin d'une compétence particulière ? Vous trouverez une liste d'
            innovateurs volontaires pour vous aider à concrétiser votre idée.
            Renseignez le mot clé et sélectionnez la personne qui correspond le
            mieux à votre besoin.
          </p>
        </div>
        <div className="text-center">
          {" "}
          <form onSubmit={handleSubmit} className="my-5">
            <div className="input-group">
              <div className="form-control-container">
                <input
                  type="text"
                  className="form-control"
                  id="search_terms"
                  placeholder="Compétence recherchée"
                  autoComplete="off"
                  onChange={(e) => setSearchTerms(e.target.value)}
                  value={searchTerms}
                />
              </div>
              <div className="input-group-append">
                <button
                  type="submit"
                  className={`btn btn-${
                    darkMode === 0 ? "warning" : "primary"
                  }`}
                >
                  <span className="d-none d-sm-inline">Rechercher </span>
                  <i className="icons-search" aria-hidden="false" />
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="Skills-display mt-2">
          {searchResults.users && searchResults.users.length ? (
            <>
              <Pagination
                searchFilters={searchParams}
                setSearchFilters={setSearchParams}
                total={searchResults.total}
              />
              <div
                className={`row list-group ${darkMode === 0 && "bg-white"}${
                  darkMode === 1 && "bg-light"
                } rounded`}
              >
                <ul className="p-0 m-2">
                  {searchResults.users.map((user, i) => (
                    <li
                      className={`list-group-item management-item p-0 ${
                        i === 0 ? "rounded-top" : ""
                      }  ${
                        i === searchResults.users.length - 1
                          ? "rounded-bottom"
                          : ""
                      }`}
                      key={user.id_user}
                    >
                      <div className="management-item-content w-100 flex-column flex-sm-row">
                        <div
                          className={`management-item-symbol w-100 w-md-50 w-lg-25 position-relative ${
                            darkMode === 0 && "bg-white"
                          }${
                            darkMode === 1 && "bg-light"
                          } pt-4 text-nowrap w-auto rounded-left text-center`}
                        >
                          <div className="my-2">
                            <Link
                              to={`${import.meta.env.VITE_FRONTEND_URI}/user/${
                                user.id_user
                              }`}
                              className="mx-3"
                            >
                              <i
                                onMouseEnter={hoverIcon}
                                onMouseLeave={blurIcon}
                                data-target={`profile_${user.id_user}`}
                                className="icons-circle-account-connected icons-size-2x"
                                aria-hidden="true"
                              />
                            </Link>
                            <Link
                              to={`${
                                import.meta.env.VITE_FRONTEND_URI
                              }/search?users=${user.id_user}`}
                              className="mx-3"
                            >
                              <i
                                onMouseEnter={hoverIcon}
                                onMouseLeave={blurIcon}
                                data-target={`innovations_${user.id_user}`}
                                className="icons-circle-works icons-size-2x"
                                aria-hidden="true"
                              />
                            </Link>
                            <Link
                              className="mx-3"
                              to={`${import.meta.env.VITE_FRONTEND_URI}/skills`}
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = `mailto:${user.mail}`;
                              }}
                            >
                              <i
                                onMouseEnter={hoverIcon}
                                onMouseLeave={blurIcon}
                                data-target={`mail_${user.id_user}`}
                                className="icons-circle-mail icons-size-2x"
                                aria-hidden="true"
                              />
                            </Link>
                          </div>
                          <div style={{ height: "10px" }}>
                            {iconHover === `profile_${user.id_user}`
                              ? "Voir son profil"
                              : ""}
                            {iconHover === `innovations_${user.id_user}`
                              ? "Voir ses innovations"
                              : ""}
                            {iconHover === `mail_${user.id_user}`
                              ? "Lui envoyer un mail"
                              : ""}
                          </div>
                          &nbsp;
                          <h1 className="text-left text-sm-center mx-auto pl-2 pr-5 text-nowrap">
                            <div>
                              {user.firstname} {user.lastname}
                            </div>
                            &nbsp;
                          </h1>
                        </div>
                        <div
                          className={`management-item-main w-100 w-md-50 w-lg-75 pl-lg-5 m-0 ${
                            darkMode === 0 && "bg-white"
                          }${darkMode === 1 && "bg-light"} rounded-right`}
                        >
                          <ul className="meta-list font-weight-medium ml-2">
                            <li className="meta-list-item text-secondary pt-3">
                              {
                                organisations.find(
                                  (organisation) =>
                                    organisation.id_organisation ===
                                    user.id_organisation
                                ).name
                              }
                              {" / "}
                              {
                                teams.find(
                                  (team) => team.id_team === user.id_team
                                ).name
                              }
                            </li>
                          </ul>
                          <ul className="meta-list font-weight-medium ml-2 mt-2">
                            <li className="meta-list-item text-secondary">
                              Compétences:
                            </li>
                          </ul>
                          <p className="mb-0 m-3 ml-3 text-secondary">
                            {user.skills}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <Pagination
                searchFilters={searchParams}
                setSearchFilters={setSearchParams}
                total={searchResults.total}
              />
            </>
          ) : (
            <img
              src={backgroundImage}
              className="w-100 h-auto rounded"
              alt="Recherche de compétence"
            />
          )}
        </div>
      </div>
    </main>
  );
}
