import PropTypes from "prop-types";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import SharedContext from "../contexts/sharedContext";
import Input from "../components/forms/Input";
import Modal from "../components/Modal";
import "../App.css";
import logo from "../assets/logo_irene.heif";
import LogoSncf from "../assets/pour_nous_tous.heif";
import background from "../assets/background_authent.heif";

const initialValues = {
  registration_number: "",
  password: "",
};

export default function Authentification({ setRefreshToken, setIsLogged }) {
  const { setIsLoading, customFetch } = useContext(SharedContext);
  const [inputValue, setInputValue] = useState(initialValues);
  const [error, setError] = useState();

  const handleChange = (e) => {
    const { value, id } = e.target;
    setInputValue({ ...inputValue, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setInputValue(initialValues);
    setIsLoading(true);
    customFetch(`${import.meta.env.VITE_BACKEND_URL}/login`, "POST", inputValue)
      .then((responseData) => {
        setRefreshToken(responseData.irene_refresh);
        localStorage.setItem("IRENE_TOKEN", responseData.irene_refresh);
        setIsLogged(true);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Saisie incorrecte.");
        setIsLoading(false);
        setIsLogged(false);
      });
  };

  return (
    <>
      <main
        className="p-0 m-0 container-fluid d-flex justify-content-center align-items-center h-100 w-100"
        style={{
          background: `center / cover url(${background})`,
        }}
      />
      <div
        className="modal show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="auth"
      >
        <div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable rounded "
          role="document"
        >
          <div
            className="modal-content px-2 border overflow-auto"
            style={{
              maxWidth: "300px",
              backgroundColor: "rgba(242, 242, 242, .5)",
            }}
          >
            <div className="modal-header flex-column align-item-center justify-content-center">
              <h1 className="modal-title text-center w-100" id="auth">
                IRENE
              </h1>
              <h3 className="py-1 text-center w-100">Développons vos idées</h3>
              <img
                className="logo img-fluid w-75 mx-auto"
                src={logo}
                alt="Logo"
              />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body d-flex flex-column justify-content-center align-items-center w-100 px-5">
                <div className="mx-auto">
                  <Input
                    label="Identifiant"
                    id="registration_number"
                    className="border border-warning"
                    onChange={handleChange}
                    value={inputValue.registration_number}
                  />
                </div>
                <div className="mx-auto">
                  <Input
                    label="Mot de passe"
                    id="password"
                    className="border border-warning"
                    onChange={handleChange}
                    value={inputValue.password}
                    type="password"
                  />
                </div>
                {error && (
                  <span className="text-danger d-flex justify-content-center">
                    {error}
                  </span>
                )}
              </div>
              <div className="modal-footer text-center flex-column align-item-center justify-content-center">
                <input
                  type="submit"
                  value="Se connecter"
                  className="btn-connect btn btn-warning mb-3 row mx-auto"
                />
                <Modal />
                <div className="about text-center mx-auto mt-2">
                  <Link
                    className="text-dark"
                    to={`${import.meta.env.VITE_FRONTEND_URI}/about`}
                  >
                    A propos
                  </Link>
                </div>
                <img
                  src={LogoSncf}
                  style={{
                    width: "auto",
                  }}
                  className="d-sm-none d-block mt-2"
                  alt="logoSncf"
                />
              </div>
            </form>
          </div>
          <img
            src={LogoSncf}
            style={{
              width: "auto",
              right: "30px",
              bottom: "10px",
            }}
            className="d-none d-sm-block position-fixed"
            alt="logoSncf"
          />
        </div>
      </div>
    </>
  );
}

Authentification.propTypes = {
  setRefreshToken: PropTypes.func.isRequired,
  setIsLogged: PropTypes.func.isRequired,
};
