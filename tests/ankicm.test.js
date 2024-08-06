import {describe, it, assert} from "../node_modules/teevi/src/teevi.js";

describe("Teevi test demo", () => {
    it("will not fail", () => {
        assert.true(2 * 2 === 4)
    })
    it("will fail", () => {
        assert.equals(4 + 2, 42)
    })
})
