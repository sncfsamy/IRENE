import { useContext } from "react";
import { Link } from "react-router-dom";
import ErrorComponent from "../components/ErrorComponent";
import error from "../assets/error.heif";
import SharedContext from "../contexts/sharedContext";

export default function Error404() {
  const { user } = useContext(SharedContext);
  return (
    <div className="container mt-5 text-center">
      <ErrorComponent
        title="Erreur 404"
        message={[
          "La page ou le fichier que vous recherchez est introuvable !",
        ]}
        image={error}
      />
      {!user && (
        <Link className="btn btn-link" to="/">
          <span>Se connecter</span>{" "}
          <i
            className="icons-arrow-next icons-size-x75 ml-2"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
