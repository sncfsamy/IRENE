import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SharedContext from "../contexts/sharedContext";

const status = [
  "En cours de rédaction",
  "Attente valid. manager",
  "Attente valid. ambassadeur",
  "Cloturée avec succès",
  "Refusée",
];

export default function IdeaList({ ideas, users, coauthors }) {
  const { user, darkMode } = useContext(SharedContext);
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  useEffect(() => {
    if (coauthors.length) $(".pophover").popover({ trigger: "hover", template: `<div class="popover" role="tooltip"><h3 class="popover-header ${darkMode===0 ? "text-warning" : ""}"></h3><div class="popover-body"></div></div>` });
  }, [coauthors]);
  useEffect(() => { // reset popover when darkMode change to adapt color to darkMode
    if (localDarkMode != darkMode && coauthors.length) {
      $(".pophover").popover('dispose');
      $(".pophover").popover({ trigger: "hover", template: `<div class="popover" role="tooltip"><h3 class="popover-header ${darkMode===0 ? "text-warning" : ""}"></h3><div class="popover-body"></div></div>` });
      setLocalDarkMode(darkMode);
    }
  }, [darkMode]);
  return (
    <ul className="list-group">
      {ideas
        ? ideas.map((idea) => (
            <li
              className="list-group-item management-item management-item-group"
              key={idea.id}
            >
              <Link
                to={`${
                  idea.status === 0 && idea.user_id === user.id
                    ? "/edit"
                    : "/innovation"
                }/${idea.id}`}
              >
                <div className="management-item-content">
                  <div className="management-item-symbol">
                    <i
                      className="icons-document icons-size-1x25"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="management-item-main text-left w-100">
                    <h2 className=" w-100">{idea.name}</h2>
                  </div>
                  <div className="management-item-main d-none d-md-flex col-4">
                    <span className={`idea-status-${idea.status}`}>
                      {status[idea.status]}&nbsp;
                    </span>
                  </div>
                  <div className={`management-item-main col-4 col-sm-3 mr-2 col-md-2 mr-md-3 ${coauthors && coauthors.filter(c => c.idea_id === idea.id).length ? "d-block " : ""}text-center`}>
                    <button
                      type="button"
                      className="btn btn-link w-100"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/user/${idea.user_id}`);
                      }}
                    >
                      {users.find((u) => idea.user_id === u.id).firstname}{" "}
                      {users.find((u) => idea.user_id === u.id).lastname}
                      &nbsp;
                    </button>
                    {coauthors && coauthors.filter(c => c.idea_id === idea.id).length ? (
                      <>
                        <br />
                        { coauthors.filter(c => c.idea_id === idea.id).length === 1 ? <button
                          type="button"
                          className="btn btn-link w-100"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/user/${idea.user_id}`);
                          }}
                        >
                          {users.find((u) => coauthors.find(c => c.idea_id === idea.id).coauthor_id === u.id).firstname}{" "}
                          {users.find((u) => coauthors.find(c => c.idea_id === idea.id).coauthor_id === u.id).lastname}
                          &nbsp;
                        </button>
                        :
                        <button
                          type="button"
                          tabIndex="0"
                          onClick={(e) => e.preventDefault()}
                          className={`btn btn-link ${darkMode === 0 ? "text-warning" : ""} w-100 pophover`}
                          data-toggle="popover"
                          data-trigger="focus"
                          data-content={coauthors.filter(c => c.idea_id === idea.id)
                            .map(
                              (c) =>
                                `${
                                  users.find((u) => c.coauthor_id === u.id)
                                    .firstname
                                } ${
                                  users.find((u) => c.coauthor_id === u.id)
                                    .lastname
                                }`
                            )
                            .join(" - ")}
                          title="Co-auteurs:"
                        >
                          +{coauthors.length} co-auteurs
                        </button> }
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                  {/* <div className="management-item-main">
                Créée le {new Date(idea.created_at).toLocaleDateString(
                  "fr-FR")}
              </div> */}
                </div>
              </Link>
            </li>
          ))
        : ""}
    </ul>
  );
}
