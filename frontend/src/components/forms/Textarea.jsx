/* eslint-disable no-undef */
import React, { useContext, useEffect, useRef } from "react";
import { PropTypes } from "prop-types";
import SharedContext from "../../contexts/sharedContext";

function Textarea({
  label,
  className,
  id,
  placeholder,
  value,
  onChange,
  required,
  useAdvancedEditor,
  errorMessage,
  extraData,
  textAreaRef,
  setAssetsToReassign,
  maxChars,
}) {
  const editorRef = useRef(null);
  const editorDivRef = useRef(null);
  const { user, setIsLoading, isLoading } = useContext(SharedContext);
  const uploadToken = user.upload_token;
  const keyEditor = "_editor";
  const getEditor = (e) => {
    return e[keyEditor];
  };
  useEffect(() => {
    if (!editorRef.current && extraData) {
      window.assetsToReassign = [];
      editorRef.current = new CKSource.EditorWatchdog();

      editorRef.current.setCreator((element, config) => {
        return CKSource.Editor.create(element, config).then((editor) => {
          return editor;
        });
      });

      editorRef.current.setDestructor((editor) => {
        return editor.destroy();
      });

      const handleError = (error) => {
        console.warn(error);
      };
      editorRef.current.on("error", handleError);

      editorRef.current
        .create(editorDivRef.current, {
          licenseKey: "",
          mediaEmbed: {
            previewsInData: true,
            extraProviders: [
              {
                name: "microsoft_stream",
                url: /^www\.microsoftstream\.com/,
              },
            ],
          },
          simpleUpload: {
            uploadUrl: `${import.meta.env.VITE_BACKEND_URL}/assets${
              extraData.id_idea ? `/${extraData.id_idea}/` : ""
            }`,
            headers: {
              Authorization: `Bearer ${uploadToken}`,
              Field: extraData.field,
              Description: "Image postée via l'éditeur de texte.",
              Challenge: extraData.id_challenge !== undefined,
              ChallengeId: extraData.id_challenge,
              CKEditorUploader: true,
            },
          },
        })
        .then(() => {
          const editor = getEditor(editorRef.current);
          setTimeout(() => {
            editor.setData(editor.sourceElement.dataset.value);
          }, 500);
          editor.model.document.on("change:data", () =>
            onChange({
              target: { id, value: editor.getData() },
            })
          );
          const fileRepo = editor.plugins.get("FileRepository");
          fileRepo.on("change:uploaded", () => {
            const loader = fileRepo.loaders.last;
            loader.on("change:uploadResponse", (_e, _n, value2) => {
              if (value2 && value2.id_asset) {
                window.assetsToReassign.push(value2.id_asset);
                setAssetsToReassign(window.assetsToReassign);
              }
              setIsLoading(false);
            });
          });
          fileRepo.on("change:uploadedPercent", () => {
            if (!isLoading) {
              setIsLoading(true);
            }
          });
          fileRepo.on("change:uploaded", () => {
            if (isLoading) {
              setIsLoading(false);
            }
          });
        })
        .catch(handleError);
    }
  }, []);

  return (
    <>
      <label htmlFor={id} className={required ? "required" : ""}>
        {label}
      </label>
      <div
        className={`form-control-container ${
          useAdvancedEditor ? "stretchy my-2 mb-4 rounded" : ""
        }${errorMessage.length ? " is-invalid" : ""}`}
      >
        {useAdvancedEditor ? (
          <div
            className={`editor${id}`}
            data-value={value}
            ref={editorDivRef}
          />
        ) : (
          <textarea
            className={`form-control stretchy my-2 mb-4 ${className}`}
            id={id}
            placeholder={placeholder}
            required={required}
            onChange={(e) =>
              onChange({
                ...e,
                target: {
                  ...e.target,
                  id: e.target.id,
                  value: e.target.value.substring(
                    0,
                    maxChars ?? e.target.value.length
                  ),
                },
              })
            }
            value={value}
            ref={textAreaRef}
          />
        )}
        <span className="form-control-state" />
      </div>
      {maxChars ? (
        <div
          className="mt-2 font-weight-medium"
          data-role="counter"
          data-limit={maxChars}
          id="charcounter"
        >
          <span data-role="counter-value">{value.length}</span>/{maxChars}{" "}
          caractères
        </div>
      ) : (
        ""
      )}
      <div
        className="invalid-feedback pb-4"
        id={`${id}_error`}
        style={{ display: errorMessage.length ? "d-block" : "d-none" }}
      >
        {errorMessage
          .filter((err) => err.msg)
          .map((err) => (
            <div key={err.msg} className="d-block">
              {err.msg}
            </div>
          ))}
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
  className: PropTypes.string,
  required: PropTypes.bool,
  useAdvancedEditor: PropTypes.bool,
  maxChars: PropTypes.string,
  errorMessage: PropTypes.arrayOf(PropTypes.shape({ msg: PropTypes.string })),
  textAreaRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  setAssetsToReassign: PropTypes.func,
  extraData: PropTypes.shape({
    id_idea: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    id_challenge: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    field: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
};
Textarea.defaultProps = {
  label: "label",
  placeholder: "",
  textAreaRef: null,
  value: "",
  className: "",
  required: false,
  errorMessage: [],
  useAdvancedEditor: false,
  setAssetsToReassign: null,
  maxChars: null,
  extraData: undefined,
};

export default Textarea;
