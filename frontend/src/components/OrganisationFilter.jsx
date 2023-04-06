import { useContext, useEffect, useRef, useState } from "react";
import { PropTypes } from "prop-types";
import SharedContext from "../contexts/sharedContext";

export default function OrganisationFilter({ values, onChange, label }) {
  const { organisations, darkMode } = useContext(SharedContext);
  const [activeOrganisations, setActiveCategories] = useState(false);
  const elemRef = useRef();
  let statusAll = "";
  if (organisations.length === values.length) {
    statusAll = "active";
  } else if (values.length > 0) {
    statusAll = "indeterminate";
  }
  const click = (e) => {
    if (elemRef.current && activeOrganisations) {
      const contain =
        e.target === elemRef.current || elemRef.current.contains(e.target);
      if (!contain) {
        setActiveCategories(false);
      }
    }
  };
  useEffect(() => {
    if (elemRef.current && activeOrganisations) {
      window.addEventListener("click", click);
    } else {
      window.removeEventListener("click", click);
    }
  }, [activeOrganisations]);

  useEffect(() => {
    return () => {
      if (activeOrganisations) {
        window.removeEventListener("click", click);
      }
    };
  }, []);
  return (
    <>
      <label htmlFor="organisations">{label}</label>
      <div
        className={`select-improved ${activeOrganisations && "active"}`}
        data-component="select-multiple"
        ref={elemRef}
      >
        <div className="select-control">
          <div
            className="input-group"
            data-role="select-toggle"
            data-target="test"
            aria-hidden="true"
            onClick={() => setActiveCategories(!activeOrganisations)}
          >
            <div className="form-control">
              <div className="custom-control custom-checkbox">
                <label
                  data-role="placeholder"
                  className={`custom-control-label font-weight-medium ${statusAll}`}
                  htmlFor="organisations"
                >
                  {values.length
                    ? `${
                        values.length > 1
                          ? `${values.length} organisations sélectionnées`
                          : organisations.find((organisation) =>
                              values.includes(organisation.id_organisation)
                            ).name
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
                  data-id={organisation.id_organisation}
                  value={organisation.id_organisation}
                  key={organisation.id_organisation}
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
                key={organisation.id_organisation}
                role="listitem"
              >
                <div className="custom-control custom-checkbox w-100">
                  <button
                    type="button"
                    data-role="value"
                    data-target={organisation.id_organisation}
                    data-id={organisation.id_organisation}
                    onClick={onChange}
                    className={`custom-control-label w-100 text-left font-weight-medium text-left ${
                      values.includes(organisation.id_organisation)
                        ? "active"
                        : ""
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

OrganisationFilter.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func,
  label: PropTypes.string,
};
OrganisationFilter.defaultProps = {
  values: [],
  onChange: null,
  label: "",
};
