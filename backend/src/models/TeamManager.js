const AbstractManager = require("./AbstractManager");

class TeamManager extends AbstractManager {
  constructor() {
    super({ table: "team", id: "id_team" });
    this.join = {
      user: "user",
      idea: "idea",
      author: "author",
    };
  }

  findAll(full = false) {
    return this.database.query(
      `SELECT t.*${
        full
          ? `,(SELECT COUNT(*) AS users FROM ${this.join.user} AS u WHERE u.${this.id} = t.${this.id}) AS users,(SELECT COUNT(id_idea) FROM ${this.join.author} AS a INNER JOIN ${this.join.user} AS u ON u.id_user = a.id_user WHERE u.${this.id} = t.${this.id}) AS ideas`
          : ""
      } FROM ${this.table} AS t`
    );
  }

  insert(team) {
    return this.database.query(
      `INSERT INTO ${this.table} (name, id_organisation) VALUES (?, ?)`,
      [team.name, team.id_organisation]
    );
  }

  update(update, id) {
    const initalSql = `UPDATE ${this.table}`;
    const data = [...update.map(({ value }) => value), id];
    return this.database.query(
      `${update.reduce(
        (sql, { column }, i) => `${sql} ${i === 0 ? "SET" : ","} ${column} = ?`,
        initalSql
      )} WHERE id_team = ?`,
      data
    );
  }
}

module.exports = TeamManager;
