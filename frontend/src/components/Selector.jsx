import { useEffect, useState } from "react";
import { PropTypes } from "prop-types";

export default function Selector({
  label,
  onChange,
  id,
  selectedValues,
  labelClassName,
  values,
  disabled,
  onlySelected,
  className,
  errorMessages,
  selected,
}) {
  const [activeElements, setActiveElements] = useState({});
  const [intermediateParents, setIntermediateParents] = useState({});
  const parents = values.filter((value) => !value.id_parent);
  const childs = values.filter((value) => value.id_parent);
  const haveSelectedChild = (val) => {
    const check =
      !val.id_parent &&
      values.find(
        (value) =>
          value.id_parent === val.id && selectedValues.includes(value.id)
      );
    return check;
  };
  const haveChild = (val) => {
    return (
      !val.id_parent &&
      values.find((value) => value.id_parent && value.id_parent === val.id) !==
        undefined
    );
  };
  useEffect(() => {
    const newIntermediateParents = { ...intermediateParents };
    parents.forEach((element) => {
      newIntermediateParents[element.id] = haveSelectedChild(element);
    });
    setIntermediateParents({ ...newIntermediateParents });
  }, [selectedValues]);
  return (
    <div
      className={`form-control-container container-fluid m-0 p-0 ${
        errorMessages && errorMessages.length ? "is-invalid" : ""
      } ${className}`}
    >
      {label ? (
        <>
          <label htmlFor="label" className={labelClassName || ""}>
            {label}
          </label>
          <input type="hidden" id="label" />
        </>
      ) : (
        ""
      )}
      <div
        className={`invalid-feedback ${className}`}
        id={`${id}_error`}
        style={{
          display: errorMessages && errorMessages.length ? "block" : "none",
        }}
      >
        {errorMessages ? errorMessages.map((err) => err.msg) : ""}
      </div>

      <ul className="list-group rounded">
        {parents
          .filter(
            (element) =>
              (selected.length ? selected.includes(element.id) : true) &&
              (!onlySelected ||
                selectedValues.includes(element.id) ||
                intermediateParents[element.id])
          )
          .map((element, i, t) => (
            <li
              id={`cat_${element.id}`}
              className={`list-group-item management-item management-item-group ${
                activeElements[element.id] ? "active" : ""
              } ${i === 0 ? "rounded-top" : ""}${
                i === t.length - 1 ? "rounded-bottom" : ""
              }`}
              key={element.id}
            >
              <div
                className={`management-item-content p-0 m-0 ${
                  i === 0 ? "rounded-top" : ""
                }${i === t.length - 1 ? "rounded-bottom" : ""}`}
                data-component="state"
                data-state="inactive"
                data-behaviour="toggle"
                data-target={`#cat_${element.id}`}
              >
                <div className="management-item-checkbox">
                  <div className="custom-control custom-checkbox custom-checkbox-alone">
                    <button
                      type="button"
                      data-role="counter"
                      id={`elem_${element.id}`}
                      data-id={element.id}
                      disabled={disabled}
                      onClick={(e) => {
                        if (!selected.length && !disabled) {
                          onChange({
                            target: {
                              dataset: { id: e.target.dataset.id },
                              checked: !selectedValues.includes(element.id),
                            },
                          });
                        }
                      }}
                      className={`custom-control-label ${
                        selectedValues.includes(element.id)
                          ? "active"
                          : `${
                              intermediateParents[element.id]
                                ? "indeterminate"
                                : ""
                            } ${disabled ? "disabled" : ""}`
                      }`}
                    >
                      <label
                        aria-hidden="true"
                        className="d-none"
                        htmlFor={`elem_${element.id}`}
                      >
                        checkbox
                      </label>
                    </button>
                  </div>
                </div>
                {haveChild(element) ? (
                  <div
                    className="management-item-caret"
                    aria-hidden="true"
                    onClick={() =>
                      setActiveElements({
                        ...activeElements,
                        [element.id]: !activeElements[element.id],
                      })
                    }
                  />
                ) : (
                  ""
                )}
                <div className="management-item-symbol d-none d-sm-inline-flex">
                  <i
                    className="icons-document icons-size-1x25"
                    aria-hidden="true"
                  />
                </div>
                <div className="management-item-main">
                  <h5 className="mb-0 font-weight-normal">
                    <button
                      type="button"
                      className="btn-unstyled text-left"
                      aria-expanded="false"
                      aria-controls={`sublist${i}`}
                      onClick={() =>
                        setActiveElements({
                          ...activeElements,
                          [element.id]: !activeElements[element.id],
                        })
                      }
                    >
                      {element.name}
                    </button>
                  </h5>
                </div>
              </div>
              <ul id={`sublist${i + 1}`} className="management-item-grouplist">
                {childs
                  .filter(
                    (child) =>
                      (selected.length ? selected.includes(child.id) : true) &&
                      child.id_parent === element.id &&
                      (!onlySelected || selectedValues.includes(child.id))
                  )
                  .map((child, i2, t2) => (
                    <li
                      className={`management-item ${
                        i === t.length - 1 && i2 === t2.length - 1
                          ? "rounded-bottom"
                          : ""
                      }`}
                      key={child.id}
                    >
                      <div
                        className={`management-item-content ${
                          i === t.length - 1 && i2 === t2.length - 1
                            ? "rounded-bottom"
                            : ""
                        }`}
                      >
                        <div className="management-item-checkbox">
                          <div className="custom-control custom-checkbox custom-checkbox-alone">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id={`sub_${id}_${child.id}`}
                              name={`${id}_sub`}
                              data-id={child.id}
                              onChange={(e) => {
                                if (!selected && !disabled) {
                                  onChange(e);
                                }
                              }}
                              aria-describedby={`${id}_error`}
                              checked={selectedValues.includes(child.id)}
                            />
                            <label
                              className="custom-control-label"
                              htmlFor={`sub_${id}_${child.id}`}
                            >
                              <span className="sr-only">{child.name}</span>
                            </label>
                          </div>
                        </div>
                        <div className="management-item-symbol management-item-spacing d-none d-sm-inline-flex">
                          <i
                            className="icons-document icons-size-1x25 "
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

Selector.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  labelClassName: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onlySelected: PropTypes.bool,
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  selected: PropTypes.arrayOf(PropTypes.number),
  selectedValues: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
  values: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      id_parent: PropTypes.number,
    })
  ),
  errorMessages: PropTypes.arrayOf(PropTypes.string),
};
Selector.defaultProps = {
  className: "",
  label: "",
  disabled: false,
  selected: [],
  labelClassName: "",
  onlySelected: false,
  selectedValues: [],
  values: [{ id: -1, name: "Aucun", id_parent: 0 }],
  errorMessages: "Au moins un élément doit être selectionné",
};
