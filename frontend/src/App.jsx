/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import colorMode from "./colorMode.js";
import "@sncf/bootstrap-sncf.metier";
import "./App.css";
import SharedContext from "./contexts/sharedContext";
import AuthenticatedApp from "./App/AuthenticatedApp";
import UnAuthenticatedApp from "./App/UnAuthenticatedApp";
import Loader from "./components/Loader";
import ModalRgpd from "@components/ModalRgpd.jsx";
import loader from "./assets/loading.webp";

const baseURL = import.meta.env.VITE_BACKEND_URL;
function App() {
  const [user, setUser] = useState();
  const [organisations, setOrganisations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("IRENE_AUTH"));
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(colorMode());

  function toggleDarkmode() {
    console.log("toggledm");
    const activecss = document.getElementById("lightCSS");
    const inactivecss = document.getElementById("darkCSS");
    if (activecss && inactivecss) {
      const hrefs = [
        activecss.getAttribute("href"),
        inactivecss.getAttribute("href"),
      ];
      activecss.setAttribute(
        "href",
        darkMode === 2
          ? hrefs.find((h) => h.includes("darkmode"))
          : hrefs.find((h) => !h.includes("darkmode"))
      );
      inactivecss.setAttribute(
        "href",
        darkMode === 2
          ? hrefs.find((h) => !h.includes("darkmode"))
          : hrefs.find((h) => h.includes("darkmode"))
      );
    }
  }
  useEffect(() => {
    localStorage.setItem("IRENE_DARKMODE", darkMode);
    toggleDarkmode();

    const body = document.querySelector("body");
    if (darkMode === 0) {
      body.classList.remove("bg-dark");
      body.classList.remove("bg-white");
      body.classList.add("bg-cyan");
      body.style.setProperty("--ck-color-base-background", "#e3e3e3");
      body.style.setProperty("--linksColor", "#ffb612");
      body.style.setProperty("--linksHoverColor", "#c58800");
      body.style.setProperty("--chipsTextColor", "#212529");
      body.style.setProperty("--formControlBorderColor", "#ffb612");
    } else if (darkMode === 1) {
      body.classList.remove("bg-dark");
      body.classList.remove("bg-cyan");
      body.classList.add("bg-white");
      body.style.setProperty("--ck-color-base-background", "#fdfdfd");
      body.style.setProperty("--linksColor", "#0088ce");
      body.style.setProperty("--linksHoverColor", "#0074af");
      body.style.setProperty("--chipsTextColor", "#ffffff");
      body.style.setProperty("--formControlBorderColor", "#4fc3ff");
    } else if (darkMode === 2) {
      body.classList.remove("bg-cyan");
      body.classList.remove("bg-white");
      body.classList.add("bg-dark");
      body.style.setProperty("--ck-color-base-background", "#333333");
      body.style.setProperty("--linksColor", "#0088ce");
      body.style.setProperty("--linksHoverColor", "#0074af");
      body.style.setProperty("--chipsTextColor", "#ffffff");
      body.style.setProperty("--formControlBorderColor", "#4fc3ff");
    }
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetch(`${baseURL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((userData) => {
          const requests = [
            fetch(`${baseURL}/organisations`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).then((response) => response.json()),
            fetch(`${baseURL}/categories`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).then((response) => response.json()),
          ];

          if (userData.role_id === 3)
            request.push(
              fetch(`${baseURL}/roles`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }).then((response) => response.json())
            );
          Promise.all(requests)
            .then((data) => {
              setUser(userData);
              setOrganisations(data[0]);
              setCategories(data[1]);
              if (userData.role_id === 3) setRoles(data[2]);
              setIsLoading(false);
            })
            .catch((error) => {
              setIsLoading(false);
              console.error(error);
            });
        })
        .catch((error) => {
          setToken();
          localStorage.removeItem("IRENE_AUTH");
          setUser();
          console.warn(error);
          setIsLoading(false);
        });
    } else setIsLoading(false);
  }, [token]);
  return (
    <div className="App">
      <SharedContext.Provider
        value={{
          user,
          token,
          baseURL,
          categories,
          organisations,
          roles,
          darkMode,
          setIsLoading,
        }}
      >
        <BrowserRouter>
          {user ? (
            <AuthenticatedApp
              setToken={setToken}
              setUser={setUser}
              setDarkMode={setDarkMode}
            />
          ) : (
            <UnAuthenticatedApp setToken={setToken} />
          )}
        </BrowserRouter>
        {isLoading ? <Loader /> : ""}
        {user && !isLoading && !user.rgpd_agreement ? (
          <ModalRgpd setUser={setUser} />
        ) : (
          ""
        )}
      </SharedContext.Provider>
      <img src={loader} style={{width: 0, height: 0}} className="position-absolute" />
    </div>
  );
}
export default App;
