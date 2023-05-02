import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import SharedContext from "../../contexts/sharedContext";

export default function Select({
  label,
  ariaLabel,
  id,
  values,
  selectedValue,
  setSelectedValue,
}) {
  const [active, setActive] = useState(false);
  const { darkMode } = useContext(SharedContext);
  const elemRef = useRef();
  const handleClick = (e) => {
    setSelectedValue({
      target: { ...e.target, value: parseInt(e.target.dataset.target, 10), id },
    });
    setActive(false);
  };
  const click = (e) => {
    if (elemRef.current && active) {
      const contain =
        e.target === elemRef.current || elemRef.current.contains(e.target);
      if (!contain) {
        setActive(false);
      }
    }
  };

  useEffect(() => {
    if (elemRef.current && active) {
      window.addEventListener("click", click);
    } else {
      window.removeEventListener("click", click);
    }
  }, [active]);

  useEffect(() => {
    return () => {
      if (active) {
        window.removeEventListener("click", click);
      }
    };
  }, []);
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <div
        className={`select-improved w-100 ${active ? "active" : ""}`}
        data-component="select-exclusive"
      >
        <div
          className="select-control w-100"
          ref={elemRef}
          aria-hidden="true"
          onClick={() => setActive(!active)}
        >
          <div className="input-group" data-role="select-toggle w-100">
            <p
              className="form-control is-placeholder d-flex align-items-center"
              data-role="placeholder"
              data-selected-prefix="Sélection actuelle"
            >
              {(values.find((value) => value.id === selectedValue) &&
                values.find((value) => value.id === selectedValue).name) ||
                (values.find((value) => value.id === -1) &&
                  values.find((value) => value.id === -1).name) ||
                values[0]?.name ||
                -1}
            </p>
            <select
              className="sr-only"
              id={id}
              data-role="input"
              tabIndex="-1"
              aria-hidden="true"
              value={selectedValue || ""}
              onChange={setSelectedValue}
            >
              <option data-role="default-hidden-option" disabled hidden>
                {label}
              </option>
              {values.map((value) => (
                <option key={value.id} data-id={value.id} value={value.id}>
                  {value.name}
                </option>
              ))}
            </select>
            <div className="input-group-append input-group-last">
              <button
                className={`btn btn-${
                  darkMode === 0 ? "warning" : "primary"
                } btn-only-icon`}
                data-role="btn"
                type="button"
                aria-expanded="false"
                aria-controls={`selecttoggle_${id}`}
              >
                <i
                  className="icons-arrow-down icons-size-x75"
                  aria-hidden="true"
                />
                <span className="sr-only">Sélectionner {ariaLabel}</span>
              </button>
            </div>
          </div>
          <div
            className="select-menu"
            id={`-selecttoggle_${id}`}
            style={{ zIndex: 1071 }}
          >
            <div className="d-flex flex-column">
              <div
                className="flex-fluid overflow-y"
                role="list"
                data-role="menu"
              >
                {values.map((value) => (
                  <span
                    className="select-menu-item"
                    role="listitem"
                    key={value.id}
                  >
                    <button
                      type="button"
                      data-role="value"
                      data-target={value.id}
                      onClick={handleClick}
                    >
                      {value.name}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Select.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  selectedValue: PropTypes.number,
  setSelectedValue: PropTypes.func,
  values: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ).isRequired,
};
Select.defaultProps = {
  setSelectedValue: null,
  selectedValue: null,
};
