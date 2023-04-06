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

  setSelecteds(idIdeas, idChallenge, state) {
    return this.database.query(
      `UPDATE ${this.table} SET selected = ?, winner = 0 WHERE ${
        this.id
      } = ? AND id_idea IN (${idIdeas.join(",")})`,
      [state, idChallenge]
    );
  }

  setWinners(idIdeas, idChallenge) {
    return this.database.query(
      `UPDATE ${this.table} SET winner = 1 WHERE ${
        this.id
      } = ? AND id_idea IN (${idIdeas.join(",")})`,
      [idChallenge]
    );
  }
}

module.exports = ChallengerManager;
