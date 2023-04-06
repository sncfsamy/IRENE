import { PropTypes } from "prop-types";

function Text({
  label,
  type,
  id,
  placeholder,
  value,
  onChange,
  required,
  errorMessages,
  className,
  readOnly,
  maxChars,
}) {
  return (
    <div className="form-group">
      <label htmlFor={id} className={required ? "required" : ""}>
        {label}
      </label>
      <div
        className={`form-control-container ${
          errorMessages.length ? "is-invalid" : ""
        }`}
      >
        <input
          type={type}
          className={`form-control ${className}`}
          id={id}
          title={placeholder}
          placeholder={placeholder}
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
          aria-describedby={`${id}_error`}
          autoComplete="off"
        />
        <span className="form-control-state" />
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
          .filter((err) => err.msg)
          .map((err) => (
            <div className="d-block">{err.msg}</div>
          ))}
      </div>
    </div>
  );
}
Text.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  className: PropTypes.string,
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
Text.defaultProps = {
  label: "",
  type: "text",
  placeholder: "",
  className: "",
  value: "",
  required: false,
  readOnly: false,
  errorMessages: [],
  maxChars: null,
};

export default Text;
