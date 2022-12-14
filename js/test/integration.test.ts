import { getOracleValue } from "../src";
import { asciiToBytes, fromHexString, toHexString } from "../src/bytes";
import { requestRedstonePayload } from "redstone-sdk";

const REDSTONE_PAYLOAD_HEX_STR =
  "4254430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003d1e382100045544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e90edd00001812f2590c000000020000002c1296a449f5d353c8b04eb389f33a583ee79449cca6e366900042f19f2521e722a410929223231905839c00865af68738f1a202478d87dc33675ea5824f343901b4254430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003d1e382100045544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e90edd00001812f2590c000000020000002dbbf8a0e6b1c9a56a4a0ef7089ef2a3f74fbd21fbd5c7c8192b70084004b4f6d37427507c4fff835f74fd4d000b6830ed296e207f49831b96f90a4f4e60820ee1c0002312e312e3223746573742d646174612d66656564000014000002ed57011e0000";
const BTC_BYTES_32_HEX =
  "4254430000000000000000000000000000000000000000000000000000000000";
const SIGNER_1_PUB_KEY_HEX =
  "466d7fcae563e5cb09a0d1870bb580344804617879a14949cf22285f1bae3f276728176c3c6431f8eeda4538dc37c865e2784f3a9e77d044f33e407797e1278a";
const SIGNER_2_PUB_KEY_HEX =
  "4f355bdcb7cc0af728ef3cceb9615d90684bb5b2ca5f859ab0f0b704075871aa385b6b1b8ead809ca67454d9683fcf2ba03456d6fe2c4abe2b07f0fbdbb2f1c1";
const TEST_TIMESTAMP_MILLISECONDS = 1654353400000;
const EUR_BYTES_32_HEX =
  "4555520000000000000000000000000000000000000000000000000000000000";

// ========================== RedStone payload structure (hex) ==========================
//   "4254430000000000000000000000000000000000000000000000000000000000" + // bytes32("BTC")
//   "000000000000000000000000000000000000000000000000000003d1e3821000" + // 42000 * 10^8
//   "4554480000000000000000000000000000000000000000000000000000000000" + // bytes32("ETH")
//   "0000000000000000000000000000000000000000000000000000002e90edd000" + // 2000 * 10^8
//   "01812f2590c0" + // timestamp (1654353400000 in hex)
//   "00000020" + // data points value byte size (32 in hex)
//   "000002" + // data points count
//   "c1296a449f5d353c8b04eb389f33a583ee79449cca6e366900042f19f2521e722a410929223231905839c00865af68738f1a202478d87dc33675ea5824f343901b" + // signature of the first signer
//   "4254430000000000000000000000000000000000000000000000000000000000" + // bytes32("BTC")
//   "000000000000000000000000000000000000000000000000000003d1e3821000" + // 42000 * 10^8
//   "4554480000000000000000000000000000000000000000000000000000000000" + // bytes32("ETH")
//   "0000000000000000000000000000000000000000000000000000002e90edd000" + // 2000 * 10^8
//   "01812f2590c0" + // timestamp (1654353400000 in hex)
//   "00000020" + // data points value byte size (32 in hex)
//   "000002" + // data points count
//   "dbbf8a0e6b1c9a56a4a0ef7089ef2a3f74fbd21fbd5c7c8192b70084004b4f6d37427507c4fff835f74fd4d000b6830ed296e207f49831b96f90a4f4e60820ee1c" + // signature of the second signer
//   "0002" + // data packages count
//   "312e312e3223746573742d646174612d66656564" + // unsigned metadata toUtf8Bytes("1.1.2#test-data-feed")
//   "000014" + // unsigned metadata byte size (20 in hex)
//   "000002ed57011e0000" // RedStone marker

const uint8ArrayToAscii = (bytes: Uint8Array): string => {
  const byteArrValues = [];
  for (let i = 0; i < bytes.length; i++) {
    byteArrValues.push(bytes[i]);
  }
  return String.fromCharCode(...byteArrValues);
};

