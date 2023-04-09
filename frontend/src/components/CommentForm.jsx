import { useContext, useLayoutEffect, useRef, useState } from "react";
import { PropTypes } from "prop-types";
import SharedContext from "../contexts/sharedContext";
import Textarea from "./forms/Textarea";

export default function CommentForm({
  id,
  setFormShowed,
  field,
  idParentComment,
  handleSubmit,
  buttonText,
}) {
  const { darkMode } = useContext(SharedContext);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState();
  const textAreaRef = useRef();
  useLayoutEffect(() => {
    if (textAreaRef.current) {
      setTimeout(() => textAreaRef.current.focus(), 250);
    }
  }, [textAreaRef.current]);
  return (
    <div
      className={`p-3 ml-auto border rounded text-left ${
        darkMode < 2 ? "bg-light" : ""
      }`}
      style={{ backgroundColor: darkMode === 2 ? "#5f5f5f" : undefined }}
    >
      <Textarea
        className={`border ${darkMode === 2 ? "bg-gray" : "bg-white"}`}
        label="Entrez votre contribution ci-dessous:"
        placeholder=""
        id={id}
        onChange={(e) => setComment(e.target.value)}
        value={comment}
        errorMessage={errors}
        textAreaRef={textAreaRef}
      />
      <div className="text-right">
        <button
          type="button"
          className="btn btn-only-icon btn-secondary mx-2 mx-sm-1 my-1 my-sm-2"
          onClick={() => setFormShowed(false)}
        >
          <span className="sr-only">Annuler</span>
          <i className="icons-close" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`btn ${
            darkMode === 0 ? "btn-warning" : "btn-primary"
          } mx-2 mx-sm-1 my-1 my-sm-2`}
          onClick={() => {
            if (comment.length < 5) {
              setErrors([
                {
                  param: "comment",
                  msg: "Votre commentaire doit comporter au moins 5 caractères !",
                },
              ]);
            } else {
              handleSubmit(
                comment,
                field,
                setFormShowed,
                () => {},
                idParentComment
              );
            }
          }}
        >
          <span className="d-sm-inline d-none p-2">{buttonText}</span>
          <i className="icons-message" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

CommentForm.propTypes = {
  id: PropTypes.string.isRequired,
  ideaData: PropTypes.shape({
    idea: PropTypes.shape({
      id_idea: PropTypes.number,
      name: PropTypes.string,
      description: PropTypes.string,
      problem: PropTypes.string,
      solution: PropTypes.string,
      gains: PropTypes.string,
      created_at: PropTypes.string,
      finished_at: PropTypes.string,
      manager_validated_at: PropTypes.string,
      ambassador_validated_at: PropTypes.string,
      prime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.number,
      categories: PropTypes.arrayOf(PropTypes.number),
    }),
    authors: PropTypes.arrayOf(
      PropTypes.shape({
        id_user: PropTypes.number,
        firstname: PropTypes.string,
        lastname: PropTypes.string,
        id_organisation: PropTypes.number,
        id_team: PropTypes.number,
        id_role: PropTypes.number,
      })
    ),
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        comments: PropTypes.arrayOf(
          PropTypes.shape({
            id_comment: PropTypes.number,
            id_parent_comment: PropTypes.number,
            created_at: PropTypes.oneOfType([
              PropTypes.string,
              PropTypes.number,
            ]),
            comment: PropTypes.string,
            id_user: PropTypes.number,
            firstname: PropTypes.string,
            lastname: PropTypes.string,
          })
        ),
        total: PropTypes.number,
      })
    ),
  }).isRequired,
  setFormShowed: PropTypes.func,
  field: PropTypes.number.isRequired,
  buttonText: PropTypes.string,
  idParentComment: PropTypes.number,
  handleSubmit: PropTypes.func,
};

CommentForm.defaultProps = {
  idParentComment: null,
  handleSubmit: null,
  setFormShowed: null,
  buttonText: "Envoyer votre contribution",
};
