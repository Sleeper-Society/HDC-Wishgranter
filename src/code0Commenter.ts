import { readFile, writeFileSync } from "node:fs";
import path from "node:path";
import { commentCode0 } from "./hyperspaceDeckCommand.ts";

const code0_path = process.argv[2];
const datajs_path = process.argv[3];

// @ts-expect-error While useing the same gdjs, this script will not fully populate gdjs beforehand
globalThis.gdjs = {};

import(path.join(process.cwd(), datajs_path))
  .then(() => {
    readFile(path.join(process.cwd(), code0_path), "utf8", (_err, file) => {
      file = commentCode0(file, gdjs.projectData);
      writeFileSync(path.join(process.cwd(), code0_path), file);
    });
  })
  .catch((err: unknown) => {
    console.error(err);
  });
