export const assert = (condition: boolean, msg?: string) => {
  if (!condition) {
    const errMsg =
      "Assertion failed" + (msg ? ` with: ${msg}` : " without message");
    throw new Error(errMsg);
  }
};
