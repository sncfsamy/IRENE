import { useContext, useState } from "react";
import SharedContext from "../contexts/sharedContext";

const status = [
  "En cours de rédaction",
  "Attente de validation manager",
  "Attente de validation ambassadeur",
  "Cloturée avec succès",
  "Refusée ou en attente d'approfondissement",
];
export default function StatusFilter({ values, onChange, label }) {
  const { darkMode } = useContext(SharedContext);
  const [activeStatus, setActiveCategories] = useState(false);
  let statusAll = "";
  if (status.length === values.length) statusAll = "active";
  else if (values.length > 0) statusAll = "indeterminate";
  return (
    <>
      <label htmlFor="categories">{label}</label>
      <div
        className={`select-improved ${activeStatus && "active"}`}
        data-component="select-multiple"
      >
        <div className="select-control">
          <div className="input-group" data-role="select-toggle">
            <div className="form-control">
              <div className="custom-control custom-checkbox">
                <label
                  data-role="placeholder"
                  className={`custom-control-label font-weight-medium ${statusAll}`}
                  htmlFor="status"
                >
                  {values.length
                    ? `${values.length} status sélectionné${
                        values.length === status.length ? "s" : ""
                      }`
                    : "Aucun status sélectionné"}
                </label>
              </div>
            </div>
            <select
              className="sr-only"
              id="status"
              data-role="input"
              tabIndex="-1"
              data-id="-1"
              aria-hidden="true"
              value={values}
              onClick={onChange}
              onChange={() => {}}
              multiple
            >
              {status.map((value, i) => (
                <option data-id={i} value={i} key={value}>
                  {value}
                </option>
              ))}
            </select>
            <div
              className={`input-group-append input-group-last ${
                activeStatus && "active"
              }`}
            >
              <button
                className={`btn btn-${
                  darkMode === 0 ? "warning" : "primary"
                } btn-only-icon ${activeStatus && "active"}`}
                data-role="btn"
                type="button"
                aria-expanded={activeStatus}
                aria-controls="status_selector"
                onClick={() => setActiveCategories(!activeStatus)}
              >
                <i
                  className="icons-arrow-down icons-size-x75"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
          <div
            id="status_selector"
            className="select-menu"
            data-role="menu"
            role="list"
          >
            <div
              className="select-group"
              data-role="group"
              data-id="0"
              role="list"
            />
            {status.map((value, i) => (
              <div className="select-menu-item" key={value} role="listitem">
                <div className="custom-control custom-checkbox w-100">
                  <button
                    type="button"
                    data-role="value"
                    data-target={i}
                    data-id={i}
                    onClick={onChange}
                    aria-checked={values.includes(i)}
                    className={`custom-control-label w-100 text-left font-weight-medium text-left ${
                      values.includes(i) ? "active" : ""
                    }`}
                  >
                    {value}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
