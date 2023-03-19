import React, { useContext, useEffect, useRef } from "react";
import { PropTypes } from "prop-types";
import "../../ckeditor/ckeditor";
import SharedContext from "../../contexts/sharedContext";

function Textarea({
  label,
  id,
  placeholder,
  value,
  onChange,
  useAdvancedEditor,
  extraData,
}) {
  const { baseURL, token, setIsLoading } = useContext(SharedContext);
  const editorRef = useRef(null);
  const editorDivRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current && extraData) {
      window[`textarea_${id}`] = value;
      editorRef.current = new CKSource.EditorWatchdog();

      editorRef.current.setCreator((element, config) => {
        return CKSource.Editor.create(element, config).then((editor) => {
          return editor;
        });
      });

      editorRef.current.setDestructor((editor) => {
        return editor.destroy();
      });

      function handleError(error) {
        console.error("Oops, something went wrong!");
        console.error(
          "Please, report the following error on https://github.com/ckeditor/ckeditor5/issues with the build id and the error stack trace:"
        );
        console.warn("Build id: fgyj5k5z4sd4-aab72pmwl4nf");
        console.error(error);
      }
      editorRef.current.on("error", handleError);

      editorRef.current
        .create(editorDivRef.current, {
          licenseKey: "",
          mediaEmbed: {
            previewsInData:true,
            extraProviders: [
              {
                  name: 'microsoft_stream',
                  url: /^www\.microsoftstream\.com/,
              },
            ],
          },
          simpleUpload: {
            uploadUrl: `${baseURL}/assets/${extraData.idea_id}/`,
            headers: {
              "X-CSRF-TOKEN": "CSRF-Token",
              Authorization: `Bearer ${token}`,
              Field: extraData.field,
              Description: "Image postée via l'éditeur",
            },
          },
        })
        .then(function () {
          setTimeout(() => {
            editorRef.current._editor.setData(
              editorRef.current._editor.sourceElement.dataset.value
            );
          }, 500);
          editorRef.current._editor.model.document.on("change:data", () =>
            onChange(editorRef.current._editor.getData())
          );
        })
        .catch(handleError);
    }
  }, []);

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <div
        className={`form-control-container ${
          useAdvancedEditor ? "stretchy my-2 mb-4 rounded" : ""
        }`}
      >
        {useAdvancedEditor ? (
          <div
            className={`editor${id}`}
            data-value={value}
            ref={editorDivRef}
          />
        ) : (
          <textarea
            className="form-control stretchy my-2 mb-4"
            id={id}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
          />
        )}
        <span className="form-control-state" />
      </div>
    </>
  );
}
Textarea.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
Textarea.defaultProps = {
  label: "label",
  placeholder: "",
  value: "",
};

export default Textarea;
