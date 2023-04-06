import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import error from "@assets/error_404.heif";
import ErrorComponent from "../components/ErrorComponent";
import SharedContext from "../contexts/sharedContext";

export default function Error404() {
  const { user, setIsLoading } = useContext(SharedContext);
  useEffect(() => setIsLoading(false), []);
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
        <Link
          className="btn btn-link"
          to={`${import.meta.env.VITE_FRONTEND_URL}/`}
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
