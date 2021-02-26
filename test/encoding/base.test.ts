import { base64 } from "../../lib/encoding/base64"
import { base36, base58, base62 } from "../../lib/encoding/baseX"

describe("BaseX encoding", () => {

    const encoders = [
        {name: "base36", enc: base36},
        {name: "base58", enc: base58},
        {name: "base62", enc: base62},
        {name: "base64", enc: base64}
    ];

    for(const {name, enc} of encoders) {
        test(`${name} - empty data`, () => {
            const data = new Uint8Array();
            const encoded = enc.encode(data);
            const decoded = enc.decode(encoded);

            expect(encoded).toHaveLength(0);
            expect(decoded).toEqual(data);
        });

        test(`${name} - simple data`, () => {
            const data = new Uint8Array([1,2,3]);
            const encoded = enc.encode(data);
            const decoded = enc.decode(encoded);
            expect(decoded).toEqual(data);
        });

        test(`${name} - 1kb of data`, () => {
            const data = new Uint8Array(1024);
            const encoded = enc.encode(data);
            const decoded = enc.decode(encoded);
            expect(decoded).toEqual(data);
        });

        test(`${name} - invalid input decode`, () => {
            expect(() => enc.decode("💩👋%$@!")).toThrow(`Non-${name} character`);
        });
    }
});
