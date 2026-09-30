import test from "node:test";
import assert from "node:assert/strict";

import { calculateFare } from "./fare.service.js";

test("calculates normal Banani to Mohakhali fare", () => {
  const fare = calculateFare("BANANI", "MOHAKHALI", false);

  assert.equal(fare, 12000);
});

test("applies pool discount to Banani to Mohakhali fare", () => {
  const fare = calculateFare("BANANI", "MOHAKHALI", true);

  assert.equal(fare, 10000);
});

test("uses default distance charge for unmapped route", () => {
  const normalFare = calculateFare("KHILGAON", "BASHUNDHARA", false);

  const pooledFare = calculateFare("KHILGAON", "BASHUNDHARA", true);

  assert.equal(normalFare, 10000);
  assert.equal(pooledFare, 8000);
});
