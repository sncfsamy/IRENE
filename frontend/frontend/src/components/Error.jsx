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
