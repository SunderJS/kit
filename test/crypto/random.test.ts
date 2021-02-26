import { generateRandomToken } from "../../lib/crypto/random"

describe("Random token generation", () => {
    test("Entropy translation into bytes", () => {
        expect(generateRandomToken(128)).toHaveLength(16);

        // It gets rounded up
        expect(generateRandomToken(126)).toHaveLength(16); 
        expect(generateRandomToken(1)).toHaveLength(1);
    });

    test("Invalid input", () => {
        expect(() => generateRandomToken(0)).toThrow();
        expect(() => generateRandomToken(-1)).toThrow();
        expect(() => generateRandomToken(-8)).toThrow();
        expect(() => generateRandomToken(NaN)).toThrow();
    })
});
