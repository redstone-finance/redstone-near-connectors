use redstone_near_connector_rs;
use std::convert::TryInto;
use std::{fmt::Write, num::ParseIntError};

const REDSTONE_PAYLOAD_HEX_STR: &str = "4254430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003d1e382100045544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e90edd00001812f2590c000000020000002c1296a449f5d353c8b04eb389f33a583ee79449cca6e366900042f19f2521e722a410929223231905839c00865af68738f1a202478d87dc33675ea5824f343901b4254430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003d1e382100045544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e90edd00001812f2590c000000020000002dbbf8a0e6b1c9a56a4a0ef7089ef2a3f74fbd21fbd5c7c8192b70084004b4f6d37427507c4fff835f74fd4d000b6830ed296e207f49831b96f90a4f4e60820ee1c0002312e312e3223746573742d646174612d66656564000014000002ed57011e0000";
const REDSTONE_CORRUPTED_PAYLOAD_HEX_STR: &str = "4254430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003d1e382100045544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e90edd00001812f2590c000000020000002c1296a449f5d353c8b04eb389f33a583ee79449cca6e366900042f19f2521e722a410929223231905839c00865af68738f1a202478d87dc33675ea5824f343901b4254430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003d1e382100045544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e90edd00001812f2590c000000020000002dbbf8a0e6b1c9a56a4a0ef7089ef2a3f74fbd21fbd5c7c8192b70084004b4f6d37427507c4fff835f74fd4d000b6830ed296e207f49831b96f90a4f4e60820ee1c0002312e312e3223746573742d646174612d66656564000014";
const BTC_BYTES_32_HEX_STR: &str =
    "4254430000000000000000000000000000000000000000000000000000000000";
const EUR_BYTES_32_HEX_STR: &str =
    "4555520000000000000000000000000000000000000000000000000000000000";
const SIGNER_1_PUB_KEY: &str = "466d7fcae563e5cb09a0d1870bb580344804617879a14949cf22285f1bae3f276728176c3c6431f8eeda4538dc37c865e2784f3a9e77d044f33e407797e1278a";
const SIGNER_2_PUB_KEY: &str = "4f355bdcb7cc0af728ef3cceb9615d90684bb5b2ca5f859ab0f0b704075871aa385b6b1b8ead809ca67454d9683fcf2ba03456d6fe2c4abe2b07f0fbdbb2f1c1";

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

pub fn decode_hex(s: &str) -> Result<Vec<u8>, ParseIntError> {
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&s[i..i + 2], 16))
        .collect()
}

pub fn encode_hex(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(bytes.len() * 2);
    for &b in bytes {
        write!(&mut s, "{:02x}", b).unwrap();
    }
    s
}

fn get_pub_key(hex_pub_key: &str) -> [u8; 64] {
    let pub_key_vec = decode_hex(hex_pub_key).unwrap();
    pub_key_vec.try_into().unwrap()
}

#[test]
fn it_gets_oracle_value() {
    let redstone_payload_vec = decode_hex(REDSTONE_PAYLOAD_HEX_STR).unwrap();
    let data_feed_id_vec = decode_hex(BTC_BYTES_32_HEX_STR).unwrap();
    let data_feed_id: [u8; 32] = data_feed_id_vec.try_into().unwrap();
    let authorised_signers: Vec<[u8; 64]> =
        vec![get_pub_key(SIGNER_1_PUB_KEY), get_pub_key(SIGNER_2_PUB_KEY)];
    let unique_signers_threshold = 1;
    let current_timestamp_milliseconds = 1654353400000;
    let oracle_value = redstone_near_connector_rs::get_oracle_value(
        &data_feed_id,
        unique_signers_threshold,
        &authorised_signers,
        current_timestamp_milliseconds,
        &redstone_payload_vec,
    );
    assert_eq!(42_000 * 100_000_000, oracle_value);
}

#[test]
#[should_panic(expected = "Invalid redstone marker")]
fn it_should_fail_for_corrupted_redstone_payload() {
    let redstone_payload_vec = decode_hex(REDSTONE_CORRUPTED_PAYLOAD_HEX_STR).unwrap();
    let data_feed_id_vec = decode_hex(BTC_BYTES_32_HEX_STR).unwrap();
    let data_feed_id: [u8; 32] = data_feed_id_vec.try_into().unwrap();
    let authorised_signers: Vec<[u8; 64]> =
        vec![get_pub_key(SIGNER_1_PUB_KEY), get_pub_key(SIGNER_2_PUB_KEY)];
    let unique_signers_threshold = 1;
    let current_timestamp_milliseconds = 1654353400000;
    redstone_near_connector_rs::get_oracle_value(
        &data_feed_id,
        unique_signers_threshold,
        &authorised_signers,
        current_timestamp_milliseconds,
        &redstone_payload_vec,
    );
}

#[test]
#[should_panic(expected = "Insufficient number of unique signers")]
fn it_should_fail_for_missing_data_feed_id() {
    let redstone_payload_vec = decode_hex(REDSTONE_PAYLOAD_HEX_STR).unwrap();
    let data_feed_id_vec = decode_hex(EUR_BYTES_32_HEX_STR).unwrap();
    let data_feed_id: [u8; 32] = data_feed_id_vec.try_into().unwrap();
    let authorised_signers: Vec<[u8; 64]> =
        vec![get_pub_key(SIGNER_1_PUB_KEY), get_pub_key(SIGNER_2_PUB_KEY)];
    let unique_signers_threshold = 1;
    let current_timestamp_milliseconds = 1654353400000;
    redstone_near_connector_rs::get_oracle_value(
        &data_feed_id,
        unique_signers_threshold,
        &authorised_signers,
        current_timestamp_milliseconds,
        &redstone_payload_vec,
    );
}
