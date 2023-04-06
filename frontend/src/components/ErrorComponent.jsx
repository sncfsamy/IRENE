import { PropTypes } from "prop-types";

function ErrorComponent({ message, title, image }) {
  return (
    <div className="form-error mb-3 w-75 mx-auto">
      <h2 className="text-white text-uppercase">
        {title || "Oouups ! Quelque chose ne s'est pas passé comme prévu..."}
      </h2>
      {image && (
        <div className="w-100">
          <img
            className="mx-auto w-75 h-auto"
            src={image}
            alt={title || message}
          />
        </div>
      )}
      {message && (
        <ul className="mt-3 mb-0 list-unstyled">
          {message.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
ErrorComponent.propTypes = {
  title: PropTypes.string,
  message: PropTypes.arrayOf(PropTypes.string),
  image: PropTypes.string,
};
ErrorComponent.defaultProps = {
  message: ["Une erreur est suvenue"],
  title: "",
  image: undefined,
};
export default ErrorComponent;
