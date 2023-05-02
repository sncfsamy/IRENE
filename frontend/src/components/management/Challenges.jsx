import PropTypes from "prop-types";
import { useContext, useState, useEffect } from "react";
import Input from "@components/forms/Input";
import Select from "@components/forms/Select";
import Textarea from "@components/forms/Textarea";
import DatePicker from "@components/forms/DatePicker";
import IdeaList from "@components/IdeasList";
import Pagination from "@components/Pagination";
import { useLocation } from "react-router-dom";
import SharedContext from "../../contexts/sharedContext";

export default function Challenges({
  setSelected,
  setSelectedToDelete,
  selected,
  addOpenAddModal,
  addRemoveCallback,
  searchFilters,
  setSearchFilters,
}) {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState({});
  const [description, setDescription] = useState(null);
  const [errors, setErrors] = useState([]);
  const [lastChangedRole, setLastChangedRole] = useState();
  const [challengeModification, setChallengeModification] = useState({});
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [assetsToReassign, setAssetsToReassign] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [notification, setNotification] = useState();
  const location = useLocation();
  const {
    organisations,
    customFetch,
    darkMode,
    user,
    setIsLoading,
    isLoading,
    addToast,
  } = useContext(SharedContext);
  const searchParams = {
    organisations: user.id_organisation,
    fullData: true,
  };
  const formatted = {
    organisations: [
      { id: -1, name: "Aucune" },
      ...organisations.map((organisation) => {
        return { ...organisation, id: organisation.id_organisation };
      }),
    ],
  };
  if (user.perms.manage_challenges_ambassador) {
    delete searchParams.organisations;
  }

  const selectAll = () => {
    if (selected.length === challenges.length) {
      setSelectedToDelete([]);
    } else {
      setSelectedToDelete(
        challenges.map((challenge) => challenge.id_challenge)
      );
    }
  };
  const selectChallenger = (event) => {
    const idElem = parseInt(event.target.value, 10);
    const newChallengers = [...challengeModification.challengers];
    const selectedChallenger = newChallengers.find(
      (challenger) => challenger.id_idea === idElem
    );
    selectedChallenger.selected = !selectedChallenger.selected;
    setChallengeModification({
      ...challengeModification,
      challengers: newChallengers,
    });
  };
  const selectWinnerChallenger = (event) => {
    const idElem = parseInt(event.target.value, 10);
    const newChallengers = [...challengeModification.challengers];
    const selectedChallenger = newChallengers.find(
      (challenger) => challenger.id_idea === idElem
    );
    selectedChallenger.winner = !selectedChallenger.winner;
    setChallengeModification({
      ...challengeModification,
      challengers: newChallengers,
    });
  };

  const loadChallenges = () => {
    setIsLoading(true);
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/challenges?${new URLSearchParams(
        searchParams
      )}`
    )
      .then((data) => {
        const newChallenges = [...data];
        for (let i = 0; i < newChallenges.length; i += 1) {
          newChallenges[i].authors = [];
          if (typeof newChallenges[i].challengers === "string") {
            newChallenges[i].challengers = JSON.parse(
              newChallenges[i].challengers
            );
          }
          if (typeof newChallenges[i].poster === "string") {
            newChallenges[i].poster = JSON.parse(newChallenges[i].poster);
          }
          if (newChallenges[i].challengers) {
            newChallenges[i].challengers.forEach((idea) =>
              idea.authors.forEach((author) =>
                newChallenges[i].authors.push(author)
              )
            );
          }
        }
        setChallenges(newChallenges);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn(err);
        setIsLoading(false);
      });
  };
  const handleChange = (e) => {
    const modifiedElement = {
      ...selectedChallenge,
      ...challengeModification,
    };
    if (
      e.target.id !== "description" &&
      e.target.id !== "selected" &&
      e.target.id !== "winner" &&
      e.target.id !== "poster"
    ) {
      modifiedElement[e.target.id] = e.target.value;
    } else if (e.target.id === "poster") {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("upload", e.target.files[0]);
      formData.append("challenge", "true");
      formData.append("id_challenge", selectedChallenge.id_challenge);
      formData.append("field", 0);
      formData.append("description", "");
      customFetch(
        `${import.meta.env.VITE_BACKEND_URL}/assets${
          selectedChallenge.id_challenge
            ? `/${selectedChallenge.id_challenge}`
            : ""
        }`,
        "POST",
        formData,
        true
      )
        .then((response) => {
          const newPoster = {
            file_name: response.urls.default,
            id_asset: parseInt(response.id_asset, 10),
          };
          setAssetsToReassign([...assetsToReassign, newPoster.id_asset]);
          setChallengeModification({
            ...challengeModification,
            poster: newPoster,
          });
          const oldChallenge = challenges.find(
            (challenge) =>
              challenge.id_challenge === challengeModification.id_challenge
          );
          if (oldChallenge) {
            oldChallenge.poster = newPoster;
          }
          setErrors([]);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn(err);
          setErrors([
            { msg: "Erreur lors du transfert.", param: "poster" },
            { msg: "Veuillez réessayer.", param: "poster" },
          ]);
          setIsLoading(false);
        });
    } else {
      modifiedElement.challengers.find(
        (challenger) => challenger.id_idea === e.target.id_idea
      )[e.target.id] = e.target.value;
    }
    setChallengeModification(modifiedElement);
  };
  const handleClick = (e) => {
    setNotification();
    setLastChangedRole();
    const challengeId = parseInt(
      e.target.parentElement.dataset.value ||
        e.target.parentElement.parentElement.dataset.value,
      10
    );
    const clickedChallenge = challenges.find(
      (testChallenge) => testChallenge.id_challenge === challengeId
    );
    setDescription(clickedChallenge.description);
    setChallengeModification(clickedChallenge);
    setSelectedChallenge(clickedChallenge);
  };
  const handleApply = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (
      addMode ||
      challengeModification.name ||
      challengeModification.description ||
      challengeModification.challengers
    ) {
      setIsLoading(true);
      const inAddMode = addMode;
      customFetch(
        `${import.meta.env.VITE_BACKEND_URL}/challenges${
          inAddMode ? "" : `/${selectedChallenge.id_challenge}`
        }`,
        inAddMode ? "POST" : "PUT",
        {
          ...challengeModification,
          description,
          started_at:
            typeof challengeModification.started_at === "string"
              ? Math.floor(
                  new Date(challengeModification.started_at).getTime() / 1000
                )
              : challengeModification.started_at,
          expired_at:
            typeof challengeModification.expired_at === "string"
              ? Math.floor(
                  new Date(challengeModification.expired_at).getTime() / 1000
                )
              : challengeModification.expired_at,
          assets: assetsToReassign,
        }
      )
        .then((response) => {
          if (response.errors) {
            setErrors(response.errors);
          } else {
            setNotification({
              success: true,
              add: inAddMode,
              challenge: challengeModification,
            });
            const newElems = inAddMode ? [...challenges] : [];
            let newChallenge = inAddMode
              ? {
                  ...challengeModification,
                  id_challenge: response.id,
                  description,
                }
              : {};
            if (!inAddMode) {
              for (let i = 0; i < challenges.length; i += 1) {
                if (
                  challenges[i].id_challenge === selectedChallenge.id_challenge
                ) {
                  newElems[i] = {
                    ...challenges[i],
                    ...challengeModification,
                    description,
                  };
                  newChallenge = newElems[i];
                } else {
                  newElems[i] = challenges[i];
                }
              }
            } else {
              newElems.push(newChallenge);
            }
            setChallenges(newElems);
            setLastChangedRole(newChallenge.id_challenge);
            setSelectedChallenge({});
            setChallengeModification({});
            setDescription(null);
            setIsLoading(false);
            $(".modal").modal("hide");
            addToast({
              title: addMode ? "Challenge créé" : "Challenge modifié",
              message: (
                <div>
                  Le challenge <b>{newChallenge.name}</b> a bien été{" "}
                  {addMode ? "créé" : "modifié"} !
                </div>
              ),
            });
          }
        })
        .catch((err) => {
          console.error(err);
          setNotification({});
          setLastChangedRole();
        })
        .finally(() => {
          setSelectedChallenge({});
          setIsLoading(false);
        });
    } else {
      setNotification();
      setLastChangedRole();
      setSelectedChallenge({});
    }
  };

  useEffect(() => {
    loadChallenges();
    addOpenAddModal("challenges", () => {
      setAddMode(true);
      const defaultChallenge = {
        name: "",
        description: "",
        started_at: Math.floor(new Date(Date.now()).getTime() / 1000),
        expired_at: Math.floor(new Date(Date.now()).getTime() / 1000),
        id_organisation: user.id_organisation,
        challengers: [],
      };
      setDescription("");
      setChallengeModification(defaultChallenge);
      setSelectedChallenge(defaultChallenge);
      $("#actionModal").modal("show");
    });
    addRemoveCallback("challenges", (deletedIds) => {
      if (deletedIds.length) {
        loadChallenges();
        setNotification({
          success: true,
          delete: true,
          deleted: deletedIds.length,
        });
      } else {
        setNotification({});
      }
    });
    $("#actionModal").on("hidden.bs.modal", () => {
      if (!isLoading) {
        setAddMode(false);
        setNotification();
        setLastChangedRole();
        setSelectedChallenge([]);
        setDescription(null);
      }
    });
  }, []);

  useEffect(() => {
    let results = [...challenges];
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

    setFilteredChallenges(results);
    setIsLoading(false);
  }, [searchFilters, challenges]);

  const imgURL = (ideaAsset, size) => {
    const ext = ideaAsset.file_name.substring(
      ideaAsset.file_name.lastIndexOf(".")
    );
    const fileName = ideaAsset.file_name.replace(ext, "");
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/challenges/challenge_${
      (selectedChallenge && selectedChallenge.id_challenge) ||
      (challengeModification && challengeModification.id_challenge)
    }/${fileName}${size ? `-${size}` : ""}${ext}`;
  };

  useEffect(() => {
    if (
      location.pathname ===
      `${import.meta.env.VITE_FRONTEND_URI}/manage/challenges`
    ) {
      setIsLoading(false);
    }
  }, [location.pathname]);

  const poster =
    (challengeModification && challengeModification.poster) ||
    (selectedChallenge && selectedChallenge.poster);
  return (
    <section>
      <p
        className={`text-${
          darkMode === 0 && notification && !notification.success
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
                  `Suppression de ${notification.deleted} challenge${
                    notification.deleted > 1 ? "s" : ""
                  } `
                ) : (
                  <>
                    {notification.add ? "Création" : "Modification"} du
                    challenge <b>{notification.challenge.name}</b>
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
            ? filteredChallenges.length
            : challenges.length
        }
      />
      <ul className="list-group">
        <li
          id="group1"
          className="list-group-item management-item  management-item-group"
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
            <div className="management-item-main text-left">
              <h2 className="m-0 p-0 text-left">Nom</h2>
            </div>
            <div className="management-item-main">
              <h2 className="m-0 p-0 text-left">Limité à une organisation</h2>
            </div>
            <div className="management-item-symbol text-left">
              <button
                className="btn btn-link"
                tabIndex="0"
                type="button"
                data-toggle="popover"
                data-trigger="focus"
                title="Innnovations participantes"
                data-content="Nombre d'innovations participantes à ce challenge"
              >
                <span className="sr-only">P</span>
                <i className="icons-file" />
              </button>
            </div>
            <div className="management-item-symbol text-left">
              <button
                className="btn btn-link"
                tabIndex="0"
                type="button"
                data-toggle="popover"
                data-trigger="focus"
                title="Innovations sélectionnées"
                data-content="Nombre d'innovations sélectionnées pour ce challenge."
              >
                <span className="sr-only">
                  Nombre d'innovations sélectionnées pour ce challenge.
                </span>
                <i className="icons-file text-warning" />
              </button>
            </div>
            <div className="management-item-symbol text-left">
              <button
                className="btn btn-link"
                tabIndex="0"
                type="button"
                data-toggle="popover"
                data-trigger="focus"
                title="Innovations vainqueurs"
                data-content="Nombre d'innovations ayant gagné ce challenge."
              >
                <span className="sr-only">
                  Nombre d'innovations ayant gagné ce challenge.
                </span>
                <i className="icons-file text-success" />
              </button>
            </div>
          </div>
        </li>
        {filteredChallenges &&
          filteredChallenges.map((challenge) => (
            <li
              id="group1"
              className={`list-group-item management-item management-item-group ${
                lastChangedRole === challenge.id_challenge ? "last-changed" : ""
              }`}
              key={challenge.id_challenge}
            >
              <div
                className="management-item-content py-0"
                data-value={challenge.id_challenge}
              >
                <div className="management-item-symbol ml-5 d-flex align-items-center">
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      value={challenge.id_challenge}
                      aria-label="Sélectionner pour suppression"
                      id={`delete_${challenge.id_challenge}`}
                      onChange={setSelected}
                      checked={selected.includes(challenge.id_challenge)}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor={`delete_${challenge.id_challenge}`}
                    >
                      <i
                        className="icons-large-suitcase icons-size-1x5 mt-n2 ml-n3 d-block"
                        aria-hidden="true"
                      />
                    </label>
                  </div>
                </div>
                <div
                  className="management-item-main text-left"
                  aria-hidden="true"
                  data-toggle="modal"
                  data-target="#actionModal"
                  onClick={handleClick}
                >
                  {challenge.name}
                </div>
                <div
                  className="management-item-main"
                  data-toggle="modal"
                  aria-hidden="true"
                  data-target="#actionModal"
                  onClick={handleClick}
                >
                  <h2 className="mb-0 text-base font-weight-normal">
                    {(organisations.find(
                      (organisation) =>
                        organisation.id_organisation ===
                        challenge.id_organisation
                    ) &&
                      organisations.find(
                        (organisation) =>
                          organisation.id_organisation ===
                          challenge.id_organisation
                      ).name) ||
                      "Aucune"}
                  </h2>
                </div>
                <div className="management-item-symbol text-left mr-1">
                  {challenge.challengers ? challenge.challengers.length : 0}
                </div>
                <div className="management-item-symbol text-left mr-1">
                  {challenge.challengers
                    ? challenge.challengers.filter(
                        (testChallenge) => testChallenge.selected
                      ).length
                    : 0}
                </div>
                <div className="management-item-symbol text-left mr-1">
                  {challenge.challengers
                    ? challenge.challengers.filter(
                        (testChallenge) => testChallenge.winner
                      ).length
                    : 0}
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
          className="modal-dialog modal-dialog-scrollable modal-xl modal-dialog-centered"
          role="document"
        >
          <div
            className="modal-content"
            style={{ overflowY: "scroll", maxHeight: "80%" }}
          >
            <div className="modal-header">
              <h5 className="h1 modal-title" id="actionModalLabel">
                {addMode
                  ? "Nouveau challenge"
                  : `Modification du challenge
                ${selectedChallenge ? `${selectedChallenge.name}` : ""}`}
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
                  placeHolder="Entrez le nom du challenge ici"
                  maxChars="255"
                  errorMessages={errors}
                  id="name"
                  value={
                    addMode
                      ? (challengeModification && challengeModification.name) ||
                        ""
                      : (challengeModification && challengeModification.name) ||
                        (selectedChallenge && selectedChallenge.name) ||
                        ""
                  }
                  onChange={handleChange}
                />
                <div
                  className={`${
                    darkMode < 2 ? "bg-light" : "bg-dark"
                  } rounded py-3 px-3 my-2`}
                >
                  <label htmlFor="poster">Bannière du challenge</label>

                  {poster && poster.file_name ? (
                    <div
                      className="row justify-content-center align-items-center"
                      style={{ maxHeight: "150px" }}
                    >
                      {challengeModification.poster && poster.file_name ? (
                        <img
                          alt={`Challenge: ${challengeModification.name}`}
                          src={`${
                            import.meta.env.VITE_BACKEND_URL
                          }/uploads/challenges/challenge_${
                            challengeModification &&
                            challengeModification.id_challenge
                          }/${poster.file_name}`}
                          srcSet={`${imgURL(poster, "150")} w150, ${imgURL(
                            poster,
                            "300"
                          )} w300, ${imgURL(poster, "800")} w800, ${imgURL(
                            poster,
                            "1080"
                          )} w1080`}
                          style={{
                            maxHeight: "150px",
                            width: "100%",
                            objectFit: "cover",
                            objectPosition: "center center",
                          }}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                  <div
                    className={`form-control-container ${
                      errors &&
                      errors.filter((error) => error.param === "poster").length
                        ? " is-invalid"
                        : ""
                    }`}
                  />
                  <div className="custom-file my-2 py-2">
                    <input
                      type="file"
                      className="custom-file-input"
                      value=""
                      onChange={handleChange}
                      accept="image/png, image/gif, image/jpeg, image/heif, image/bmp, image/tiff"
                      id="poster"
                    />
                    <label
                      className="custom-file-label text-left pl-3"
                      htmlFor="poster"
                    >
                      {poster && poster.file_name
                        ? poster.file_name.replace(
                            /[\w|\d]{8}-[\w|\d]{4}-[\w|\d]{4}-[\w|\d]{4}-[\w|\d]{12,13}-/g,
                            ""
                          )
                        : "Aucun fichier sélectionné"}
                    </label>
                  </div>
                  <span className="form-control-state" />
                  <div
                    className="invalid-feedback pb-4"
                    id="poster_error"
                    style={{
                      display:
                        errors &&
                        errors.filter((error) => error.param === "poster")
                          .length
                          ? "block"
                          : "none",
                    }}
                  >
                    {errors
                      ? errors
                          .filter((error) => error.param === "poster")
                          .map((err) => <div key={err.msg}>{err.msg}</div>)
                      : ""}
                  </div>
                  <span>
                    Note: le traitement de l'images prendra quelques instants.
                  </span>
                </div>
                {description !== null && (selectedChallenge || addMode) ? (
                  <Textarea
                    label="Description"
                    required
                    id="description"
                    useAdvancedEditor
                    errorMessages={errors}
                    setAssetsToReassign={setAssetsToReassign}
                    extraData={{
                      id_challenge: addMode
                        ? undefined
                        : selectedChallenge && selectedChallenge.id_challenge,
                      field: 1,
                    }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                ) : (
                  ""
                )}
                <Select
                  id="id_organisation"
                  label="Organisation:"
                  ariaLabel="Organisation"
                  values={formatted.organisations}
                  selectedValue={
                    addMode
                      ? (challengeModification &&
                          challengeModification.id_organisation) ||
                        -1
                      : challengeModification.id_organisation ||
                        selectedChallenge.id_organisation
                  }
                  setSelectedValue={handleChange}
                />
                <DatePicker
                  label="Date de début du challenge:"
                  id="started_at"
                  className="mt-2"
                  value={
                    addMode
                      ? (challengeModification &&
                          challengeModification.started_at) ||
                        new Date(Date.now()).getTime() / 1000
                      : (challengeModification &&
                          challengeModification.started_at) ||
                        (selectedChallenge && selectedChallenge.started_at) ||
                        new Date(Date.now()).getTime() / 1000
                  }
                  onChange={handleChange}
                />
                <DatePicker
                  label="Date de fin du challenge:"
                  id="expired_at"
                  className="mt-1"
                  value={
                    addMode
                      ? (challengeModification &&
                          challengeModification.expired_at) ||
                        new Date(Date.now()).getTime() / 1000
                      : (challengeModification &&
                          challengeModification.expired_at) ||
                        (selectedChallenge && selectedChallenge.expired_at) ||
                        new Date(Date.now()).getTime() / 1000
                  }
                  onChange={handleChange}
                />
                {selectedChallenge &&
                selectedChallenge.challengers &&
                selectedChallenge.challengers.length ? (
                  <>
                    <h2>Idées retenues:</h2>
                    <IdeaList
                      id="selected"
                      ideas={selectedChallenge.challengers.map((challenger) => {
                        return { ...challenger, authors: undefined };
                      })}
                      authors={selectedChallenge.authors || []}
                      selected={selectedChallenge.challengers
                        .filter((challenger) => challenger.selected)
                        .map((challenger) => challenger.id_idea)}
                      setSelected={selectChallenger}
                    />

                    <h2>Idées vainqueur(s):</h2>
                    <IdeaList
                      id="winners"
                      ideas={selectedChallenge.challengers
                        .filter((challenger) => challenger.selected)
                        .map((challenger) => {
                          return { ...challenger, authors: undefined };
                        })}
                      authors={selectedChallenge.authors || []}
                      selected={selectedChallenge.challengers
                        .filter((challenger) => challenger.winner)
                        .map((challenger) => challenger.id_idea)}
                      setSelected={selectWinnerChallenger}
                    />
                  </>
                ) : (
                  "S'afficheront ici les innovations déposées sur ce challenge afin de pouvoir les selectionner."
                )}
              </div>
              <div className="modal-footer justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedChallenge();
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
                  disabled={!(challengeModification?.name && description)}
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
            ? filteredChallenges.length
            : challenges.length
        }
      />
    </section>
  );
}

Challenges.propTypes = {
  selected: PropTypes.arrayOf(PropTypes.number),
  setSelected: PropTypes.func,
  setSelectedToDelete: PropTypes.func,
  addOpenAddModal: PropTypes.func,
  addRemoveCallback: PropTypes.func,
  searchFilters: PropTypes.instanceOf(URLSearchParams).isRequired,
  setSearchFilters: PropTypes.func,
};
Challenges.defaultProps = {
  selected: [],
  setSelected: null,
  setSelectedToDelete: null,
  addOpenAddModal: null,
  addRemoveCallback: null,
  setSearchFilters: null,
};
