const AbstractManager = require("./AbstractManager");

class NoteManager extends AbstractManager {
  constructor() {
    super({ table: "note" });
    this.idea_table = "idea";
  }

  addNote(idUser, idIdea, note) {
    return this.database.query(
      `UPDATE ${this.idea_table} SET note = note + ? WHERE id_idea = ? AND (SELECT COUNT(*) FROM ${this.table} WHERE id_user = ? AND id_idea = ?) = 0`,
      [note, idIdea, idUser, idIdea]
    );
  }

  addNoteUser(idUser, idIdea) {
    return this.database.query(
      `INSERT INTO ${this.table} (id_user, id_idea) VALUES (?, ?)`,
      [idUser, idIdea]
    );
  }
}

module.exports = NoteManager;
