export const getMedianValue = (values: bigint[]): bigint => {
  if (values.length === 0) {
    throw new Error("Can not take median of an empty array");
  }
  values.sort((a, b) => (a > b ? 1 : -1));
  const mid = Math.floor(values.length / 2);
  if (values.length % 2 === 0) {
    return (values[mid - 1] + values[mid]) / BigInt(2);
  } else {
    return values[mid];
  }
};
