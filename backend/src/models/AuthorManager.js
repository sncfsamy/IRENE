const AbstractManager = require("./AbstractManager");

class AuthorManager extends AbstractManager {
  constructor() {
    super({ table: "author" });
    this.join = { user: "user" };
  }

  find(ids_idea, withIdeaId = false) {
    return this.database.query(
      `SELECT ${withIdeaId ? "id_idea," : ""}id_user,firstname,lastname FROM ${this.table} AS a INNER JOIN ${this.join.user} AS u ON u.id_user = a.id_user WHERE id_idea IN (?)`,
      [ids_idea]
    );
  }

  delete(idIdea) {
    return this.database.query(`DELETE FROM ${this.table} WHERE id_idea = ?`, [
      idIdea,
    ]);
  }

  add(authors, idIdea) {
    const initialSql = `INSERT INTO ${this.table}`;
    const data = [];
    for (let i = 0; i < authors.length; i += 1) {
      data.push(authors[i].isAuthor)
      data.push(idIdea);
      data.push(authors[i].idUser);
    }
    const query = authors.reduce(
      (sql, _, index) =>
        `${sql} ${
          index === 0 ? "(is_author,id_idea,id_user) VALUES" : ","
        } (?, ?, ?)`,
      initialSql
    );
    return this.database.query(query, data);
  }
}

module.exports = AuthorManager;
