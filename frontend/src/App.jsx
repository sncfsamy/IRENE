/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import ModalRgpd from "@components/ModalRgpd";
import loader from "@assets/loading.webp";
import colorMode from "./colorMode";
import SharedContext from "./contexts/sharedContext";
import AuthenticatedApp from "./App/AuthenticatedApp";
import UnAuthenticatedApp from "./App/UnAuthenticatedApp";
import Loader from "./components/Loader";

function App() {
  const [user, setUser] = useState();
  const [organisations, setOrganisations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(colorMode());
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("IRENE_TOKEN")
  );

  const customFetch = (url, method = "GET", data = null, noHeaders = false) => {
    return new Promise((resolve, reject) => {
      const options = {
        method,
        credentials: "include",
        headers: {},
      };
      if (!noHeaders) {
        options.headers["Content-Type"] = "application/json";
      }
      if (data) {
        options.body = noHeaders ? data : JSON.stringify(data);
      }

      fetch(url, options)
        .then(async (response) => {
          const contentType = response.headers.get("content-type");
          if (response.ok) {
            resolve(
              contentType && contentType.includes("application/json")
                ? response.json()
                : {}
            );
          } else {
            const responseData = await response.json();
            if (responseData && responseData.expired) {
              const response2 = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/renew`,
                {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${refreshToken}`,
                  },
                  body: JSON.stringify({
                    refreshExchangeToken: responseData.refreshExchangeToken,
                  }),
                }
              );
              if (response2.ok) {
                const response3 = await fetch(url, options);
                const contentType2 = response3.headers.get("content-type");
                const reponseToSend =
                  contentType2 && contentType2.includes("application/json")
                    ? response3.json()
                    : {};
                if (response3.ok) {
                  resolve(reponseToSend);
                } else {
                  setIsLogged(false);
                  setUser();
                  setRefreshToken();
                  reject(reponseToSend);
                }
              } else {
                setIsLogged(false);
                setUser();
                setRefreshToken();
                reject(new Error({ errors: { msg: "Bad removal" } }));
              }
            } else if (responseData && responseData.loggedOut) {
              setIsLogged(false);
              setUser();
              reject(new Error(responseData));
            } else if (responseData) {
              reject(new Error(responseData));
            } else {
              reject(new Error(response));
            }
          }
        })
        .then((responseData) => {
          if (responseData && responseData.loggedOut) {
            setIsLogged(false);
            setUser();
            reject(new Error({}));
          } else {
            resolve(responseData);
          }
        })
        .catch(async (response) => {
          console.warn("Error: ", response);
          reject(new Error({}));
        });
    });
  };

  function toggleDarkmode() {
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
      body.style.setProperty("--h1color", "#333");
    } else if (darkMode === 1) {
      body.classList.remove("bg-dark");
      body.classList.remove("bg-cyan");
      body.classList.add("bg-white");
      body.style.setProperty("--ck-color-base-background", "#fdfdfd");
      body.style.setProperty("--linksColor", "#0088ce");
      body.style.setProperty("--linksHoverColor", "#0074af");
      body.style.setProperty("--chipsTextColor", "#ffffff");
      body.style.setProperty("--formControlBorderColor", "#4fc3ff");
      body.style.setProperty("--h1color", "#333");
    } else if (darkMode === 2) {
      body.classList.remove("bg-cyan");
      body.classList.remove("bg-white");
      body.classList.add("bg-dark");
      body.style.setProperty("--ck-color-base-background", "#333333");
      body.style.setProperty("--linksColor", "#0088ce");
      body.style.setProperty("--linksHoverColor", "#0074af");
      body.style.setProperty("--chipsTextColor", "#ffffff");
      body.style.setProperty("--formControlBorderColor", "#4fc3ff");
      body.style.setProperty("--h1color", "#fefefe");
    }
  }, [darkMode]);

  useEffect(() => {
    customFetch(`${import.meta.env.VITE_BACKEND_URL}/me`)
      .then((userData) => {
        const requests = [
          customFetch(`${import.meta.env.VITE_BACKEND_URL}/organisations`),
          customFetch(
            `${import.meta.env.VITE_BACKEND_URL}/categories?limit=500`
          ),
          customFetch(`${import.meta.env.VITE_BACKEND_URL}/teams`),
        ];

        if (userData.perms.manage_all) {
          requests.push(
            customFetch(`${import.meta.env.VITE_BACKEND_URL}/roles`)
          );
        }
        Promise.all(requests)
          .then((data) => {
            setUser(userData);
            setOrganisations(data[0]);
            setCategories(data[1].categories);
            setTeams(data[2]);
            if (userData.perms.manage_all) {
              setRoles(data[3]);
            }
            setIsLogged(true);
          })
          .catch((error) => {
            console.warn(error);
            setIsLogged(false);
            setIsLoading(false);
          });
      })
      .catch(() => {
        console.log("déco")
        setUser();
        setIsLogged(false);
        setIsLoading(false);
      });
  }, [isLogged]);
  return (
    <div className="App">
      <SharedContext.Provider
        value={{
          customFetch,
          user,
          categories,
          organisations,
          teams,
          roles,
          darkMode,
          setIsLoading,
          isLogged,
        }}
      >
        <BrowserRouter>
          {user ? (
            <AuthenticatedApp
              setUser={setUser}
              setDarkMode={setDarkMode}
              setOrganisations={setOrganisations}
              setTeams={setTeams}
              setRoles={setRoles}
              setCategories={setCategories}
              setIsLogged={setIsLogged}
            />
          ) : (
            <UnAuthenticatedApp setIsLogged={setIsLogged} setRefreshToken={setRefreshToken} />
          )}
        </BrowserRouter>
        {isLoading ? <Loader /> : ""}
        {user && !isLoading && !user.rgpd_agreement ? (
          <ModalRgpd setUser={setUser} />
        ) : (
          ""
        )}
      </SharedContext.Provider>
      <img
        src={loader}
        alt="Loader view"
        style={{ width: 0, height: 0 }}
        className="position-absolute"
      />
    </div>
  );
}
export default App;
