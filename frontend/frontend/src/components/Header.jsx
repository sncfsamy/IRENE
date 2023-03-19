import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import SharedContext from "../contexts/sharedContext";
import logo_sncf_irene from "../assets/LOGO_SNCF_GROUPE_NOIR_small.png";
import logo_sncf_sncf from "../assets/LOGO_SNCF_GROUPE_RVB_small.png";
import logo_sncf_dark from "../assets/LOGO_SNCF_GROUPE_DEFONCE_small.png";
import logo from "../assets/logo.png";
import logo_dark from "../assets/logo_dark.png";

export default function Header({ setToken, setDarkMode, setUser }) {
  const handleClick = (e) => {
    const sideMenu = document.querySelector(".Side-menu");
    e.preventDefault();
    sideMenu.classList.toggle("ml-0");
  };
  const [homeIsHovering, setHomeIsHovering] = useState(false);
  const [skillsIsHovering, setSkillsIsHovering] = useState(false);
  const [innovationIsHovering, setInnovationIsHovering] = useState(false);
  const [ideaIsHovering, setIdeaIsHovering] = useState(false);
  const { darkMode } = useContext(SharedContext);

  let buttonsColor = darkMode === 0 ? "bg-cyan" : "bg-secondary";
  buttonsColor = darkMode === 1 ? "bg-light" : buttonsColor;
  let hoverButtonColor = darkMode === 0 ? "bg-warning" : "bg-cyan";
  hoverButtonColor = darkMode === 1 ? "bg-cyan" : hoverButtonColor;

  const disconnect = () => {
    localStorage.removeItem("IRENE_AUTH");
    setUser();
    setToken();
  };

  let backgroundColor = "bg-light";
  if (darkMode > 0) {
    backgroundColor = "bg-primary";
  }
  return (
    <div className="sticky-top d-flex flex-column">
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
        <h1 className="m-2 font-weight-bold d-flex w-auto flex-row justify-content-arround align-items-center pl-sm-5">
          <img
            src={darkMode === 0 ? logo_dark : logo}
            height="60px"
            alt="IRENE"
            className="ml-sm-5 pl-sm-5 ml-md-0 pl-md-0 pr-3"
          />
          IRENE
          {darkMode === 0 ? (
            <img
              src={logo_sncf_irene}
              height="90px"
              className="pl-3"
              alt="Logo SNCF"
            />
          ) : (
            ""
          )}
          {darkMode === 1 ? (
            <img
              src={logo_sncf_sncf}
              height="90px"
              className="pl-3"
              alt="Logo SNCF"
            />
          ) : (
            ""
          )}
          {darkMode === 2 ? (
            <img
              src={logo_sncf_dark}
              height="90px"
              className="pl-3"
              alt="Logo SNCF"
            />
          ) : (
            ""
          )}
        </h1>

        <i
          className="icons-menu-account icons-size-1x25 icons-md-size-1x5 mr-xl-2 text-gray-dark"
          aria-hidden="true"
          type="button"
          id="userMenu"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-controls="usercontrol"
        >
          {" "}
        </i>
        <div
          className="dropdown-menu dropdown-menu-right mt-4"
          aria-labelledby="userMenu"
          id="usercontrol"
        >
          <ul>
            <Link to="/user">
              <li className="dropdown-item">Paramètre du compte</li>
            </Link>
            <Link to="/documents">
              <li className="dropdown-item">Documentation</li>
            </Link>
            <Link to="/about">
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
      <div
        className="Side-menu position-absolute text-white p-sm-0 p-2"
        style={{
          transition: "all linear .5s",
          top: "61px",
          backgroundColor: "rgba(0, 17, 43, 0.9)",
          marginLeft: "-100%",
        }}
      >
        <nav>
          <ul className="d-flex flex-column flex-sm-row p-1 m-0 w-auto meta-list">
            <Link to="/">
              <li
                onMouseEnter={() => setHomeIsHovering(true)}
                onMouseLeave={() => setHomeIsHovering(false)}
                className="pb-3 pb-sm-0"
              >
                <i
                  className={`text-dark ${
                    homeIsHovering ? hoverButtonColor : buttonsColor
                  } irene-menu-icon btn-rounded icons-itinerary-train-station`}
                  style={{
                    transform:
                      homeIsHovering && window.innerWidth >= 575
                        ? "translateY(24px)"
                        : "",
                  }}
                >
                  {" "}
                </i>
                <h1
                  className={`ml-3 d-inline d-sm-none w-100 h-100 lead font-weight-bolder text-nowrap text-monospace ${
                    homeIsHovering ? "text-warning" : "text-white"
                  }`}
                  style={{
                    transition: "all ease-in-out .2s",
                  }}
                >
                  Accueil
                </h1>
              </li>
            </Link>
            <Link to="/skills">
              <li
                onMouseEnter={() => setSkillsIsHovering(true)}
                onMouseLeave={() => setSkillsIsHovering(false)}
                className="pb-3 pb-sm-0"
              >
                <i
                  className={`text-dark ${
                    skillsIsHovering ? hoverButtonColor : buttonsColor
                  } irene-menu-icon Circle-icon btn-rounded icons-circle-account-connected`}
                  style={{
                    transform:
                      skillsIsHovering && window.innerWidth >= 575
                        ? "translateY(24px)"
                        : "",
                  }}
                >
                  {" "}
                </i>
                <h1
                  className={`ml-3 d-inline d-sm-none w-100 h-100 lead font-weight-bolder text-nowrap text-monospace ${
                    skillsIsHovering ? "text-warning" : "text-white"
                  }`}
                  style={{
                    transition: "all ease-in-out .2s",
                  }}
                >
                  Compétences
                </h1>
              </li>
            </Link>
            <Link to="/search">
              <li
                onMouseEnter={() => setInnovationIsHovering(true)}
                onMouseLeave={() => setInnovationIsHovering(false)}
                className="pb-3 pb-sm-0"
              >
                {" "}
                <i
                  className={`text-dark ${
                    innovationIsHovering ? hoverButtonColor : buttonsColor
                  } irene-menu-icon Circle-icon btn-rounded icons-file`}
                  style={{
                    transform:
                      innovationIsHovering && window.innerWidth >= 575
                        ? "translateY(24px)"
                        : "",
                  }}
                >
                  {" "}
                </i>
                <h1
                  className={`ml-3 d-inline d-sm-none w-100 h-100 lead font-weight-bolder text-nowrap text-monospace ${
                    innovationIsHovering ? "text-warning" : "text-white"
                  }`}
                  style={{
                    transition: "all ease-in-out .2s",
                  }}
                >
                  Innovations
                </h1>
              </li>
            </Link>
            <Link to="/edit">
              <li
                onMouseEnter={() => setIdeaIsHovering(true)}
                onMouseLeave={() => setIdeaIsHovering(false)}
                className="pb-0"
              >
                {" "}
                <i
                  className={`text-dark ${
                    ideaIsHovering ? hoverButtonColor : buttonsColor
                  } irene-menu-icon menu-icon btn-rounded icons-large-lightbulb`}
                  style={{
                    transform:
                      ideaIsHovering && window.innerWidth >= 575
                        ? "translateY(24px)"
                        : "",
                  }}
                >
                  {" "}
                </i>
                <h1
                  className={`ml-3 d-inline d-sm-none w-100 h-100 lead font-weight-bolder text-nowrap text-monospace ${
                    ideaIsHovering ? "text-warning" : "text-white"
                  }`}
                  style={{
                    transition: "all ease-in-out .2s",
                  }}
                >
                  J'ai une idée
                </h1>
              </li>
            </Link>
          </ul>
          {window.innerWidth >= 575 && (
            <div
              className={`text-dark lead ${
                homeIsHovering ||
                skillsIsHovering ||
                innovationIsHovering ||
                ideaIsHovering
                  ? hoverButtonColor
                  : buttonsColor
              } position-relative text-center ${
                homeIsHovering ||
                skillsIsHovering ||
                innovationIsHovering ||
                ideaIsHovering
                  ? "d-block"
                  : "d-none"
              }`}
              style={{
                zIndex: 1,
                width: "300px",
                left: -20,
                top: -6,
                pointerEvents: "none",
              }}
            >
              {homeIsHovering && "Accueil"}
              {skillsIsHovering && "Compétences"}
              {innovationIsHovering && "Innovations"}
              {ideaIsHovering && "J'ai une idée"}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
