import { Link } from "react-router-dom";
import logo from "../assets/logo_irene.heif";

export default function About() {
  return (
    <div className="container m-5 mx-auto p-3 pt-5 bg-dark text-light text-justify rounded">
      <Link to={`${import.meta.env.VITE_FRONTEND_URI}`}>
        <img
          className="img mx-auto d-block vh-10 w-auto"
          src={logo}
          alt="Logo"
        />
      </Link>
      <h1 className="text-center font-weight-bold mb-5 text-cyan">
        A propos d'IRENE :
      </h1>
      <p>
        Nous sommes Samy, Danyel, Vincent et Margaux, nous avons fait le choix
        d’apporter des évolutions d’une plateforme interne à notre entreprise
        qui aujourd’hui s’appelle Léonard.
      </p>
      <h2 className="text-cyan">Mais qui est Léonard ?</h2>{" "}
      <p>
        Léonard est né en 2013, c’est une plateforme qui permet de recenser les
        innovations participatives du groupe SNCF. C’est une démarche qui
        sollicite l’intelligence collective et valorise la contribution de
        chacun. Une idée sur deux est mise en œuvre avec succès.
      </p>{" "}
      <p>
        {" "}
        L’innovation participative est, pour le fleuron français du transport,
        un levier de création de valeur et un élément fort de l’expérience
        collaborateur.
      </p>{" "}
      <p>
        Victime de son succès, chaque année Léonard enregistre près de 11000
        idées qui sont proposées par plus de 9000 salariés.
      </p>{" "}
      <p>
        {" "}
        Après 10 ans d’utilisation, salariés et ambassadeurs, se sont rendus
        compte que des évolutions doivent être effectuées pour rendre la
        plateforme pérenne.{" "}
      </p>{" "}
      <p>
        {" "}
        Le projet IRENE (Innovation Recherche Elaboration Nouveauté Entraide) a
        toujours pour objectif de recenser les innovations participatives du
        groupe SNCF ainsi qu’effectuer un recensement des compétences sur la
        base du volontariat.{" "}
      </p>{" "}
      <h2 className="text-cyan"> Les points forts d'IRENE ? </h2>{" "}
      <p>
        {" "}
        L’entraide: J’ai une innovation en tête mais je n’ai pas toutes les
        compétences nécessaires pour la développer. Grace à la plateforme IRENE,
        je vais pouvoir rechercher une compétence que dispose un ou plusieurs de
        mes collègues afin de mener à bien la concrétisation de mon idée.{" "}
      </p>{" "}
      <p>
        Un autre point évolutif que dispose IRENE est le filtre de recherche. En
        effet, je peux consulter librement les innovations déposées sur IRENE et
        je peux appliquer des filtres de recherches afin de recenser au mieux
        les innovations succeptibles de m'intéresser.{" "}
      </p>{" "}
      <p>
        L'inscription à la newsletter mensuelle d'IRENE qui m'enverra toutes les
        nouvelles innovations concernant les catégories qui m'intéressent.{" "}
      </p>
      <h2 className="text-cyan">Agréable visite.</h2>
    </div>
  );
}
