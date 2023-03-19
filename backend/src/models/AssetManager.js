const AbstractManager = require("./AbstractManager");

class AssetManager extends AbstractManager {
  constructor() {
    super({ table: "asset" });
  }

  find(id) {
    return this.database.query(
      `select * from ${this.table} where idea_id = ?`,
      [id]
    );
  }

  insert(uri, size, type, ideaId, commentId, field, description) {
    return this.database.query(
      `insert into ${this.table} (uri, size, type, idea_id, comment_id, field, description) values (?, ?, ?, ?, ?, ?, ?)`,
      [uri, size, type, ideaId, commentId, field, description]
    );
  }
}
module.exports = AssetManager;
