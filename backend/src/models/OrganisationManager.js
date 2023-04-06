const AbstractManager = require("./AbstractManager");

class OrganisationManager extends AbstractManager {
  constructor() {
    super({ table: "organisation", id: "id_organisation" });
    this.join = {
      user: "user",
      team: "team",
      challenge: "challenge",
      idea: "idea",
    };
  }

  findAll(full = false) {
    return this.database.query(
      `SELECT o.*${
        full
          ? `,(SELECT COUNT(*) AS users FROM ${this.join.user} AS u WHERE u.${this.id} = o.${this.id}) AS users,(SELECT COUNT(*) AS ideas FROM ${this.join.idea} AS i WHERE i.${this.id} = o.${this.id}) AS ideas,(SELECT COUNT(*) AS challenges FROM ${this.join.challenge} AS c WHERE c.${this.id} = o.${this.id}) AS challenges`
          : ""
      } FROM ${this.table} AS o`
    );
  }

  insert(organisation) {
    return this.database.query(`INSERT INTO ${this.table} (name) VALUES (?)`, [
      organisation.name,
    ]);
  }

  update(organisation) {
    return this.database.query(
      `UPDATE ${this.table} SET name = ? WHERE ${this.id} = ?`,
      [organisation.name, organisation.id]
    );
  }
}

module.exports = OrganisationManager;
