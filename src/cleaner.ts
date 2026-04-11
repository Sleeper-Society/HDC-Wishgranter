import fs from "fs";

for (const script of fs
  .readdirSync(import.meta.dirname, {
    encoding: "utf8",
    withFileTypes: true,
    recursive: true,
  })
  .filter(
    (value: fs.Dirent) =>
      value.name.endsWith(".js") && value.name !== import.meta.filename,
  )
  .map((value: fs.Dirent) => {
    return value.parentPath + "/" + value.name;
  })) {
  fs.readFile(script, "utf8", (_error, data) => {
    fs.writeFileSync(
      script,
      data
        .replace("export {};", "")
        .replace(
          'Object.defineProperty(exports, "__esModule", { value: true });',
          "",
        ),
    );
  });
}
