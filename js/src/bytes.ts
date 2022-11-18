interface ByteSubArray {
  fullArr: Uint8Array;
  startIndex: number;
  length: number;
}

export const toHexString = (bytesArr: Uint8Array): string =>
  bytesArr.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

export const byteSubArrayToSeparateArray = (
  subArr: ByteSubArray
): Uint8Array => {
  const resultArr: Uint8Array = new Uint8Array(subArr.length);
  for (let i = 0; i < subArr.length; i++) {
    resultArr[i] = subArr.fullArr[subArr.startIndex + i];
  }
  return resultArr;
};

export const asciiToBytes = (str: string): Uint8Array => {
  const byteArr = [];
  for (let i = 0; i < str.length; i++) {
    byteArr.push(str.charCodeAt(i));
  }
  return new Uint8Array(byteArr);
};

export const bytesToAscii = (bytesArr: ByteSubArray): string => {
  const byteArrValues = [];
  for (let i = 0; i < bytesArr.length; i++) {
    byteArrValues.push(bytesArr.fullArr[bytesArr.startIndex + i]);
  }
  return String.fromCharCode(...byteArrValues);
};

export const bytesToBN = (bytesArr: ByteSubArray): bigint => {
  const numberBytes = byteSubArrayToSeparateArray(bytesArr);
  const numberBytesHex = toHexString(numberBytes);
  return BigInt("0x" + numberBytesHex);
};

export const bytesToNumber = (bytesArr: ByteSubArray): number => {
  return Number(bytesToBN(bytesArr));
};

export const fromHexString = (hexString: string): Uint8Array =>
  Uint8Array.from(
    hexString.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16))
  );
