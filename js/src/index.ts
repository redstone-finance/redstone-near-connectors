// data_feed_id: &[u8; 32],
// unique_signers_threshold: u8,
// authorised_signers: &[[u8; 64]],
// current_timestamp_milliseconds: u128,
// redstone_payload: &[u8],

interface OracleValueRequest {
  dataFeedId: Uint8Array;
  uniqueSignersThreshold: number;
  authorisedSigners: Uint8Array[];
  currentTimestampMilliseconds: number;
  redstonePayload: Uint8Array;
}

function getOracleValue(oracleReq: OracleValueRequest): number {
  return 42;
}
