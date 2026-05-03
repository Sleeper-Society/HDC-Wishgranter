import type { PathLike } from "fs";
import type { gdjs } from "../wishgranterTypes/gdjs.ts";
(function (gdjs: gdjs) {
  //Preloads
  const fs = window.remote_replace.fs;
  const logger = new gdjs.Logger("Filesystem");
  gdjs.fileSystem = {
    saveVariableToJSONFile(
      variable: { toJSObject: () => object },
      file: PathLike,
    ) {
      try {
        fs.writeFileSync(file, JSON.stringify(variable.toJSObject()));
      } catch (error) {
        logger.error(
          "Unable to save the variable to path: '" + file.toString() + "': ",
          error,
        );
      }
    },
    deleteFile(file: PathLike) {
      try {
        fs.unlinkSync(file);
      } catch (error) {
        logger.error(
          "Unable to delete the file: '" + file.toString() + "': ",
          error,
        );
      }
    },
    pathExists(file: PathLike): boolean {
      return fs.existsSync(file);
    },
    getUserHomePath(): string {
      return window.remote_replace.app.getPath("home") || "";
    },
    getDocumentsPath(): string {
      return window.remote_replace.app.getPath("documents") || "";
    },
    loadVariableFromJSONFile(
      variable: { fromJSON: (path: PathLike) => void },
      file: PathLike,
      _t: unknown,
      removeCRCharacters = true,
    ) {
      try {
        const output = fs.readFileSync(file);
        if (output) {
          variable.fromJSON(
            removeCRCharacters ? output.replace(/\r/g, "") : output,
          );
        }
      } catch (error) {
        logger.error(
          "Unable to load variable from the file at path: '" +
            file.toString() +
            "': ",
          error,
        );
      }
    },
    makeDirectory(dir: PathLike) {
      try {
        fs.mkdirSync(dir);
      } catch (error) {
        logger.error(
          "Unable to create directory at: '" + dir.toString() + "': ",
          error,
        );
      }
    },
    getPathDelimiter(): string {
      return window.remote_replace.path.sep();
    },
  };
})(gdjs);
