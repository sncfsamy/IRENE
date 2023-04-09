import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SharedContext from "../contexts/sharedContext";

const status = [
  "En cours de rédaction",
  "Attente valid. manager",
  "Attente valid. ambassadeur",
  "Cloturée avec succès",
  "En attente d'approfondissement",
  "Refusée",
];

export default function IdeaList({
  ideas,
  authors,
  setSelected,
  setSelectedToDelete,
  selected,
  id,
}) {
  const { user, darkMode } = useContext(SharedContext);
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  const navigate = useNavigate();
  useEffect(() => {
    if (authors.length > 1) {
      $(".pophover").popover({
        trigger: "hover",
        template: `<div class="popover" role="tooltip"><h3 class="popover-header ${
          darkMode === 0 ? "text-warning" : ""
        }"></h3><div class="popover-body"></div></div>`,
      });
    }
  }, [authors]);
  useEffect(() => {
    // reset popover when darkMode change to adapt color to darkMode
    if (localDarkMode !== darkMode && authors.length > 1) {
      $(".pophover").popover("dispose");
      $(".pophover").popover({
        trigger: "hover",
        template: `<div class="popover" role="tooltip"><h3 class="popover-header ${
          darkMode === 0 ? "text-warning" : ""
        }"></h3><div class="popover-body"></div></div>`,
      });
      setLocalDarkMode(darkMode);
    }
  }, [darkMode]);
  const selectAll = () => {
    if (selected.length === ideas.length) {
      setSelectedToDelete([]);
    } else {
      setSelectedToDelete(ideas.map((idea) => idea.id_idea));
    }
  };

  return (
    <ul className="list-group">
      {setSelected ? (
        <li className="list-group-item management-item">
          <div className="management-item-content py-0">
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
            <div className="management-item-main d-none d-md-flex col-sm">
              <h2 className="m-0 p-0 text-left">Status</h2>
            </div>
            <div className="management-item-main text-break flex-column justify-content-center align-items-end col-sm-2">
              <h2 className="m-0 p-0 text-right">Auteur(s)</h2>
            </div>
          </div>
        </li>
      ) : (
        ""
      )}

      {ideas
        ? ideas.map((idea) => (
            <li
              className="list-group-item management-item management-item-group"
              key={idea.id_idea}
            >
              <div className="management-item-content py-0">
                {setSelected ? (
                  <div className="management-item-symbol ml-5 d-flex align-items-center">
                    <div className="custom-control custom-checkbox align-middle">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        value={idea.id_idea}
                        aria-label="Sélectionner pour suppression"
                        id={`${id || "delete"}_${idea.id_idea}`}
                        onChange={setSelected}
                        checked={
                          selected ? selected.includes(idea.id_idea) : undefined
                        }
                      />
                      <label
                        className="custom-control-label"
                        htmlFor={`${id || "delete"}_${idea.id_idea}`}
                      >
                        <i
                          className="icons-document icons-size-1x5 mt-n2 ml-n3 d-block"
                          aria-hidden="true"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <div
                  className="management-item-main text-left col-sm"
                  aria-hidden="true"
                  onClick={() => {
                    $(".modal").modal("hide");
                    navigate(
                      `${import.meta.env.VITE_FRONTEND_URI}/${
                        (idea.status === 0 || idea.status === 4) &&
                        authors.find(
                          (author) =>
                            author.id_idea === idea.id_idea && author.is_author
                        ).id_user === user.id_user
                          ? "edit"
                          : "innovation"
                      }/${idea.id_idea}`
                    );
                  }}
                >
                  <h2>
                    {idea.name[0].toUpperCase()}
                    {idea.name.substring(1)}
                  </h2>
                </div>
                <div
                  className="management-item-main d-none d-md-flex col-sm"
                  aria-hidden="true"
                  onClick={() => {
                    $(".modal").modal("hide");
                    navigate(
                      `${import.meta.env.VITE_FRONTEND_URI}/${
                        (idea.status === 0 || idea.status === 4) &&
                        authors.find(
                          (author) =>
                            author.id_idea === idea.id_idea && author.is_author
                        ).id_user === user.id_user
                          ? "edit"
                          : "innovation"
                      }/${idea.id_idea}`
                    );
                  }}
                >
                  <span className={`idea-status-${idea.status}`}>
                    {status[idea.status]}&nbsp;
                  </span>
                </div>
                <div
                  className="management-item-main text-break flex-column justify-content-center align-items-end col-sm-2"
                  aria-hidden="true"
                  onClick={() => {
                    $(".modal").modal("hide");
                    navigate(
                      `${import.meta.env.VITE_FRONTEND_URI}/${
                        (idea.status === 0 || idea.status === 4) &&
                        authors.find(
                          (author) =>
                            author.id_idea === idea.id_idea && author.is_author
                        ).id_user === user.id_user
                          ? "edit"
                          : "innovation"
                      }/${idea.id_idea}`
                    );
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-link text-break d-block"
                    onClick={(e) => {
                      e.preventDefault();
                      $(".modal").modal("hide");
                      navigate(
                        `/user/${
                          authors.find(
                            (author) =>
                              author.id_idea === idea.id_idea &&
                              author.is_author
                          ).id_user
                        }`
                      );
                    }}
                  >
                    {
                      authors.find(
                        (author) =>
                          author.id_idea === idea.id_idea && author.is_author
                      ).firstname
                    }{" "}
                    {
                      authors.find(
                        (author) =>
                          author.id_idea === idea.id_idea && author.is_author
                      ).lastname
                    }
                    &nbsp;
                  </button>
                  {authors.filter((author) => author.id_idea === idea.id_idea)
                    .length === 2 ? (
                    <button
                      type="button"
                      className="btn btn-link text-break d-block"
                      onClick={(e) => {
                        e.preventDefault();
                        $(".modal").modal("hide");
                        navigate(
                          `/user/${
                            authors.find(
                              (author) =>
                                author.id_idea === idea.id_idea &&
                                !author.is_author
                            ).id_user
                          }`
                        );
                      }}
                    >
                      {
                        authors.find(
                          (author) =>
                            author.id_idea === idea.id_idea && !author.is_author
                        ).firstname
                      }{" "}
                      {
                        authors.find(
                          (author) =>
                            author.id_idea === idea.id_idea && !author.is_author
                        ).lastname
                      }
                      &nbsp;
                    </button>
                  ) : (
                    ""
                  )}
                  {authors.filter((author) => author.id_idea === idea.id_idea)
                    .length > 2 ? (
                    <button
                      type="button"
                      tabIndex="0"
                      onClick={(e) => {
                        e.preventDefault();
                        $(".pophover").popover("dispose");
                      }}
                      className={`btn btn-link text-break d-block text-right ${
                        darkMode === 0 ? "text-warning" : ""
                      } w-100 pophover`}
                      data-toggle="popover"
                      data-trigger="focus"
                      data-html
                      data-content={`<ul>
                          ${authors
                            .filter(
                              (author) =>
                                author.id_idea === idea.id_idea &&
                                !author.is_author
                            )
                            .map(
                              (author) =>
                                `<li>
                                ${author.firstname} ${author.lastname}
                              </li>`
                            )
                            .join("\r\n")}
                        </ul>`}
                      title="Co-auteurs:"
                    >
                      +
                      {authors.filter(
                        (author) => author.id_idea === idea.id_idea
                      ).length - 1}{" "}
                      co-auteurs
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </li>
          ))
        : ""}
    </ul>
  );
}

IdeaList.propTypes = {
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      is_author: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
      id_user: PropTypes.number,
      firstname: PropTypes.string,
      lastname: PropTypes.string,
    })
  ),
  id: PropTypes.string,
  ideas: PropTypes.arrayOf(
    PropTypes.shape({
      id_idea: PropTypes.number,
      name: PropTypes.string,
      status: PropTypes.number,
    })
  ),
  selected: PropTypes.arrayOf(PropTypes.number),
  setSelected: PropTypes.func,
  setSelectedToDelete: PropTypes.func,
};
IdeaList.defaultProps = {
  authors: [],
  ideas: [],
  selected: [],
  id: "",
  setSelected: null,
  setSelectedToDelete: null,
};
