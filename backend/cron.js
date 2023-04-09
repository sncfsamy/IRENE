/* eslint-disable no-await-in-loop */
const fs = require("fs");
const path = require("path");
const models = require("./src/models");

const deleteOrphanFiles = () => {
  models.asset
    .getCount()
    .then(async ([[{ total }]]) => {
      console.info("Removing orphan files from /uploads");
      const iterations = Math.ceil(total / 100);
      let databaseFiles = [];
      for (let i = 1; i <= iterations; i += 1) {
        const data = await models.asset.findAll(i);
        databaseFiles = [
          ...databaseFiles,
          ...data[0].map((file) => {
            const parsedFile = path.parse(file.file_name);
            return { ...file, file_name_without_ext: parsedFile.name };
          }),
        ];
      }
      const folders = fs
        .readdirSync("uploads")
        .filter(
          (folder) => folder !== "idea_undefined" && folder !== "challenges"
        );
      let files = [];
      for (let i = 0; i < folders.length; i += 1) {
        if (fs.lstatSync(path.join("uploads", folders[i])).isDirectory())
          files = [
            ...files,
            ...fs
              .readdirSync(path.join("uploads", folders[i]))
              .map((file) => path.join("uploads", folders[i], file)),
          ];
        else files.push(path.join("uploads", folders[i]));
      }
      if (fs.existsSync(path.join("uploads", "idea_undefined")))
        files = [
          ...files,
          ...fs
            .readdirSync(path.join("uploads", "idea_undefined"))
            .map((file) => path.join("uploads", "idea_undefined", file)),
        ];
      if (fs.existsSync(path.join("uploads", "challenges"))) {
        const challengeFolders = fs.readdirSync(
          path.join("uploads", "challenges")
        );
        for (let i = 0; i < challengeFolders.length; i += 1) {
          files = [
            ...files,
            ...fs
              .readdirSync(
                path.join("uploads", "challenges", challengeFolders[i])
              )
              .map((file) =>
                path.join("uploads", "challenges", challengeFolders[i], file)
              ),
          ];
        }
      }
      const toDelete = [];
      const toDeleteFromDb = [];
      files.forEach((file) => {
        if (
          !databaseFiles.find((dbFile) =>
            file.includes(dbFile.file_name_without_ext)
          )
        ) {
          toDelete.push(file);
        }
      });
      databaseFiles.forEach((dbFile) => {
        if (!dbFile.id_idea && !dbFile.id_challenge) {
          files
            .filter((file) => file.includes(dbFile.file_name_without_ext))
            .forEach((file) => toDelete.push(file));
          toDeleteFromDb.push(dbFile.id_asset);
        }
      });
      toDelete.forEach((file) => fs.rmSync(`./${file}`));
      if (toDeleteFromDb.length) {
        await models.asset.deleteIds(toDeleteFromDb);
        console.info(`Removed ${toDeleteFromDb.length} oprhan db asset`);
      }
      if (toDelete.length)
        console.info(`Deleted ${toDelete.length} orphan files`);
      if (!toDelete.length && !toDeleteFromDb.length)
        console.info("Nothing to delete");
    })
    .catch((error) => console.error(error));
};

module.exports = {
  deleteOrphanFiles,
};
