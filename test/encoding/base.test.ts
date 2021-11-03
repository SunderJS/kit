import test from "ava";

import { base64 } from "../../src/encoding/base64.js";
import { base36, base58, base62 } from "../../src/encoding/baseX.js";

const encoders = [
  { name: "base36", enc: base36 },
  { name: "base58", enc: base58 },
  { name: "base62", enc: base62 },
  { name: "base64", enc: base64 },
];

for (const { name, enc } of encoders) {
  test(`${name} - empty data`, (t) => {
    const data = new Uint8Array();
    const encoded = enc.encode(data);
    const decoded = enc.decode(encoded);

    t.is(encoded.length, 0);
    t.deepEqual(decoded, data);
  });

  test(`${name} - simple data`, (t) => {
    const data = new Uint8Array([1, 2, 3]);
    const encoded = enc.encode(data);
    const decoded = enc.decode(encoded);
    t.deepEqual(decoded, data);
  });

  test(`${name} - 1kb of data`, (t) => {
    const data = new Uint8Array(1024);
    const encoded = enc.encode(data);
    const decoded = enc.decode(encoded);
    t.deepEqual(decoded, data);
  });

  test(`${name} - invalid input decode`, (t) => {
    t.throws(() => enc.decode("💩👋%$@!"));
  });
}
