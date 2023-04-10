import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import IdeaList from "@components/IdeasList";
import ChallengesSlider from "@components/ChallengeSlider";
import logoIrene from "@assets/logo.heif";
import logoIreneDark from "@assets/logo_dark.heif";
import challenge from "@assets/challenge.heif";
import pepper from "@assets/pepper-300.heif";
import pepper150 from "@assets/pepper-150.heif";
import gareNantes from "@assets/gare_nantes-300.heif";
import gareNantes150 from "@assets/gare_nantes-150.heif";
import regiolisHydrogene from "@assets/regiolis_hydrogene-300.heif";
import regiolisHydrogene150 from "@assets/regiolis_hydrogene-150.heif";
import rails from "@assets/rails-300.heif";
import rails150 from "@assets/rails-150.heif";
import SharedContext from "../contexts/sharedContext";

const defaultIdeas = { ideas: [], authors: [] };
export default function Home() {
  const { isLogged, setIsLoading, user, darkMode, customFetch } =
    useContext(SharedContext);
  const [myIdeas, setMyIdeas] = useState(defaultIdeas);
  const [myOrganisationIdeas, setMyOrganisationIdeas] = useState(defaultIdeas);
  const [lastIdeas, setLastIdeas] = useState(defaultIdeas);
  const [challenges, setChallenges] = useState([]);
  useEffect(() => {
    if (isLogged && user && user.id_user) {
      Promise.all([
        customFetch(
          `${import.meta.env.VITE_BACKEND_URL}/ideas?users=${
            user.id_user
          }&limit=3`,
          "GET"
        ),
        customFetch(
          `${import.meta.env.VITE_BACKEND_URL}/ideas?organisations=${
            user.id_organisation
          }&limit=3`,
          "GET"
        ),
        customFetch(
          `${import.meta.env.VITE_BACKEND_URL}/ideas/?limit=3`,
          "GET"
        ),
        customFetch(
          `${import.meta.env.VITE_BACKEND_URL}/challenges?organisations=${
            user.id_organisation
          }&limit=3`,
          "GET"
        ),
      ])
        .then(
          ([
            myIdeasData,
            organisationIdeasData,
            lastIdeasData,
            challengesData,
          ]) => {
            setLastIdeas(lastIdeasData);
            setMyOrganisationIdeas(organisationIdeasData);
            setMyIdeas(myIdeasData);
            const newChallenges = [...challengesData];
            for (let i = 0; i < newChallenges.length; i += 1) {
              if (typeof newChallenges[i].challengers === "string") {
                newChallenges[i].challengers = JSON.parse(
                  newChallenges[i].challengers
                );
              }
              if (typeof newChallenges[i].poster === "string") {
                newChallenges[i].poster = JSON.parse(newChallenges[i].poster);
              }
            }
            setChallenges(newChallenges);
            setIsLoading(false);
          }
        )
        .catch((err) => {
          console.warn(err);
          setIsLoading(false);
        });
    }
  }, [isLogged, user]);

  return (
    <main className="container p-3">
      <div className="d-flex flex-fill">
        <div className="text-center">
          <img
            src={darkMode === 1 ? logoIreneDark : logoIrene}
            alt="logo"
            className=" d-none d-sm-block "
            style={({ height: 170 }, { width: 170 })}
          />
        </div>
        <div
          className="text-center bg-gray-dark w-100 rounded p-1 m-1"
          style={{ height: 170 }}
        >
          {challenges && challenges.length ? (
            <ChallengesSlider challenges={challenges} />
          ) : (
            <img src={challenge} alt="logo" className="img-fluid h-100" />
          )}
        </div>
      </div>
      <div className="d-flex flex-column flex-fill flex-grow-1 flex-lg-row h-100 w-auto">
        <div
          className="d-flex flex-row flex-lg-column flex-fill h-100 w-100 p-1 flex-grow-1"
          style={{ minHeight: 90 }}
        >
          <div
            style={{ background: `center / cover no-repeat url('${pepper}')` }}
            className="w-100 d-inline home-image1-div flex-grow-1"
          >
            <img
              src={pepper}
              srcSet={`${pepper150} 150w,${pepper} 300w`}
              alt="Pepper: androïde d'assistance client SNCF"
              className="d-none d-lg-block w-100 home-image1 flex-grow-1"
            />
          </div>
          <div
            style={{
              background: `center / cover no-repeat url('${gareNantes}')`,
            }}
            className="w-100 d-inline"
          >
            <img
              src={gareNantes}
              srcSet={`${gareNantes150} 150w,${gareNantes} 300w`}
              alt="Nouvelle gare de Nantes"
              className="d-none d-lg-block w-100"
            />
          </div>
          <div
            style={{
              background: `center / cover no-repeat url('${regiolisHydrogene}')`,
            }}
            className="w-100 d-inline home-image3-div"
          >
            <img
              src={regiolisHydrogene}
              srcSet={`${regiolisHydrogene150} 150w,${regiolisHydrogene} 300w`}
              alt="TER régiolis à l'hydrogène"
              className="d-none d-lg-block w-100 home-image3"
            />
          </div>
          <div
            style={{ background: `center / cover no-repeat url('${rails}')` }}
            className="w-100 d-none d-lg-inline rounded-bottom"
          >
            <img
              src={rails}
              srcSet={`${rails150} 150w,${rails} 300w`}
              alt="Rails. Crédit prise de vue : JC Milhet / Fret SNCF"
              className="d-none d-lg-block w-100 rounded-bottom"
            />
          </div>
        </div>
        <div className="d-flex flex-column justify-content-between">
          <div
            className={`${
              darkMode === 2 ? "bg-gray" : "bg-light"
            } rounded p-1 m-1 h-100 d-flex flex-column`}
          >
            <Link
              to={`${import.meta.env.VITE_FRONTEND_URI}/search?users=${
                user.id_user
              }`}
            >
              <h1 className="my-ideas text-center">
                Mes dernières innovations
              </h1>
            </Link>
            <IdeaList ideas={myIdeas.ideas} authors={myIdeas.authors} />
            <div className="flex-grow-1 d-flex justify-content-center align-items-center p-2">
              <span className="text-center">
                Toutes vos dernières innovations s'
                {myIdeas.ideas.length ? "affichent" : "afficheront"} ici.
                {myIdeas.ideas.length ? (
                  <>
                    <br />
                    Si vous souhaitez accéder aux plus anciennes,{" "}
                    <Link
                      to={`${import.meta.env.VITE_FRONTEND_URI}/search?users=${
                        user.id_user
                      }`}
                    >
                      cliquez-ici
                    </Link>{" "}
                    ou bien sur "Mes dernières innovations".
                  </>
                ) : (
                  ""
                )}
              </span>
            </div>
          </div>
          <div
            className={`${
              darkMode === 2 ? "bg-gray" : "bg-light"
            } rounded p-1 m-1 h-100 d-flex flex-column`}
          >
            <Link
              to={`${import.meta.env.VITE_FRONTEND_URI}/search?organisations=${
                user.id_organisation
              }`}
            >
              <h1 className="my-organisation-ideas text-center">
                Les innovations de l'établissement
              </h1>
            </Link>
            <IdeaList
              ideas={myOrganisationIdeas.ideas}
              authors={myOrganisationIdeas.authors}
            />
            <div className="flex-grow-1 d-flex justify-content-center align-items-center p-2">
              <span className="text-center">
                Les dernières innovations déposées par tous les innovateurs de
                votre établissement s'
                {myOrganisationIdeas.ideas.length
                  ? "affichent"
                  : "afficheront"}{" "}
                ici.{" "}
                {myOrganisationIdeas.ideas.length ? (
                  <>
                    Si vous souhaitez accéder aux plus anciennes,{" "}
                    <Link
                      to={`${
                        import.meta.env.VITE_FRONTEND_URI
                      }/search?organisations=${user.id_organisation}`}
                    >
                      cliquez-ici
                    </Link>{" "}
                    ou bien sur "Les innovations de l'établissement".
                  </>
                ) : (
                  ""
                )}
              </span>
            </div>
          </div>

          <div
            className={`${
              darkMode === 2 ? "bg-gray" : "bg-light"
            } rounded p-1 m-1 h-100 d-flex flex-column`}
          >
            <Link to={`${import.meta.env.VITE_FRONTEND_URI}/search`}>
              <h1 className="last-ideas text-center">
                Les dernières innovations
              </h1>
            </Link>
            <IdeaList ideas={lastIdeas.ideas} authors={lastIdeas.authors} />
            <div className="flex-grow-1 d-flex justify-content-center align-items-center p-2">
              <span className="text-center">
                Les dernières innovations, tout établissements confondus s'
                {lastIdeas.ideas.length ? "affichent" : "afficheront"} ici.
                {lastIdeas.ideas.length ? (
                  <>
                    <br /> Si vous souhaitez accéder aux plus anciennes,{" "}
                    <Link to={`${import.meta.env.VITE_FRONTEND_URI}/search`}>
                      cliquez-ici
                    </Link>{" "}
                    ou bien sur "Les dernières innovations".
                  </>
                ) : (
                  ""
                )}
              </span>
            </div>
          </div>
          <div
            className={`${
              darkMode === 2 ? "bg-gray" : "bg-light"
            } rounded p-4 m-1 h-100 d-none d-xl-flex align-items-center`}
          >
            <blockquote className="blockquote text-center p-4">
              <p>
                Nous inventons, aujourd’hui, le système ferroviaire de demain,
                plus fiable et encore plus décarboné, pour faciliter vos voyages
                et l’activité des chargeurs dans tous les territoires.
              </p>
              <footer className="blockquote-footer">
                sncf.com {" - "}
                <cite title="Source Title">Innovation & recherche</cite>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </main>
  );
}
