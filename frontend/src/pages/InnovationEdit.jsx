import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Selector from "@components/Selector";
import FilesAndUploads from "@components/FilesAndUploads";
import UserSearchSelect from "@components/UserSearchSelect";
import Text from "../components/forms/Text";
import sharedContext from "../contexts/sharedContext";
import Textarea from "../components/forms/Textarea";

function InnovationEdit() {
  const defaultIdea = {
    name: "",
    description: "",
    problem: "",
    solution: "",
    gains: "",
    status: 0,
    categories: [],
    coauthors: [],
  };
  const [errorField, setErrorField] = useState();
  const [idea, setIdea] = useState(defaultIdea);
  const { darkMode, setIsLoading, categories, user, customFetch } =
    useContext(sharedContext);
  const [authorId, setAuthorId] = useState(user.id_user);
  const [assetsToReassign, setAssetsToReassign] = useState([]);
  const [assetsToReassignFromEditor, setAssetsToReassignFromEditor] = useState(
    []
  );
  const [ideaAssets, setIdeaAssets] = useState([]);
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [gains, setGains] = useState("");
  const [poster, setPoster] = useState(
    ideaAssets.find((asset) => asset.field === 0 && !asset.id_comment)
  );
  const [searchParams] = useSearchParams();
  const challenge =
    searchParams.has("challenge") && searchParams.get("challenge");
  const imageModalRef = useRef(null);
  let finished = false;

  let { id } = useParams();

  const navigate = useNavigate();
  const handleCheck = (event) => {
    let updatedList = [...idea.categories];
    const value = parseInt(event.target.dataset.id, 10);
    const parentCategorie = categories.find(
      (categorie) => categorie.id_categorie === value
    ).id_parent_categorie;
    if (event.target.checked) {
      if (!updatedList.includes(value)) updatedList.push(value);
      if (!parentCategorie) {
        updatedList = [
          ...updatedList,
          ...categories
            .filter((catToFilter) => {
              if (
                !updatedList.includes(catToFilter.id_categorie) &&
                catToFilter.id_parent_categorie === value
              ) {
                return true;
              }
              return false;
            })
            .map((cat) => cat.id_categorie),
        ];
      } else if (
        updatedList.filter(
          (categorie) =>
            categories.find((cat) => cat.id_categorie === categorie)
              .id_parent_categorie === parentCategorie
        ).length ===
        categories.filter(
          (categorie) => categorie.id_parent_categorie === parentCategorie
        ).length
      ) {
        updatedList.push(parentCategorie);
      }
    } else {
      if (idea.categories.includes(value))
        updatedList.splice(idea.categories.indexOf(value), 1);
      if (!parentCategorie) {
        categories.forEach((catToFilter) => {
          if (
            updatedList.includes(catToFilter.id_categorie) &&
            categories.find(
              (categorie) => categorie.id_categorie === catToFilter.id_categorie
            ).id_parent_categorie === value
          ) {
            updatedList.splice(
              updatedList.indexOf(catToFilter.id_categorie),
              1
            );
          }
        });
      } else if (updatedList.includes(parentCategorie)) {
        updatedList.splice(updatedList.indexOf(parentCategorie), 1);
      }
    }
    setIdea({ ...idea, categories: updatedList });
  };
  const handleSubmit = (e) => {
    setIsLoading(true);
    if (e) {
      e.preventDefault();
    }
    setErrorField([]);
    const newIdea = { ...idea, problem, solution, gains };
    setIdea(newIdea);
    if (id) {
      const status = finished ? 1 : 0;
      customFetch(`${import.meta.env.VITE_BACKEND_URL}/ideas/${id}`, "PUT", {
        ...newIdea,
        finished_at: finished,
        status,
        assets: [...assetsToReassign, ...assetsToReassignFromEditor],
      })
        .then((response) => {
          if (response.errors) {
            setErrorField(response.errors);
          }
          setIsLoading(false);
          if (finished) {
            navigate(`${import.meta.env.VITE_FRONTEND_URI}/innovation/${id}`);
          }
        })
        .catch(() => setIsLoading(false));
    } else {
      const status = finished ? 1 : 0;
      customFetch(`${import.meta.env.VITE_BACKEND_URL}/ideas`, "POST", {
        ...newIdea,
        finished_at: finished,
        status,
        assets: [...assetsToReassign, ...assetsToReassignFromEditor],
        challenge,
      })
        .then((response) => {
          if (response.errors) {
            setErrorField(response.errors);
            setIsLoading(false);
          } else {
            id = response.id;
            navigate(
              `${import.meta.env.VITE_FRONTEND_URI}/${
                finished ? "innovation" : "edit"
              }/${id}`
            );
            setIsLoading(false);
          }
        })
        .catch(() => {
          setIdea({ ...idea, status: 0 });
          setIsLoading(false);
        });
    }
  };
  const handleDelete = () => {
    if (
      id &&
      ((user.id_user === authorId && idea.status === 0) ||
        (user.perms.manage_ideas_ambassador &&
          user.id_organisation === idea.id_organisation))
    ) {
      customFetch(`${import.meta.env.VITE_BACKEND_URL}/ideas/${id}`, "DELETE")
        .then(() => {
          setIsLoading(false);
          navigate(`${import.meta.env.VITE_FRONTEND_URI}/`);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
          navigate(`${import.meta.env.VITE_FRONTEND_URI}/`);
        });
    }
  };
  const setCoauthors = (coauthors) => {
    setIdea({ ...idea, coauthors });
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      customFetch(`${import.meta.env.VITE_BACKEND_URL}/ideas/${id}`, "GET")
        .then((dataIdea) => {
          const author = dataIdea.authors.find((a) => a.is_author);
          if (!author || author.id_user !== user.id_user) {
            navigate(`${import.meta.env.VITE_FRONTEND_URI}/`);
          } else {
            finished = dataIdea.idea.status !== 0 && dataIdea.idea.status !== 4;
            setIdea({
              ...dataIdea.idea,
              categories: dataIdea.idea.categories ?? [],
              coauthors: dataIdea.authors.filter((a) => !a.is_author),
            });
            setAuthorId(author.id_user ?? user.id_user);
            setIdeaAssets(dataIdea.assets);
            setProblem(dataIdea.idea.problem);
            setSolution(dataIdea.idea.solution);
            setGains(dataIdea.idea.gains);
            setPoster(
              dataIdea.assets.find(
                (asset) => asset.field === 0 && !asset.id_comment
              )
            );
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
        });
    } else {
      setIdea(defaultIdea);
      setAuthorId(user.id_user);
      setIdeaAssets([]);
      setProblem("");
      setSolution("");
      setGains("");
      setPoster();
      setIsLoading(false);
    }
  }, [id]);

  const handleChange = (e) => {
    if (e.target.id === "poster") {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("upload", e.target.files[0]);
      formData.append("field", 0);
      formData.append("description", "");
      customFetch(
        `${import.meta.env.VITE_BACKEND_URL}/assets${id ? `/${id}` : ""}`,
        "POST",
        formData,
        true
      )
        .then((response) => {
          const newAsset = {
            file_name: response.urls.default,
            id_idea: idea.id_idea,
            id_asset: parseInt(response.id_asset, 10),
            id_comment: null,
            size: parseInt(response.size, 10),
            type: response.type,
            field: parseInt(0, 10),
            description: "",
          };
          setAssetsToReassign([...assetsToReassign, newAsset.id_asset]);
          setIsLoading(false);
          setIdeaAssets([...ideaAssets, newAsset]);
          setPoster(newAsset);
          setErrorField([]);
        })
        .catch((err) => {
          setErrorField([
            { msg: "Erreur lors du transfert.", param: "poster" },
            { msg: "Veuillez réessayer.", param: "poster" },
          ]);
          console.warn(err);
          setIsLoading(false);
        });
    } else {
      setIdea({ ...idea, [e.target.id]: e.target.value });
    }
  };

  const imgURL = (ideaAsset, size) => {
    const ext = ideaAsset.file_name.substring(
      ideaAsset.file_name.lastIndexOf(".")
    );
    const fileName = ideaAsset.file_name.replace(ext, "");
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/idea_${id}/${fileName}${
      size ? `-${size}` : ""
    }${ext}`;
  };

  const finishing = () => {
    finished = true;
    handleSubmit();
    setIdea({ ...idea, status: 1 });
  };

  return (
    <main className="container mx-auto my-3 p-0">
      <h1 className="display-1">
        <i className="icons-document icons-size-3x mx-2" aria-hidden="true" />
        {id !== undefined ? (
          <>
            Edition de l'innovation <b>{idea.name}</b>
          </>
        ) : (
          "Nouvelle innovation"
        )}
      </h1>
      <form
        className={`d-flex flex-column justify-content-center rounded w-100 p-0 px-3 m-0 mb-2 ${
          darkMode === 0 ? "bg-white" : ""
        }`}
        style={{
          backgroundColor: `${darkMode === 2 ? "#4d4f53" : ""}${
            darkMode === 1 ? "#e9e9e9" : ""
          }`,
        }}
        onSubmit={handleSubmit}
      >
        <UserSearchSelect
          label="Co-auteurs"
          users={idea.coauthors}
          setUsers={setCoauthors}
        />
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded pt-3 px-3 my-2`}
        >
          <Text
            label="Nom de l'innovation"
            id="name"
            placeholder="Entrez le nom de votre innovation ici"
            value={idea.name}
            onChange={handleChange}
            readonly={finished || idea.status > 0}
            required
            errorMessages={
              errorField
                ? errorField.filter((error) => error.param === "name")
                : []
            }
            maxChars="80"
          />
        </div>
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded pt-3 px-3 my-2`}
        >
          <Text
            label="Courte description"
            id="description"
            placeholder="Entrez ici une courte description de votre innovation"
            value={idea.description}
            onChange={handleChange}
            required
            readonly={finished || idea.status > 0}
            errorMessages={
              errorField
                ? errorField.filter((error) => error.param === "description")
                : []
            }
            maxChars="160"
          />
        </div>
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded py-3 px-3 my-2`}
        >
          <label htmlFor="poster">Bannière de l'innovation</label>

          {poster ? (
            <div
              className="row justify-content-center align-items-center"
              style={{ maxHeight: "150px" }}
            >
              <img
                alt="bannière"
                src={`${import.meta.env.VITE_BACKEND_URL}/uploads/idea_${id}/${
                  poster.file_name
                }`}
                srcSet={`${imgURL(poster, "150")} w150, ${imgURL(
                  poster,
                  "300"
                )} w300, ${imgURL(poster, "800")} w800, ${imgURL(
                  poster,
                  "1080"
                )} w1080`}
                style={{
                  maxHeight: "150px",
                  width: "100%",
                  objectFit: "cover",
                  objectPosition: "center center",
                }}
              />
            </div>
          ) : (
            ""
          )}
          <div
            className={`form-control-container ${
              errorField &&
              errorField.filter((error) => error.param === "poster").length
                ? " is-invalid"
                : ""
            }`}
          />
          <div className="custom-file my-2 py-2">
            <input
              type="file"
              className="custom-file-input"
              value=""
              onChange={handleChange}
              accept="image/png, image/jpeg, image/heif, image/bmp, image/tiff"
              id="poster"
            />
            <label
              className="custom-file-label text-left pl-3"
              htmlFor="poster"
            >
              {poster
                ? poster.file_name.replace(
                    /[\w|\d]{8}-[\w|\d]{4}-[\w|\d]{4}-[\w|\d]{4}-[\w|\d]{12,13}-/g,
                    ""
                  )
                : "Aucun fichier sélectionné"}
            </label>
          </div>
          <span className="form-control-state" />
          <div
            className="invalid-feedback pb-4"
            id="poster_error"
            style={{
              display:
                errorField &&
                errorField.filter((error) => error.param === "poster").length
                  ? "block"
                  : "none",
            }}
          >
            {errorField
              ? errorField
                  .filter((error) => error.param === "poster")
                  .map((err) => <div key={err.msg}>{err.msg}</div>)
              : ""}
          </div>
          <span>
            Note: le traitement de l'images prendra quelques instants.
          </span>
        </div>
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded py-3 px-3 my-2`}
        >
          <Textarea
            label="Description de la problèmatique"
            id="problem"
            placeholder="Taper la description de votre problème"
            value={idea.problem}
            onChange={(e) => setProblem(e.target.value)}
            readonly={finished || idea.status > 0}
            useAdvancedEditor
            extraData={{ id_idea: id, field: 1 }}
            setAssetsToReassign={setAssetsToReassignFromEditor}
            errorMessages={
              errorField
                ? errorField.filter((error) => error.param === "problem")
                : []
            }
          />
          <FilesAndUploads
            field={1}
            idIdeaAuthor={authorId}
            ideaAssets={ideaAssets}
            setIdeaAssets={setIdeaAssets}
            assetsToReassign={assetsToReassign}
            setAssetsToReassign={setAssetsToReassign}
            idea={idea}
            imageModalRef={imageModalRef}
          />
        </div>
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded py-3 px-3 my-2`}
        >
          <Textarea
            label="Solution proposée"
            id="solution"
            placeholder="Expliquez ici votre solution"
            value={idea.solution}
            onChange={(e) => setSolution(e.target.value)}
            readonly={finished || idea.status > 0}
            useAdvancedEditor
            extraData={{ id_idea: id, field: 2 }}
            setAssetsToReassign={setAssetsToReassignFromEditor}
            errorMessages={
              errorField
                ? errorField.filter((error) => error.param === "solution")
                : []
            }
          />
          <FilesAndUploads
            field={2}
            idIdeaAuthor={authorId}
            ideaAssets={ideaAssets}
            setIdeaAssets={setIdeaAssets}
            assetsToReassign={assetsToReassign}
            setAssetsToReassign={setAssetsToReassign}
            idea={idea}
            imageModalRef={imageModalRef}
          />
        </div>
        <div
          className={`${
            darkMode < 2 ? "bg-light" : "bg-dark"
          } rounded py-3 px-3 my-2`}
        >
          <Textarea
            label="Gains attendus ou constatés"
            id="gains"
            placeholder="Expliquez maintenant les gains potentiels ou constatés de votre solution"
            value={idea.gains}
            onChange={(e) => setGains(e.target.value)}
            readonly={finished || idea.status > 0}
            useAdvancedEditor
            extraData={{ id_idea: id, field: 3 }}
            setAssetsToReassign={setAssetsToReassignFromEditor}
            errorMessages={
              errorField
                ? errorField.filter((error) => error.param === "gains")
                : []
            }
          />
          <FilesAndUploads
            field={3}
            idIdeaAuthor={authorId}
            ideaAssets={ideaAssets}
            setIdeaAssets={setIdeaAssets}
            assetsToReassign={assetsToReassign}
            setAssetsToReassign={setAssetsToReassign}
            idea={idea}
            imageModalRef={imageModalRef}
          />
        </div>
        <Selector
          onChange={handleCheck}
          selectedValues={idea.categories}
          values={categories.map((data) => {
            return {
              id: data.id_categorie,
              name: data.name,
              id_parent: data.id_parent_categorie,
            };
          })}
          label="Catégories associées:"
          id="categorie_selector"
          className={`${
            darkMode < 2 ? "bg-light" : "bg-gray-dark"
          } rounded p-3 my-2`}
          errorMessages={
            errorField
              ? errorField.filter((error) => error.param === "categories")
              : []
          }
        />
        <div className="d-flex w-100 flex-column flex-md-row justify-content-center justify-content-md-end float-md-right m-0 py-3 width1">
          <button
            type="submit"
            className={`btn btn-${darkMode === 0 ? "warning" : "primary"} m-3`}
            disabled={finished || (idea.status !== 0 && idea.status !== 4)}
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={finishing}
            id="finished"
            className={`btn btn-${darkMode === 0 ? "warning" : "primary"} m-3`}
            disabled={finished || (idea.status !== 0 && idea.status !== 4)}
          >
            Enregistrer et finaliser
          </button>
          {id &&
          ((user.id_user === authorId && idea.status === 0) ||
            (user.perms.manage_ideas_manager &&
              user.id_organisation === idea.id_organisation)) ? (
            <>
              <button
                data-toggle="modal"
                data-target="#deleteModal"
                type="button"
                id="finished"
                className="btn btn-danger m-3"
              >
                Supprimer
              </button>
              <div
                className="modal fade"
                id="deleteModal"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="deleteModalLabel"
                aria-hidden="true"
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="h1 modal-title" id="deleteModalLabel">
                        Suppression d'une innovation
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
                    <div className="modal-body">
                      Êtes-vous certain de vouloir supprimer cette innovation ?
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-dismiss="modal"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="btn btn-danger"
                        data-dismiss="modal"
                      >
                        Suppression définitive
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            ""
          )}
        </div>
        <div
          className="modal fade bd-example-modal-lg"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="myLargeModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content text-center"
              style={{ background: "transparent" }}
            >
              <img
                ref={imageModalRef}
                id="modalImage"
                src=""
                srcSet=""
                alt={`Visuel lié à l'innovation ${idea.name}`}
                className="rounded my-auto mx-auto img-fluid"
              />
              <button
                className="btn btn-warning rounded p-2 position-absolute"
                style={{ top: 15, right: 15 }}
                type="button"
                onClick={() =>
                  window.open(imageModalRef.current.src, "_blank").focus()
                }
              >
                <i
                  className="icons-external-link icons-size-25px"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

export default InnovationEdit;
