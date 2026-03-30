import {PathLike} from 'fs'
import PreloadedWindow from './bridge'
declare var gdjs : any
(function (gdjs : any){
    //Preloads
    const fs = (window as unknown as PreloadedWindow).remote_replace.fs
    const logger = new gdjs.Logger("Filesystem");
    gdjs.fileSystem = class {
        static saveVariableToJSONFile(variable : any, file : PathLike) {
            try {
                fs.writeFileSync(file, JSON.stringify(variable.toJSObject()), "utf8")
            } catch (error) {
                logger.error("Unable to save the variable to path: '" + file + "': ", error)
            }
        }
        static deleteFile(file : PathLike) {
          try {
            fs.unlinkSync(file)
          } catch (error) {
            logger.error("Unable to delete the file: '" + file + "': ", error)
          }
        }
        static pathExists(file : PathLike) : boolean{
          return fs.existsSync(file)
        }
        static getUserHomePath() : string{
          return (window as unknown as PreloadedWindow).remote_replace.app.getPath("home") || "";
        }
        static getDocumentsPath() : string{
          return (window as unknown as PreloadedWindow).remote_replace.app.getPath("documents") || "";
        }
        static loadVariableFromJSONFile (variable : any, file : PathLike, _t : any, removeCRCharacters = true) {
          try {
            const output = fs.readFileSync(file)
            if (output){
              variable.fromJSON(removeCRCharacters ? output.replace(/\r/g, "") : removeCRCharacters)
            }
          } catch (error) {
            logger.error(
              "Unable to load variable from the file at path: '" + file + "': ",
              error,
            );
          }
        }
        static makeDirectory(dir : PathLike){
          try{
            fs.mkdirSync(dir)
          } catch (error){
            logger.error("Unable to create directory at: '" + dir + "': ", error);
          }
        }
        static getPathDelimiter() : string{
          return (window as unknown as PreloadedWindow).remote_replace.path.sep
        }
    }
})(gdjs || (gdjs = {}))