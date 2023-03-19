import { useContext, useState } from "react";
import SharedContext from "../contexts/sharedContext";

export default function CategorieFilter({ values, onChange, label }) {
  const { categories, darkMode } = useContext(SharedContext);
  const [activeCategories, setActiveCategories] = useState(false);
  const parents = categories.filter(
    (categorie) => !categorie.id_parent_categorie
  );
  const childs = categories.filter(
    (categorie) => categorie.id_parent_categorie
  );
  let statusAll = "";
  if (categories && categories.length === values.length) statusAll = "active";
  else if (values.length > 0) statusAll = "indeterminate";
  return (
    <>
      <label htmlFor="categories">{label}</label>
      <div
        className={`select-improved ${activeCategories && "active"}`}
        data-component="select-multiple"
      >
        <div className="select-control">
          <div className="input-group" data-role="select-toggle">
            <div className="form-control">
              <div className="custom-control custom-checkbox">
                <label
                  data-role="placeholder"
                  className={`custom-control-label font-weight-medium ${statusAll}`}
                  htmlFor="categories"
                >
                  {values.length
                    ? `${values.length} catégorie${
                        values.length > 1 ? "s" : ""
                      } sélectionnée${values.length > 1 ? "s" : ""}`
                    : "Aucune catégorie sélectionnée"}
                </label>
              </div>
            </div>
            <select
              className="sr-only"
              id="categories"
              data-role="input"
              tabIndex="-1"
              data-id="-1"
              aria-hidden="true"
              value={values}
              onClick={onChange}
              onChange={() => {}}
              multiple
            >
              {categories.map((categorie) => (
                <option
                  data-id={categorie.id}
                  value={categorie.id}
                  key={categorie.id}
                >
                  {categorie.name}
                </option>
              ))}
            </select>
            <div
              className={`input-group-append input-group-last ${
                activeCategories && "active"
              }`}
            >
              <button
                className={`btn btn-${
                  darkMode === 0 ? "warning" : "primary"
                } btn-only-icon ${activeCategories && "active"}`}
                data-role="btn"
                type="button"
                aria-expanded={activeCategories}
                aria-controls="categories_selector"
                onClick={() => setActiveCategories(!activeCategories)}
              >
                <i
                  className="icons-arrow-down icons-size-x75"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
          <div
            id="categories_selector"
            className="select-menu"
            data-role="menu"
            role="list"
          >
            {parents.map((categorie) => (
              <div
                className="select-group"
                data-role="group"
                data-id={categorie.id}
                key={categorie.id}
                role="listitem"
              >
                <div className="select-group-head">
                  <div className="custom-control custom-checkbox w-100">
                    <button
                      type="button"
                      data-role="counter"
                      data-id={categorie.id}
                      onClick={onChange}
                      className={`custom-control-label font-weight-medium w-100 text-left text-uppercase ${
                        (categories.filter(
                          (cat) => cat.id_parent_categorie === categorie.id
                        ).length ===
                          categories.filter(
                            (cat) =>
                              cat.id_parent_categorie === categorie.id &&
                              values.includes(cat.id)
                          ).length &&
                          "active") ||
                        (categories.find(
                          (catToFind) =>
                            catToFind.id_parent_categorie === categorie.id &&
                            values.includes(catToFind.id)
                        ) &&
                          "indeterminate")
                      }`}
                    >
                      {categorie.name}
                    </button>
                  </div>
                </div>
                <div className="select-group-content" role="list">
                  {childs
                    .filter(
                      (child) => child.id_parent_categorie === categorie.id
                    )
                    .map((child) => (
                      <div
                        className="select-menu-item"
                        role="listitem"
                        key={child.id}
                      >
                        <div className="custom-control custom-checkbox">
                          <button
                            type="button"
                            data-role="value"
                            data-id={child.id}
                            onClick={onChange}
                            data-target={child.id}
                            role="checkbox"
                            aria-checked="false"
                            className={`custom-control-label w-100 text-left font-weight-medium ${
                              values.includes(child.id) && "active"
                            }`}
                          >
                            {child.name}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
