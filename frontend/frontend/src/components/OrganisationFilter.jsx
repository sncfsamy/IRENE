import { useContext, useState } from "react";
import SharedContext from "../contexts/sharedContext";

export default function OrganisationFilter({ values, onChange, label }) {
  const { organisations, darkMode } = useContext(SharedContext);
  const [activeOrganisations, setActiveCategories] = useState(false);
  let statusAll = "";
  if (organisations.length === values.length) statusAll = "active";
  else if (values.length > 0) statusAll = "indeterminate";
  return (
    <>
      <label htmlFor="categories">{label}</label>
      <div
        className={`select-improved ${activeOrganisations && "active"}`}
        data-component="select-multiple"
      >
        <div className="select-control">
          <div className="input-group" data-role="select-toggle">
            <div className="form-control">
              <div className="custom-control custom-checkbox">
                <label
                  data-role="placeholder"
                  className={`custom-control-label font-weight-medium ${statusAll}`}
                  htmlFor="organisations"
                >
                  {values.length
                    ? `${values.length} organisation${
                        values.length === organisations.length ? "s" : ""
                      } sélectionnée${
                        values.length === organisations.length ? "s" : ""
                      }`
                    : "Aucune organisation sélectionnée"}
                </label>
              </div>
            </div>
            <select
              className="sr-only"
              id="organisations"
              data-role="input"
              tabIndex="-1"
              data-id="-1"
              aria-hidden="true"
              value={values}
              onClick={onChange}
              onChange={() => {}}
              multiple
            >
              {organisations.map((organisation) => (
                <option
                  data-id={organisation.id}
                  value={organisation.id}
                  key={organisation.id}
                >
                  {organisation.name}
                </option>
              ))}
            </select>
            <div
              className={`input-group-append input-group-last ${
                activeOrganisations && "active"
              }`}
            >
              <button
                className={`btn btn-${
                  darkMode === 0 ? "warning" : "primary"
                } btn-only-icon ${activeOrganisations && "active"}`}
                data-role="btn"
                type="button"
                aria-expanded={activeOrganisations}
                aria-controls="organisations_selector"
                onClick={() => setActiveCategories(!activeOrganisations)}
              >
                <i
                  className="icons-arrow-down icons-size-x75"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
          <div
            id="organisations_selector"
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
            {organisations.map((organisation) => (
              <div
                className="select-menu-item"
                key={organisation.id}
                role="listitem"
              >
                <div className="custom-control custom-checkbox w-100">
                  <button
                    type="button"
                    data-role="value"
                    data-target={organisation.id}
                    data-id={organisation.id}
                    onClick={onChange}
                    aria-checked={values.includes(organisation.id)}
                    className={`custom-control-label w-100 text-left font-weight-medium text-left ${
                      values.includes(organisation.id) ? "active" : ""
                    }`}
                  >
                    {organisation.name}
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
