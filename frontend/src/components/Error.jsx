import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export default function ErrorComponent({
  errorMessage,
  errorTitle,
  linkToHome,
}) {
  return (
    <div className="form-error mb-3">
      <h2 className="text-white text-uppercase">{errorTitle ?? "Erreur !"}</h2>
      <ul className="mt-1 mb-0">
        <li>{errorMessage}</li>
        {linkToHome && <li />}
        {linkToHome && (
          <li>
            <Link to="/">Retour à l'accueil</Link>
          </li>
        )}
      </ul>
    </div>
  );
}

ErrorComponent.propTypes = {
  errorMessage: PropTypes.arrayOf(
    PropTypes.shape({
      param: PropTypes.string,
      msg: PropTypes.string,
    })
  ),
  errorTitle: PropTypes.string,
  linkToHome: PropTypes.bool,
};
ErrorComponent.defaultProps = {
  errorMessage: [],
  errorTitle: "Oooops ! Nous avons un problème...",
  linkToHome: false,
};
