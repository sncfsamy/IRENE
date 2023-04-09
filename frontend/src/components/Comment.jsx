import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import CommentForm from "./CommentForm";
import SharedContext from "../contexts/sharedContext";

const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export default function Comment({
  comment,
  id,
  className,
  field,
  ideaData,
  setIdeaData,
  handleSubmit,
  deep,
}) {
  const { teams, organisations, user, darkMode, setIsLoading, customFetch } =
    useContext(SharedContext);
  const [formShowed, setFormShowed] = useState(false);
  const handleDelete = () => {
    setIsLoading(true);
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/comments/${comment.id_comment}`,
      "DELETE"
    )
      .then(() => {
        const { comments } = ideaData;
        comments[field].comments = comments[field].comments.filter(
          (sourceComment) => sourceComment.id_comment !== comment.id_comment
        );
        comments[field].total -= 1;
        setIdeaData({ ...ideaData, comments });
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn(err);
        setIsLoading(false);
      });
  };
  return (
    <div style={{ marginLeft: deep ? `${deep / 1.7}rem` : undefined }}>
      <div
        className={`comment-header d-flex flex-row justify-content-between align-items-center rounded-top px-1 px-sm-3 px-lg-4 py-1 py-sm-2 py-lg-3 mt-1 mb-0 mx-0 ${
          darkMode === 0 ? "bg-white" : ""
        }${darkMode === 1 ? "bg-white" : ""}${
          darkMode === 2 ? "bg-dark" : ""
        } ${className}`}
        style={{ borderColor: `${darkMode === 2 ? "#f2f2f2" : "#d2d2d2"}` }}
      >
        <div>
          <Link
            to={`${import.meta.env.VITE_FRONTEND_URI}/user/${comment.id_user}`}
          >
            {comment.firstname} {comment.lastname}
          </Link>
          <br />
          {
            organisations.find(
              (organisation) =>
                organisation.id_organisation === comment.id_organisation
            ).name
          }{" "}
          / {teams.find((team) => team.id_team === comment.id_team).name}
          <br />
          Le{" "}
          {new Date(comment.created_at).toLocaleDateString(
            "FR-fr",
            dateOptions
          )}{" "}
          à {new Date(comment.created_at).toLocaleTimeString("FR-fr")}
        </div>
        <div>
          {user.perms.manage_all ? (
            <button
              type="button"
              className="btn btn-danger p-4 p-md-2"
              onClick={handleDelete}
            >
              <span className="d-none d-md-inline">Supprimer &nbsp;</span>
              <i className="icons-close" aria-hidden="true" />
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
      <div
        className={`comment-content px-2 px-lg-3 py-1 py-lg-2 my-0 mx-0 ${
          darkMode === 2 ? "bg-gray text-white" : "bg-light"
        } ${className}`}
        style={{ borderColor: `${darkMode === 2 ? "#f2f2f2" : "#d2d2d2"}` }}
      >
        <p>{comment.comment}</p>
        {field !== "0" ||
        (user.perms.manage_ideas_manager &&
          user.id_team ===
            ideaData.authors.find((author) => author.is_author).id_team) ||
        (user.perms.manage_ideas_ambassador &&
          user.id_organisation === ideaData.idea.id_organisation) ||
        ideaData.authors.find(
          (author) => author.id_user === user.id_user && author.is_author
        ) ? (
          <div className="text-right pt-4 text-break">
            {formShowed ? (
              <CommentForm
                ideaData={ideaData}
                setIdeaData={setIdeaData}
                setFormShowed={setFormShowed}
                field={field}
                id={`${id}_${comment.id_comment}`}
                idParentComment={comment.id_comment}
                handleSubmit={handleSubmit}
                buttonText={`Répondre à ${comment.firstname} ${comment.lastname}`}
              />
            ) : (
              <button
                type="button"
                className="btn btn-link text-break"
                onClick={() => setFormShowed(true)}
              >
                Répondre à {comment.firstname} {comment.lastname}
              </button>
            )}
          </div>
        ) : (
          ""
        )}
        {ideaData.comments[field].comments
          .filter((child) => child.id_parent_comment === comment.id_comment)
          .map((child) => (
            <div key={child.id_comment}>
              <Comment
                comment={child}
                id={`${id}_${comment.id_comment}_${child.id_comment}`}
                field={field}
                ideaData={ideaData}
                setIdeaData={setIdeaData}
                handleSubmit={handleSubmit}
                deep={deep ? deep + 1 : 1}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

Comment.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  deep: PropTypes.number,
  comment: PropTypes.shape({
    id_comment: PropTypes.number,
    id_organisation: PropTypes.number,
    id_team: PropTypes.number,
    created_at: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    comment: PropTypes.string,
    id_user: PropTypes.number,
    firstname: PropTypes.string,
    lastname: PropTypes.string,
  }),
  field: PropTypes.number.isRequired,
  ideaData: PropTypes.shape({
    idea: PropTypes.shape({
      id_idea: PropTypes.number,
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
  handleSubmit: PropTypes.func,
  setIdeaData: PropTypes.func,
};

Comment.defaultProps = {
  className: "",
  handleSubmit: null,
  deep: null,
  comment: null,
  setIdeaData: null,
};
