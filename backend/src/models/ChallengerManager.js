const AbstractManager = require("./AbstractManager");

class ChallengerManager extends AbstractManager {
  constructor() {
    super({ table: "challenger", id: "id_challenge" });
  }

  insert(idIdea, idChallenge) {
    return this.database.query(
      `INSERT INTO ${this.table} (id_idea,id_challenge) VALUES (?,?)`,
      [idIdea, idChallenge]
    );
  }

  resetSelectedsAndWinners(idChallenge) {
    return this.database.query(
      `UPDATE ${this.table} SET selected = 0, winner = 0 WHERE ${this.id} = ?`,
      [idChallenge]
    );
  }

  setSelecteds(idIdeas, idChallenge) {
    return this.database.query(
      `UPDATE ${this.table} SET selected = 1 WHERE ${
        this.id
      } = ? AND id_idea IN (${idIdeas.join(",")})`,
      [idChallenge]
    );
  }

  setWinners(idIdeas, idChallenge) {
    return this.database.query(
      `UPDATE ${this.table} SET selected = 1, winner = 1 WHERE ${
        this.id
      } = ? AND id_idea IN (${idIdeas.join(",")})`,
      [idChallenge]
    );
  }
}

module.exports = ChallengerManager;
