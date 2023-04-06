import { useState, useContext, useRef } from "react";
import { PropTypes } from "prop-types";
import useColorChange from "use-color-change";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import SharedContext from "../contexts/sharedContext";

export default function Comments({
  id,
  label,
  field,
  ideaData,
  setIdeaData,
  commentsLoaded,
  setCommentsLoaded,
  handleSubmit,
}) {
  const { setIsLoading, user, customFetch } = useContext(SharedContext);
  const [formShowed, setFormShowed] = useState(false);
  const elementRef = useRef(null);
  const handleLoadComments = () => {
    setIsLoading(true);
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/comments/${
        ideaData.idea.id_idea
      }/${field}`,
      "GET"
    )
      .then((result) => {
        const { comments } = ideaData;
        comments[field].comments = result;
        comments[field].total = result.length;
        setIdeaData({ ...ideaData, comments });
        const newCommentsLoaded = [...commentsLoaded];
        newCommentsLoaded[field] = true;
        setCommentsLoaded(newCommentsLoaded);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn(err);
        setIsLoading(false);
      });
  };
  const addedComment = useColorChange(
    ideaData.comments[field].comments.length,
    {
      higher: "#26e026",
      lower: "crimson",
      duration: 5000,
    }
  );
  return (
    <div className="p-3" ref={elementRef}>
      <h2>{label}</h2>
      {field !== 0 &&
      !commentsLoaded[field] &&
      ideaData.comments[field].total >
        parseInt(ideaData.comments[field].comments.length, 10) ? (
        <div className="text-right">
          <button
            type="button"
            className="btn btn-link"
            onClick={handleLoadComments}
          >
            Afficher toutes les contributions (total{" "}
            {ideaData.comments[field].total}) &nbsp;{" "}
            <i
              className="icons-large-conversation icons-size-3x25"
              aria-hidden="true"
              style={{ fontSize: "2rem" }}
            />
          </button>
        </div>
      ) : (
        ""
      )}
      <div>
        {ideaData.comments[field].comments.length
          ? ideaData.comments[field].comments
              .filter((comment) => !comment.id_parent_comment)
              .map((comment, i) => (
                <div key={comment.id_comment}>
                  <Comment
                    id={`comment_${comment.id_comment}`}
                    comment={comment}
                    field={field}
                    ideaData={ideaData}
                    style={
                      i === 0 &&
                      comment.id_user === user.id_user &&
                      (new Date(Date.now()).getTime() -
                        new Date(comment.created_at)) /
                        1000 <
                        10
                        ? addedComment
                        : {}
                    }
                    setIdeaData={setIdeaData}
                    setFormShowed={setFormShowed}
                    handleSubmit={handleSubmit}
                  />
                </div>
              ))
          : "Aucune contribution pour le moment."}
      </div>
      {field !== 0 ||
      (user.perms.manage_ideas_manager &&
        user.id_team === ideaData.idea.id_team) ||
      (user.perms.manage_ideas_ambassador &&
        user.id_organisation === ideaData.idea.id_organisation) ? (
        <div className="text-right pt-4">
          {formShowed ? (
            <CommentForm
              ideaData={ideaData}
              setIdeaData={setIdeaData}
              setFormShowed={setFormShowed}
              field={field}
              id={`${id}_${field}`}
              handleSubmit={(...arg) => {
                handleSubmit(...arg);
                elementRef.current.scrollIntoView({ behavior: "smooth" });
              }}
              buttonText="Envoyer votre contribution"
            />
          ) : (
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setFormShowed(true)}
            >
              Ajouter une contribution
            </button>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

Comments.propTypes = {
  id: PropTypes.string.isRequired,
  commentsLoaded: PropTypes.arrayOf(PropTypes.bool),
  setCommentsLoaded: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  label: PropTypes.string,
  ideaData: PropTypes.shape({
    idea: PropTypes.shape({
      id_idea: PropTypes.number,
      id_team: PropTypes.number,
      id_organisation: PropTypes.number,
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
  setIdeaData: PropTypes.func,
  field: PropTypes.number.isRequired,
};
Comments.defaultProps = {
  label: "",
  commentsLoaded: [],
  setIdeaData: null,
};
