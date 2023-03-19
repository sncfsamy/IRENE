import { PropTypes } from "prop-types";
import { forwardRef, useContext, useState } from "react";
import ReactDatePicker, {
  registerLocale,
  setDefaultLocale,
} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import fr from "date-fns/locale/fr";
import SharedContext from "../../contexts/sharedContext";

registerLocale("fr", fr);
setDefaultLocale("fr");

const CustomInput = forwardRef(({ value, onClick, id }, ref) => {
  const { darkMode } = useContext(SharedContext);
  return (
    <div>
      <div className="input-group" data-toggle="collapsing">
        <div className="form-control-container">
          <input
            id={id}
            type=""
            value={value}
            className="form-control"
            placeholder="jj/mm/aaaa"
            onClick={onClick}
            ref={ref}
            readOnly
          />
          <span className="form-control-state" />
        </div>
        <div className="input-group-append">
          <button
            type="button"
            className={`btn btn-${
              darkMode === 0 ? "warning" : "primary"
            } btn-only-icon`}
            data-role="btn"
            tabIndex="-1"
            onClick={onClick}
            aria-expanded="false"
          >
            <i className="icons-calendar" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
});

CustomInput.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  onClick: PropTypes.func,
};
CustomInput.defaultProps = {
  id: "id_input",
  value: undefined,
  onClick: undefined,
};

function DatePicker({ label, id, fonction, value }) {
  const [date, setDate] = useState(value && new Date(value));
  return (
    <>
      <label htmlFor={id} className="font-weight-medium mb-2">
        {label}
      </label>
      <ReactDatePicker
        selected={value ? date : ""}
        id={id}
        onChange={(changedDate) => {
          setDate(changedDate);
          fonction({
            target: { id, value: Math.floor(changedDate.getTime() / 1000) },
          });
        }}
        customInput={<CustomInput />}
        dateFormat="dd/MM/yyyy"
      />
    </>
  );
}
DatePicker.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  value: PropTypes.number,
  fonction: PropTypes.func.isRequired,
};
DatePicker.defaultProps = {
  label: "label",
  value: undefined,
};

export default DatePicker;
