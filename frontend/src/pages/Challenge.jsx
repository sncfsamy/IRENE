import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import IdeaList from "@components/IdeasList";
import SharedContext from "../contexts/sharedContext";
import challengeDefaultImage from "../assets/challenge.heif";

export default function Challenge() {
  const [challenge, setChallenge] = useState();
  const { id } = useParams();
  const { customFetch, setIsLoading, darkMode } = useContext(SharedContext);
  const imageModalRef = useRef(null);

  const imgURL = (ideaAsset, size) => {
    const ext = ideaAsset.file_name.substring(
      ideaAsset.file_name.lastIndexOf(".")
    );
    const fileName = ideaAsset.file_name.replace(ext, "");
    return `${
      import.meta.env.VITE_BACKEND_URL
    }/uploads/challenges/challenge_${id}/${encodeURIComponent(fileName)}${
      size ? `-${size}` : ""
    }${ext}`;
  };
  const now = new Date(Date.now()).getTime() / 1000;
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      customFetch(`${import.meta.env.VITE_BACKEND_URL}/challenges/${id}`)
        .then((data) => {
          const challengeData = { ...data[0] };
          challengeData.authors = [];
          if (typeof challengeData.challengers === "string") {
            challengeData.challengers = JSON.parse(challengeData.challengers);
          }
          if (typeof challengeData.poster === "string") {
            challengeData.poster = JSON.parse(challengeData.poster);
          }
          if (challengeData.challengers.length) {
            challengeData.challengers.forEach((idea) =>
              idea.authors.forEach((author) =>
                challengeData.authors.push(author)
              )
            );
          }
          setChallenge(challengeData);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, []);
  return challenge ? (
    <main className="container p-3">
      <h1 className="display-1">
        <i
          className="icons-large-suitcase icons-size-3x mx-2"
          aria-hidden="true"
        />
        Challenge innovation: {challenge.name}
      </h1>
      <div
        className={`d-flex flex-column justify-content-center rounded w-100 p-0 px-0 m-0 mb-2 ${
          darkMode === 0 ? "bg-white" : ""
        }`}
        style={{
          backgroundColor: `${darkMode === 2 ? "#4d4f53" : ""}${
            darkMode === 1 ? "#e9e9e9" : ""
          }`,
        }}
      >
        <img
          className="rounded-top"
          alt={`Challenge ${challenge.name}`}
          style={{
            maxHeight: "250px",
            width: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
          src={
            challenge.poster
              ? `${
                  import.meta.env.VITE_BACKEND_URL
                }/uploads/challenges/challenge_${
                  challenge.id_challenge
                }/${encodeURIComponent(challenge.poster.file_name)}`
              : challengeDefaultImage
          }
          srcSet={
            challenge.poster
              ? `${imgURL(challenge.poster, "150")} w150, ${imgURL(
                  challenge.poster,
                  "300"
                )} w300, ${imgURL(challenge.poster, "800")} w800, ${imgURL(
                  challenge.poster,
                  "1080"
                )} w1080`
              : undefined
          }
        />
        <div className="p-3">
          <p
            dangerouslySetInnerHTML={{
              __html: challenge.description.replaceAll(
                "<img src=",
                '<img class="rounded img-fluid" style="cursor: zoom-in;" data-toggle="modal" data-target=".bd-example-modal-lg" onClick="document.getElementById(\'modalImage\').src=this.src; document.getElementById(\'modalImage\').srcset=this.srcset;" src='
              ),
            }}
          />
          {challenge.challengers && challenge.challengers.length ? (
            <div className="py-2">
              <h2>
                {`Idée${
                  challenge.challengers.length > 1 ? "s" : ""
                } participante${challenge.challengers.length > 1 ? "s" : ""}`}
                :
              </h2>
              <IdeaList
                id="selected"
                ideas={challenge.challengers.map((challenger) => {
                  return { ...challenger, authors: undefined };
                })}
                authors={challenge.authors || []}
              />
            </div>
          ) : (
            ""
          )}
          {challenge.challengers &&
          challenge.challengers.filter((challenger) => challenger.selected)
            .length ? (
            <div className="py-2">
              <h2>
                {`Idée${
                  challenge.challengers.filter(
                    (challenger) => challenger.selected
                  ).length > 1
                    ? "s"
                    : ""
                } sélectionnée${
                  challenge.challengers.filter(
                    (challenger) => challenger.selected
                  ).length > 1
                    ? "s"
                    : ""
                }`}
                :
              </h2>
              <IdeaList
                id="selected"
                ideas={challenge.challengers
                  .filter((challenger) => challenger.selected)
                  .map((challenger) => {
                    return { ...challenger, authors: undefined };
                  })}
                authors={challenge.authors || []}
              />
            </div>
          ) : (
            ""
          )}
          {challenge.challengers &&
          challenge.challengers.filter((challenger) => challenger.winner)
            .length ? (
            <div className="py-2">
              <h2>
                {`Idée${
                  challenge.challengers.filter(
                    (challenger) => challenger.winner
                  ).length > 1
                    ? "s"
                    : ""
                } vainqueur${
                  challenge.challengers.filter(
                    (challenger) => challenger.winner
                  ).length > 1
                    ? "s"
                    : ""
                }`}
                :
              </h2>
              <IdeaList
                id="winners"
                ideas={challenge.challengers
                  .filter((challenger) => challenger.winner)
                  .map((challenger) => {
                    return { ...challenger, authors: undefined };
                  })}
                authors={challenge.authors || []}
              />
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="d-flex p-4">
          {challenge.started_at < now && challenge.expired_at > now ? (
            <>
              Vous avez une idée répondant à ce challenge et vous souhaitez y
              participer ? Alors cliquez sur le bouton !
              <Link
                to={`${import.meta.env.VITE_FRONTEND_URI}/edit?challenge=${
                  challenge.id_challenge
                }`}
                className="my-auto mx-auto btn btn-success"
              >
                J'ai une idée !
              </Link>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
      <div
        className="modal fade bd-example-modal-lg"
        tabIndex="-1"
        role="dialog"
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
              alt={`Visuel au challenge ${challenge.name}`}
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
    </main>
  ) : (
    <main />
  );
}
