import { PropTypes } from "prop-types";
import { useContext, useRef, useState } from "react";
import SharedContext from "../../contexts/sharedContext";
import "bootstrap-icons/font/bootstrap-icons.css";

function Input({
  label,
  type,
  id,
  placeHolder,
  value,
  onChange,
  required,
  errorMessages,
  className,
  formGroupClassName,
  labelClassName,
  readOnly,
  maxChars,
  withClearButton,
}) {
  const { darkMode } = useContext(SharedContext);
  const textRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const moveCursorToEnd = () => {
    setTimeout(() => {
      textRef.current.selectionStart = value.length;
      textRef.current.selectionEnd = value.length;
      textRef.current.focus();
      textRef.current.removeEventListener("focus", moveCursorToEnd);
    }, 1);
  };
  return (
    <div className={`form-group ${formGroupClassName}`}>
      <label
        htmlFor={id}
        className={`${required ? "required" : ""} ${labelClassName || ""}`}
      >
        {label}
      </label>
      <div
        className={`form-control-container ${
          errorMessages.filter((err) => err.msg && err.param === id).length
            ? "is-invalid"
            : ""
        }`}
      >
        <input
          type={showPassword && type === "password" ? "text" : type}
          className={`form-control ${className} ${
            type === "password" || withClearButton ? "pr-5" : ""
          }`}
          id={id}
          title={placeHolder}
          placeholder={placeHolder}
          value={value}
          onChange={(e) =>
            onChange({
              ...e,
              target: {
                ...e.target,
                id: e.target.id,
                value: maxChars
                  ? e.target.value.substring(0, maxChars)
                  : e.target.value,
              },
            })
          }
          required={required}
          readOnly={readOnly}
          ref={textRef}
          aria-describedby={`${id}_error`}
          autoComplete="off"
        />
        <span className="form-control-state" />
        {withClearButton ? (
          <button
            type="button"
            className={`btn-clear btn-${darkMode ? "primary" : "warning"} ${
              value ? "" : "d-none"
            }`}
            style={{ border: "none" }}
            onClick={() => {
              onChange({
                target: {
                  id,
                  value: "",
                },
              });
              textRef.current.focus();
            }}
          >
            <span className="sr-only">Effacer</span>
            <i className="icons-close" aria-hidden="true" />
          </button>
        ) : (
          ""
        )}
        {type === "password" ? (
          <button
            type="button"
            className="btn-link position-absolute h-75 px-1 rounded"
            style={{ top: "12.5%", right: "2%" }}
            onClick={() => {
              setShowPassword(!showPassword);
              textRef.current.addEventListener("focus", moveCursorToEnd);
              textRef.current.focus();
            }}
          >
            <span className="sr-only">Afficher/masquer le mot de passe</span>
            <i
              className={`bi bi-eye${showPassword ? "-slash" : ""}`}
              style={{ fontSize: "24px" }}
              aria-hidden="true"
            />
          </button>
        ) : (
          ""
        )}
      </div>
      {maxChars ? (
        <div
          className="mt-2 font-weight-medium text-right"
          data-role="counter"
          data-limit={maxChars}
          id="charcounter"
        >
          <span data-role="counter-value">{value.length}</span>/{maxChars}
        </div>
      ) : (
        ""
      )}
      <div
        className="invalid-feedback"
        id={`${id}_error`}
        style={{ display: errorMessages.length ? "d-block" : "d-none" }}
      >
        {errorMessages
          .filter((err) => err.msg && err.param === id)
          .map((err) => (
            <div key={err.msg} className="d-block">
              {err.msg}
            </div>
          ))}
      </div>
    </div>
  );
}
Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
  placeHolder: PropTypes.string,
  value: PropTypes.string,
  className: PropTypes.string,
  formGroupClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  withClearButton: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  maxChars: PropTypes.string,
  errorMessages: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      msg: PropTypes.string,
      param: PropTypes.string,
      location: PropTypes.string,
    })
  ),
};
Input.defaultProps = {
  label: "",
  type: "text",
  placeHolder: "",
  className: "",
  value: "",
  formGroupClassName: "",
  labelClassName: "",
  withClearButton: false,
  required: false,
  readOnly: false,
  errorMessages: [],
  maxChars: null,
};

export default Input;
