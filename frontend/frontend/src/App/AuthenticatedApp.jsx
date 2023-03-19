import { Route, Routes } from "react-router-dom";
import UserProfile from "@pages/UserProfile";
import Header from "../components/Header";
import Home from "../pages/Home";
import InnovationDisplay from "../pages/InnovationDisplay";
import InnovationEdit from "../pages/InnovationEdit";
import InnovationSearch from "../pages/InnovationSearch";
import SkillSearch from "../pages/SkillSearch";
import Documents from "../pages/Documents";
import About from "../pages/About";
import Error404 from "../pages/Error404";

export default function AuthenticatedApp({ setUser, setDarkMode, setToken }) {
  return (
    <div>
      <Header setDarkMode={setDarkMode} setUser={setUser} setToken={setToken} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/innovation/:id" element={<InnovationDisplay />} />
        <Route path="/edit" element={<InnovationEdit />} />
        <Route path="/edit/:id" element={<InnovationEdit />} />
        <Route path="/search" element={<InnovationSearch />} />
        <Route path="/skills" element={<SkillSearch />} />
        <Route path="/user" element={<UserProfile setUser={setUser} />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
}
