import { useContext, useState } from "react";
import SharedContext from "../contexts/sharedContext";

export default function CategorieSelector({
  label,
  onChange,
  values,
  className,
  labelClassName,
  errorMessages,
  selected,
}) {
  const { categories } = useContext(SharedContext);
  const [activeCategories, setActiveCategories] = useState(values);
  const parents = categories.filter(
    (categorie) => !categorie.id_parent_categorie
  );
  const childs = categories.filter(
    (categorie) => categorie.id_parent_categorie
  );
  const haveActiveChild = (categorie) => {
    return (
      !categorie.id_parent_categorie &&
      categories.find(
        (cat) =>
          cat.id_parent_categorie === categorie.id && values.includes(cat.id)
      ) !== undefined
    );
  };
  return (
    <div
      className={`form-control-container container-fluid m-0 p-0 ${
        errorMessages && errorMessages.length ? "is-invalid" : ""
      }`}
    >
      <h1 className={`${labelClassName ? labelClassName : "lead"}`}>{label}</h1>
      <div
        className={`invalid-feedback ${className}`}
        id="categories_error"
        style={{ display: errorMessages && errorMessages.length ? "block" : "none" }}
      >
        {errorMessages ? errorMessages.map((err) => err.msg) : ""}
      </div>

      <ul className="list-group">
        {parents
          .filter((categorie) =>
            selected ? selected.includes(categorie.id) : true
          )
          .map((categorie, i) => (
            <li
              id={`cat_${categorie.id}`}
              className={`list-group-item management-item management-item-group ${
                activeCategories[categorie.id] ? "active" : ""
              }`}
              key={categorie.id}
            >
              <div
                className="management-item-content p-0 m-0"
                data-component="state"
                data-state="inactive"
                data-behaviour="toggle"
                data-target={`#cat${categorie.id}`}
              >
                <div className="management-item-checkbox">
                  <div className="custom-control custom-checkbox custom-checkbox-alone custom-checkbox custom-checkbox-alone-alone">
                    <button
                      type="button"
                      data-role="counter"
                      data-id={categorie.id}
                      onClick={(e) => {
                        if (!selected)
                          onChange({
                            target: {
                              dataset: { id: e.target.dataset.id },
                              checked: !values.includes(categorie.id),
                            },
                          });
                      }}
                      className={`custom-control-label ${
                        values.includes(categorie.id)
                          ? "active"
                          : `${
                              haveActiveChild(categorie) ? "indeterminate" : ""
                            }`
                      }`}
                    />
                  </div>
                </div>
                <div
                  className="management-item-caret"
                  onClick={() =>
                    setActiveCategories({
                      ...activeCategories,
                      [categorie.id]: !activeCategories[categorie.id],
                    })
                  }
                />
                <div className="management-item-symbol">
                  <i
                    className="icons-document icons-size-1x25"
                    aria-hidden="true"
                  />
                </div>
                <div className="management-item-main">
                  <h2 className="mb-0 text-base font-weight-normal">
                    <button
                      type="button"
                      className="btn-unstyled"
                      aria-expanded="false"
                      aria-controls={`sublist${i}`}
                      onClick={() =>
                        setActiveCategories({
                          ...activeCategories,
                          [categorie.id]: !activeCategories[categorie.id],
                        })
                      }
                    >
                      {categorie.name}
                    </button>
                  </h2>
                </div>
              </div>
              <ul id={`sublist${i + 1}`} className="management-item-grouplist">
                {childs
                  .filter(
                    (child) =>
                      (selected ? selected.includes(child.id) : true) &&
                      child.id_parent_categorie === categorie.id
                  )
                  .map((child) => (
                    <li className="management-item" key={child.id}>
                      <div className="management-item-content">
                        <div className="management-item-checkbox">
                          <div className="custom-control custom-checkbox custom-checkbox-alone custom-checkbox custom-checkbox-alone-alone">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id={`categorie${child.id}`}
                              name="categorie"
                              data-id={child.id}
                              onChange={(e) => {
                                if (!selected) onChange(e);
                              }}
                              aria-describedby="categories_error"
                              checked={values.includes(child.id)}
                            />
                            <label
                              className="custom-control-label"
                              htmlFor={`categorie${child.id}`}
                            >
                              <span className="sr-only">{child.name}</span>
                            </label>
                          </div>
                        </div>
                        <div className="management-item-symbol management-item-spacing">
                          <i
                            className="icons-document icons-size-1x25"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="management-item-main">
                          <h5 className="mb-0 font-weight-normal">
                            {child.name}
                          </h5>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
      </ul>
    </div>
  );
}
