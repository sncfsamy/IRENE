import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import Text from "@components/forms/Text";
import Pagination from "@components/Pagination";
import { useLocation } from "react-router-dom";
import SharedContext from "../../contexts/sharedContext";

export default function Organisations({
  setOrganisations,
  setTeams,
  setSelected,
  setSelectedToDelete,
  selected,
  addOpenAddModal,
  addRemoveCallback,
  searchFilters,
  setSearchFilters,
}) {
  const [selectedOrganisation, setSelectedOrganisation] = useState();
  const [lastChangedOrganisation, setLastChangedOrganisation] = useState();
  const [organisationModification, setOrganisationModification] = useState({});
  const [filteredOrganisations, setFilteredOrganisations] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [notification, setNotification] = useState();
  const location = useLocation();
  const { organisations, teams, customFetch, darkMode, setIsLoading } =
    useContext(SharedContext);
  const handleChange = (e) => {
    setOrganisationModification({
      ...organisationModification,
      name: e.target.value,
    });
  };
  const selectAll = () => {
    if (selected.length === organisations.length) {
      setSelectedToDelete([]);
    } else {
      setSelectedToDelete(organisations.map((org) => org.id_organisation));
    }
  };
  const handleClick = (e) => {
    const organisationId = parseInt(
      e.target.parentElement.dataset.value ||
        e.target.parentElement.parentElement.dataset.value,
      10
    );
    if (!Number.isNaN(organisationId)) {
      setNotification();
      setLastChangedOrganisation();
      setOrganisationModification({});
      setSelectedOrganisation(
        organisations.find(
          (organisation) => organisation.id_organisation === organisationId
        )
      );
    }
  };
  const handleApply = (e) => {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);
    const inAddMode = addMode;
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/organisations${
        inAddMode ? "" : `/${selectedOrganisation.id_organisation}`
      }`,
      inAddMode ? "POST" : "PUT",
      organisationModification
    )
      .then((response) => {
        setNotification({
          success: true,
          organisation: organisationModification,
        });
        const newElems = inAddMode ? [...organisations] : [];
        let newOrganisation = inAddMode
          ? { ...organisationModification, id_organisation: response.id }
          : {};
        if (!inAddMode) {
          for (let i = 0; i < organisations.length; i += 1) {
            if (
              organisations[i].id_organisation ===
              selectedOrganisation.id_organisation
            ) {
              newElems[i] = {
                ...organisations[i],
                ...organisationModification,
              };
              newOrganisation = newElems[i];
            } else {
              newElems[i] = organisations[i];
            }
          }
        } else {
          newElems.push(newOrganisation);
        }
        setOrganisations(newElems);
        setLastChangedOrganisation(newOrganisation.id_organisation);
        setSelectedOrganisation();
        setOrganisationModification({});
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setNotification({});
        setLastChangedOrganisation();
        setSelectedOrganisation();
        setIsLoading(false);
      });
  };

  useEffect(() => {
    addOpenAddModal("organisations", () => {
      setAddMode(true);
      setOrganisationModification({});
      $("#actionModal").modal("show");
      $("#actionModal").on("hidden.bs.modal", () => {
        setAddMode(false);
      });
    });
    addRemoveCallback("organisations", (deletedIds) => {
      if (deletedIds.length) {
        setTeams(
          teams.filter((team) => !deletedIds.includes(team.id_organisation))
        );
        setOrganisations(
          organisations.filter(
            (organisation) => !deletedIds.includes(organisation.id_organisation)
          )
        );
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
    let results = [...organisations];
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

    setFilteredOrganisations(results);
    setIsLoading(false);
  }, [searchFilters, organisations, location.pathname]);
  useEffect(() => {
    if (location.pathname === "/manage/organisations") {
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
        style={{ height: "20px" }}
      >
        {notification ? (
          <>
            {notification.success ? (
              <>
                <i className="icons-checked mr-2" aria-hidden="true" />
                {notification.delete ? (
                  `Suppression de ${notification.deleted} organisation${
                    notification.deleted > 1 ? "s" : ""
                  } `
                ) : (
                  <>
                    {notification.add ? "Création" : "Modification"} de
                    l'organisation <b>{notification.organisation.name} </b>
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
            ? filteredOrganisations.length
            : organisations.length
        }
      />
      <ul className="list-group">
        <li id="group1" className="list-group-item management-item">
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
            <div className="management-item-main col-">
              <h2 className="mb-0 text-base text-left">Nom</h2>
            </div>
            <div className="management-item-symbol col-1">
              <button
                className="btn btn-link"
                tabIndex="0"
                type="button"
                data-toggle="popover"
                data-trigger="focus"
                title="Utilisateurs"
                data-content="Nombre d'utilisateurs de l'organisation"
              >
                <span className="sr-only">
                  Nombre d'utilisateurs de l'organisation
                </span>
                <i className="icons-circle-account-connected" />
              </button>
            </div>
            <div className="management-item-symbol text-left col-1">
              <button
                className="btn btn-link"
                tabIndex="0"
                type="button"
                data-toggle="popover"
                data-trigger="focus"
                title="Innnovations"
                data-content="Nombre d'innovations de l'organisation"
              >
                <span className="sr-only">
                  Nombre d'innovations de l'organisation
                </span>
                <i className="icons-document" />
              </button>
            </div>
            <div className="management-item-symbol text-left col-1">
              <button
                className="btn btn-link"
                tabIndex="0"
                type="button"
                data-toggle="popover"
                data-trigger="focus"
                title="Challenges"
                data-content="Nombre de challenges de l'organisation"
              >
                <span className="sr-only">
                  Nombre de challenges de l'organisation
                </span>
                <i className="icons-large-suitcase" />
              </button>
            </div>
          </div>
        </li>
        {filteredOrganisations &&
          filteredOrganisations.map((organisation) => (
            <li
              id="group1"
              className={`list-group-item management-item management-item-group ${
                lastChangedOrganisation === organisation.id_organisation
                  ? "last-changed"
                  : ""
              }`}
              key={organisation.id_organisation}
            >
              <div
                className="management-item-content py-0"
                data-value={organisation.id_organisation}
              >
                <div className="management-item-symbol ml-5 d-flex align-items-center">
                  <div className="custom-control custom-checkbox align-middle">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      value={organisation.id_organisation}
                      aria-label="Sélectionner pour suppression"
                      id={`delete_${organisation.id_organisation}`}
                      onChange={setSelected}
                      checked={selected.includes(organisation.id_organisation)}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor={`delete_${organisation.id_organisation}`}
                    >
                      <i
                        className="icons-large-france icons-size-1x5 mt-n2 ml-n3 d-block"
                        aria-hidden="true"
                      />
                    </label>
                  </div>
                </div>
                <div
                  className="management-item-main col-"
                  data-toggle="modal"
                  data-target="#actionModal"
                  aria-hidden="true"
                  onClick={handleClick}
                >
                  <h2 className="mb-0 text-base font-weight-normal">
                    {organisation.name}
                  </h2>
                </div>
                <div className="management-item-main text-left col-1">
                  {(organisation.users ?? 0)
                    .toLocaleString("en")
                    .replace(/,/g, " ")}
                </div>
                <div className="management-item-main text-left col-1">
                  {(organisation.ideas ?? 0)
                    .toLocaleString("en")
                    .replace(/,/g, " ")}
                </div>
                <div className="management-item-main text-left col-1">
                  {(organisation.challenges ?? 0)
                    .toLocaleString("en")
                    .replace(/,/g, " ")}
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
                  ? "Nouvelle catégorie"
                  : `Modification de
                ${selectedOrganisation ? `${selectedOrganisation.name}` : ""}`}
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
              <div className="modal-body mt-3 mb-n3">
                <Text
                  label="Nom"
                  required
                  placeholder="Entrez le nom de l'entité ici"
                  maxChars="255"
                  errorMessages={[]}
                  id="organisation"
                  value={
                    addMode
                      ? organisationModification.name || ""
                      : (organisationModification &&
                          organisationModification.name) ||
                        (selectedOrganisation && selectedOrganisation.name) ||
                        ""
                  }
                  onChange={handleChange}
                />
              </div>
              <div className="modal-footer justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedOrganisation();
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
                  data-dismiss="modal"
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
            ? filteredOrganisations.length
            : organisations.length
        }
      />
    </section>
  );
}

Organisations.propTypes = {
  setTeams: PropTypes.func,
  setOrganisations: PropTypes.func,
  selected: PropTypes.arrayOf(PropTypes.number),
  setSelected: PropTypes.func,
  setSelectedToDelete: PropTypes.func,
  addOpenAddModal: PropTypes.func,
  addRemoveCallback: PropTypes.func,
  searchFilters: PropTypes.instanceOf(URLSearchParams).isRequired,
  setSearchFilters: PropTypes.func,
};
Organisations.defaultProps = {
  selected: [],
  setTeams: null,
  setOrganisations: null,
  setSelected: null,
  setSelectedToDelete: null,
  addOpenAddModal: null,
  addRemoveCallback: null,
  setSearchFilters: null,
};
