const AbstractManager = require("./AbstractManager");

class AuthorManager extends AbstractManager {
  constructor() {
    super({ table: "author", id: "id_idea" });
    this.join = { user: "user" };
  }

  find(idsIdea, withIdeaId = false) {
    return this.database.query(
      `SELECT ${
        withIdeaId ? "id_idea," : ""
      }a.id_user,firstname,lastname,id_organisation,id_team,id_role,is_author FROM ${
        this.table
      } AS a INNER JOIN ${this.join.user} AS u ON u.id_user = a.id_user WHERE ${
        this.id
      } IN (?)`,
      [idsIdea]
    );
  }

  add(authors, idIdea) {
    const initialSql = `INSERT INTO ${this.table}`;
    const data = [];
    for (let i = 0; i < authors.length; i += 1) {
      data.push(authors[i].isAuthor);
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
