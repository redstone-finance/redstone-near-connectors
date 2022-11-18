import { assert } from "./assert";
import { near } from "near-sdk-js";
import {
  asciiToBytes,
  bytesToAscii,
  bytesToBN,
  bytesToNumber,
  byteSubArrayToSeparateArray,
  toHexString,
} from "./bytes";
import { getMedianValue } from "./math";

const REDSTONE_MARKER_BS = 9;
const UNSIGNED_METADATA_BYTE_SIZE_BS = 3;
const DATA_PACKAGES_COUNT_BS = 2;
const DATA_POINTS_COUNT_BS = 3;
const SIGNATURE_BS = 65;
const DATA_POINT_VALUE_BYTE_SIZE_BS = 4;
const DATA_FEED_ID_BS = 32;
const TIMESTAMP_BS = 6;
const MAX_TIMESTAMP_DELAY_MS = 3 * 60 * 1000; // 3 minutes in milliseconds
const REDSTONE_MARKER = [0, 0, 2, 237, 87, 1, 30, 0, 0]; // 0x000002ed57011e0000

interface OracleRequestParams {
  dataFeedId: string;
  uniqueSignersThreshold: number;
  authorisedSigners: string[];
  currentTimestampMilliseconds: number;
  redstonePayload: Uint8Array;
}

interface DataPackageExtractionRequest {
  oracleRequestParams: OracleRequestParams;
  negativeOffsetToDataPackage: number;
}

interface DataPackageExtractionResult {
  containsRequestedDataFeedId: boolean;
  valueForRequestedDataFeed: bigint;
  signerIndex: number;
  dataPackageByteSize: number;
}

const assertValidRedstoneMarker = (redstonePayload: Uint8Array) => {
  const startIndex = redstonePayload.length - REDSTONE_MARKER_BS;

  for (let i = 0; i < REDSTONE_MARKER_BS; i++) {
    const expectedByte = REDSTONE_MARKER[i];
    const receivedByte = redstonePayload[startIndex + i];
    assert(expectedByte == receivedByte, "Invalid redstone marker");
  }
};

const extractUnsignedMetadataOffset = (redstonePayload: Uint8Array): number => {
  const startIndex =
    redstonePayload.length -
    (UNSIGNED_METADATA_BYTE_SIZE_BS + REDSTONE_MARKER_BS);

  const unsignedMetadataMsgByteSize = bytesToNumber({
    fullArr: redstonePayload,
    startIndex,
    length: UNSIGNED_METADATA_BYTE_SIZE_BS,
  });

  return (
    unsignedMetadataMsgByteSize +
    UNSIGNED_METADATA_BYTE_SIZE_BS +
    REDSTONE_MARKER_BS
  );
};

const validateTimestamp = (
  receivedTimestampMilliseconds: number,
  currentTimestampMilliseconds: number
) => {
  if (
    receivedTimestampMilliseconds + MAX_TIMESTAMP_DELAY_MS <
    currentTimestampMilliseconds
  ) {
    throw new Error("Timestamp is too old");
  }
};

