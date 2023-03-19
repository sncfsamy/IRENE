import { Route, Routes } from "react-router-dom";
import Authentification from "../pages/Authentification";
import About from "../pages/About";
import Documents from "../pages/Documents";
import Error404 from "../pages/Error404";

export default function UnAuthenticatedApp({ setToken }) {
  return (
    <Routes>
      <Route path="*" element={<Authentification setToken={setToken} />} />
      <Route path="/about" element={<About />} />
      <Route path="/documents" element={<Documents />} />
    </Routes>
  );
}
