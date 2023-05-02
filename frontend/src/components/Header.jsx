import { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import logoSncfWhite from "@assets/LOGO_SNCF_GROUPE_NOIR_small.heif";
import logoSncf from "@assets/LOGO_SNCF_GROUPE_RVB_small.heif";
import logoSncfDark from "@assets/LOGO_SNCF_GROUPE_DEFONCE_small.heif";
import logoIreneOff from "@assets/logo.heif";
import logoIreneOn from "@assets/logo_on.heif";
import logoIreneDarkOff from "@assets/logo_dark_off.heif";
import logoIreneDarkOn from "@assets/logo_dark_on.heif";
import SharedContext from "../contexts/sharedContext";

export default function Header({ setDarkMode, setUser, setIsLogged }) {
  const handleClick = (e) => {
    e.preventDefault();
    document.querySelector(".menu").classList.toggle("showed");
  };
  const [menuHover, setMenuHover] = useState(0);
  const [isLogoHover, setIsLogoHover] = useState(false);
  const { darkMode, user, customFetch, setIsLoading } =
    useContext(SharedContext);
  const location = useLocation();
  const navigate = useNavigate();
  let buttonsColor = darkMode === 0 ? "bg-cyan" : "bg-secondary";
  buttonsColor = darkMode === 1 ? "bg-light" : buttonsColor;
  let hoverButtonColor = darkMode === 0 ? "bg-warning" : "bg-cyan";
  hoverButtonColor = darkMode === 1 ? "bg-cyan" : hoverButtonColor;

  const disconnect = () => {
    customFetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, "POST").finally(
      () => {
        setUser();
        setIsLogged(false);
        navigate(`${import.meta.env.VITE_FRONTEND_URI}/`);
      }
    );
  };
  const handleLinkClick = (e) => {
    const href =
      e.target.parentElement.href ?? e.target.parentElement.parentElement.href;
    $(".modal").modal("hide");
    if (!href.includes(location.pathname)) setIsLoading(true);
    else setIsLoading(false);
  };
  let backgroundColor = "bg-light";
  if (darkMode > 0) {
    backgroundColor = "bg-primary";
  }
  const havePerms = () => {
    return (
      user.perms &&
      (user.perms.manage_ideas_manager ||
        user.perms.manage_ideas_ambassador ||
        user.perms.manage_ideas_all ||
        user.perms.manage_challenges ||
        user.perms.manage_challenges_all ||
        user.perms.manage_organisations ||
        user.perms.manage_teams ||
        user.perms.manage_roles ||
        user.perms.manage_categories ||
        user.perms.manage_all)
    );
  };
  const click = (e) => {
    const menu = document.querySelector(".menu");
    if (
      menu.classList.contains("showed") &&
      !e.target.classList.contains("icons-menu-burger")
    ) {
      menu.classList.toggle("showed");
    }
  };
  useEffect(() => {
    window.addEventListener("click", click);
    return () => window.removeEventListener("click", click);
  }, []);
  return (
    <div className="sticky-top d-flex flex-column" style={{ zIndex: "1070" }}>
      <div
        className={`p-2 ${backgroundColor} text-black d-flex justify-content-between align-items-center`}
        style={{ height: "62px", top: 0, left: 0 }}
      >
        <div className="inline">
          <i
            className="d-sm-none icons-menu-burger icons-size-30px"
            onClick={handleClick}
            aria-hidden="true"
          >
            {" "}
          </i>
        </div>
        <h1 className="m-2 ml-md-5 font-weight-bold d-flex w-auto flex-row justify-content-arround align-items-center pl-sm-5">
          <Link
            to={`${import.meta.env.VITE_FRONTEND_URI}/`}
            onClick={handleLinkClick}
            className="btn-unstyled"
            onMouseEnter={() => setIsLogoHover(true)}
            onMouseLeave={() => setIsLogoHover(false)}
          >
            <img
              src={
                darkMode
                  ? `${isLogoHover ? logoIreneOn : logoIreneOff}`
                  : `${isLogoHover ? logoIreneDarkOn : logoIreneDarkOff}`
              }
              height="60px"
              alt="IRENE"
              className="ml-sm-5 pl-sm-5 ml-md-0 pl-md-0 pr-3"
            />
            <span className="d-none d-md-inline">IRENE</span>
          </Link>
          <a className="d-none d-md-inline" href="https://www.sncf.com">
            {darkMode === 0 ? (
              <img
                src={logoSncfWhite}
                height="90px"
                className="pl-3"
                alt="Logo SNCF"
              />
            ) : (
              ""
            )}
            {darkMode === 1 ? (
              <img
                src={logoSncf}
                height="90px"
                className="pl-3"
                alt="Logo SNCF"
              />
            ) : (
              ""
            )}
            {darkMode === 2 ? (
              <img
                src={logoSncfDark}
                height="90px"
                className="pl-3"
                alt="Logo SNCF"
              />
            ) : (
              ""
            )}
          </a>
        </h1>

        <i
          className="btn-rounded btn-rounded-gray text-gray-dark font-weight-bold style-none"
          style={{ fontStyle: "normal", minHeight: "40px", minWidth: "40px" }}
          aria-hidden="true"
          type="button"
          id="dropdownUserMenu"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-controls="usercontrol"
        >
          {user.firstname && user.firstname[0]}
          {user.lastname && user.lastname[0]}
        </i>
        <div
          className="dropdown-menu dropdown-menu-right mt-4"
          aria-labelledby="userMenu"
          id="usercontrol"
        >
          <div className="text-right mx-3">
            Connecté en tant que <br />
            <span className="lead">
              {user.firstname} {user.lastname}
            </span>
          </div>
          <ul>
            <Link
              to={`${import.meta.env.VITE_FRONTEND_URI}/user`}
              onClick={handleLinkClick}
            >
              <li className="dropdown-item">Paramètre du compte</li>
            </Link>
            <Link to={`${import.meta.env.VITE_FRONTEND_URI}/documents`}>
              <li className="dropdown-item">Documentation</li>
            </Link>
            <Link to={`${import.meta.env.VITE_FRONTEND_URI}/about`}>
              <li className="dropdown-item">A propos</li>
            </Link>
            <li className="dropdown-item mx-1">
              <div className="mb-1">Jeu de couleurs:</div>
              <div className="options-control">
                <div className="options-item">
                  <input
                    type="radio"
                    name="colorisation"
                    id="ireneColors"
                    className="sr-only"
                    value="0"
                    checked={darkMode === 0}
                    onChange={(e) => setDarkMode(parseInt(e.target.value, 10))}
                  />
                  <label
                    className="options-btn font-weight-medium"
                    htmlFor="ireneColors"
                  >
                    IRENE
                  </label>
                </div>
                <div className="options-item">
                  <input
                    type="radio"
                    name="colorisation"
                    id="sncfColors"
                    className="sr-only"
                    value="1"
                    checked={darkMode === 1}
                    onChange={(e) => setDarkMode(parseInt(e.target.value, 10))}
                  />
                  <label
                    className="options-btn font-weight-medium"
                    htmlFor="sncfColors"
                  >
                    SNCF
                  </label>
                </div>
                <div className="options-item">
                  <input
                    type="radio"
                    name="colorisation"
                    id="darkSncfColors"
                    className="sr-only"
                    value="2"
                    checked={darkMode === 2}
                    onChange={(e) => setDarkMode(parseInt(e.target.value, 10))}
                  />
                  <label
                    className="options-btn font-weight-medium"
                    htmlFor="darkSncfColors"
                  >
                    SOMBRE
                  </label>
                </div>
              </div>
            </li>
            <button
              type="button"
              onClick={disconnect}
              className="dropdown-item"
            >
              Se déconnecter
            </button>
          </ul>
        </div>
      </div>
      <div className="menu position-absolute text-white p-sm-0 p-2">
        <nav>
          <ul className="d-flex flex-column flex-sm-row p-10 m-0 w-auto meta-list">
            <Link
              to={`${import.meta.env.VITE_FRONTEND_URI}/`}
              onClick={handleLinkClick}
            >
              <li
                onMouseEnter={() => setMenuHover(1)}
                onMouseLeave={() => setMenuHover(0)}
                className="pb-3 pb-sm-0"
              >
                <i
                  className={`text-dark ${
                    menuHover === 1 ? hoverButtonColor : buttonsColor
                  } irene-menu-icon btn-rounded icons-itinerary-train-station`}
                  style={{
                    transform:
                      menuHover === 1 && window.innerWidth >= 575
                        ? "translateY(24px)"
                        : "",
                  }}
                >
                  {" "}
                </i>
                <h1
                  className={`ml-3 d-inline d-sm-none w-100 h-100 lead font-weight-bolder text-nowrap text-monospace ${
                    menuHover === 1 ? "text-warning" : "text-white"
                  }`}
                  style={{
                    transition: "all ease-in-out .2s",
                  }}
                >
                  Accueil
                </h1>
              </li>
            </Link>
            <Link
              to={`${import.meta.env.VITE_FRONTEND_URI}/skills`}
              onClick={handleLinkClick}
            >
              <li
                onMouseEnter={() => setMenuHover(2)}
                onMouseLeave={() => setMenuHover(0)}
                className="pb-3 pb-sm-0"
              >
                <i
                  className={`text-dark ${
                    menuHover === 2 ? hoverButtonColor : buttonsColor
                  } irene-menu-icon btn-rounded icons-circle-account-connected`}
                  style={{
                    transform:
                      menuHover === 2 && window.innerWidth >= 575
                        ? "translateY(24px)"
                        : "",
                  }}
                >
                  {" "}
                </i>
                <h1
                  className={`ml-3 d-inline d-sm-none w-100 h-100 lead font-weight-bolder text-nowrap text-monospace ${
                    menuHover === 2 ? "text-warning" : "text-white"
                  }`}
                  style={{
                    transition: "all ease-in-out .2s",
                  }}
                >
                  Compétences
                </h1>
              </li>
            </Link>
            <Link
              to={`${import.meta.env.VITE_FRONTEND_URI}/search`}
              onClick={handleLinkClick}
            >
              <li
                onMouseEnter={() => setMenuHover(3)}
                onMouseLeave={() => setMenuHover(0)}
                className="pb-3 pb-sm-0"
              >
                {" "}
                <i
                  className={`text-dark ${
                    menuHover === 3 ? hoverButtonColor : buttonsColor
                  } irene-menu-icon btn-rounded icons-file`}
                  style={{
                    transform:
                      menuHover === 3 && window.innerWidth >= 575
                        ? "translateY(24px)"
                        : "",
                  }}
                >
                  {" "}
                </i>
                <h1
                  className={`ml-3 d-inline d-sm-none w-100 h-100 lead font-weight-bolder text-nowrap text-monospace ${
                    menuHover === 3 ? "text-warning" : "text-white"
                  }`}
                  style={{
                    transition: "all ease-in-out .2s",
                  }}
                >
                  Innovations
                </h1>
              </li>
            </Link>
            <Link
              to={`${import.meta.env.VITE_FRONTEND_URI}/edit`}
              onClick={handleLinkClick}
            >
              <li
                onMouseEnter={() => setMenuHover(4)}
                onMouseLeave={() => setMenuHover(0)}
                className={`pb-${havePerms() ? "3" : "0"} pb-sm-0`}
              >
                {" "}
                <i
                  className={`text-dark ${
                    menuHover === 4 ? hoverButtonColor : buttonsColor
                  } irene-menu-icon menu-icon btn-rounded icons-large-lightbulb`}
                  style={{
                    transform:
                      menuHover === 4 && window.innerWidth >= 575
                        ? "translateY(24px)"
                        : "",
                  }}
                >
                  {" "}
                </i>
                <h1
                  className={`ml-3 d-inline d-sm-none w-100 h-100 lead font-weight-bolder text-nowrap text-monospace ${
                    menuHover === 4 ? "text-warning" : "text-white"
                  }`}
                  style={{
                    transition: "all ease-in-out .2s",
                  }}
                >
                  J'ai une idée
                </h1>
              </li>
            </Link>
            {havePerms() ? (
              <Link
                to={`${import.meta.env.VITE_FRONTEND_URI}/manage`}
                onClick={handleLinkClick}
              >
                <li
                  onMouseEnter={() => setMenuHover(5)}
                  onMouseLeave={() => setMenuHover(0)}
                  className="pb-0"
                >
                  {" "}
                  <i
                    className={`text-dark ${
                      menuHover === 5 ? "bg-danger" : buttonsColor
                    } irene-menu-icon menu-icon btn-rounded icons-admin`}
                    style={{
                      transform:
                        menuHover === 5 && window.innerWidth >= 575
                          ? "translateY(24px)"
                          : "",
                    }}
                  >
                    {" "}
                  </i>
                  <h1
                    className={`ml-3 d-inline d-sm-none w-100 h-100 lead font-weight-bolder text-nowrap text-monospace ${
                      menuHover === 5 ? "text-warning" : "text-white"
                    }`}
                    style={{
                      transition: "all ease-in-out .2s",
                    }}
                  >
                    Mon espace de gestion
                  </h1>
                </li>
              </Link>
            ) : (
              ""
            )}
          </ul>
          {window.innerWidth >= 575 && (
            <div
              className={`${
                menuHover > 0 && menuHover < 5 ? hoverButtonColor : ""
              }${menuHover === 5 ? "bg-danger" : ""}${
                menuHover === 0 ? buttonsColor : ""
              } position-relative text-center ${
                menuHover > 0 ? "d-block" : "d-none"
              }`}
              style={{
                width: havePerms() ? "350px" : "300px",
                left: -20,
                top: -1,
                pointerEvents: "none",
                zIndex: 1070,
              }}
            >
              <div
                className={`${
                  menuHover === 5 ? "text-white" : "text-dark"
                } lead`}
                style={{
                  backgroundColor: "transparent",
                }}
              >
                {menuHover === 1 && "Accueil"}
                {menuHover === 2 && "Compétences"}
                {menuHover === 3 && "Innovations"}
                {menuHover === 4 && "J'ai une idée"}
                {menuHover === 5 && "Mon espace de gestion"}
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

Header.propTypes = {
  setDarkMode: PropTypes.func.isRequired,
  setIsLogged: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
};
