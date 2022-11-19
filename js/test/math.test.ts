import { getMedianValue } from "../src/math";

describe("Math", () => {
  test("Should properly get median for array [3, 9, 5]", async () => {
    const median = getMedianValue([BigInt(3), BigInt(9), BigInt(5)]);
    expect(median).toBe(BigInt(5));
  });
});
