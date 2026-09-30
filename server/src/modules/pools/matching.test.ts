import test from "node:test";
import assert from "node:assert/strict";

import { isCompatibleRoute } from "./matching.js";

test("accepts a valid Dhaka route", () => {
  assert.equal(
    isCompatibleRoute(
      "BANANI",
      "MOHAKHALI",
    ),
    true,
  );
});

test("accepts Khilgaon to Bashundhara", () => {
  assert.equal(
    isCompatibleRoute(
      "KHILGAON",
      "BASHUNDHARA",
    ),
    true,
  );
});

test("rejects same pickup and destination", () => {
  assert.equal(
    isCompatibleRoute(
      "BANANI",
      "BANANI",
    ),
    false,
  );
});

test("rejects an unknown zone", () => {
  assert.equal(
    isCompatibleRoute(
      "UNKNOWN",
      "MOHAKHALI",
    ),
    false,
  );
});