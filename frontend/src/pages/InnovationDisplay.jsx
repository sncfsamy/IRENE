import { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import SharedContext from "../contexts/sharedContext";
import bgImage from "../assets/idea_default_picture.heif";
import "../assets/ck-content.css";
import CategorieSelector from "@components/CategorieSelector";

const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export default function InnovationDisplay() {
  const [displayShow, setDisplayShow] = useState({
    idea: {
      user_id: 0,
      name: "",
      id: 0,
      description: "",
      created_at: 0,
      finished_at: 0,
      views: "",
      status: "",
      problem: "",
      solution: "",
      gains: "",
      categories: [],
    },
    users: [
      {
        id: 0,
        lastname: "",
        firstname: "",
      },
    ],
    coauthors: [],
  });
  const detailedStatus = [
    "En cours de rédaction",
    "Attente validation manager",
    "Attente validation ambassadeur",
    "Cloturée avec succès",
    "Refusée",
  ];

  const { id } = useParams();
  const { baseURL, token, user, setIsLoading, darkMode } =
    useContext(SharedContext);
  const [notesHover, setNotesHover] = useState(0);
  const [loadingVote, setLoadingVote] = useState(false);
  const imageModalRef = useRef(null);
  let author = user;
  let coauthors = [];
  if (displayShow.idea.user_id) {
    author = displayShow.users.find((el) => el.id === displayShow.idea.user_id);
  }
  if (displayShow.coauthors && displayShow.coauthors.length) {
    coauthors = displayShow.coauthors.map((coauthor) =>
      displayShow.users.find((el) => el.id === coauthor.user_id)
    );
  }
  useEffect(() => {
    setIsLoading(true);
    fetch(`${baseURL}/ideas/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const noted_by = response.idea.noted_by
          ? response.idea.noted_by
              .split(",")
              .filter((v) => v != "" && v != ",")
              .map((v) => parseInt(v, 10))
          : [];
        const note =
          noted_by.length > 0 ? response.idea.note / noted_by.length : 0;
        setDisplayShow({
          ...response,
          idea: {
            ...response.idea,
            noted_by,
            final_note: note,
          },
        });
        setIsLoading(false);
      });
    $(function () {
      $('[data-toggle="popover"]').popover();
    });
  }, []);
  const setNoteHover = (e) => {
    if (Array.isArray(displayShow.idea.noted_by)) {
      if (!displayShow.idea.noted_by.includes(user.id)) {
        const nb = parseInt(e.target.dataset.id, 10);
        setNotesHover(nb);
      } else setNotesHover(0);
    }
  };
  const setNoteOut = (e) => {
    setNotesHover(0);
  };
  const handleNoteClick = (e) => {
    const userNote = notesHover;
    if (
      Array.isArray(displayShow.idea.noted_by) &&
      !displayShow.idea.noted_by.includes(`${user.id}`)
    ) {
      fetch(`${baseURL}/note/${displayShow.idea.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note: userNote }),
      }).then((response) => {
        if (response.ok) {
          setNoteOut();
          document.activeElement?.blur();
          const totalVotes = [...displayShow.idea.noted_by].push(user.id);
          setDisplayShow({
            ...displayShow,
            idea: {
              ...displayShow.idea,
              note: displayShow.idea.note + userNote,
              noted_by: totalVotes,
              final_note: (displayShow.idea.note + userNote) / totalVotes,
            },
          });
        }
      });
    }
  };
  return (
    <main className="container h-100 d-flex flex-column mt-3 pb-5">
      <div
        className="rounded-top m-0 p-0 h-100 w-100 border"
        style={{ background: `center / cover no-repeat url(${bgImage})` }}
      >
        <div
          className="m-0 p-0 h-100 w-100 rounded"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <h1 className="rounded-top font-weight-bold p-2 display-1">
            Idée #{displayShow.idea.id} - {displayShow.idea.name}
          </h1>
          <ul className="meta-list font-weight-medium ml-2">
            <li className="meta-list-item text-secondary">
              Par{" "}
              <Link
                to={`/user/${author.id}`}
              >{`${author.firstname} ${author.lastname}`}</Link>
            </li>
            {displayShow.coauthors.length
              ? displayShow.coauthors.map((coauthor) => (
                  <li
                    key={coauthor.coauthor_id}
                    className="meta-list-item text-secondary separator"
                  >
                    <Link to={`/user/${coauthor.coauthor_id}`}>{`${
                      displayShow.users.find(
                        (u) => u.id === coauthor.coauthor_id
                      ).firstname
                    } ${
                      displayShow.users.find(
                        (u) => u.id === coauthor.coauthor_id
                      ).lastname
                    }`}</Link>
                  </li>
                ))
              : ""}
          </ul>
          <ul className="meta-list font-weight-medium ml-2">
            <li className="meta-list-item text-secondary">
              Créée le{" "}
              {new Date(displayShow.idea.created_at).toLocaleDateString(
                "fr-FR",
                dateOptions
              )}
            </li>
          </ul>
          {user.role_id > 1 && displayShow.idea.finished_at ? (
            <ul className="meta-list font-weight-medium ml-2">
              <li className="meta-list-item text-secondary">
                Finalisée le{" "}
                {new Date(displayShow.idea.finished_at).toLocaleDateString(
                  "fr-FR",
                  dateOptions
                )}
              </li>
            </ul>
          ) : (
            ""
          )}
          {user.role_id > 1 && displayShow.idea.manager_validated_at ? (
            <ul className="meta-list font-weight-medium ml-2">
              <li className="meta-list-item text-secondary">
                Validée manager le{" "}
                {new Date(
                  displayShow.idea.manager_validated_at
                ).toLocaleDateString("fr-FR", dateOptions)}
              </li>
            </ul>
          ) : (
            ""
          )}
          <ul className="meta-list font-weight-medium ml-2">
            {user.role_id > 2 && displayShow.idea.ambassador_validated_at ? (
              <li className="meta-list-item text-secondary">
                Validée ambassadeur le{" "}
                {new Date(
                  displayShow.idea.ambassador_validated_at
                ).toLocaleDateString("fr-FR", dateOptions)}
              </li>
            ) : (
              ""
            )}
          </ul>
          <ul className="meta-list font-weight-medium ml-2">
            <li className="meta-list-item text-secondary">
              👁️‍🗨️ {displayShow.idea.views}
            </li>
            <li
              className="meta-list-item text-secondary separator"
              onMouseLeave={() => setNotesHover(0)}
              data-id="note"
            >
              <button
                type="button"
                onClick={handleNoteClick}
                className="btn btn-link"
                disabled={notesHover === 0}
              >
                <i
                  data-id="1"
                  onMouseEnter={setNoteHover}
                  onMouseLeave={setNoteOut}
                  className={`icons-bookmark icons-size-1x25 ${
                    notesHover >= 1 ? "text-danger" : ""
                  } ${
                    displayShow.idea.final_note >= 1 && notesHover < 1
                      ? "text-warning"
                      : ""
                  }`}
                  aria-hidden="true"
                />
                <i
                  data-id="2"
                  onMouseEnter={setNoteHover}
                  onMouseLeave={setNoteOut}
                  className={`icons-bookmark icons-size-1x25 ${
                    notesHover >= 2 ? "text-danger" : ""
                  } ${
                    displayShow.idea.final_note >= 2 && notesHover < 2
                      ? "text-warning"
                      : ""
                  }`}
                  aria-hidden="true"
                />
                <i
                  data-id="3"
                  onMouseEnter={setNoteHover}
                  onMouseLeave={setNoteOut}
                  className={`icons-bookmark icons-size-1x25 ${
                    notesHover >= 3 ? "text-danger" : ""
                  } ${
                    displayShow.idea.final_note >= 3 && notesHover < 3
                      ? "text-warning"
                      : ""
                  }`}
                  aria-hidden="true"
                />
                <i
                  data-id="4"
                  onMouseEnter={setNoteHover}
                  onMouseLeave={setNoteOut}
                  className={`icons-bookmark icons-size-1x25 ${
                    notesHover >= 4 ? "text-danger" : ""
                  } ${
                    displayShow.idea.final_note >= 4 && notesHover < 4
                      ? "text-warning"
                      : ""
                  }`}
                  aria-hidden="true"
                />
                <i
                  data-id="5"
                  onMouseEnter={setNoteHover}
                  onMouseLeave={setNoteOut}
                  className={`icons-bookmark icons-size-1x25 ${
                    notesHover >= 5 ? "text-danger" : ""
                  } ${
                    displayShow.idea.final_note >= 5 && notesHover < 5
                      ? "text-warning"
                      : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
            </li>
          </ul>
          <ul className="meta-list font-weight-medium ml-2">
            <li className="meta-list-item text-secondary">
              <p>{displayShow.idea.description}</p>
            </li>
          </ul>
        </div>
      </div>
      <div className="">
        <nav role="navigation" aria-label="Status : ">
          <ol className="breadcrumb rounded-bottom px-2 border-right border-left border-bottom">
            <li
              className={`breadcrumb-item ${
                displayShow.idea.status === 0 ? "active" : ""
              }`}
              aria-current={displayShow.idea.status === 0 ? "step" : ""}
            >
              <button
                type="button"
                tabIndex="0"
                className={`btn btn-link text-${
                  displayShow.idea.status === 0 ? "warning" : "link"
                }`}
                data-toggle="popover"
                data-trigger="focus"
                title="En cours de rédaction"
                data-content="Rédaction et relecture de l'idée, n'oubliez pas d'habiller votre innovation d'une image de couverture, et de l'accompagner de tous les documents qui peuvent s'avérer utiles !"
              >
                {detailedStatus[0]}
              </button>
              {displayShow.idea.status === 0 ? (
                <span className="sr-only">actif</span>
              ) : (
                ""
              )}
            </li>
            <li
              className={`breadcrumb-item ${
                displayShow.idea.status === 1 ? "active" : ""
              }`}
              aria-current={displayShow.idea.status === 1 ? "step" : ""}
            >
              <button
                type="button"
                tabIndex="0"
                className={`btn btn-link text-${
                  displayShow.idea.status === 1 ? "warning" : "link"
                }`}
                data-toggle="popover"
                data-trigger="focus"
                title="En attente de validation manager"
                data-content="Votre manager doit valider la poursuite de votre innovation vers l'infinie et au delà..."
              >
                {detailedStatus[1]}
              </button>
              {displayShow.idea.status === 1 ? (
                <span className="sr-only">actif</span>
              ) : (
                ""
              )}
            </li>
            <li
              className={`breadcrumb-item ${
                displayShow.idea.status === 2 ? "active" : ""
              }`}
              aria-current={displayShow.idea.status === 2 ? "step" : ""}
            >
              <button
                type="button"
                tabIndex="0"
                className={`btn btn-link text-${
                  displayShow.idea.status === 2 ? "warning" : "link"
                }`}
                data-toggle="popover"
                data-trigger="focus"
                title="En attente de validation ambassadeur"
                data-content="Cette étape nécessite le rassemblement de la commission innovation de votre établissement ce qui se produit une fois par trimestre."
              >
                {detailedStatus[2]}
              </button>
              {displayShow.idea.status === 2 ? (
                <span className="sr-only">actif</span>
              ) : (
                ""
              )}
            </li>
            <li
              className={`breadcrumb-item ${
                displayShow.idea.status > 2 ? "active" : ""
              }`}
              aria-current={displayShow.idea.status > 2 ? "step" : ""}
            >
              {displayShow.idea.status < 2 ? (
                <>
                  <button
                    type="button"
                    tabIndex="0"
                    className="btn btn-link"
                    data-toggle="popover"
                    data-trigger="focus"
                    title="Validée et mise en application"
                    data-content="Une innovation validée a été approuvée par votre établissement pour sa mise en application ! Elle peut également avoir été primée."
                  >
                    {detailedStatus[3]}
                  </button>
                  &nbsp;/&nbsp;
                  <button
                    type="button"
                    tabIndex="0"
                    className="btn btn-link"
                    data-toggle="popover"
                    data-trigger="focus"
                    title="Refusée ou nécessite un approfondissement"
                    data-content="Une idée peut avoir été refusée car elle nécessiterait un approfondissement de votre part, ou une expertise d'un tiers."
                  >
                    {detailedStatus[4]}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  tabIndex="0"
                  className={`btn btn-link text-${
                    displayShow.idea.status === 3
                      ? "warning"
                      : `${displayShow.idea.status === 4 ? "danger" : "link"}`
                  }`}
                  data-toggle="popover"
                  data-trigger="focus"
                  title={
                    displayShow.idea.status === 3
                      ? "Validée et mise en application (état actuel)"
                      : "Refusée ou nécessite un approfondissement (état actuel)"
                  }
                  data-content={
                    displayShow.idea.status === 3
                      ? "Une innovation validée a été approuvée par votre établissement pour sa mise en application ! Elle peut également avoir été primée."
                      : "Une idée peut avoir été refusée car elle nécessiterait un approfondissement de votre part, ou une expertise d'un tiers."
                  }
                >
                  {detailedStatus[displayShow.idea.status]}
                </button>
              )}
            </li>
          </ol>
          <CategorieSelector
            label={`Catégorie${
              displayShow.idea.categories.length ? "s" : ""
            } associées`}
            className={`${
              darkMode < 2 ? "bg-light" : "bg-gray-dark"
            } rounded p-3 my-2`}
            labelClassName="p-3"
            values={displayShow.idea.categories}
            selected={displayShow.idea.categories}
          />
        </nav>
      </div>
      <div className="col mt-2 px-0">
        <h1 className="p-3">Description de la problèmatique</h1>
        <div className="card overflow-hidden">
          <div
            className={`card-body p-2 p-sm-3 ${
              darkMode === 2 ? "bg-gray" : "bg-light"
            } p-0`}
          >
            <div
              className="ck-content"
              dangerouslySetInnerHTML={{
                __html: displayShow.idea.problem.replaceAll(
                  "<img src=",
                  '<img class="rounded" style="cursor: zoom-in;" data-toggle="modal" data-target=".bd-example-modal-lg" onClick="document.getElementById(\'modalImage\').src=this.src; document.getElementById(\'modalImage\').srcset=this.srcset;" src='
                ),
              }}
            />
          </div>
        </div>
      </div>
      <div className="col mt-2 px-0">
        <h1 className="p-3">Solution proposée</h1>
        <div className="card overflow-hidden">
          <div
            className={`card-body p-2 p-sm-3 ${
              darkMode === 2 ? "bg-gray" : "bg-light"
            } p-0`}
          >
            <div
              className="ck-content"
              dangerouslySetInnerHTML={{
                __html: displayShow.idea.solution.replaceAll(
                  "<img",
                  '<img class="rounded" style="cursor: zoom-in;" data-toggle="modal" data-target=".bd-example-modal-lg" onClick="document.getElementById(\'modalImage\').src=this.src; document.getElementById(\'modalImage\').srcset=this.srcset;"'
                ),
              }}
            />
          </div>
        </div>
      </div>
      <div className="col mt-2 pb-5 px-0">
        <h1 className="p-3">Gains attendus et/ou constatés</h1>
        <div className="card overflow-hidden">
          <div
            className={`card-body p-2 p-sm-3 ${
              darkMode === 2 ? "bg-gray" : "bg-light"
            } p-0`}
          >
            <div
              className="ck-content"
              dangerouslySetInnerHTML={{
                __html: displayShow.idea.gains.replaceAll(
                  "<img",
                  '<img class="rounded" style="cursor: zoom-in;" data-toggle="modal" data-target=".bd-example-modal-lg" onClick="document.getElementById(\'modalImage\').src=this.src; document.getElementById(\'modalImage\').srcset=this.srcset;"'
                ),
              }}
            />
          </div>
        </div>
      </div>
      <div
        className="modal fade bd-example-modal-lg"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="myLargeModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content text-center"
            style={{ background: "transparent" }}
          >
            <img
              ref={imageModalRef}
              id="modalImage"
              src=""
              alt={`Visuel lié à l'innovation ${displayShow.idea.name}`}
              className="rounded my-auto mx-auto img-fluid"
            />
            <button
              className="btn btn-warning rounded p-2 position-absolute"
              style={{ top: 15, right: 15 }}
              type="button"
              onClick={() =>
                window.open(imageModalRef.current.src, "_blank").focus()
              }
            >
              <i
                className="icons-external-link icons-size-25px"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