const extractDataPackage = (
  extractionReq: DataPackageExtractionRequest
): DataPackageExtractionResult => {
  const { redstonePayload, currentTimestampMilliseconds, authorisedSigners } =
    extractionReq.oracleRequestParams;
  const extractionResult: DataPackageExtractionResult = {
    containsRequestedDataFeedId: false,
    valueForRequestedDataFeed: BigInt(0),
    signerIndex: -1,
    dataPackageByteSize: 0,
  };

  // Extracting signature
  let endIndex =
    redstonePayload.length - extractionReq.negativeOffsetToDataPackage;
  let startIndex = endIndex - SIGNATURE_BS;
  const signatureStartIndex = startIndex;

  // Extracting number of data points
  startIndex -= DATA_POINTS_COUNT_BS;
  const dataPointsCount = bytesToNumber({
    fullArr: redstonePayload,
    startIndex,
    length: DATA_POINTS_COUNT_BS,
  });

  // Extracting data points value byte size
  startIndex -= DATA_POINT_VALUE_BYTE_SIZE_BS;
  const dataPointsValueSize = bytesToNumber({
    fullArr: redstonePayload,
    startIndex,
    length: DATA_POINT_VALUE_BYTE_SIZE_BS,
  });

  // Calculating total data package byte size
  const dataPackageByteSizeWithoutSig =
    (dataPointsValueSize + DATA_FEED_ID_BS) * dataPointsCount +
    TIMESTAMP_BS +
    DATA_POINT_VALUE_BYTE_SIZE_BS +
    DATA_POINTS_COUNT_BS;
  extractionResult.dataPackageByteSize =
    dataPackageByteSizeWithoutSig + SIGNATURE_BS;

  // Extracting and validating timestamp
  startIndex -= TIMESTAMP_BS;
  let timestampMilliseconds = bytesToNumber({
    fullArr: redstonePayload,
    startIndex,
    length: TIMESTAMP_BS,
  });
  validateTimestamp(timestampMilliseconds, currentTimestampMilliseconds);

  // Going through data points
  for (
    let dataPointIndex = 0;
    dataPointIndex < dataPointsCount;
    dataPointIndex++
  ) {
    // Extracting value
    startIndex -= dataPointsValueSize;
    const dataPointValue = bytesToBN({
      fullArr: redstonePayload,
      startIndex,
      length: dataPointsValueSize,
    });

    // Extracting data feed id
    startIndex -= DATA_FEED_ID_BS;
    const dataFeedId = byteSubArrayToSeparateArray({
      fullArr: redstonePayload,
      startIndex,
      length: DATA_FEED_ID_BS,
    });

    if (
      toHexString(dataFeedId) === extractionReq.oracleRequestParams.dataFeedId
    ) {
      extractionResult.containsRequestedDataFeedId = true;
      extractionResult.valueForRequestedDataFeed = dataPointValue;
      break;
    }
  }

  // Hashing the message
  const msgLen = dataPackageByteSizeWithoutSig;
  startIndex =
    redstonePayload.length -
    (msgLen + SIGNATURE_BS + extractionReq.negativeOffsetToDataPackage);
  const msgHash = near.keccak256(
    bytesToAscii({ fullArr: redstonePayload, startIndex, length: msgLen })
  );

  // Signer recovering
  const signatureVByte =
    redstonePayload[signatureStartIndex + 64] === 0x1c ? 1 : 0;
  const signatureWithoutVByte = bytesToAscii({
    fullArr: redstonePayload,
    startIndex: signatureStartIndex,
    length: SIGNATURE_BS - 1,
  });
  const recoveredSigner = near.ecrecover(
    msgHash,
    signatureWithoutVByte,
    signatureVByte,
    1
  );
  const recoveredSignerHex = toHexString(asciiToBytes(recoveredSigner!));

  // Signer verification
  for (
    let authorisedSignerIndex = 0;
    authorisedSignerIndex < authorisedSigners.length;
    authorisedSignerIndex++
  ) {
    if (authorisedSigners[authorisedSignerIndex] === recoveredSignerHex) {
      extractionResult.signerIndex = authorisedSignerIndex;
      break;
    }
  }
  if (extractionResult.signerIndex === -1) {
    throw new Error(`Signer is not authorised: ${recoveredSignerHex}`);
  }

  return extractionResult;
};

export const getOracleValue = (oracleReq: OracleRequestParams): bigint => {
  const { redstonePayload } = oracleReq;

  // Checking unsigned metadata with redstone marker
  assertValidRedstoneMarker(redstonePayload);
  let negativeOffset = extractUnsignedMetadataOffset(redstonePayload);

  // Getting number of data packages in the payload
  const numberOfDataPackages = bytesToNumber({
    fullArr: redstonePayload,
    startIndex:
      redstonePayload.length - (negativeOffset + DATA_PACKAGES_COUNT_BS),
    length: DATA_PACKAGES_COUNT_BS,
  });

  // Prepare helpful vars before parsing each data package
  negativeOffset += DATA_PACKAGES_COUNT_BS;
  const uniqueSigners: { [signedIndex: string]: boolean } = {};
  const values: bigint[] = [];

  // Extracting data packages one by one
  for (
    let dataPackageIndex = 0;
    dataPackageIndex < numberOfDataPackages;
    dataPackageIndex++
  ) {
    // Extracting and parsing data package
    const {
      dataPackageByteSize,
      containsRequestedDataFeedId,
      signerIndex,
      valueForRequestedDataFeed,
    } = extractDataPackage({
      oracleRequestParams: oracleReq,
      negativeOffsetToDataPackage: negativeOffset,
    });

    // Shifting negative offset to the next package
    negativeOffset += dataPackageByteSize;

    // Collecting value if needed
    if (containsRequestedDataFeedId && !uniqueSigners[signerIndex]) {
      uniqueSigners[signerIndex] = true;
      values.push(valueForRequestedDataFeed);
    }
  }

  if (values.length < oracleReq.uniqueSignersThreshold) {
    throw new Error(`Insufficient number of unique signers: ${values.length}`);
  }

  return getMedianValue(values);
};
