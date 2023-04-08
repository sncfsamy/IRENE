import { PropTypes } from "prop-types";
import { useContext, useLayoutEffect, useRef } from "react";
import SharedContext from "../contexts/sharedContext";
import Textarea from "./forms/Textarea";

export default function ManagerCommentForm({ id, value, setValue, errors }) {
  const { darkMode } = useContext(SharedContext);
  const textAreaRef = useRef();
  useLayoutEffect(() => {
    if (textAreaRef.current) {
      setTimeout(() => textAreaRef.current.focus(), 650);
    }
  }, [textAreaRef.current]);
  return (
    <div
      className={`p-3 ml-auto border rounded text-left ${
        darkMode < 2 ? "bg-light" : ""
      }`}
      style={{ backgroundColor: darkMode === 2 ? "#5f5f5f" : undefined }}
    >
      <Textarea
        className="border"
        label="Expliquez votre action ci-dessous:"
        placeholder=""
        id={id}
        onChange={(e) => setValue(e.target.value)}
        value={value}
        errorMessage={errors}
        textAreaRef={textAreaRef}
      />
      Ce commentaire sera ajouté au parcours de l'innovation.
    </div>
  );
}

ManagerCommentForm.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      msg: PropTypes.string,
      param: PropTypes.string,
    })
  ).isRequired,
};
ManagerCommentForm.defaultProps = {
  setValue: null,
};
