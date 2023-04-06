import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import error from "@assets/error_403.heif";
import ErrorComponent from "../components/ErrorComponent";
import SharedContext from "../contexts/sharedContext";

export default function Error403() {
  const { user, setIsLoading } = useContext(SharedContext);
  useEffect(() => setIsLoading(false), []);
  return (
    <div className="container mt-5 text-center">
      <ErrorComponent
        title="Erreur 403"
        message={[
          "Accès non autorisé !",
          "Vous n'avez pas l'autorisation d'accéder à cette page.",
        ]}
        image={error}
      />
      {!user && (
        <Link
          className="btn btn-link"
          to={`${import.meta.env.VITE_FRONTEND_URI}/`}
        >
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
