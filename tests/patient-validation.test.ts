import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validatePatientRegistration } from "../patient-validation";

describe("patient registration validation", () => {
  it("trims and accepts valid registration data", () => {
    assert.deepEqual(validatePatientRegistration({
      name: "  Demo Patient ",
      age: 24,
      gender: "Other",
      contact: "  12345 ",
      address: "  Demo address ",
    }), {
      data: {
        name: "Demo Patient",
        age: 24,
        gender: "Other",
        contact: "12345",
        address: "Demo address",
      },
    });
  });

  it("rejects malformed or out-of-range registrations", () => {
    for (const input of [
      null,
      { name: "", age: 24, gender: "Male", contact: "12345", address: "Address" },
      { name: "Demo Patient", age: 24.5, gender: "Male", contact: "12345", address: "Address" },
      { name: "Demo Patient", age: 131, gender: "Male", contact: "12345", address: "Address" },
      { name: "Demo Patient", age: 24, gender: "Unknown", contact: "12345", address: "Address" },
      { name: "Demo Patient", age: 24, gender: "Male", contact: "", address: "Address" },
    ]) {
      assert.equal("error" in validatePatientRegistration(input), true);
    }
  });
});
