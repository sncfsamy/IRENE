import PropTypes from "prop-types";
import { Route, Routes } from "react-router-dom";
import UserProfile from "@pages/UserProfile";
import Challenge from "@pages/Challenge";
import Header from "../components/Header";
import Home from "../pages/Home";
import InnovationDisplay from "../pages/InnovationDisplay";
import InnovationEdit from "../pages/InnovationEdit";
import InnovationSearch from "../pages/InnovationSearch";
import SkillSearch from "../pages/SkillSearch";
import Documents from "../pages/Documents";
import About from "../pages/About";
import Error404 from "../pages/Error404";
import Manage from "../pages/Manage";

export default function AuthenticatedApp({
  setUser,
  setDarkMode,
  setIsLogged,
  setOrganisations,
  setTeams,
  setRoles,
  setCategories,
}) {
  return (
    <div>
      <Header
        setDarkMode={setDarkMode}
        setUser={setUser}
        setIsLogged={setIsLogged}
      />
      <Routes>
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/`}
          element={<Home />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/innovation/:id`}
          element={<InnovationDisplay />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/challenge/:id`}
          element={<Challenge />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/edit`}
          element={<InnovationEdit />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/edit/:id`}
          element={<InnovationEdit />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/search`}
          element={<InnovationSearch />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/skills`}
          element={<SkillSearch />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/user`}
          element={<UserProfile />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/user/:id`}
          element={<UserProfile />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/about`}
          element={<About />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/documents`}
          element={<Documents />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/manage`}
          element={<Manage />}
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/manage/:page`}
          element={
            <Manage
              setOrganisations={setOrganisations}
              setTeams={setTeams}
              setRoles={setRoles}
              setCategories={setCategories}
            />
          }
        />
        <Route
          path={`${import.meta.env.VITE_FRONTEND_URI}/*`}
          element={<Error404 />}
        />
      </Routes>
    </div>
  );
}

AuthenticatedApp.propTypes = {
  setCategories: PropTypes.func.isRequired,
  setDarkMode: PropTypes.func.isRequired,
  setIsLogged: PropTypes.func.isRequired,
  setOrganisations: PropTypes.func.isRequired,
  setRoles: PropTypes.func.isRequired,
  setTeams: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
};
