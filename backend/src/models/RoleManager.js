const AbstractManager = require("./AbstractManager");

class RoleManager extends AbstractManager {
  constructor() {
    super({ table: "role", id: "id_role" });
    this.join = {
      user: "user",
    };
  }

  findAll(full = false) {
    return this.database.query(
      `SELECT r.*${
        full
          ? `,(SELECT COUNT(*) AS users FROM ${this.join.user} AS u WHERE u.${this.id} = r.${this.id}) AS users`
          : ""
      } FROM ${this.table} AS r`
    );
  }

  insert(role) {
    return this.database.query(
      `INSERT INTO ${this.table} (name, manage_ideas_manager, manage_ideas_ambassador, manage_ideas_all, manage_challenges_ambassador, manage_challenges_all, manage_users, manage_categories, manage_organisations, manage_teams, manage_roles, manage_all) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        role.name,
        role.manage_ideas_manager,
        role.manage_ideas_ambassador,
        role.manage_ideas_all,
        role.manage_challenges_ambassador,
        role.manage_challenges_all,
        role.manage_users,
        role.manage_categories,
        role.manage_organisations,
        role.manage_teams,
        role.manage_roles,
        role.manage_all,
      ]
    );
  }

  update(role) {
    return this.database.query(
      `UPDATE ${this.table} SET name = ?, manage_ideas_manager = ?, manage_ideas_ambassador = ?, manage_ideas_all = ?, manage_challenges_ambassador = ?, manage_challenges_all = ?, manage_users = ?, manage_categories = ?, manage_organisations = ?, manage_teams = ?, manage_roles = ?, manage_all = ? WHERE id_role = ?`,
      [
        role.name,
        role.manage_ideas_manager,
        role.manage_ideas_ambassador,
        role.manage_ideas_all,
        role.manage_challenges_ambassador,
        role.manage_challenges_all,
        role.manage_users,
        role.manage_categories,
        role.manage_organisations,
        role.manage_teams,
        role.manage_roles,
        role.manage_all,
        role.id_role,
      ]
    );
  }
}

module.exports = RoleManager;
