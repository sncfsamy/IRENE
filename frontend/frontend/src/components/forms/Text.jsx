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
}) {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={id} className={required ? "required" : ""}>
        {label}
      </label>
      <div
        className={`form-control-container ${
          errorMessages.length ? "is-invalid" : ""
        } ${className}`}
      >
        <input
          type={type}
          className={`form-control ${className}`}
          id={id}
          title={placeholder}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
          aria-describedby={`${id}_error`}
          autoComplete="off"
        />
        <span className={`form-control-state ${className}`} />
      </div>
      <div
        className={`invalid-feedback ${className}`}
        id={`${id}_error`}
        style={{ display: errorMessages.length ? "block" : "none" }}
      >
        {errorMessages.map((err) => err.msg)}
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
};

export default Text;
