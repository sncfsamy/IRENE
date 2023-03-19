import Modal from "../components/Modal";

export default function Documents() {
  return (
    <div className="container rounded m-3 mx-auto p-4 bg-light">
      <ul>
        <li>Lien vers Supports documentaires</li>
        <li>Lien vers Guides Utilisateurs</li>
        <li>Lien vers Conditions Générales d'Utilisation</li>
        <li>Lien vers Mention d’information données personnelles</li>
        <li>Lien vers Mentions Légales</li>
        <li>Lien vers FAQ Irène</li>
        <Modal />
      </ul>
    </div>
  );
}
