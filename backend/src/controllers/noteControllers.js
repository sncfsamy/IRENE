const models = require("../models");

const note = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userNote = parseInt(req.body.note, 10);
  models.note
    .addNote(req.payload.sub, id, userNote)
    .then(([results]) => {
      if (results.affectedRows) {
        models.note
          .addNoteUser(req.payload.sub, id)
          .then(([addNoteUserResults]) => {
            if (addNoteUserResults.affectedRows) res.sendStatus(204);
            else res.sendStatus(409);
          })
          .catch((err) => {
            console.warn("noteController:note:addNoteUser: ", err);
            res.sendStatus(500);
          });
      } else res.sendStatus(404);
    })
    .catch((err) => {
      console.warn("noteController:note:addNote: ", err);
      res.sendStatus(500);
    });
};

module.exports = {
  note,
};
