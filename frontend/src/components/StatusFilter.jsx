import { useContext, useEffect, useRef, useState } from "react";
import { PropTypes } from "prop-types";
import SharedContext from "../contexts/sharedContext";

const status = [
  "En cours de rédaction",
  "Attente de validation manager",
  "Attente de validation ambassadeur",
  "Cloturée avec succès",
  "En attente d'approfondissement",
  "Refusée",
];
export default function StatusFilter({ values, onChange, label }) {
  const { darkMode } = useContext(SharedContext);
  const [activeStatus, setActiveStatus] = useState(false);
  const elemRef = useRef();
  let statusAll = "";
  if (status.length === values.length) {
    statusAll = "active";
  } else if (values.length > 0) {
    statusAll = "indeterminate";
  }
  const click = (e) => {
    if (elemRef.current && activeStatus) {
      const contain =
        e.target === elemRef.current || elemRef.current.contains(e.target);
      if (!contain) {
        setActiveStatus(false);
      }
    }
  };
  useEffect(() => {
    if (elemRef.current && activeStatus) {
      window.addEventListener("click", click);
    } else {
      window.removeEventListener("click", click);
    }
  }, [activeStatus]);

  useEffect(() => {
    return () => {
      if (activeStatus) {
        window.removeEventListener("click", click);
      }
    };
  }, []);
  return (
    <>
      <label htmlFor="status">{label}</label>
      <div
        className={`select-improved ${activeStatus && "active"}`}
        data-component="select-multiple"
        ref={elemRef}
      >
        <div className="select-control">
          <div
            className="input-group"
            data-role="select-toggle"
            aria-hidden="true"
            onClick={() => setActiveStatus(!activeStatus)}
          >
            <div className="form-control">
              <div className="custom-control custom-checkbox">
                <label
                  data-role="placeholder"
                  className={`custom-control-label font-weight-medium ${statusAll}`}
                  htmlFor="status"
                >
                  {values.length
                    ? `${
                        values.length > 1
                          ? `${values.length} status sélectionnées`
                          : status[values[0]]
                      }`
                    : "Aucune status sélectionnée"}
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
                onClick={() => setActiveStatus(!activeStatus)}
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

StatusFilter.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func,
  label: PropTypes.string,
};
StatusFilter.defaultProps = {
  values: [],
  onChange: null,
  label: "",
};
