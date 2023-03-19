const AbstractManager = require("./AbstractManager");

class TeamManager extends AbstractManager {
  constructor() {
    super({ table: "team" });
  }

  insert(team) {
    return this.database.query(`insert into ${this.table} (name, id_organisation) values (?, ?)`, [
      team.name,
    ]);
  }

  update(team) {
    return this.database.query(
      `update ${this.table} set name = ?, id_organisation = ? where id = ?`,
      [team.name, team.id_organisation, team.id]
    );
  }
}

module.exports = TeamManager;
