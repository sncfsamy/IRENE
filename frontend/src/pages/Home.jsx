import React, { useContext, useEffect, useState } from "react";
import IdeaList from "@components/IdeasList";
import SharedContext from "../contexts/sharedContext";
import logo from "../assets/logo.png";
import logo_dark from "../assets/logo_dark.png";
import challenge from "../assets/challenge.heif";
import Random1 from "../assets/pepper.jpg";
import Random2 from "../assets/gare_nantes.jpg";
import Random3 from "../assets/regiolis_hydrogene.jpg";

const defaultIdeas = { ideas: [], coauthors: [], users: [] };
export default function Home() {
  const { token, baseURL, setIsLoading, user, darkMode } = useContext(SharedContext);
  const [myIdeas, setMyIdeas] = useState(defaultIdeas);
  const [myOrganisationIdeas, setMyOrganisationIdeas] = useState(defaultIdeas);
  const [lastIdeas, setLastIdeas] = useState(defaultIdeas);
  useEffect(() => {
    if (token) {
      Promise.all([
        fetch(`${baseURL}/ideas?user_id=${user.id}&limit=3`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json()),
        fetch(
          `${baseURL}/ideas?organisation_id=${user.organisation_id}&limit=3`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((res) => res.json()),
        fetch(`${baseURL}/ideas/?limit=3`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json()),
      ])
        .then(([my, org, last]) => {
          setLastIdeas(last);
          setMyOrganisationIdeas(org);
          setMyIdeas(my);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn(err);
          setIsLoading(false);
        });
    }
  }, [token]);

  return (
    <main className="container p-3">
      <div className="d-flex">
        <div className="text-center">
          <img
            src={darkMode===1 ? logo_dark : logo}
            alt="logo"
            className=" d-none d-sm-block "
            style={({ height: 170 }, { width: 170 })}
          />
        </div>
        <div
          className="text-center bg-gray-dark w-100 rounded p-1 m-1"
          style={{ height: 170 }}
        >
          <img src={challenge} alt="logo" className="img-fluid h-100" />
        </div>
      </div>
      <div className="d-flex flex-column flex-lg-row h-100">
        <div className="d-flex flex-row flex-lg-column p-1 w-lg-25" style={{ minHeight: 90 }}>
          <div
            style={{ background: `center / cover no-repeat url('${Random1}')` }}
            className="w-100 rounded d-inline"
          >
          <img src={Random1} alt="Décoration 1" className="d-none d-lg-block img-fluid" /></div>
          <div
            style={{ background: `center / cover no-repeat url('${Random2}')` }}
            className="w-100 rounded d-inline"
          >
          <img src={Random2} alt="Décoration 2" className="d-none d-lg-block img-fluid" /></div>
          <div
            style={{ background: `center / cover no-repeat url('${Random3}')` }}
            className="w-100 rounded d-inline"
          >
          <img src={Random3} alt="Décoration 3" className="d-none d-lg-block img-fluid" /></div>
        </div>
        <div className="d-flex flex-column h-100 w-100 text-center">
          <div className={`${darkMode===2 ? "bg-gray" : "bg-light"} rounded p-1 m-1`}>
            <h1>Mes dernières innovations</h1>
            <IdeaList
              ideas={myIdeas.ideas}
              coauthors={myIdeas.coauthors}
              users={myIdeas.users}
            />
          </div>
          <div className={`${darkMode===2 ? "bg-gray" : "bg-light"} rounded p-1 m-1`}>
            <h1>Les innovations de l'établissement</h1>
            <IdeaList
              ideas={myOrganisationIdeas.ideas}
              coauthors={myOrganisationIdeas.coauthors}
              users={myOrganisationIdeas.users}
            />
          </div>
          <div className={`${darkMode===2 ? "bg-gray" : "bg-light"} rounded p-1 m-1`}>
            <h1>Les dernières innovations</h1>
            <IdeaList
              ideas={lastIdeas.ideas}
              coauthors={lastIdeas.coauthors}
              users={lastIdeas.users}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