const mockKeccak256 = (msg: string) => {
  return "mock-hash-of: " + msg;
};

const mockEcrecover = (
  _msgHash: string,
  signatureWithoutVByte: string
): string => {
  const signatureHex = toHexString(asciiToBytes(signatureWithoutVByte));
  if (signatureHex.startsWith("dbbf8a0e6b1c9a56a4a0")) {
    return uint8ArrayToAscii(fromHexString(SIGNER_1_PUB_KEY_HEX));
  } else {
    return uint8ArrayToAscii(fromHexString(SIGNER_2_PUB_KEY_HEX));
  }
};

describe("Integration tests", () => {
  test("Should properly get oracle value with correct test payload", async () => {
    const oracleValue = getOracleValue({
      authorisedSigners: [SIGNER_1_PUB_KEY_HEX, SIGNER_2_PUB_KEY_HEX],
      currentTimestampMilliseconds: TEST_TIMESTAMP_MILLISECONDS,
      dataFeedId: BTC_BYTES_32_HEX,
      redstonePayload: fromHexString(REDSTONE_PAYLOAD_HEX_STR),
      uniqueSignersThreshold: 2,
      ecrecover: mockEcrecover,
      keccak256: mockKeccak256,
    });

    expect(oracleValue).toBe(BigInt(4200000000000));
  });

  test("Should properly get oracle value with real redstone payload", async () => {
    const redstoneDataGateways = [
      "https://cache-service-direct-1.b.redstone.finance",
      "https://d33trozg86ya9x.cloudfront.net",
    ];

    const redstonePayloadHex = await requestRedstonePayload(
      {
        dataServiceId: "redstone-main-demo",
        uniqueSignersCount: 1,
        dataFeeds: ["BTC"],
      },
      redstoneDataGateways
    );

    const realBtcPriceFromOracle = getOracleValue({
      authorisedSigners: [SIGNER_2_PUB_KEY_HEX],
      currentTimestampMilliseconds: TEST_TIMESTAMP_MILLISECONDS,
      dataFeedId: BTC_BYTES_32_HEX,
      redstonePayload: fromHexString(redstonePayloadHex),
      uniqueSignersThreshold: 1,
      ecrecover: mockEcrecover,
      keccak256: mockKeccak256,
    });

    console.log({ realBtcPriceFromOracle });
    expect(realBtcPriceFromOracle).toBeGreaterThan(0);
  });

  test("Should fail for corrupted payload", async () => {
    expect(() =>
      getOracleValue({
        authorisedSigners: [SIGNER_1_PUB_KEY_HEX, SIGNER_2_PUB_KEY_HEX],
        currentTimestampMilliseconds: TEST_TIMESTAMP_MILLISECONDS,
        dataFeedId: BTC_BYTES_32_HEX,
        redstonePayload: fromHexString(
          REDSTONE_PAYLOAD_HEX_STR.replace(
            "000002ed57011e0000",
            "000002ed57011b0000"
          )
        ),
        uniqueSignersThreshold: 2,
        ecrecover: mockEcrecover,
        keccak256: mockKeccak256,
      })
    ).toThrow("Assertion failed with: Invalid redstone marker");
  });

  test("Should fail if requesting missing data feed id", () => {
    expect(() =>
      getOracleValue({
        authorisedSigners: [SIGNER_1_PUB_KEY_HEX, SIGNER_2_PUB_KEY_HEX],
        currentTimestampMilliseconds: TEST_TIMESTAMP_MILLISECONDS,
        dataFeedId: EUR_BYTES_32_HEX,
        redstonePayload: fromHexString(REDSTONE_PAYLOAD_HEX_STR),
        uniqueSignersThreshold: 2,
        ecrecover: mockEcrecover,
        keccak256: mockKeccak256,
      })
    ).toThrow("Insufficient number of unique signers: 0");
  });
});
