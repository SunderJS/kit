import test from "ava";
import { generateRandomToken } from "../../src/crypto/random.js";

import { Crypto } from "@peculiar/webcrypto";
globalThis.crypto = new Crypto();

test("Entropy translation into bytes", (t) => {
  t.is(generateRandomToken(128).length, 16);

  // It gets rounded up
  t.is(generateRandomToken(126).length, 16);
  t.is(generateRandomToken(1).length, 1);
});

test("Invalid input", (t) => {
  t.throws(() => generateRandomToken(0));
  t.throws(() => generateRandomToken(-1));
  t.throws(() => generateRandomToken(-8));
  t.throws(() => generateRandomToken(NaN));
});
