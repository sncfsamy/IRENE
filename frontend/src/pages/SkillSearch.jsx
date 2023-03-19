import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Text from "../components/forms/Text";
import backgroundImage from "../assets/skills-background.heif";
import SharedContext from "../contexts/sharedContext";

export default function SkillSearch() {
  const { baseURL, token, organisations, darkMode, setIsLoading } =
    useContext(SharedContext);
  const [searchTerms, setSearchTerms] = useState({ search_terms: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const handleChange = (e) => {
    const { id, value } = e.target;
    setSearchTerms({ [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNoResults(false);
    if (searchTerms.search_terms.length >= 3) {
      fetch(`${baseURL}/skills?${new URLSearchParams(searchTerms)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((results) => {
          setSearchResults(results);
          if (results.length === 0) {
            setNoResults(true);
            setSearchResults([]);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setNoResults(true);
          console.warn(err);
          setIsLoading(false);
        });
    } else {
      setNoResults(true);
      setIsLoading(false);
      setSearchResults([]);
    }
  };

  return (
    <main className="container d-flex flex-column mt-3 h-100">
      <h1 className="display-1">Recherche de compétences</h1>
      <div
        className={`m-2 p-2 ${
          darkMode < 2 ? "bg-light" : "bg-gray-dark"
        } rounded`}
      >
        <h2>Compétences:</h2>
        <p>
          Besoin d'une compétence particulière ? Vous trouverez une liste d'
          innovateurs volontaires pour vous aider à concrétiser votre idée.
          Renseignez le mot clé et sélectionnez la personne qui correspond le
          mieux à votre besoin.
        </p>
      </div>
      <div className="text-center">
        {" "}
        <form onSubmit={handleSubmit} className="col-sm row-">
          <Text
            id="search_terms"
            className="m-auto"
            onChange={handleChange}
            value={searchTerms.search_terms}
            placeholder="Entrez la compétence recherchée ici"
            errorMessage={
              noResults
                ? [{ msg: "Cette recherche n'a retourné aucun résultat." }]
                : []
            }
          />
          <button
            className={`btn btn-${
              darkMode === 0 ? "warning" : "primary"
            } h-50 m-3`}
          >
            Rechercher cette compétence{" "}
            <i
              className="icons-search icons-size-x75 ml-2"
              aria-hidden="true"
            />
          </button>
        </form>
      </div>
      <div className="Skills-display mt-2">
        {searchResults.length ? (
          <div
            className={`row list-group ${darkMode === 0 && "bg-white"}${
              darkMode === 1 && "bg-light"
            } rounded`}
          >
            <ul className="p-0">
              {searchResults.map((user, i) => (
                <li
                  className={`list-group-item management-item p-0 ${
                    i === 0 ? "rounded-top" : ""
                  }  ${i === searchResults.length - 1 ? "rounded-bottom" : ""}`}
                  key={user.id}
                >
                  <div className="management-item-content w-100">
                    <div
                      className={`management-item-symbol position-relative ${
                        darkMode === 0 && "bg-white"
                      }${
                        darkMode === 1 && "bg-light"
                      } pt-4 text-nowrap w-auto rounded-left`}
                    >
                      <h1
                        className="text-center mx-auto pl-2 pr-5 text-nowrap"
                        style={{ borderTopRightRadius: ".4375rem" }}
                      >
                        <Link to={`/user/${user.id}`}>
                          <i
                            className="icons-circle-account-connected icons-size-2x float-left"
                            aria-hidden="true"
                          />
                        </Link>
                        <Link
                          to="#"
                          onClick={(e) => {
                            window.location.href = `mailto:${user.mail}`;
                            e.preventDefault();
                          }}
                        >
                          <i
                            className="icons-circle-mail icons-size-2x ml-2"
                            aria-hidden="true"
                          />
                        </Link>
                        &nbsp;
                        {user.firstname} {user.lastname}
                        &nbsp;
                      </h1>
                    </div>
                    <div
                      className={`management-item-main m-0 ${
                        darkMode === 0 && "bg-white"
                      }${darkMode === 1 && "bg-light"} rounded-right`}
                    >
                      <ul className="meta-list font-weight-medium ml-2">
                        <li className="meta-list-item text-secondary pt-3">
                          Région:{" "}
                          {
                            organisations.find(
                              (organisation) =>
                                organisation.id === user.organisation_id
                            ).name
                          }
                        </li>
                      </ul>
                      <ul className="meta-list font-weight-medium ml-2 mt-2">
                        <li className="meta-list-item text-secondary">
                          Compétences:
                        </li>
                      </ul>
                      <p className="mb-0 d-none d-lg-block m-3 ml-3 text-secondary">
                        {user.skills}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <img
            src={backgroundImage}
            className="w-100 h-auto rounded"
            alt="Recherche de compétence"
          />
        )}
      </div>
    </main>
  );
}
