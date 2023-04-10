import { Route, Routes } from "react-router-dom";
import { PropTypes } from "prop-types";
import Authentification from "../pages/Authentification";
import About from "../pages/About";

export default function UnAuthenticatedApp({ setRefreshToken, setIsLogged }) {
  return (
    <Routes>
      <Route
        path={`${import.meta.env.VITE_FRONTEND_URI}/about`}
        element={<About />}
      />
      <Route
        path={`${import.meta.env.VITE_FRONTEND_URI}/*`}
        element={
          <Authentification
            setIsLogged={setIsLogged}
            setRefreshToken={setRefreshToken}
          />
        }
      />
    </Routes>
  );
}

UnAuthenticatedApp.propTypes = {
  setRefreshToken: PropTypes.func.isRequired,
  setIsLogged: PropTypes.func.isRequired,
};
