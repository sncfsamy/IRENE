const AbstractManager = require("./AbstractManager");

class AssetManager extends AbstractManager {
  constructor() {
    super({ table: "asset", id: "id_asset" });
  }

  findPoster(idIdea, idChallenge = -1) {
    return this.database.query(
      `SELECT file_name,id_asset FROM ${this.table} WHERE (id_idea = ? OR id_challenge = ?) AND field = 0`,
      [idIdea, idChallenge]
    );
  }

  findByIdea(idIdea) {
    return this.database.query(
      `SELECT * FROM ${this.table} WHERE id_idea = ?`,
      [idIdea]
    );
  }

  findByChallenge(idChallenge) {
    return this.database.query(
      `SELECT * FROM ${this.table} WHERE id_challenge = ?`,
      [idChallenge]
    );
  }

  findToDelete(ids) {
    return this.database.query(
      `SELECT file_name,id_asset FROM ${
        this.table
      } WHERE id_idea IN (${ids.join(",")})`
    );
  }

  insert(uri, size, type, ideaId, commentId, challengeId, field, description) {
    return this.database.query(
      `INSERT INTO ${this.table} (file_name, size, type, id_idea, id_comment, id_challenge, field, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uri, size, type, ideaId, commentId, challengeId, field, description]
    );
  }

  setIdIdea(assetsIds, idIdea) {
    return this.database.query(
      `UPDATE ${this.table} SET id_idea = ? WHERE id_asset IN (${assetsIds.join(
        ","
      )}) AND id_idea IS NULL`,
      [idIdea]
    );
  }

  setIdComment(assetsIds, idComment) {
    return this.database.query(
      `UPDATE ${
        this.table
      } SET id_comment = ? WHERE id_asset IN (${assetsIds.join(
        ","
      )}) AND id_comment IS NULL`,
      [idComment]
    );
  }

  setIdChallenge(assetsIds, idChallenge) {
    return this.database.query(
      `UPDATE ${
        this.table
      } SET id_challenge = ? WHERE id_asset IN (${assetsIds.join(
        ","
      )}) AND id_challenge IS NULL`,
      [idChallenge]
    );
  }
}
module.exports = AssetManager;
