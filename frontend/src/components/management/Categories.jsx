import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import Text from "@components/forms/Text";
import Select from "@components/forms/Select";
import Pagination from "@components/Pagination";
import { useLocation } from "react-router-dom";
import SharedContext from "../../contexts/sharedContext";

export default function Categories({
  setCategories,
  setSelected,
  setSelectedToDelete,
  selected,
  addOpenAddModal,
  addRemoveCallback,
  searchFilters,
  setSearchFilters,
}) {
  const [selectedCategorie, setSelectedCategorie] = useState({});
  const [lastChangedCategorie, setLastChangedCategorie] = useState();
  const [categorieModification, setCategorieModification] = useState({});
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [notification, setNotification] = useState();
  const location = useLocation();
  const { categories, customFetch, darkMode, setIsLoading } =
    useContext(SharedContext);
  const selectAll = () => {
    if (selected.length === categories.length) {
      setSelectedToDelete([]);
    } else {
      setSelectedToDelete(
        categories.map((categorie) => categorie.id_categorie)
      );
    }
  };
  const formattedCategories = [
    {
      id: -1,
      name: "Aucune",
      id_parent: null,
    },
    ...categories.map((categorie) => {
      return {
        ...categorie,
        id: categorie.id_categorie,
        id_parent:
          categorie.id_parent_categorie === null
            ? -1
            : categorie.id_parent_categorie,
      };
    }),
  ];
  const handleChange = (e) => {
    setCategorieModification({
      ...categorieModification,
      [e.target.id]: e.target.value,
    });
  };
  const handleClick = (e) => {
    const categorieId = parseInt(
      e.target.parentElement.dataset.value ||
        e.target.parentElement.parentElement.dataset.value,
      10
    );
    setNotification();
    setLastChangedCategorie();
    setCategorieModification({});
    setSelectedCategorie(
      categorieId !== -1
        ? categories.find((categorie) => categorie.id_categorie === categorieId)
        : null
    );
  };
  const handleApply = (e) => {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/categories${
        addMode ? "" : `/${selectedCategorie.id_categorie}`
      }`,
      addMode ? "POST" : "PUT",
      categorieModification
    )
      .then((response) => {
        setNotification({
          success: true,
          add: addMode,
          categorie: categorieModification,
        });
        const newElems = addMode ? [...categories] : [];
        let newCategorie = addMode
          ? { ...categorieModification, id_categorie: response.id }
          : {};
        if (!addMode) {
          for (let i = 0; i < categories.length; i += 1) {
            if (categories[i].id_categorie === selectedCategorie.id_categorie) {
              newElems[i] = { ...categories[i], ...categorieModification };
              newCategorie = newElems[i];
            } else {
              newElems[i] = categories[i];
            }
          }
        } else {
          newElems.push(newCategorie);
        }
        setCategories(
          newElems.map((cat) => {
            return {
              ...cat,
              id_parent_categorie:
                cat.id_parent_categorie === -1 ? null : cat.id_parent_categorie,
            };
          })
        );
        setLastChangedCategorie(newCategorie.id_categorie);
        setSelectedCategorie({});
        setCategorieModification({});
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setNotification({});
        setLastChangedCategorie();
        setSelectedCategorie({});
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (
      location.pathname ===
      `${import.meta.env.VITE_FRONTEND_URI}/manage/categories`
    ) {
      setIsLoading(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    let results = [...categories];
    if (
      searchFilters.has("search_terms") &&
      searchFilters.get("search_terms")
    ) {
      results = results.filter((element) =>
        element.name
          .toLowerCase()
          .includes(searchFilters.get("search_terms").toLowerCase())
      );
    }

    results = results.filter(
      (_, i) =>
        i >= (searchFilters.get("page") - 1) * searchFilters.get("limit") &&
        i < searchFilters.get("page") * searchFilters.get("limit")
    );

    setFilteredCategories(results);
    setIsLoading(false);
  }, [searchFilters, categories]);

  useEffect(() => {
    addOpenAddModal("categories", () => {
      setAddMode(true);
      $("#actionModal").modal("show");
      $("#actionModal").on("hidden.bs.modal", () => {
        setAddMode(false);
      });
    });
    addRemoveCallback("categories", (deletedIds) => {
      if (deletedIds.length) {
        setCategories([
          ...categories.filter(
            (categorie) => !deletedIds.includes(categorie.id_categorie)
          ),
        ]);
        setNotification({
          success: true,
          delete: true,
          deleted: deletedIds.length,
        });
      } else {
        setNotification({});
      }
    });
  }, []);
  return (
    <section>
      <p
        className={`text-${
          darkMode === 0 && notification && notification.success
            ? "warning"
            : ""
        }${
          darkMode !== 0 && notification && notification.success
            ? "primary"
            : ""
        }${
          notification && !notification.success ? "danger" : ""
        } pl-4 pt-2 pb-2 font-weight-medium`}
        style={{ minHeight: "20px" }}
      >
        {notification ? (
          <>
            {notification.success ? (
              <>
                <i className="icons-checked mr-2" aria-hidden="true" />
                {notification.delete ? (
                  `Suppression de ${notification.deleted} catégorie${
                    notification.deleted > 1 ? "s" : ""
                  } `
                ) : (
                  <>
                    {notification.add ? "Création" : "Modification"} de la
                    catégorie <b>{notification.categorie.name} </b>
                  </>
                )}
                effectuée
              </>
            ) : (
              "La modification n'a pas pu être appliquée ! Veuillez réessayer ultérieurement."
            )}{" "}
          </>
        ) : (
          ""
        )}
      </p>
      <Pagination
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        total={
          searchFilters.has("search_terms") && searchFilters.get("search_terms")
            ? filteredCategories.length
            : categories.length
        }
      />
      <ul className="list-group">
        <li id="group1" className="list-group-item management-item">
          <div className="management-item-content py-0">
            <div className="management-item-symbol ml-5 d-flex align-items-center">
              <div className="custom-control custom-checkbox align-middle">
                <label
                  className="custom-control-label d-none"
                  htmlFor="selectall"
                  aria-hidden="true"
                >
                  checkbox
                </label>
                <input
                  type="checkbox"
                  className="custom-control-input"
                  aria-label="Sélectionner/desélectionner tout pour suppression"
                  id="selectall"
                  onClick={selectAll}
                />
              </div>
            </div>
            <div className="management-item-main text-left">
              <h2 className="m-0 p-0 text-left">Nom</h2>
            </div>
            <div className="management-item-main">
              <h2 className="m-0 p-0 text-left">Parent</h2>
            </div>
            <div className="management-item-symbol text-left col-1">
              <button
                className="btn btn-link"
                tabIndex="0"
                type="button"
                data-toggle="popover"
                data-trigger="focus"
                title="Utilisateurs"
                data-content="Nombre d'utilisateurs ayant souscris cette catégorie pour la newsletter."
              >
                <span className="sr-only">Cliquez pour plus d'information</span>
                <i className="icons-circle-account-connected" />
              </button>
            </div>
            <div className="management-item-symbol text-left col-1">
              <button
                className="btn btn-link"
                tabIndex="0"
                type="button"
                data-toggle="popover"
                data-trigger="focus"
                title="Innovations"
                data-content="Nombre d'innovations associées à cette catégorie."
              >
                <span className="sr-only">Cliquez pour plus d'information</span>
                <i className="icons-document" />
              </button>
            </div>
          </div>
        </li>
        {filteredCategories &&
          filteredCategories.map((categorie) => (
            <li
              id="group1"
              className={`list-group-item management-item ${
                lastChangedCategorie === categorie.id_categorie
                  ? "last-changed"
                  : ""
              }`}
              key={categorie.id_categorie}
            >
              <div
                className="management-item-content"
                data-value={categorie.id_categorie}
              >
                <div className="management-item-symbol ml-5 d-flex align-items-center">
                  <div className="custom-control custom-checkbox align-middle">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      value={categorie.id_categorie}
                      aria-label="Sélectionner pour suppression"
                      id={`delete_${categorie.id_categorie}`}
                      checked={selected.includes(categorie.id_categorie)}
                      onChange={setSelected}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor={`delete_${categorie.id_categorie}`}
                    >
                      <i
                        className="icons-file icons-size-1x ml-n3 d-block"
                        aria-hidden="true"
                      />
                    </label>
                  </div>
                </div>
                <div
                  className="management-item-main text-left col-"
                  data-toggle="modal"
                  data-target="#actionModal"
                  aria-hidden="true"
                  onClick={handleClick}
                >
                  {categorie.name}
                </div>
                <div
                  className="management-item-main  col-"
                  data-value={
                    categories.find(
                      (cat) =>
                        cat.id_categorie === categorie.id_parent_categorie
                    )
                      ? categories.find(
                          (cat) =>
                            cat.id_categorie === categorie.id_parent_categorie
                        ).id_categorie
                      : categorie.id_categorie
                  }
                >
                  <h2
                    className="mb-0 text-left font-weight-normal"
                    data-toggle="modal"
                    aria-hidden="true"
                    data-target="#actionModal"
                    onClick={handleClick}
                  >
                    {categorie.id_parent_categorie &&
                    categorie.id_parent_categorie !== -1
                      ? categories.find(
                          (cat) =>
                            cat.id_categorie === categorie.id_parent_categorie
                        ).name
                      : ""}
                  </h2>
                </div>
                <div className="management-item-symbol text-left col-1">
                  {categorie.users.toLocaleString("en").replace(/,/g, " ")}
                </div>
                <div className="management-item-symbol text-left col-1">
                  {categorie.ideas.toLocaleString("en").replace(/,/g, " ")}
                </div>
              </div>
            </li>
          ))}
      </ul>
      <div
        className="modal fade"
        id="actionModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="actionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="h1 modal-title" id="actionModalLabel">
                {addMode
                  ? "Nouvelle catégorie"
                  : `Modification de
                ${selectedCategorie ? `${selectedCategorie.name}` : ""}`}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Annuler"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form onSubmit={handleApply}>
              <div className="modal-body mt-3">
                <Text
                  label="Nom"
                  required
                  placeholder="Entrez le nom de l'équipe ici"
                  maxChars="255"
                  errorMessages={[]}
                  id="name"
                  value={
                    addMode
                      ? categorieModification.name || ""
                      : (categorieModification && categorieModification.name) ||
                        (selectedCategorie && selectedCategorie.name) ||
                        ""
                  }
                  onChange={handleChange}
                />
                <Select
                  id="id_parent_categorie"
                  label="Catégorie parente"
                  ariaLabel="Catégorie parente"
                  selectedValue={
                    addMode
                      ? categorieModification.id_parent_categorie || -1
                      : (categorieModification &&
                          categorieModification.id_parent_categorie) ||
                        (selectedCategorie &&
                          selectedCategorie.id_parent_categorie) ||
                        -1
                  }
                  values={formattedCategories}
                  setSelectedValue={handleChange}
                />
              </div>
              <div className="modal-footer justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategorie();
                    setNotification();
                  }}
                  data-dismiss="modal"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  onClick={handleApply}
                  className={`btn btn-${
                    darkMode === 0 ? "warning" : "primary"
                  }`}
                  data-dismiss="modal"
                >
                  {addMode ? "Créer" : "Appliquer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Pagination
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        total={
          searchFilters.has("search_terms") && searchFilters.get("search_terms")
            ? filteredCategories.length
            : categories.length
        }
      />
    </section>
  );
}

Categories.propTypes = {
  selected: PropTypes.arrayOf(PropTypes.number),
  setSelected: PropTypes.func,
  setCategories: PropTypes.func,
  setSelectedToDelete: PropTypes.func,
  addOpenAddModal: PropTypes.func,
  addRemoveCallback: PropTypes.func,
  searchFilters: PropTypes.instanceOf(URLSearchParams).isRequired,
  setSearchFilters: PropTypes.func,
};
Categories.defaultProps = {
  selected: [],
  setSelected: null,
  setCategories: null,
  setSelectedToDelete: null,
  addOpenAddModal: null,
  addRemoveCallback: null,
  setSearchFilters: null,
};
