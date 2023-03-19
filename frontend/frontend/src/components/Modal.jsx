function Modal() {
  return (
    <div>
      <button
        type="button"
        className="btn btn-link text-dark mp-5"
        data-toggle="modal"
        data-target="#modal"
      >
        Besoin d'aide
      </button>

      <div
        className="modal fade"
        tabIndex="-1"
        id="modal"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="h1 modal-title" id="modalLabel">
                Nous contacter
              </h5>
            </div>
            <div className="modal-body text-secondary">
              {" "}
              Posez votre question à l'adresse e-mail: contact@irene.fr.
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary w-75 m-auto"
                data-dismiss="modal"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
