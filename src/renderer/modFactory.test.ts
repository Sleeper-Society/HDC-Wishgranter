import { describe, it } from "node:test";
import { parseJson } from "./modFactory.ts";
import assert from "node:assert";

describe("parseJson", () => {
  it("should add top level element to empty object", async () => {
    assert.deepEqual(
      await parseJson({}, {
        json: () =>
          new Promise((resolve) => {
            resolve({
              a: "bbb",
            });
          }),
      } as Response),
      { a: "bbb" },
    );
  });
  it("should add top level element to nonempty object", async () => {
    assert.deepEqual(
      await parseJson({ a: "bbb" }, {
        json: () =>
          new Promise((resolve) => {
            resolve({
              c: "ddd",
            });
          }),
      } as Response),
      { a: "bbb", c: "ddd" },
    );
  });
});
describe("parseData", () => {
  it("should ");
});
