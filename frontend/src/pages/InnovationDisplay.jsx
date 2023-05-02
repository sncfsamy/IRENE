import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SharedContext from "../contexts/sharedContext";
import bgImage from "../assets/idea_default_picture.heif";
import "../assets/ck-content.css";
import Selector from "../components/Selector";
import Comments from "../components/Comments";
import ManagerCommentForm from "../components/ManagerCommentForm";
import FilesAndUploads from "../components/FilesAndUploads";
import Error404 from "./Error404";

const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export default function InnovationDisplay() {
  const [ideaData, setIdeaData] = useState({
    idea: {
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
      id_organisation: 1,
      categories: [],
    },
    authors: [],
    assets: [
      { assets: [], total: 0 },
      { assets: [], total: 0 },
      { assets: [], total: 0 },
      { assets: [], total: 0 },
    ],
  });
  const detailedStatus = [
    "En cours de rédaction",
    "Attente validation manager",
    "Attente validation ambassadeur",
    "Cloturée avec succès",
    "En attente d'approfondissement",
    "Refusée",
  ];

  const { id } = useParams();
  const {
    user,
    categories,
    organisations,
    teams,
    isLoading,
    setIsLoading,
    darkMode,
    customFetch,
    addToast,
  } = useContext(SharedContext);
  const [notesHover, setNotesHover] = useState(0);
  const [modalAction, setModalAction] = useState({});
  const [managerComment, setManagerComment] = useState("");
  const [managerCommentErrors, setManagerCommentErrors] = useState([]);
  const [perms, setPerms] = useState({});
  const navigate = useNavigate();
  const [commentsLoaded, setCommentsLoaded] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [poster, setPoster] = useState(
    ideaData.assets.find((asset) => asset.field === 0 && !asset.id_comment)
  );
  const imageModalRef = useRef(null);
  useEffect(() => {
    setIsLoading(true);
    customFetch(`${import.meta.env.VITE_BACKEND_URL}/ideas/${id}`, "GET").then(
      (response) => {
        const note =
          response.idea.noted_by > 0
            ? response.idea.note / response.idea.noted_by
            : 0;
        setIdeaData({
          ...response,
          idea: {
            ...response.idea,
            final_note: note,
          },
        });

        setPerms({
          isManager:
            user.perms.manage_ideas_manager &&
            response.authors.find((autor) => autor.is_author).id_team ===
              user.id_team,
          isAmbassador:
            user.perms.manage_ideas_ambassador &&
            response.idea.id_organisation === user.id_organisation,
          isAdmin: user.perms.manage_ideas_all || user.perms.manage_all,
        });
        setPoster(
          response.assets.find(
            (asset) => asset.field === 0 && !asset.id_comment
          )
        );
        $(() => {
          $('[data-toggle="popover"]').popover("dispose");
          $('[data-toggle="popover"]').popover();
        });
        setIsLoading(false);
      }
    );
  }, []);
  const setNoteHover = (e) => {
    if (ideaData.idea.id_user !== user.id_user) {
      const nb = parseInt(e.target.dataset.id, 10);
      setNotesHover(nb);
    } else {
      setNotesHover(0);
    }
  };
  const setNoteOut = () => {
    setNotesHover(0);
  };
  const handleNoteClick = () => {
    if (ideaData.idea.id_user !== user.id_user) {
      customFetch(
        `${import.meta.env.VITE_BACKEND_URL}/note/${ideaData.idea.id_idea}`,
        "PUT",
        {
          note: notesHover,
        }
      )
        .then(() => {
          setNoteOut();
          document.activeElement?.blur();
          setIdeaData({
            ...ideaData,
            idea: {
              ...ideaData.idea,
              note: ideaData.idea.note + notesHover,
              noted_by: ideaData.idea.noted_by + 1,
              final_note:
                (ideaData.idea.note + notesHover) /
                (ideaData.idea.noted_by + 1),
              id_user: user.id_user,
            },
          });
        })
        .catch();
    }
  };
  // From https://linuxhint.com/scroll-to-element-javascript/
  function Position(incObj) {
    let obj = incObj;
    let currenttop = 0;
    if (obj.offsetParent) {
      while (obj.offsetParent) {
        obj = obj.offsetParent;
        currenttop += obj.offsetTop;
      }
      return [currenttop];
    }
  }
  //

  const handleSubmitComment = (
    comment,
    field,
    setFormShowed,
    setErrors,
    idParentComment = null
  ) => {
    return new Promise((resolve, reject) => {
      const commentContent = {
        comment,
        field: parseInt(field, 10),
        id_user: user.id_user,
        id_idea: ideaData.idea.id_idea,
        id_parent_comment: idParentComment,
      };
      customFetch(
        `${import.meta.env.VITE_BACKEND_URL}/comments`,
        "POST",
        commentContent
      )
        .then((result) => {
          const idComment = parseInt(result.idComment, 10);
          if (Number.isNaN(id)) {
            setErrors(result.errors);
            reject();
          } else {
            const newIdeaData = { ...ideaData };
            newIdeaData.comments[field].comments.unshift({
              ...commentContent,
              id_comment: idComment,
              created_at: Math.floor(new Date(Date.now()).getTime()),
              id_team: user.id_team,
              id_organisation: user.id_organisation,
              firstname: user.firstname,
              lastname: user.lastname,
            });
            newIdeaData.comments[field].total += 1;
            resolve();
            setIdeaData(newIdeaData);
            setFormShowed(false);
            setTimeout(() => {
              const lastCommentPosition = document.querySelector(
                ".last-comment"
              )
                ? Position(document.querySelector(".last-comment"))
                : null;
              if (lastCommentPosition)
                window.scrollTo({
                  top: lastCommentPosition - 100,
                  left: 0,
                  behavior: "smooth",
                });
            }, 250);
          }
        })
        .catch((err) => {
          setErrors(err);
          reject();
        });
    });
  };
  const handleAction = () => {
    if (
      modalAction.action !== "delete" &&
      (perms.isManager || perms.isAmbassador || perms.isAdmin)
    ) {
      let data = {};
      if (
        modalAction.action === "validateAmbassador" &&
        (perms.isAmbassador || perms.isAdmin)
      ) {
        data = { ambassador_validated_at: 1, status: 3 };
      }
      if (
        modalAction.action === "validateManager" &&
        (perms.isManager || perms.isAdmin)
      ) {
        data = { manager_validated_at: 1, status: 2 };
      }
      if (
        modalAction.action === "reject" &&
        (perms.isAdmin || perms.isAmbassador || perms.isManager)
      ) {
        data = { status: 5 };
      }
      if (
        modalAction.action === "deepen" &&
        (perms.isAdmin || perms.isAmbassador || perms.isManager)
      ) {
        data = { status: 4 };
      }
      if (managerComment.length > 10) {
        handleSubmitComment(
          managerComment,
          0,
          () => {},
          setManagerCommentErrors
        )
          .then(() => {
            customFetch(
              `${import.meta.env.VITE_BACKEND_URL}/ideas/${id}`,
              "PUT",
              data
            ).then(() => {
              if (modalAction.action !== "delete") {
                const newIdea = ideaData.idea;
                if (modalAction.action === "validateManager") {
                  newIdea.status = 2;
                  newIdea.manager_validated_at = new Date().getTime() / 1000;
                  addToast({
                    title: "Innovation validée",
                    message: (
                      <div>
                        Votre validation de l'innovation "
                        <b>{ideaData.idea.name}</b>" a bien été prise en compte
                        !
                      </div>
                    ),
                  });
                } else if (modalAction.action === "validateAmbassador") {
                  newIdea.status = 3;
                  newIdea.ambassador_validated_at = new Date().getTime() / 1000;
                  addToast({
                    title: "Innovation validée",
                    message: (
                      <div>
                        Votre validation de l'innovation "
                        <b>{ideaData.idea.name}</b>" a bien été prise en compte
                        !
                      </div>
                    ),
                  });
                } else if (modalAction.action === "deepen") {
                  newIdea.status = 4;
                  addToast({
                    title: "Innovation modifiée",
                    message: (
                      <div>
                        Votre demande d'approfondissement de l'innovation "
                        <b>{ideaData.idea.name}</b>" a bien été prise en compte
                        !
                      </div>
                    ),
                  });
                } else if (modalAction.action === "reject") {
                  newIdea.status = 5;
                  addToast({
                    title: "Innovation modifiée",
                    message: (
                      <div>
                        Votre refus de l'innovation "<b>{ideaData.idea.name}</b>
                        " a bien été pris en compte !
                      </div>
                    ),
                  });
                }
                setIdeaData({
                  ...ideaData,
                  idea: newIdea,
                });
                $(() => {
                  $('[data-toggle="popover"]').popover("dispose");
                  $('[data-toggle="popover"]').popover();
                });
              }
              $(".modal").modal("hide");
              setTimeout(setModalAction, 1000, {});
            });
          })
          .catch();
      } else {
        setManagerCommentErrors([
          {
            param: "comment",
            msg: "Votre commentaire doit comporter au moins 10 caractères !",
          },
        ]);
      }
    } else if (perms.isAdmin || perms.isAmbassador) {
      customFetch(`${import.meta.env.VITE_BACKEND_URL}/ideas/${id}`, "DELETE")
        .then(() => {
          $(".modal").modal("hide");
          addToast({
            title: "Innovation supprimée",
            message: (
              <div>
                IRENE a oublié l'innovation "<b>{ideaData.idea.name}</b>" !
              </div>
            ),
          });
          navigate(`${import.meta.env.VITE_FRONTEND_URI}/`);
        })
        .catch((err) => console.warn(err));
    }
  };
  const handleActionSelect = (e) => {
    e.preventDefault();
    setManagerComment("");
    switch (e.target.dataset.action) {
      case "validateManager":
        setModalAction({
          title: "Valider",
          message: "Êtes-vous sûr de vouloir valider cette innovation ?",
          targetStatus: 2,
          buttonClass: "btn-success",
          buttonText: "Valider cette innovation",
          action: e.target.dataset.action,
        });
        break;
      case "validateAmbassador":
        setModalAction({
          title: "Valider",
          message: "Êtes-vous sûr de vouloir valider cette innovation ?",
          targetStatus: 3,
          buttonClass: "btn-success",
          buttonText: "Valider cette innovation",
          action: e.target.dataset.action,
        });
        break;
      case "reject":
        setModalAction({
          title: "Refuser",
          message: "Êtes vous sûr de vouloir rejeter cette innovation ?",
          targetStatus: 5,
          buttonClass: "btn-warning",
          buttonText: "Refuser cette innovation",
          action: e.target.dataset.action,
        });
        break;
      case "delete":
        setModalAction({
          title: "Supprimer",
          message: "Êtes vous certains de vouloir supprimer cette innovation ?",
          buttonClass: "btn-danger",
          buttonText: "Supprimer cette innovation",
          action: e.target.dataset.action,
        });
        break;
      case "deepen":
        setModalAction({
          title: "Demande d'approfondissement",
          message: `Êtes vous certains de vouloir demander l'approfondissement de cette innovation ?<br /><br />${
            ideaData.authors.find((author) => author.is_author).firstname
          } ${
            ideaData.authors.find((author) => author.is_author).lastname
          } sera notifié(e) de votre demande d'approfondissement.<br /><br />${
            ideaData.authors.find((author) => author.is_author).firstname
          } ${
            ideaData.authors.find((author) => author.is_author).lastname
          } devra revoir son innovation et la finaliser de nouveau.<br /><br />
            De plus les dates de validation seront réinitialisées et l'innovation devra de nouveau être validée par le manager et l'ambassadeur.${
              ideaData.idea.status === 5
                ? '<br /><br /><span class="text-danger">Attention: Cela annulera le refus de cette innovation.</span>'
                : ""
            }<br /><br />`,
          buttonClass: "btn-info",
          targetStatus: 4,
          buttonText: "Demander l'approfondissement",
          action: e.target.dataset.action,
        });
        break;
      default:
    }
  };
  let showing = "show";
  if (
    (ideaData &&
      ideaData.idea &&
      ideaData.authors.find((author) => author.is_author) &&
      ideaData.authors.find((author) => author.is_author).id_user !==
        user.id_user &&
      (ideaData.idea.status === 0 || ideaData.idea.status === 4) &&
      !perms.isManager &&
      !perms.isAmbassador &&
      !perms.isAdmin) ||
    !ideaData.idea ||
    !ideaData.idea.name ||
    ideaData.idea.name.length === 0
  )
    showing = "404";
  else if (isLoading) showing = "loading";
  switch (showing) {
    case "404":
      return <Error404 />;
    case "loading":
      return "";
    default:
      return (
        <main
          className={`container h-100 flex-column my-3 pb-5 pt-2 px-2 rounded ${
            darkMode === 0 ? "bg-white" : ""
          }`}
          style={{
            backgroundColor: `${darkMode === 2 ? "#4d4f53" : ""}${
              darkMode === 1 ? "#e9e9e9" : ""
            }`,
          }}
        >
          <div className="rounded-top m-0 p-0 h-100 w-100 border poster-hover">
            <div
              style={{
                background: `center / cover no-repeat url(${
                  poster
                    ? `${import.meta.env.VITE_BACKEND_URL}/uploads/idea_${id}/${
                        poster.file_name
                      }`
                    : bgImage
                })`,
              }}
            >
              <div
                className="m-0 p-0 h-100 w-100 rounded-top"
                style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
              >
                <h1 className="rounded-top font-weight-bold p-2 display-1">
                  <i
                    className="icons-large-lightbulb icons-size-3x mx-2"
                    aria-hidden="true"
                  />
                  Idée #{ideaData.idea.id_idea} -{" "}
                  {ideaData.idea.name[0].toUpperCase()}
                  {ideaData.idea.name.substring(1)}
                </h1>
                <ul className="meta-list font-weight-medium ml-2">
                  <li className="meta-list-item text-white">
                    Par{"  "}&nbsp;&nbsp;
                    <Link
                      to={`${import.meta.env.VITE_FRONTEND_URI}/user/${
                        ideaData.authors.find((author) => author.is_author)
                          .id_user
                      }`}
                    >{`${
                      ideaData.authors.find((author) => author.is_author)
                        .firstname
                    } ${
                      ideaData.authors.find((author) => author.is_author)
                        .lastname
                    }`}</Link>{" "}
                    (
                    {`${
                      organisations.find(
                        (organisation) =>
                          organisation.id_organisation ===
                          ideaData.authors.find((author) => author.is_author)
                            .id_organisation
                      ).name
                    }/${
                      teams.find(
                        (team) =>
                          team.id_team ===
                          ideaData.authors.find((author) => author.is_author)
                            .id_team
                      ).name
                    } `}
                    )
                  </li>
                  {ideaData.authors.find((author) => !author.is_author)
                    ? ideaData.authors
                        .filter((author) => !author.is_author)
                        .map((coauthor) => (
                          <li
                            key={coauthor.id_user}
                            className="meta-list-item text-white separator"
                          >
                            <Link
                              to={`${import.meta.env.VITE_FRONTEND_URI}/user/${
                                coauthor.id_user
                              }`}
                            >{`${coauthor.firstname} ${coauthor.lastname}`}</Link>{" "}
                            (
                            {`${
                              organisations.find(
                                (organisation) =>
                                  organisation.id_organisation ===
                                  coauthor.id_organisation
                              ).name
                            }/${
                              teams.find(
                                (team) => team.id_team === coauthor.id_team
                              ).name
                            } `}
                            )
                          </li>
                        ))
                    : ""}
                </ul>
                <ul className="meta-list font-weight-medium ml-2">
                  <li className="meta-list-item text-secondary text-white">
                    Créée le{" "}
                    {new Date(ideaData.idea.created_at).toLocaleDateString(
                      "fr-FR",
                      dateOptions
                    )}
                  </li>
                </ul>
                {user.role_id > 1 && ideaData.idea.finished_at ? (
                  <ul className="meta-list font-weight-medium ml-2">
                    <li className="meta-list-item text-secondary text-white">
                      Finalisée le{" "}
                      {new Date(ideaData.idea.finished_at).toLocaleDateString(
                        "fr-FR",
                        dateOptions
                      )}
                    </li>
                  </ul>
                ) : (
                  ""
                )}
                {user.role_id > 1 && ideaData.idea.manager_validated_at ? (
                  <ul className="meta-list font-weight-medium ml-2">
                    <li className="meta-list-item text-secondary text-white">
                      Validée manager le{" "}
                      {new Date(
                        ideaData.idea.manager_validated_at
                      ).toLocaleDateString("fr-FR", dateOptions)}
                    </li>
                  </ul>
                ) : (
                  ""
                )}
                <ul className="meta-list font-weight-medium ml-2">
                  {user.role_id > 2 && ideaData.idea.ambassador_validated_at ? (
                    <li className="meta-list-item text-secondary text-white">
                      Validée ambassadeur le{" "}
                      {new Date(
                        ideaData.idea.ambassador_validated_at
                      ).toLocaleDateString("fr-FR", dateOptions)}
                    </li>
                  ) : (
                    ""
                  )}
                </ul>
                <ul className="meta-list font-weight-medium ml-2">
                  <li className="meta-list-item text-secondary text-white">
                    👁️‍🗨️ {ideaData.idea.views}
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
                          ideaData.idea.final_note >= 1 && notesHover < 1
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
                          ideaData.idea.final_note >= 2 && notesHover < 2
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
                          ideaData.idea.final_note >= 3 && notesHover < 3
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
                          ideaData.idea.final_note >= 4 && notesHover < 4
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
                          ideaData.idea.final_note >= 5 && notesHover < 5
                            ? "text-warning"
                            : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                </ul>
                <ul className="meta-list font-weight-medium ml-2 mb-0">
                  <li className="meta-list-item text-secondary text-white">
                    <p>{ideaData.idea.description}</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="">
            <nav role="navigation" aria-label="Status : ">
              <ol className="breadcrumb rounded-bottom px-2 border-right border-left border-bottom">
                <li
                  className={`breadcrumb-item ${
                    ideaData.idea.status === 1 ? "active" : ""
                  }`}
                  aria-current={ideaData.idea.status === 1 ? "step" : ""}
                >
                  <button
                    type="button"
                    tabIndex="0"
                    className={`btn btn-link text-${
                      ideaData.idea.status === 1 ? "danger" : "link"
                    }`}
                    data-toggle="popover"
                    data-trigger="hover"
                    title={`En attente de validation manager${
                      ideaData.idea.status === 1 ? " (état actuel)" : ""
                    }`}
                    data-content="Votre manager doit valider la poursuite de votre innovation vers l'infinie et au delà..."
                  >
                    {detailedStatus[1]}
                  </button>
                  {ideaData.idea.status === 1 ? (
                    <span className="sr-only">actif</span>
                  ) : (
                    ""
                  )}
                </li>
                <li
                  className={`breadcrumb-item ${
                    ideaData.idea.status === 2 ? "active" : ""
                  }`}
                  aria-current={ideaData.idea.status === 2 ? "step" : ""}
                >
                  <button
                    type="button"
                    tabIndex="0"
                    className={`btn btn-link text-${
                      ideaData.idea.status === 2 ? "danger" : "link"
                    }`}
                    data-toggle="popover"
                    data-trigger="hover"
                    title={`Attente de validation ambassadeur${
                      ideaData.idea.status === 2 ? " (état actuel)" : ""
                    }`}
                    data-content="Cette étape nécessite le rassemblement de la commission innovation de votre établissement ce qui se produit une fois par trimestre en fonction des établissements."
                  >
                    {detailedStatus[2]}
                  </button>
                  {ideaData.idea.status === 2 ? (
                    <span className="sr-only">actif</span>
                  ) : (
                    ""
                  )}
                </li>
                <li
                  className={`breadcrumb-item ${
                    ideaData.idea.status > 2 ? "active" : ""
                  }`}
                  aria-current={ideaData.idea.status > 2 ? "step" : ""}
                >
                  {ideaData.idea.status <= 2 ? (
                    <>
                      <button
                        type="button"
                        tabIndex="0"
                        className="btn btn-link"
                        data-toggle="popover"
                        data-trigger="hover"
                        title={`Validée et mise en application${
                          ideaData.idea.status === 3 ? " (état actuel)" : ""
                        }`}
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
                        data-trigger="hover"
                        title="Nécessite un approfondissement"
                        data-content="Une idée peut nécessiter un approfondissement de votre part, ou une expertise d'un tiers (voir le commentaire de la demande d'approfondissement)."
                      >
                        {detailedStatus[4]}
                      </button>
                      &nbsp;/&nbsp;
                      <button
                        type="button"
                        tabIndex="0"
                        className="btn btn-link"
                        data-toggle="popover"
                        data-trigger="hover"
                        title="Refusée:"
                        data-content="Une idée peut être refusée si elle manque de consistance, qu'elle n'est pas pertinente, ou bien qu'une autre innovation a déjà solutionné cette problématique."
                      >
                        {detailedStatus[5]}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      tabIndex="0"
                      className={`btn btn-link text-${
                        ideaData.idea.status === 3 ||
                        ideaData.idea.status === 4 ||
                        ideaData.idea.status === 5
                          ? "danger"
                          : "link"
                      }`}
                      data-toggle="popover"
                      data-trigger="hover"
                      title={`${
                        ideaData.idea.status === 3
                          ? "Validée et mise en application (état actuel)"
                          : ""
                      }
                      ${
                        ideaData.idea.status === 4
                          ? "Nécessite un approfondissement (état actuel)"
                          : ""
                      }
                      ${
                        ideaData.idea.status === 5
                          ? "Refusée (état actuel)"
                          : ""
                      }`}
                      data-content={`${
                        ideaData.idea.status === 3
                          ? "Une innovation validée a été approuvée par votre établissement pour sa mise en application ! Elle peut également avoir été primée."
                          : ""
                      }
                      ${
                        ideaData.idea.status === 4
                          ? "Une idée peut avoir nécessiter un approfondissement de votre part, ou une expertise d'un tiers (voir le commentaire de la demande d'approfondissement)."
                          : ""
                      }
                      ${
                        ideaData.idea.status === 5
                          ? "Cette idée a été refusée (voir le commentaire du refus)."
                          : ""
                      }`}
                    >
                      {detailedStatus[ideaData.idea.status]}
                    </button>
                  )}
                </li>
              </ol>
            </nav>
          </div>
          <div className="col mt-2 px-0">
            <h1 className="p-3">
              {`Catégorie${
                ideaData.idea.categories.length ? "s" : ""
              } associées`}
            </h1>
            <div className="card overflow-hidden">
              <Selector
                label=""
                className={`${
                  darkMode < 2 ? "bg-light" : "bg-gray-dark"
                } rounded p-3 m-0`}
                id="subscribed_categories"
                values={categories.map((categorie) => {
                  return {
                    id: categorie.id_categorie,
                    name: categorie.name,
                    id_parent: categorie.id_parent_categorie,
                  };
                })}
                onlySelected
                onChange={() => {
                  return false;
                }}
                selectedValues={ideaData.idea.categories}
                errorMessages={[]}
              />
            </div>
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
                    __html: ideaData.idea.problem.replaceAll(
                      "<img src=",
                      '<img class="rounded" style="cursor: zoom-in;" data-toggle="modal" data-target=".bd-example-modal-lg" onClick="document.getElementById(\'modalImage\').src=this.src; document.getElementById(\'modalImage\').srcset=this.srcset;" src='
                    ),
                  }}
                />
              </div>
              <Comments
                id="comments_problem"
                label={
                  !commentsLoaded[1]
                    ? "Dernières contributions:"
                    : "Contributions:"
                }
                field={1}
                ideaData={ideaData}
                setIdeaData={setIdeaData}
                commentsLoaded={commentsLoaded}
                setCommentsLoaded={setCommentsLoaded}
                handleSubmit={handleSubmitComment}
              />
              <FilesAndUploads
                field={1}
                idIdeaAuthor={
                  ideaData.authors.find((autor) => autor.is_author).id_user
                }
                ideaAssets={ideaData.assets}
                setIdeaAssets={(assets) => setIdeaData({ ...ideaData, assets })}
                idea={ideaData.idea}
                imageModalRef={imageModalRef}
              />
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
                    __html: ideaData.idea.solution.replaceAll(
                      "<img",
                      '<img class="rounded" style="cursor: zoom-in;" data-toggle="modal" data-target=".bd-example-modal-lg" onClick="document.getElementById(\'modalImage\').src=this.src; document.getElementById(\'modalImage\').srcset=this.srcset;"'
                    ),
                  }}
                />
              </div>
              <Comments
                id="comments_solution"
                label={
                  !commentsLoaded[2]
                    ? "Dernières contributions:"
                    : "Contributions:"
                }
                field={2}
                ideaData={ideaData}
                setIdeaData={setIdeaData}
                commentsLoaded={commentsLoaded}
                setCommentsLoaded={setCommentsLoaded}
                handleSubmit={handleSubmitComment}
              />
              <FilesAndUploads
                field={2}
                idIdeaAuthor={
                  ideaData.authors.find((autor) => autor.is_author).id_user
                }
                ideaAssets={ideaData.assets}
                setIdeaAssets={(assets) => setIdeaData({ ...ideaData, assets })}
                idea={ideaData.idea}
                imageModalRef={imageModalRef}
              />
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
                    __html: ideaData.idea.gains.replaceAll(
                      "<img",
                      '<img class="rounded" style="cursor: zoom-in;" data-toggle="modal" data-target=".bd-example-modal-lg" onClick="document.getElementById(\'modalImage\').src=this.src; document.getElementById(\'modalImage\').srcset=this.srcset;"'
                    ),
                  }}
                />
                <FilesAndUploads
                  field={3}
                  idIdeaAuthor={
                    ideaData.authors.find((autor) => autor.is_author).id_user
                  }
                  ideaAssets={ideaData.assets}
                  setIdeaAssets={(assets) =>
                    setIdeaData({ ...ideaData, assets })
                  }
                  idea={ideaData.idea}
                  imageModalRef={imageModalRef}
                />
              </div>
              <Comments
                id="comments_gains"
                label={
                  !commentsLoaded[3]
                    ? "Dernières contributions:"
                    : "Contributions:"
                }
                field={3}
                ideaData={ideaData}
                setIdeaData={setIdeaData}
                commentsLoaded={commentsLoaded}
                setCommentsLoaded={setCommentsLoaded}
                handleSubmit={handleSubmitComment}
              />
            </div>
          </div>
          {ideaData.comments[0].comments.length > 0 ? (
            <div className="col mt-2 pb-5 px-0">
              <h1 className="p-3">Parcours de l'innovation</h1>
              <div className="card overflow-hidden">
                <Comments
                  id="comments_innov"
                  label=""
                  field={0}
                  ideaData={ideaData}
                  setIdeaData={setIdeaData}
                  commentsLoaded={commentsLoaded}
                  setCommentsLoaded={setCommentsLoaded}
                  handleSubmit={handleSubmitComment}
                />
              </div>
            </div>
          ) : (
            ""
          )}

          <div
            className="modal fade bd-example-modal-lg"
            tabIndex="-1"
            role="dialog"
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
                  alt={`Visuel lié à l'innovation ${ideaData.idea.name}`}
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
          {id && (perms.isAdmin || perms.isAmbassador || perms.isManager) ? (
            <div className="my-0 mx-0 w-100 d-flex justify-content-center align-items-center flex-column">
              <div className="my-0 mx-0 w-100 d-flex justify-content-center align-items-center flex-column flex-md-row">
                {(ideaData.idea.status > 0 && ideaData.idea.status < 3) ||
                ideaData.idea.status === 5 ? (
                  <div
                    className={`m-0 validate-buttons-area ${
                      ideaData.idea.status === 5 ? "" : "mr-md-5"
                    } d-flex justify-content-center justify-content-md-end align-items-center flex-row`}
                  >
                    <button
                      data-toggle="modal"
                      data-target="#actionModal"
                      data-action="deepen"
                      type="button"
                      style={{ width: "218px" }}
                      className="btn btn-info m-2 text-center"
                      onClick={handleActionSelect}
                    >
                      Demande
                      <br />
                      d'approfondissement
                    </button>
                  </div>
                ) : (
                  ""
                )}
                <div className="m-0 d-flex validate-buttons-area justify-content-center justify-content-md-start align-items-center flex-row">
                  {ideaData.idea.status === 1 &&
                  (perms.isManager || perms.isAdmin) ? (
                    <button
                      data-toggle="modal"
                      data-target="#actionModal"
                      data-action="validateManager"
                      type="button"
                      style={{ width: "170px" }}
                      className="btn btn-success m-2 text-center"
                      onClick={handleActionSelect}
                    >
                      Validation
                      <br />
                      manager
                    </button>
                  ) : (
                    ""
                  )}
                  {ideaData.idea.status === 2 &&
                  (perms.isAmbassador || perms.isAdmin) ? (
                    <button
                      data-toggle="modal"
                      data-target="#actionModal"
                      data-action="validateAmbassador"
                      type="button"
                      style={{ width: "170px" }}
                      className="btn btn-success m-2 text-center"
                      onClick={handleActionSelect}
                    >
                      Validation
                      <br />
                      ambassadeur
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div
                className={`m-0 w-100 d-flex flex-column flex-md-row ${
                  ideaData.idea.status === 5
                    ? "justify-content-start"
                    : "justify-content-center justify-content-md-end"
                }`}
              >
                {ideaData.idea.status > 0 && ideaData.idea.status < 5 ? (
                  <div
                    className={`m-0 ${
                      ideaData.idea.status === 5 ? "" : "mr-md-5"
                    } d-flex validate-buttons-area justify-content-center justify-content-md-end align-items-center flex-row`}
                  >
                    <button
                      data-toggle="modal"
                      data-target="#actionModal"
                      data-action="reject"
                      type="button"
                      className="btn btn-warning m-2 text-center reject-button"
                      onClick={handleActionSelect}
                    >
                      Refuser
                    </button>
                  </div>
                ) : (
                  ""
                )}
                {perms.isAmbassador || perms.isAdmin ? (
                  <div
                    className={`m-0 d-flex align-items-center flex-row validate-buttons-area ${
                      ideaData.idea.status === 5
                        ? "justify-content-center justify-content-md-end "
                        : "justify-content-center justify-content-md-start"
                    }`}
                  >
                    <button
                      data-toggle="modal"
                      data-target="#actionModal"
                      data-action="delete"
                      type="button"
                      style={{
                        width: ideaData.idea.status === 5 ? "218px" : "170px",
                      }}
                      className="btn btn-danger m-2 text-center"
                      onClick={handleActionSelect}
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div
                className="modal fade"
                id="actionModal"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="actionModalLabel"
                aria-hidden="true"
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="h1 modal-title" id="actionModalLabel">
                        {modalAction.title}
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
                    {modalAction.targetStatus ? (
                      <div className="modal-body">
                        <ManagerCommentForm
                          id="action"
                          ideaData={ideaData}
                          setIdeaData={setIdeaData}
                          field={0}
                          textButton={modalAction.buttonText}
                          classNameButton={modalAction.buttonClass}
                          setValue={setManagerComment}
                          value={managerComment}
                          errors={managerCommentErrors}
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    <div
                      className="modal-body"
                      dangerouslySetInnerHTML={{ __html: modalAction.message }}
                    />
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setModalAction({})}
                        data-dismiss="modal"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleAction}
                        className={`btn ${modalAction.buttonClass}`}
                      >
                        {modalAction.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </main>
      );
  }
}
