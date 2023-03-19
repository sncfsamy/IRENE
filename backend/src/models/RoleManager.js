const AbstractManager = require("./AbstractManager");

class RoleManager extends AbstractManager {
  constructor() {
    super({ table: "role" });
  }

  find(id_role) {
    return this.database.query(`SELECT * FROM  ${this.table} WHERE id_role = ?`, [
      id_role,
    ]);
  }

  insert(role) {
    return this.database.query(`INSERT INTO ${this.table} (name,manage_ideas_manager,manage_ideas_ambassador, manage_challenges_ambassador, manage_challenges_all, manage_teams, manage_users, manage_organisations, manage_roles, manage_all) VALUES (?,?,?,?,?,?,?,?,?,?)`, [
      role.name,
      role.manage_ideas_manager,
      role.manage_ideas_ambassador,
      role.manage_challenges_ambassador,
      role.manage_challenges_all,
      role.manage_teams,
      role.manage_users,
      role.manage_organisations,
      role.manage_roles,
      role.manage_all
    ]);
  }

  update(role) {
    return this.database.query(
      `${role.reduce((sql, {param}, index) => `${sql} ${index===0 ? "SET" : ","} ${param} = ?`, initialSql)} WHERE id_role = ?`,
      [...role.map(({ value }) => value), role.id]
    );
  }
}

module.exports = RoleManager;
