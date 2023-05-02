import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import Input from "@components/forms/Input";
import Select from "@components/forms/Select";
import Pagination from "@components/Pagination";
import { useLocation } from "react-router-dom";
import SharedContext from "../../contexts/sharedContext";

export default function Teams({
  setTeams,
  setSelected,
  setSelectedToDelete,
  selected,
  addOpenAddModal,
  addRemoveCallback,
  searchFilters,
  setSearchFilters,
}) {
  const {
    teams,
    organisations,
    customFetch,
    darkMode,
    setIsLoading,
    user,
    addToast,
  } = useContext(SharedContext);
  const [selectedTeam, setSelectedTeam] = useState({});
  const [lastChangedTeam, setLastChangedTeam] = useState();
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [errors, setErrors] = useState([]);
  const [teamModification, setTeamModification] = useState({
    id_organisation: user.id_organisation,
  });
  const [addMode, setAddMode] = useState(false);
  const location = useLocation();
  const [notification, setNotification] = useState();
  const formattedOrganisations = organisations.map((organisation) => {
    return { ...organisation, id: organisation.id_organisation };
  });
  const handleChange = (e) => {
    setTeamModification({
      ...teamModification,
      [e.target.id]: e.target.value,
    });
  };
  const selectAll = () => {
    if (selected.length === teams.length) {
      setSelectedToDelete([]);
    } else {
      setSelectedToDelete(teams.map((team) => team.id_team));
    }
  };

  const handleClick = (e) => {
    setNotification();
    setLastChangedTeam();
    setTeamModification({});
    const teamId = parseInt(
      e.target.parentElement.dataset.value ||
        e.target.parentElement.parentElement.dataset.value,
      10
    );
    setSelectedTeam(teams.find((team) => team.id_team === teamId));
  };

  const handleApply = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (addMode || teamModification.id_organisation || teamModification.name) {
      setIsLoading(true);
      customFetch(
        `${import.meta.env.VITE_BACKEND_URL}/teams${
          addMode ? "" : `/${selectedTeam.id_team}`
        }`,
        addMode ? "POST" : "PUT",
        teamModification
      )
        .then((response) => {
          if (response.errors) {
            setErrors(response.errors);
          } else {
            setNotification({
              success: true,
              add: addMode,
              team: teamModification,
            });
            const newElems = addMode ? [...teams] : [];
            let newElem = addMode
              ? { ...teamModification, id_team: response.id }
              : {};
            if (!addMode) {
              for (let i = 0; i < teams.length; i += 1) {
                if (teams[i].id_team === selectedTeam.id_team) {
                  newElems[i] = { ...teams[i], ...teamModification };
                  newElem = newElems[i];
                } else {
                  newElems[i] = teams[i];
                }
              }
            } else {
              newElems.push(newElem);
            }
            setTeams(newElems);
            setLastChangedTeam(newElem.id_team);
            setTeamModification({});
            $(".modal").modal("hide");
            addToast({
              title: addMode ? "Equipe créée" : "Equipe modifiée",
              message: (
                <div>
                  L'équipe{" "}
                  <b>
                    {
                      organisations.find(
                        (organisation) =>
                          organisation.id_organisation ===
                          newElem.id_organisation
                      ).name
                    }{" "}
                    \ {newElem.name}
                  </b>{" "}
                  a bien été {addMode ? "créée" : "modifiée"} !
                </div>
              ),
            });
          }
        })
        .catch((err) => {
          console.error(err);
          setNotification({});
          setLastChangedTeam();
        })
        .finally(() => {
          setIsLoading(false);
          setSelectedTeam({});
        });
    } else {
      setNotification();
      setTeamModification({});
      setSelectedTeam();
    }
  };

  useEffect(() => {
    if (location.pathname === "/manage/teams") {
      setIsLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    addOpenAddModal("teams", () => {
      setAddMode(true);
      $("#actionModal").modal("show");
      $("#actionModal").on("hidden.bs.modal", () => {
        setAddMode(false);
      });
    });
    addRemoveCallback("teams", (deletedIds) => {
      if (deletedIds.length) {
        setTeams([
          ...teams.filter((team) => !deletedIds.includes(team.id_team)),
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
    let results = [...teams];
    if (
      searchFilters.has("search_terms") &&
      searchFilters.get("search_terms")
    ) {
      results = results.filter((element) => {
        const organisation = organisations.find(
          (org) => org.id_organisation === element.id_organisation
        );
        return (
          element.name
            .toLowerCase()
            .includes(searchFilters.get("search_terms").toLowerCase()) ||
          (organisation &&
            organisation.name
              .toLowerCase()
              .includes(searchFilters.get("search_terms").toLowerCase()))
        );
      });
    }

    results = results.filter(
      (_, i) =>
        i >= (searchFilters.get("page") - 1) * searchFilters.get("limit") &&
        i < searchFilters.get("page") * searchFilters.get("limit")
    );
    setFilteredTeams(results);
    setIsLoading(false);
  }, [searchFilters, teams]);

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
                    <b>{notification.team.name} </b>
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
            ? filteredTeams.length
            : teams.length
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
            <div className="management-item-main col-">
              <h2 className="m-0 p-0 text-left">Nom</h2>
            </div>
            <div className="management-item-main col-">
              <h2 className="m-0 p-0 text-left">Organisation</h2>
            </div>
            <div className="management-item-symbol col-1 mr-2">
              <button
                className="btn btn-link"
                type="button"
                tabIndex="0"
                data-toggle="popover"
                data-trigger="focus"
                title="Membres"
                data-content="Nombre d'utilisateurs membres de l'équipe."
              >
                <span className="sr-only">
                  Nombre d'utilisateurs membres de l'équipe.
                </span>
                <i className="icons-circle-account-connected" />
              </button>
            </div>
            <div className="management-item-symbol col-1 ml-2">
              <button
                className="btn btn-link"
                type="button"
                tabIndex="0"
                data-toggle="popover"
                data-trigger="focus"
                title="Innovations"
                data-content="Nombre cumulés d'innovations (auteur ou coauteur confondus) des membres de cette équipe"
              >
                <span className="sr-only">
                  Nombre cumulés des membres de cette équipe
                </span>
                <i className="icons-file" />
              </button>
            </div>
          </div>
        </li>
        {filteredTeams &&
          filteredTeams.map((team) => (
            <li
              id="group1"
              className={`list-group-item management-item management-item-group ${
                lastChangedTeam === team.id_team ? "last-changed" : ""
              }`}
              key={team.id_team}
            >
              <div
                className="management-item-content py-0"
                data-value={team.id_team}
              >
                <div className="management-item-symbol ml-5 d-flex align-items-center">
                  <div className="custom-control custom-checkbox align-middle">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      value={team.id_team}
                      aria-label="Sélectionner pour suppression"
                      id={`delete_${team.id_team}`}
                      onChange={setSelected}
                      checked={selected.includes(team.id_team)}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor={`delete_${team.id_team}`}
                    >
                      <i
                        className="icons-large-group icons-size-1x5 mt-n2 ml-n3 d-block"
                        aria-hidden="true"
                      />
                    </label>
                  </div>
                </div>
                <div
                  className="management-item-main text-left col-"
                  data-toggle="modal"
                  aria-hidden="true"
                  data-target="#actionModal"
                  onClick={handleClick}
                >
                  {team.name}
                </div>
                <div
                  className="management-item-main col-"
                  data-toggle="modal"
                  aria-hidden="true"
                  data-target="#actionModal"
                  onClick={handleClick}
                >
                  {
                    organisations.find(
                      (organisation) =>
                        organisation.id_organisation === team.id_organisation
                    ).name
                  }
                </div>
                <div className="management-item-symbol col-1 mr-2">
                  {team.users}
                </div>
                <div className="management-item-symbol col-1 ml-2">
                  {team.ideas}
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
                  ? "Nouvelle équipe"
                  : `Modification de
                ${selectedTeam ? `${selectedTeam.name}` : ""}`}
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
                  placeHolder="Entrez le nom de l'équipe ici"
                  maxChars="255"
                  errorMessages={errors}
                  id="name"
                  value={
                    addMode
                      ? (teamModification && teamModification.name) || ""
                      : (teamModification && teamModification.name) ||
                        (selectedTeam && selectedTeam.name) ||
                        ""
                  }
                  onChange={handleChange}
                />
                <Select
                  id="id_organisation"
                  label="Organisation"
                  ariaLabel="Organisation"
                  selectedValue={
                    addMode
                      ? (teamModification &&
                          teamModification.id_organisation) ||
                        organisations[0].id_organisation
                      : (teamModification &&
                          teamModification.id_organisation) ||
                        (selectedTeam && selectedTeam.id_organisation) ||
                        organisations[0].id_organisation
                  }
                  values={formattedOrganisations}
                  setSelectedValue={handleChange}
                />
              </div>
              <div className="modal-footer justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedTeam();
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
                  disabled={!teamModification?.name && !selectedTeam?.name}
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
            ? filteredTeams.length
            : teams.length
        }
      />
    </section>
  );
}

Teams.propTypes = {
  setTeams: PropTypes.func,
  selected: PropTypes.arrayOf(PropTypes.number),
  setSelected: PropTypes.func,
  setSelectedToDelete: PropTypes.func,
  addOpenAddModal: PropTypes.func,
  addRemoveCallback: PropTypes.func,
  searchFilters: PropTypes.instanceOf(URLSearchParams).isRequired,
  setSearchFilters: PropTypes.func,
};
Teams.defaultProps = {
  selected: [],
  setTeams: null,
  setSelected: null,
  setSelectedToDelete: null,
  addOpenAddModal: null,
  addRemoveCallback: null,
  setSearchFilters: null,
};
