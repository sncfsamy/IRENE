const AbstractManager = require("./AbstractManager");

class VoteManager extends AbstractManager {
  constructor() {
    super({ table: "vote" });
    this.idea_table = "idea";
  }

  addVote(id_user, id_idea, note) {
    return this.database.query(`UPDATE ${this.idea_table} SET note = note + ? WHERE id_idea = ? AND (SELECT COUNT(*) FROM ${this.table} WHERE id_user = ? AND id_idea = ?) = 0`,
    [
      note,
      id_idea,
      id_user,
      id_idea
    ]);
  }

  addNote() {
    return this.database.query(`INSERT INTO ${this.table} (id_user, id_idea) VALUES (?, ?)`, [
      id_user,
      id_idea
    ]);
  }
}

module.exports = VoteManager;
