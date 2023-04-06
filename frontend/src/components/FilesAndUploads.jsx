import PropTypes from "prop-types";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import Motrice from "@assets/Motrice";
import { Link } from "react-router-dom";
import SharedContext from "../contexts/sharedContext";
import Textarea from "./forms/Textarea";

export default function FilesAndUploads({
  idea,
  idIdeaAuthor,
  field,
  ideaAssets,
  setIdeaAssets,
  assetsToReassign,
  setAssetsToReassign,
  imageModalRef,
  idComment,
}) {
  const localImageModalRef = imageModalRef;
  const defaultAsset = { description: "", files: [] };
  const { user, darkMode, setIsLoading, customFetch } =
    useContext(SharedContext);
  const [showAll, setShowAll] = useState(false);
  const [errors, setErrors] = useState([]);
  const [asset, setAsset] = useState(defaultAsset);
  const textAreaRef = useRef(null);
  const topRef = useRef(null);

  const colorFileType = {
    "application/x-zip-compressed": {
      background: "rgba(213,154,45,.5)",
      text: "#d59a2d",
    },
    "application/x-msdownload": {
      background: "rgba(221,84,88,.5)",
      text: "#dd5458",
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      background: "rgba(37,105,184,.5)",
      text: "#2468b8",
    },
    "application/pdf": { background: "rgba(215,55,55,.5)", text: "#d73737" },
    "application/vnd.ms-excel": {
      background: "rgba(43,147,29,.5)",
      text: "#2a931c",
    },
    "text/plain": { background: "rgba(8,10,42,.5)", text: "#070a2a" },
  };

  // from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  const rgbToHex = (r, g, b) => {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
  };

  const getColor = (type, element) => {
    let color = colorFileType[type];
    if (!color) {
      const r = Math.floor(Math.random() * 16);
      const g = Math.floor(Math.random() * 16);
      const b = Math.floor(Math.random() * 16);
      color = {
        background: `rgba(${r},${r},${r},.5)`,
        text: rgbToHex(r, g, b),
      };
      colorFileType[type] = color;
    }
    return color[element];
  };

  const handleChange = (e) => {
    let element = e.target.id;
    if (element.includes("descriptionFileField")) {
      element = "description";
    }
    if (element.includes("filesField")) {
      element = "files";
    }
    setAsset({
      ...asset,
      [element]: element === "files" ? e.target.files : e.target.value,
    });
  };
  const handleAddFileClick = () => {
    setTimeout(() => textAreaRef.current.focus(), 500);
  };
  const handleDelete = (assetId) => {
    setIsLoading(true);
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/assets/${assetId}/`,
      "DELETE"
    )
      .then(() => {
        setIdeaAssets([
          ...ideaAssets.filter((ideaAsset) => ideaAsset.id_asset !== assetId),
        ]);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        console.warn(err);
      });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    for (let i = 0; i < asset.files.length; i += 1) {
      formData.append("upload", asset.files[i]);
    }
    formData.append("field", field);
    formData.append("description", asset.description);
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/assets${
        idea.id_idea ? `/${idea.id_idea}` : ""
      }`,
      "POST",
      formData,
      true
    )
      .then((response) => {
        const newAssets = [];
        if (Array.isArray(response)) {
          response.forEach((file) => {
            const newAsset = {
              file_name: file.urls.default,
              id_idea: idea.id_idea,
              id_asset: parseInt(file.id_asset, 10),
              id_comment: idComment ?? null,
              size: parseInt(file.size, 10),
              type: file.type,
              field: parseInt(field, 10),
              description: asset.description,
            };
            newAssets.push(newAsset);
          });
        } else {
          const newAsset = {
            file_name: response.urls.default,
            id_idea: idea.id_idea,
            id_asset: parseInt(response.id_asset, 10),
            id_comment: idComment ?? null,
            size: parseInt(response.size, 10),
            type: response.type,
            field: parseInt(field, 10),
            description: asset.description,
          };
          newAssets.push(newAsset);
        }

        setAssetsToReassign([
          ...assetsToReassign,
          ...newAssets.map((newAsset) => newAsset.id_asset),
        ]);
        setIsLoading(false);
        setAsset(defaultAsset);
        setIdeaAssets([...ideaAssets, ...newAssets]);
      })
      .catch((err) => {
        setErrors([
          { msg: "Erreur lors du transfert." },
          { msg: "Veuillez réessayer." },
        ]);
        console.warn(err);
        setIsLoading(false);
      });
  };

  const imgURL = (ideaAsset, size) => {
    const ext = ideaAsset.file_name.substring(
      ideaAsset.file_name.lastIndexOf(".")
    );
    const fileName = ideaAsset.file_name.replace(ext, "");
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/idea_${
      ideaAsset.id_idea
    }/${fileName}${size ? `-${size}` : ""}${ext}`;
  };

  const handleImageClick = (e) => {
    localImageModalRef.current.src = e.target.src;
    localImageModalRef.current.srcset = e.target.srcset;
  };

  const resize = () => {
    if (!window.popover_upload) {
      window.popover_upload = true;
      if (window.popover_upload_timeout) {
        clearTimeout(window.popover_upload_timeout);
      }
      window.popover_upload_timeout = setTimeout(() => {
        if (window.innerWidth < 1024) {
          $(".delete-popover").popover("dispose");
          $(".delete-popover").popover({
            delay: { show: 1000, hide: 200 },
            title: "Supprimer ce fichier",
            content: "",
            animation: true,
            placement: "right",
            trigger: "hover",
          });
        } else {
          $(".delete-popover").popover("dispose");
        }
      }, 300);
      window.popover_upload = false;
    }
  };

  const handleFileTitleClick = (e) => {
    if (e.target.dataset.disable) {
      e.target.preventDefault();
    }
  };

  // from https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
  const fileSize = (incBytes) => {
    let bytes = incBytes;
    const thresh = 1024;

    if (Math.abs(bytes) < thresh) {
      return `${bytes} B`;
    }

    const units = ["ko", "Mo", "Go", "To", "Po", "Eo", "Zo", "Yo"];
    let u = -1;
    const r = 10 ** 2;

    do {
      bytes /= thresh;
      u += 1;
    } while (
      Math.round(Math.abs(bytes) * r) / r >= thresh &&
      u < units.length - 1
    );

    return `${bytes.toFixed(2)} ${units[u]}`;
  };

  useLayoutEffect(() => {
    window.addEventListener("resize", resize);
    if (window.innerWidth < 1024) {
      $(".delete-popover").popover("dispose");
      $(".delete-popover").popover({
        delay: { show: 1000, hide: 200 },
        title: "Supprimer ce fichier",
        content: "",
        animation: true,
        placement: "right",
        trigger: "hover",
      });
    }
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  const idField = parseInt(field, 10);

  return (
    <div className="d-flex flex-column" ref={topRef}>
      {user.id_user === idIdeaAuthor && (!idea.status || idea.status === 4) ? (
        <div className="row justify-content-end">
          <button
            className="btn btn-link mr-3"
            type="button"
            data-toggle="modal"
            data-target={`#uploadModalField${field}`}
            onClick={handleAddFileClick}
          >
            Ajouter des fichiers
          </button>
        </div>
      ) : (
        ""
      )}
      {ideaAssets &&
      ideaAssets.filter((ideaAsset) => ideaAsset.field === idField).length ? (
        <section className="container mb-3">
          <div className="container-fluid d-flex justify-content-between mb-3 w-100">
            <h4>Pièces jointes:</h4>
          </div>
          <div className="row">
            {ideaAssets
              .filter((ideaAsset) => ideaAsset.field === idField)
              .map((ideaAsset, i, t) => (
                <div
                  key={ideaAsset.id_asset}
                  className={`col-6 col-md-3 my-2 mx-n1 file-upload  ${
                    i < (showAll ? t.length : 4) ? "" : "file-upload-hidden "
                  }${i > 1 && !showAll ? " d-none d-md-block" : ""}`}
                >
                  <div className="card overflow-hidden">
                    <div className="col p-0 attachment-card-head">
                      <span
                        className={`position-absolute ${
                          ideaAsset.type.includes("image") ? "d-none" : ""
                        }`}
                      >
                        <Link
                          to={`${
                            import.meta.env.VITE_BACKEND_URL
                          }/uploads/idea_${idea.id_idea}/${
                            ideaAsset.file_name
                          }`}
                          target="_blank"
                          onClick={handleFileTitleClick}
                          data-disable={ideaAsset.type.includes("image")}
                        >
                          <h1
                            className="font-weight-bold d-sm-none d-lg-block"
                            style={{ color: getColor(ideaAsset.type, "text") }}
                          >
                            {ideaAsset.file_name
                              .substring(
                                ideaAsset.file_name.lastIndexOf(".") + 1
                              )
                              .toUpperCase()}
                          </h1>
                          <h2
                            className="font-weight-bold d-none d-sm-block d-lg-none"
                            style={{ color: getColor(ideaAsset.type, "text") }}
                          >
                            {ideaAsset.file_name
                              .substring(
                                ideaAsset.file_name.lastIndexOf(".") + 1
                              )
                              .toUpperCase()}
                          </h2>
                        </Link>
                      </span>
                      {ideaAsset.type.includes("image") ? (
                        <img
                          className="card-img-top"
                          alt={ideaAsset.description}
                          src={imgURL(ideaAsset)}
                          srcSet={`${imgURL(ideaAsset, 150)} w150,${imgURL(
                            ideaAsset,
                            300
                          )} w300,${imgURL(ideaAsset, 800)} w800,${imgURL(
                            ideaAsset,
                            1080
                          )} w1080`}
                          style={{ cursor: "zoom-in" }}
                          data-toggle="modal"
                          data-target=".bd-example-modal-lg"
                          aria-hidden="true"
                          onClick={handleImageClick}
                        />
                      ) : (
                        <Link
                          to={`${
                            import.meta.env.VITE_BACKEND_URL
                          }/uploads/idea_${idea.id_idea}/${
                            ideaAsset.file_name
                          }`}
                          target="_blank"
                        >
                          <Motrice
                            fill={getColor(ideaAsset.type, "background")}
                          />
                        </Link>
                      )}
                    </div>
                    <div className="card-body">
                      <div>
                        {ideaAsset.file_name.replaceAll(
                          /[\w|\d]{8}-[\w|\d]{4}-[\w|\d]{4}-[\w|\d]{4}-[\w|\d]{12,13}-/g,
                          ""
                        )}
                      </div>
                      <div>{fileSize(ideaAsset.size)}</div>
                      <p className="card-title mb-0 text-base text-justify font-weight-normal">
                        {ideaAsset.description}
                      </p>
                      {(user.perms.manage_all ||
                        user.id_user === idIdeaAuthor) &&
                      (idea.status === 0 || idea.status === 4) ? (
                        <button
                          type="button"
                          className="btn-sm close text-danger mt-4 mx-auto"
                          aria-label="Supprimer ce fichier"
                          onClick={() => handleDelete(ideaAsset.id_asset)}
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Supprimer ce fichier"
                        >
                          <span className="d-none d-lg-inline-block badge badge-danger">
                            Supprimer <span aria-hidden="true"> &times;</span>
                          </span>
                          <span
                            className="d-inline-block d-lg-none"
                            aria-hidden="true"
                          >
                            &times;
                          </span>
                        </button>
                      ) : (
                        // </span>
                        ""
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <section className="mx-4 w-100">
            {ideaAssets.filter((ideaAsset) => ideaAsset.field === idField)
              .length > 4 ? (
              <button
                className="btn btn-link float-right"
                type="button"
                onClick={() => {
                  setShowAll(!showAll);
                  if (showAll) {
                    topRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                {showAll ? "Réduire" : "Tout afficher"} (
                {
                  ideaAssets.filter((ideaAsset) => ideaAsset.field === idField)
                    .length
                }
                )
                <i
                  className={`icons-arrow-${
                    showAll ? "up" : "down"
                  } icons-size-x75`}
                  aria-hidden="true"
                />
              </button>
            ) : (
              ""
            )}
          </section>
        </section>
      ) : (
        ""
      )}
      <div
        className="modal fade"
        id={`uploadModalField${field}`}
        tabIndex="-1"
        role="dialog"
        aria-labelledby={`uploadModalLabelField${field}`}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="h1 modal-title"
                id={`uploadModalLabelField${field}`}
              >
                Envoi de fichiers
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Annuler"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body text-break py-5">
              <span>Tous types acceptés. Maximum 50Mo.</span>
              <div className="input-group mb-5">
                <div className="custom-file">
                  <input
                    type="file"
                    className="custom-file-input"
                    value=""
                    onChange={handleChange}
                    multiple
                    id={`filesField${field}`}
                  />
                  <label
                    className="custom-file-label text-left pl-3"
                    htmlFor={`filesField${field}`}
                  >{`${
                    asset.files.length
                      ? `${
                          asset.files.length === 1
                            ? asset.files[0].name
                            : `${asset.files.length} fichiers sélectionnés`
                        }`
                      : "Aucun fichier sélectionné"
                  } `}</label>
                </div>
              </div>
              <Textarea
                className="border"
                label="Description:"
                placeholder="Entrez ici une description ou bien une explication accompagnant votre fichier"
                id={`descriptionFileField${field}`}
                onChange={handleChange}
                value={asset.description}
                errorMessage={errors}
                textAreaRef={textAreaRef}
                maxChars="200"
              />
            </div>
            <div className="mx-4">
              Note: le traitement des images prendra quelques instants.
            </div>
            <div className="modal-footer d-flex align-items-center justify-content-end">
              <button
                type="button"
                className="btn btn-secondary mx-1"
                data-dismiss="modal"
              >
                Annuler
              </button>
              <button
                type="button"
                className={`btn btn-${
                  darkMode === 0 ? "warning" : "primary"
                } my-1 mx-1`}
                data-dismiss="modal"
                onClick={handleSubmit}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

FilesAndUploads.propTypes = {
  field: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  idComment: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  idIdeaAuthor: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  assetsToReassign: PropTypes.arrayOf(PropTypes.number),
  setAssetsToReassign: PropTypes.func,
  idea: PropTypes.shape({
    id_idea: PropTypes.number,
    status: PropTypes.number,
  }).isRequired,
  ideaAssets: PropTypes.arrayOf(
    PropTypes.shape({
      filter: PropTypes.func,
    })
  ).isRequired,
  imageModalRef: PropTypes.shape({
    current: PropTypes.shape({
      src: PropTypes.string,
      srcset: PropTypes.string,
    }),
  }),
  setIdeaAssets: PropTypes.func,
};
FilesAndUploads.defaultProps = {
  setIdeaAssets: null,
  imageModalRef: null,
  assetsToReassign: [],
  setAssetsToReassign: null,
  idComment: null,
};
