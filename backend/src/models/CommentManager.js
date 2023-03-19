const AbstractManager = require("./AbstractManager");

class CommentManager extends AbstractManager {
  constructor() {
    super({ table: "comment" });
    this.join = { user: "user" };
  }

  insert(comment) {
    return this.database.query(
      `INSERT INTO ${this.table} (comment, field, id_user, id_idea) VALUES (?, ?, ?, ?)`,
      [comment.comment, comment.field, comment.id_user, comment.id_idea]
    );
  }

  find(ideaId, field) {
    return this.database.query(
      `SELECT * FROM  ${this.table} WHERE id_idea = ? AND field = ?`,
      [ideaId, field]
    );
  }

  getLastsCommentsOfAnIdeaById(id) {
    const sql = `SELECT id,comment,date,c.id_user,id_role,id_team,id_organisation,firstname,lastname FROM ${this.table} AS c INNER JOIN ${this.join.user} AS u ON u.id_user = c.id_user WHERE id_idea = ? AND field = ? ORDER BY date DESC LIMIT 2;`;
    return Promise.all([
      this.database.query(sql, [id, 0]),
      this.database.query(sql, [id, 1]),
      this.database.query(sql, [id, 2]),
      this.database.query(sql, [id, 3]),
    ]);
  }

  destroy(id) {
    return this.database.query(
      `DELETE FROM ${this.table} WHERE id_comment = ?`,
      [id]
    );
  }
}

module.exports = CommentManager;
