import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo_irene.png";
import background from "../assets/background_authent.heif";
import "../App.css";
import Text from "../components/forms/Text";
import Modal from "../components/Modal";
import SharedContext from "../contexts/sharedContext";

const initialValues = {
  registration_number: "",
  password: "",
};

export default function Authentification({ setToken }) {
  const { setIsLoading, baseURL } = useContext(SharedContext);
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
    fetch(`${baseURL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputValue),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.token) {
          localStorage.setItem("IRENE_AUTH", response.token);
          setToken(response.token);
        } else {
          setError("Saisie incorrecte.");
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError("Saisie incorrecte.");
        setIsLoading(false);
      });
  };

  return (
    <main
      className="w-100 h-100 container-fluid d-flex justify-content-center align-items-center p-0 m-0 "
      style={{
        background: `center / cover url(${background})`,
      }}
    >
      <div
        className="p-0 d-flex-fluid flex-column h-auto rounded justify-content-center align-item-center text-center"
        style={{
          maxWidth: "300px",
          backgroundColor: "rgba(242, 242, 242, 0.5)",
        }}
      >
        <img className="w-25 m-4" src={logo} alt="Logo" />
        <h1 className="title">IRENE</h1>
        <h4 className="slogan">Développons vos idées</h4>
        <form onSubmit={handleSubmit} className="mb-0">
          <div className="mt-3 w-50 mx-auto mb-0">
            <Text
              label="Identifiant"
              id="registration_number"
              onChange={handleChange}
              value={inputValue.registration_number}
            />
          </div>
          <div className="mt-0 mb-0 w-50 mx-auto mb-0">
            <Text
              label="Mot de passe"
              id="password"
              onChange={handleChange}
              value={inputValue.password}
              type="password"
            />
          </div>
          {error && <span className="text-danger">{error}</span>}

          <input
            type="submit"
            value="Se connecter"
            className="btn-connect btn btn-warning m-3"
          />
          <Modal />
          <div className="lead mt-2 mb-4">
            <Link className="text-dark" to="/about">
              A propos
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
