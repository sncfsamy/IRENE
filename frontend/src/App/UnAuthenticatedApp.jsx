import { Route, Routes } from "react-router-dom";
import { PropTypes } from "prop-types";
import Authentification from "../pages/Authentification";
import About from "../pages/About";
import Error403 from "@pages/Error403";

export default function UnAuthenticatedApp({
  setRefreshToken,
  isLogged,
  setIsLogged,
  isLoading,
}) {
  const authenticatedRoutes = [
    `${import.meta.env.VITE_FRONTEND_URI}/innovation/:id`,
    `${import.meta.env.VITE_FRONTEND_URI}/edit`,
    `${import.meta.env.VITE_FRONTEND_URI}/edit/:id`,
    `${import.meta.env.VITE_FRONTEND_URI}/search`,
    `${import.meta.env.VITE_FRONTEND_URI}/skills`,
    `${import.meta.env.VITE_FRONTEND_URI}/user`,
    `${import.meta.env.VITE_FRONTEND_URI}/user/:id`,
    `${import.meta.env.VITE_FRONTEND_URI}/documents`,
    `${import.meta.env.VITE_FRONTEND_URI}/manage`,
    `${import.meta.env.VITE_FRONTEND_URI}/manage/:page`,
  ];
  return (
    <Routes>
      <Route
        path={`${import.meta.env.VITE_FRONTEND_URI}/about`}
        element={<About />}
      />
      <Route
        path={`${import.meta.env.VITE_FRONTEND_URI}*`}
        element={<Authentification setIsLogged={setIsLogged} setRefreshToken={setRefreshToken} />}
      />
    </Routes>
  );
}

UnAuthenticatedApp.propTypes = {
  setRefreshToken: PropTypes.func.isRequired,
  user: PropTypes.shape({}),
  isLogged: PropTypes.bool,
  isLoading: PropTypes.bool,
};
UnAuthenticatedApp.defaultProps = {
  isLogged: false,
  isLoading: true,
  user: null,
};
