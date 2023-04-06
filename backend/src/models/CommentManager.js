const AbstractManager = require("./AbstractManager");

class CommentManager extends AbstractManager {
  constructor() {
    super({ table: "comment", id: "id_comment" });
    this.join = { user: "user" };
  }

  insert(comment) {
    return this.database.query(
      `INSERT INTO ${this.table} (comment, field, id_user, id_idea, id_parent_comment) VALUES (?, ?, ?, ?, ?)`,
      [
        comment.comment,
        comment.field,
        comment.id_user,
        comment.id_idea,
        comment.id_parent_comment,
      ]
    );
  }

  find(ideaId, field) {
    return this.database.query(
      `SELECT c.*,u.id_user,u.id_team,u.id_organisation,u.firstname,u.lastname FROM  ${this.table} AS c INNER JOIN ${this.join.user} AS u ON u.id_user = c.id_user WHERE id_idea = ? AND field = ? ORDER BY created_at DESC`,
      [ideaId, field]
    );
  }

  getLastsCommentsOfAnIdeaById(id) {
    const sql = `SELECT id_comment,comment,c.created_at,c.id_user,id_role,id_team,id_organisation,firstname,lastname FROM ${this.table} AS c INNER JOIN ${this.join.user} AS u ON u.id_user = c.id_user WHERE id_idea = ? AND field = ? AND (c.id_parent_comment IS NULL OR c.field = 0) ORDER BY c.created_at DESC `;
    const totalSql = `SELECT COUNT(*) AS total FROM ${this.table} AS c INNER JOIN ${this.join.user} AS u ON u.id_user = c.id_user WHERE id_idea = ? AND field = ?`;
    return Promise.all([
      this.database.query(sql, [id, 0]),
      this.database.query(`${sql} LIMIT 2`, [id, 1]),
      this.database.query(totalSql, [id, 1]),
      this.database.query(`${sql} LIMIT 2`, [id, 2]),
      this.database.query(totalSql, [id, 2]),
      this.database.query(`${sql} LIMIT 2`, [id, 3]),
      this.database.query(totalSql, [id, 3]),
    ]);
  }
}

module.exports = CommentManager;
