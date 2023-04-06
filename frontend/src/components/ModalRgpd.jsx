import { PropTypes } from "prop-types";
import React, { useContext, useState } from "react";
import SharedContext from "../contexts/sharedContext";

export default function ModalRgpd({ setUser }) {
  const { user, setIsLoading, customFetch } = useContext(SharedContext);
  const [rgpd, setRgpd] = useState(user.rgpd_agreement);
  const handleClick = () => {
    setIsLoading(true);
    customFetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/${user.id_user}`,
      "PUT",
      { rgpd_agreement: true }
    )
      .then(() => {
        setUser({ ...user, rgpd_agreement: true });
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        setIsLoading(true);
      });
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel4"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        role="document"
        style={{ maxWidth: "90%" }}
      >
        <div className="modal-content w-100 p-2">
          <div className="modal-header">
            <h5 className="h1 modal-title" id="exampleModalLabel4">
              Consentement RGPD
            </h5>
          </div>
          <div className="modal-body">
            <p className="text-justify">
              Les informations recueillies sur ce formulaire sont enregistrées
              dans un fichier informatisé par IRENE pour diffusion interne à
              l'entreprise. La base légale du traitement est le consentement,le
              contrat, l'obligation légale, l'interêt public, les interêts
              legitimes. Les données collectées seront communiquées aux seuls
              destinataires suivants : SNCF. Les données sont conservées pendant
              3ans. Vous pouvez accéder aux données vous concernant, les
              rectifier, demander leur effacement ou exercer votre droit à la
              limitation du traitement de vos données. (en fonction de la base
              légale du traitement, mentionner également : Vous pouvez retirer à
              tout moment votre consentement au traitement de vos données ; Vous
              pouvez également vous opposer au traitement de vos données ; Vous
              pouvez également exercer votre droit à la portabilité de vos
              données). Consultez le site cnil.fr pour plus d’informations sur
              vos droits. Pour exercer ces droits ou pour toute question sur le
              traitement de vos données dans ce dispositif, vous pouvez
              contacter (le cas échéant, notre délégué à la protection des
              données ou le service chargé de l’exercice de ces droits) :
              contact@irene.fr. Si vous estimez, après nous avoir contactés, que
              vos droits « Informatique et Libertés » ne sont pas respectés,
              vous pouvez adresser une réclamation à la CNIL.
            </p>
          </div>
          <div className="modal-footer">
            <div className="col">
              <div className="custom-control custom-checkbox row ">
                <input
                  type="checkbox"
                  name="exampleCheckbox1"
                  className="custom-control-input"
                  id="exampleCheckbox1"
                  checked={rgpd}
                  onChange={(e) => setRgpd(e.target.checked)}
                />
                <label
                  className="custom-control-label"
                  htmlFor="exampleCheckbox1"
                >
                  Je reconnais avoir pris connaissance et accepter les
                  Conditions Genérales d'Utilisation ci-dessus, au service
                  auquel je souscris.
                </label>
              </div>
              <div className="row m-3 float-sm-right text-center">
                <button
                  type="button"
                  className="btn btn-warning m-bottom"
                  onClick={handleClick}
                  disabled={!rgpd}
                >
                  Accepter les conditions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ModalRgpd.propTypes = {
  setUser: PropTypes.func,
};
ModalRgpd.defaultProps = {
  setUser: null,
};
