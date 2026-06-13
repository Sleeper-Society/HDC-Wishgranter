import { describe, it } from "node:test";
import { parseData, parseJson } from "./modFactory.ts";
import assert from "node:assert";
import type { projectData, Resource } from "./gdjs.ts";

describe("parseJson", () => {
  it("should add top level element to empty object", async () => {
    assert.deepEqual(
      await parseJson(
        {},
        {
          json: () =>
            new Promise((resolve) => {
              resolve({
                a: "bbb",
              });
            }),
        } as Response,
        "",
        "normal.json",
      ),
      { a: "bbb" },
    );
  });
  it("should add top level element to nonempty object", async () => {
    assert.deepEqual(
      await parseJson(
        { a: "bbb" } as object,
        {
          json: () =>
            new Promise((resolve) => {
              resolve({
                c: "ddd",
              });
            }),
        },
        "",
        "normal.json",
      ),
      { a: "bbb", c: "ddd" },
    );
  });
  it("should add sub level element to list object", async () => {
    assert.deepEqual(
      await parseJson(
        { a: { b: "ccc" } },
        {
          json: () =>
            new Promise((resolve) => {
              resolve({
                a: { d: "eee" },
              });
            }),
        } as Response,
        "",
        "list.json",
      ),
      { a: { b: "ccc", d: "eee" } },
    );
  });
});
describe("parseData", () => {
  it("should make paths full in js", async () => {
    assert.deepEqual(
      await parseData(
        {},
        {
          text: () =>
            new Promise((resolve) => {
              resolve(
                'gdjs.projectData = { "resources": { "resources": [{ "file": "wishgranter" }] } }',
              );
            }),
        } as Response,
        "thefullpath/",
        "js",
      ),
      {
        resources: { resources: [{ file: "thefullpath/wishgranter" }] },
      } as projectData,
    );
  });
  it("should make paths full in json", async () => {
    assert.deepEqual(
      await parseData(
        {},
        {
          json: () =>
            new Promise((resolve) => {
              resolve({ resources: { resources: [{ file: "wishgranter" }] } });
            }),
        } as Response,
        "thefullpath",
        "data.json",
      ),
      {
        resources: { resources: [{ file: "thefullpath/wishgranter" }] },
      } as projectData,
    );
  });
  it("should appened to resources", async () => {
    assert.deepEqual(
      await parseData(
        {
          resources: {
            resources: [{ file: "thefullpath/wishgranter" } as Resource],
          },
        },
        {
          json: () =>
            new Promise((resolve) => {
              resolve({ resources: { resources: [{ file: "wishgranter" }] } });
            }),
        } as Response,
        "adiffrentpath",
        "data.json",
      ),
      {
        resources: {
          resources: [
            { file: "thefullpath/wishgranter" },
            { file: "adiffrentpath/wishgranter" },
          ],
        },
      } as projectData,
    );
  });
});
