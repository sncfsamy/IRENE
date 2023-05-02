import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import ModalRgpd from "@components/ModalRgpd";
import loader from "@assets/loading.webp";
import logoIreneDarkOn from "@assets/logo_dark_on.heif";
import SharedContext from "./contexts/sharedContext";
import AuthenticatedApp from "./App/AuthenticatedApp";
import UnAuthenticatedApp from "./App/UnAuthenticatedApp";
import Loader from "./components/Loader";
import Toast from "./class/Toast";

function colorMode() {
  const dm = parseInt(localStorage.getItem("IRENE_DARKMODE"), 10);
  return (!Number.isNaN(dm) && dm) || 0;
}
window.toasts = new Toast();
function App() {
  const [user, setUser] = useState();
  const [organisations, setOrganisations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastsShowed, setToastsShowed] = useState([]);
  const [darkMode, setDarkMode] = useState(colorMode());
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("IRENE_TOKEN")
  );

  const customFetch = (url, method = "GET", data = null, noHeaders = false) => {
    return new Promise((resolve) => {
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
          let toReturn = null;
          const contentType = response.headers.get("content-type");
          if (response.ok) {
            toReturn =
              contentType && contentType.includes("application/json")
                ? response.json()
                : {};
          } else if (response && typeof response === "string") {
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
                  toReturn = reponseToSend;
                } else {
                  setIsLogged(false);
                  setUser();
                  setRefreshToken();
                  toReturn = reponseToSend;
                }
              } else {
                setIsLogged(false);
                setUser();
                setRefreshToken();
                toReturn = null;
              }
            } else if (responseData && responseData.loggedOut) {
              setIsLogged(false);
              setUser();
              toReturn = responseData;
            } else if (!responseData) {
              toReturn = response;
            }
          } else {
            toReturn = null;
          }
          return toReturn;
        })
        .then((responseData) => {
          if (responseData && responseData.loggedOut) {
            setIsLogged(false);
            setUser();
            resolve([]);
          } else if (responseData) resolve(responseData);
          else resolve([]);
        })
        .catch((err) => {
          console.warn(err);
          resolve([]);
        });
    });
  };

  const addToast = (toastData) => {
    window.toasts.addToast(toastData);
    setToastsShowed(window.toasts.getToasts());
    setTimeout(() => {
      const toast =
        window.toasts.getToasts()[window.toasts.getToasts().length - 1];
      $(`#toast_${toast.id}`)
        .toast({ animation: true, autohide: true, delay: 8000 })
        .toast("show")
        .on("hidden.bs.toast", () => {
          $(`#toast_${toast.id}`).toast("dispose");
          $(`#toast_${toast.id}`).hide();
          window.toasts.removeToast(toast.id);
        });
    }, 250);
    setTimeout(() => {
      setToastsShowed(window.toasts.getToasts());
    }, 8500);
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
        setUser();
        setIsLogged(false);
        setIsLoading(false);
      });
  }, [isLogged]);
  const memoizedValues = useMemo(
    () => ({
      user,
      categories,
      organisations,
      teams,
      roles,
      darkMode,
      isLogged,
      customFetch,
      setIsLoading,
      addToast,
    }),
    [user, categories, organisations, teams, roles, darkMode, isLogged]
  );
  return (
    <div className="App">
      {toastsShowed.length ? (
        <div
          className="position-fixed h-100"
          style={{ top: "64px", right: 0, zIndex: 1072 }}
        >
          {toastsShowed.map((toast) => (
            <div
              className={`toast ${darkMode === 2 ? "bg-gray" : ""}`}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              id={`toast_${toast.id}`}
              key={toast.id}
            >
              <div className="toast-header bg-warning text-dark">
                <img
                  src={logoIreneDarkOn}
                  className="rounded mr-2"
                  style={{ width: "50px" }}
                  alt="Irene notification"
                />
                <strong
                  className={`mr-auto ${darkMode === 2 ? "text-dark" : ""}`}
                >
                  {toast.title}
                </strong>
                <small className="text-dark">À l'instant</small>
                <button
                  type="button"
                  className="ml-2 mb-1 close text-dark"
                  data-dismiss="toast"
                  aria-label="Fermer"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="toast-body">{toast.message}</div>
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
      <SharedContext.Provider value={memoizedValues}>
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
            <UnAuthenticatedApp
              setIsLogged={setIsLogged}
              setRefreshToken={setRefreshToken}
            />
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
