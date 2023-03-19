-- -----------------------------------------------------
-- IRENE default database
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Table `organisation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `organisation` (
  `id_organisation` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_organisation`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `idea`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `idea` (
  `id_idea` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(160) NULL DEFAULT NULL,
  `problem` MEDIUMTEXT NULL DEFAULT NULL,
  `solution` MEDIUMTEXT NULL DEFAULT NULL,
  `gains` MEDIUMTEXT NULL DEFAULT NULL,
  `note` DECIMAL(10,0) NULL DEFAULT '0',
  `noted_by` MEDIUMTEXT NULL DEFAULT NULL,
  `views` INT NULL DEFAULT '0',
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `finished_at` DATETIME NULL DEFAULT NULL,
  `manager_validated_at` DATETIME NULL DEFAULT NULL,
  `ambassador_validated_at` DATETIME NULL DEFAULT NULL,
  `prime` INT NULL DEFAULT '0',
  `status` INT NULL DEFAULT '0',
  `id_organisation` INT NOT NULL,
  PRIMARY KEY (`id_idea`, `id_organisation`),
  INDEX `fk_idea_idx_organisation` (`id_organisation` ASC) VISIBLE,
  FULLTEXT INDEX `idea_fulltext` (`name`, `description`, `problem`, `solution`, `gains`) VISIBLE,
  CONSTRAINT `fk_idea_organisation`
    FOREIGN KEY (`id_organisation`)
    REFERENCES `organisation` (`id_organisation`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `role`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `role` (
  `id_role` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `manage_ideas_manager` TINYINT NULL DEFAULT '0',
  `manage_ideas_ambassador` TINYINT NULL DEFAULT '0',
  `manage_challenges_ambassador` TINYINT NULL DEFAULT '0',
  `manage_challenges_all` TINYINT NULL DEFAULT '0',
  `manage_teams` TINYINT NULL DEFAULT '0',
  `manage_users` TINYINT NULL DEFAULT '0',
  `manage_organisations` TINYINT NULL DEFAULT '0',
  `manage_roles` TINYINT NULL DEFAULT '0',
  `manage_all` TINYINT NULL DEFAULT '0',
  PRIMARY KEY (`id_role`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `team`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `team` (
  `id_team` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `id_organisation` INT NOT NULL,
  PRIMARY KEY (`id_team`),
  INDEX `fk_team_organisation_organisation_idx` (`id_organisation` ASC) VISIBLE,
  CONSTRAINT `fk_user_has_organisation_organisation`
    FOREIGN KEY (`id_organisation`)
    REFERENCES `organisation` (`id_organisation`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id_user` INT NOT NULL AUTO_INCREMENT,
  `firstname` VARCHAR(255) NOT NULL,
  `lastname` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `registration_number` VARCHAR(45) NOT NULL,
  `skills` VARCHAR(1024) NULL DEFAULT NULL,
  `mail` VARCHAR(255) NOT NULL,
  `mail_notification` TINYINT NULL DEFAULT '0',
  `rgpd_agreement` TINYINT NULL DEFAULT '0',
  `id_organisation` INT NOT NULL,
  `id_team` INT NOT NULL,
  `id_role` INT NOT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE INDEX `registration_number` (`registration_number` ASC) VISIBLE,
  INDEX `fk_user_organisation_idx` (`id_organisation` ASC) VISIBLE,
  INDEX `fk_user_role_idx` (`id_role` ASC) VISIBLE,
  FULLTEXT INDEX `users_search` (`firstname`, `lastname`) VISIBLE,
  INDEX `fk_user_team_idx` (`id_team` ASC) VISIBLE,
  CONSTRAINT `fk_user_organisation`
    FOREIGN KEY (`id_organisation`)
    REFERENCES `organisation` (`id_organisation`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_role`
    FOREIGN KEY (`id_role`)
    REFERENCES `role` (`id_role`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_team`
    FOREIGN KEY (`id_team`)
    REFERENCES `team` (`id_team`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `comment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `comment` (
  `id_comment` INT NOT NULL AUTO_INCREMENT,
  `comment` MEDIUMTEXT NOT NULL,
  `date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `field` INT NOT NULL,
  `id_user` INT NULL DEFAULT NULL,
  `id_idea` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id_comment`),
  INDEX `fk_id_user_idx` (`id_user` ASC) VISIBLE,
  INDEX `fk_id_idea_idx` (`id_idea` ASC) VISIBLE,
  CONSTRAINT `fk_id_idea`
    FOREIGN KEY (`id_idea`)
    REFERENCES `idea` (`id_idea`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_id_comment`
    FOREIGN KEY (`id_user`)
    REFERENCES `user` (`id_user`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `asset`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `asset` (
  `id_asset` INT NOT NULL AUTO_INCREMENT,
  `field` INT NOT NULL,
  `description` MEDIUMTEXT NULL DEFAULT NULL,
  `uri` VARCHAR(255) NOT NULL,
  `size` INT NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `id_idea` INT NULL DEFAULT NULL,
  `id_comment` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id_asset`),
  INDEX `fk_idea_id_idx` (`id_idea` ASC) VISIBLE,
  INDEX `fk_comment_id_idx` (`id_comment` ASC) VISIBLE,
  CONSTRAINT `fk_comment_id_idx`
    FOREIGN KEY (`id_comment`)
    REFERENCES `comment` (`id_comment`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_idea_id_asset`
    FOREIGN KEY (`id_idea`)
    REFERENCES `idea` (`id_idea`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `categorie`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `categorie` (
  `id_categorie` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `id_parent_categorie` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id_categorie`),
  INDEX `fk_categorie_parent_idx` (`id_parent_categorie` ASC) VISIBLE,
  CONSTRAINT `fk_categorie_parent`
    FOREIGN KEY (`id_parent_categorie`)
    REFERENCES `categorie` (`id_categorie`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `challenge`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `challenge` (
  `id_challenge` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(160) NOT NULL,
  `description` MEDIUMTEXT NULL DEFAULT NULL,
  `started_at` TIMESTAMP NULL DEFAULT NULL,
  `expired_at` TIMESTAMP NULL DEFAULT NULL,
  `id_organisation` INT NOT NULL,
  PRIMARY KEY (`id_challenge`, `id_organisation`),
  INDEX `fk_challenge_organisation_idx` (`id_organisation` ASC) VISIBLE,
  CONSTRAINT `fk_challenge_organisation_idx`
    FOREIGN KEY (`id_organisation`)
    REFERENCES `organisation` (`id_organisation`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `idea_categorie`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `idea_categorie` (
  `id_idea` INT NOT NULL,
  `id_categorie` INT NOT NULL,
  INDEX `fk_idea_has_categorie_categorie_idx` (`id_categorie` ASC) VISIBLE,
  INDEX `fk_idea_has_categorie_idea_idx` (`id_idea` ASC) VISIBLE,
  PRIMARY KEY (`id_categorie`, `id_idea`),
  CONSTRAINT `fk_idea_has_categorie_categorie`
    FOREIGN KEY (`id_categorie`)
    REFERENCES `categorie` (`id_categorie`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_idea_has_categorie_idea`
    FOREIGN KEY (`id_idea`)
    REFERENCES `idea` (`id_idea`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `author`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `author` (
  `is_author` TINYINT NULL DEFAULT 0,
  `id_idea` INT NOT NULL,
  `id_user` INT NOT NULL,
  PRIMARY KEY (`id_idea`, `id_user`),
  INDEX `fk_idea_has_user_user_idx` (`id_user` ASC) VISIBLE,
  INDEX `fk_idea_has_user_idea_idx` (`id_idea` ASC) VISIBLE,
  CONSTRAINT `fk_idea_has_user_idea`
    FOREIGN KEY (`id_idea`)
    REFERENCES `idea` (`id_idea`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_idea_has_user_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `user` (`id_user`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `challenger_idea`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `challenger` (
  `id_challenge` INT NOT NULL,
  `id_idea` INT NOT NULL,
  `selected` TINYINT NULL DEFAULT 0,
  `winner` TINYINT NULL DEFAULT 0,
  PRIMARY KEY (`id_challenge`, `id_idea`),
  INDEX `fk_challenge_has_idea_idea_idx` (`id_idea` ASC) VISIBLE,
  INDEX `fk_challenge_has_idea_challenge_idx` (`id_challenge` ASC) VISIBLE,
  CONSTRAINT `fk_challenge_has_idea_challenge`
    FOREIGN KEY (`id_challenge`)
    REFERENCES `challenge` (`id_challenge`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_challenge_has_idea_idea`
    FOREIGN KEY (`id_idea`)
    REFERENCES `idea` (`id_idea`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


-- -----------------------------------------------------
-- Table `vote`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `vote` (
  `id_user` INT NULL,
  `id_idea` INT NOT NULL,
  PRIMARY KEY (`id_idea`),
  INDEX `fk_user_has_idea_idea_idx` (`id_idea` ASC) VISIBLE,
  INDEX `fk_user_has_idea_user_idx` (`id_user` ASC) VISIBLE,
  CONSTRAINT `fk_user_has_idea_user`
    FOREIGN KEY (`id_user`)
    REFERENCES `user` (`id_user`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_has_idea_idea`
    FOREIGN KEY (`id_idea`)
    REFERENCES `idea` (`id_idea`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_general_ci;


CREATE DEFINER = CURRENT_USER TRIGGER `vote_AFTER_INSERT` AFTER INSERT ON `vote` FOR EACH ROW
BEGIN
	UPDATE `idea`
    SET noted_by = noted_by + 1
    WHERE id_idea = NEW.id_idea;
END;
