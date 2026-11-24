import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectPatientsNeedingDemoRecords } from "../seed";

describe("demo health-record seeding", () => {
  it("only creates sample histories for newly seeded demo patients", () => {
    const patients = [
      { id: "existing-with-records" },
      { id: "existing-without-records" },
      { id: "new-demo" },
      { id: "new-demo-with-records" },
    ];

    const patientsNeedingRecords = selectPatientsNeedingDemoRecords(
      patients,
      new Set(["existing-with-records", "new-demo-with-records"]),
      new Set(["new-demo", "new-demo-with-records"])
    );

    assert.deepEqual(patientsNeedingRecords, [{ id: "new-demo" }]);
  });
});
