import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CategorieSelector from "@components/CategorieSelector";
import Text from "../components/forms/Text";
import sharedContext from "../contexts/sharedContext";
import Textarea from "../components/forms/Textarea";

function InnovationEdit() {
  const [errorField, setErrorField] = useState();
  const [idea, setIdea] = useState({
    name: "",
    description: "",
    problem: "",
    solution: "",
    gains: "",
    status: 0,
    categories: [],
  });
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [gains, setGains] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]); // utilisateurs en retour du back après recherche
  const [selectedUsers, setSelectedUsers] = useState([]); // utilisateurs sélectionnés pour le filtrage
  const [searchUserValue, setSearchUserValue] = useState(""); // valeur pour recherche utilisateur
  let finished = false;

  let { id } = useParams();

  const { token, baseURL, darkMode, setIsLoading, categories } =
    useContext(sharedContext);

  const navigate = useNavigate();

  const handleUserSelect = (e) => {
    const uid = parseInt(e.target.dataset.value, 10);
    const userToAdd = userSearchResults.find((u) => u.id === uid);
    if (userToAdd && !selectedUsers.find((u) => u.id === userToAdd.id)) {
      const newUserSearch = [...userSearchResults];
      const newUsersForSearch = [...selectedUsers, userToAdd];
      newUserSearch.splice(newUserSearch.find(({ id }) => id === uid));
      setSelectedUsers(newUsersForSearch);
      setUserSearchResults(newUserSearch);
      setSearchUserValue("");
      setIdea({
        ...idea,
        coauthors: newUsersForSearch.map(({ id }) => id).join(","),
      });
    }
  };
  const handleUserDeselect = (e) => {
    const uid = parseInt(e.target.dataset.value, 10);
    const newSelectedUsers = selectedUsers.filter((u) => u.id !== uid);
    setSelectedUsers(newSelectedUsers);
    setIdea({
      ...idea,
      coauthors: newUsersForSearch.map(({ id }) => id).join(","),
    });
  };
  const handleUserSearch = (e) => {
    setSearchUserValue(e.target.value);
    if (window.searchUserTimeout) {
      clearTimeout(window.searchUserTimeout);
      window.searchUserTimeout = null;
    }
    if (e.target.value.length > 2) {
      window.searchUserTimeout = setTimeout(() => {
        fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/users/search?${new URLSearchParams({
            search_terms: e.target.value,
          })}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => response.json())
          .then((responseData) =>
            setUserSearchResults(
              responseData.filter(
                (u) => !selectedUsers.find((us) => us.id === u.id)
              )
            )
          );
      }, 600);
    } else {
      setUserSearchResults();
    }
  };

  const handleCheck = (event) => {
    let updatedList = [...idea.categories];
    const value = parseInt(event.target.dataset.id, 10);
    if (event.target.checked) {
      !updatedList.includes(value) && updatedList.push(value);
      if (
        !categories.find((categorie) => categorie.id === value)
          .id_parent_categorie
      ) {
        updatedList = [
          ...updatedList,
          ...categories
            .filter((catToFilter) => {
              if (
                !updatedList.includes(catToFilter.id) &&
                catToFilter.id_parent_categorie === value
              ) {
                return true;
              }
              return false;
            })
            .map((cat) => cat.id),
        ];
      }
    } else {
      idea.categories.includes(value) &&
        updatedList.splice(idea.categories.indexOf(value), 1);
      if (
        !categories.find((categorie) => categorie.id === value)
          .id_parent_categorie
      ) {
        categories.forEach((catToFilter) => {
          if (
            updatedList.includes(catToFilter.id) &&
            categories.find((categorie) => categorie.id === catToFilter.id)
              .id_parent_categorie === value
          ) {
            updatedList.splice(updatedList.indexOf(catToFilter.id), 1);
          }
        });
      }
    }
    setIdea({ ...idea, categories: updatedList });
  };
  const handleSubmit = (e) => {
    setIsLoading(true);
    if (e) e.preventDefault();
    setErrorField([]);
    const newIdea = { ...idea, problem, solution, gains };
    setIdea(newIdea);
    if (id) {
      fetch(`${baseURL}/ideas/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newIdea,
          finished_at: finished,
          status: finished ? 1 : 0,
        }),
      })
        .then((response) => !response.ok && response.json())
        .then((response) => {
          if (response.errors) {
            setErrorField(response.errors);
          }
          setIsLoading(false);
          if (finished) navigate(`/innovation/${id}`);
        })
        .catch(() => setIsLoading(false));
    } else {
      fetch(`${baseURL}/ideas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newIdea,
          finished_at: finished,
          status: finished ? 1 : 0,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
            setErrorField(response.errors);
            setIsLoading(false);
          } else {
            id = response.id;
            navigate(`/${finished ? "innovation" : "edit"}/${id}`);
            setIsLoading(false);
          }
        })
        .catch(() => {
          setIdea({ ...idea, status: 0 });
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetch(`${baseURL}/ideas/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((dataIdea) => {
          finished = dataIdea.idea.status > 0;
          setIdea(dataIdea.idea);
          setSelectedUsers(dataIdea.coauthors.map(c => dataIdea.users.find(u => u.id === c.coauthor_id)));
          setProblem(dataIdea.idea.problem);
          setSolution(dataIdea.idea.solution);
          setGains(dataIdea.idea.gains);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
        });
    }
  }, []);

  const handleChange = (e) => {
    const nouvelIdee = { ...idea, [e.target.id]: e.target.value };
    setIdea(nouvelIdee);
  };

  const finishing = () => {
    finished = true;
    handleSubmit();
    setIdea({ ...idea, status: 1 });
  };

  return (
    <main className="container mx-auto mt-3 p-0">
      <h1 className="display-1">Edition de votre innovation</h1>
      <form
        className="d-flex flex-column justify-content-center w-100 p-0 px-3 m-0"
        onSubmit={handleSubmit}
      >
        <div className="row-fluid">
          <label className="lead" htmlFor="user_id">
            Co-auteurs
          </label>
        </div>
        <div className="row-fluid h-10">
          <div
            className="form-control-container form-chips-container h-10 mb-4"
            data-component="chips"
          >
            {selectedUsers && selectedUsers.length ? (
              selectedUsers.map((u) => (
                <div className="chips-group" key={u.id}>
                  <span
                    className={`chips chips-label px-3 bg-${
                      darkMode === 0 ? "warning" : "primary"
                    }`}
                  >
                    {u.firstname} {u.lastname}
                  </span>
                  <button
                    type="button"
                    className={`chips chips-btn chips-only-icon bg-${
                      darkMode === 0 ? "warning" : "primary"
                    }`}
                    data-value={u.id}
                    onClick={handleUserDeselect}
                  >
                    <span
                      className={`sr-only bg-${
                        darkMode === 0 ? "warning" : "primary"
                      }`}
                    >
                      Supprimer {u.firstname} {u.lastname}
                    </span>
                    <i
                      className={`icons-close bg-${
                        darkMode === 0 ? "warning" : "primary"
                      }`}
                      aria-hidden="true"
                      data-value={u.id}
                      onClick={handleUserDeselect}
                    />
                  </button>
                </div>
              ))
            ) : (
              <button
                type="button"
                className="page-link"
                onClick={() => document.getElementById("user_id").focus()}
              >
                Aucun coauteur
              </button>
            )}
            <label
              className="font-weight-medium mb-2 sr-only"
              htmlFor="receivers2"
            >
              Auteur, co-auteur
            </label>
            <select
              id="receivers2"
              className="sr-only"
              data-role="input"
              tabIndex="-1"
              aria-hidden="true"
              multiple
            />
          </div>
        </div>
        <div className="row-fluid">
          <div className="flex-fluid overflow-y" role="list" data-role="menu">
            {userSearchResults &&
              userSearchResults.map((u) => (
                <span className="select-menu-item" role="listitem" key={u.id}>
                  <div className="chips-group" key={u.id}>
                    <span
                      className={`chips chips-label px-3 bg-${
                        darkMode === 0 ? "warning" : "primary"
                      }`}
                    >
                      {u.firstname} {u.lastname} &nbsp;
                    </span>
                    <button
                      type="button"
                      className={`chips chips-btn chips-only-icon bg-${
                        darkMode === 0 ? "warning" : "primary"
                      }`}
                      data-value={u.id}
                      onClick={handleUserSelect}
                    >
                      <span className="sr-only">
                        Ajouter {u.firstname} {u.lastname}
                      </span>
                      <i
                        className="icons-add"
                        aria-hidden="true"
                        data-value={u.id}
                        onClick={handleUserSelect}
                      />
                    </button>
                  </div>
                </span>
              ))}
          </div>
          <div className="d-flex pt-4 flex-row" data-role="add">
            <div className="form-control-container w-100">
              <label htmlFor="user_id" className="sr-only">
                Saisir le nom d’un agent à rechercher
              </label>
              <input
                id="user_id"
                type="text"
                className="form-control form-control"
                data-role="add-input"
                placeholder="Rechercher un agent"
                value={searchUserValue}
                onChange={handleUserSearch}
                autoComplete="off"
              />
              <span className="form-control-state" />
            </div>
          </div>
        </div>
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded pt-3 px-3 my-2`}
        >
          <Text
            label="Nom de l'innovation"
            id="name"
            placeholder="Taper le nom de votre innovation ici"
            value={idea.name}
            onChange={handleChange}
            readonly={finished || idea.status > 0}
            required
            errorMessages={
              errorField
                ? errorField.filter((error) => error.param === "name")
                : []
            }
          />
        </div>
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded pt-3 px-3 my-2`}
        >
          <Text
            label="Courte description"
            id="description"
            placeholder="Taper votre description ici"
            value={idea.description}
            onChange={handleChange}
            required
            readonly={finished || idea.status > 0}
            errorMessages={
              errorField
                ? errorField.filter((error) => error.param === "description")
                : []
            }
          />
        </div>
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded pt-3 px-3 my-2`}
        >
          <Textarea
            label="Description de la problèmatique"
            id="problem"
            placeholder="Taper la description de votre problème"
            value={problem}
            onChange={(v) => setProblem(v)}
            readonly={finished || idea.status > 0}
            useAdvancedEditor
            extraData={{ idea_id: id, field: 1 }}
            errorMessages={
              errorField
                ? errorField.filter((error) => error.param === "problem")
                : []
            }
          />
        </div>
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded pt-3 px-3 my-2`}
        >
          <Textarea
            label="Solution proposée"
            id="solution"
            placeholder="Expliquez ici votre solution"
            value={solution}
            onChange={(v) => setSolution(v)}
            readonly={finished || idea.status > 0}
            useAdvancedEditor
            extraData={{ idea_id: id, field: 2 }}
            errorMessages={
              errorField
                ? errorField.filter((error) => error.param === "solution")
                : []
            }
          />
        </div>
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded pt-3 px-3 my-2`}
        >
          <Textarea
            label="Gains attendus/constatés"
            id="gains"
            placeholder="Expliquez maintenant les gains potentiels ou constatés de votre solution"
            value={gains}
            onChange={(v) => setGains(v)}
            className="bg-light"
            readonly={finished || idea.status > 0}
            useAdvancedEditor
            extraData={{ idea_id: id, field: 3 }}
            errorMessages={
              errorField
                ? errorField.filter((error) => error.param === "gains")
                : []
            }
          />
        </div>
        <CategorieSelector
          onChange={handleCheck}
          values={idea.categories}
          label="Catégories associées:"
          className={`${
            darkMode < 2 ? "bg-light" : "bg-gray-dark"
          } rounded p-3 my-2`}
          errorMessages={
            errorField
              ? errorField.filter((error) => error.param === "categories")
              : []
          }
        />
        <div className="d-flex w-100 flex-column flex-sm-row justify-content-center justify-content-sm-end float-sm-right m-0 py-5 bd-highlight width1">
          <button
            type="submit"
            className={`btn btn-${darkMode === 0 ? "warning" : "primary"} m-3`}
            disabled={finished || idea.status > 0}
          >
            Enregistrer et finaliser plus tard
          </button>
          <button
            type="button"
            onClick={finishing}
            id="finished"
            className={`btn btn-${darkMode === 0 ? "warning" : "primary"} m-3`}
            disabled={finished || idea.status > 0}
          >
            Enregistrer et finaliser
          </button>
        </div>
      </form>
    </main>
  );
}

export default InnovationEdit;
