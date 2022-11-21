# redstone-near-connector-rs

RUST library for integrating RedStone Oracles with NEAR Smart Contracts and dApps.

## 🔮 RedStone Oracles

RedStone is a data ecosystem that delivers frequently updated, reliable and diverse data on-chain.

To learn more about RedStone oracles use the following links:

- [RedStone documentation](https://docs.redstone.finance/docs/introduction)
- [Supported Price Feeds (1000+)](https://docs.redstone.finance/docs/smart-contract-devs/price-feeds)
- [Data from custom URLs](https://docs.redstone.finance/docs/smart-contract-devs/custom-urls)
- [NFT Data Feeds](https://docs.redstone.finance/docs/smart-contract-devs/nft-data-feeds)
- [Verifiable entropy](https://docs.redstone.finance/docs/smart-contract-devs/pseudo-randomness)

## 🚀 Getting started

### 1. Adjust your NEAR smart contracts

#### Installation

Add [redstone-near-connector-rs](https://crates.io/crates/redstone-near-connector-rs) dependency to your Cargo.toml file in your smart contract crate

#### Usage

Now you can use the `get_oracle_value` function in your smart contract code in the following way:

```rust
use near_sdk::{log, near_bindgen};
use redstone_near_connector_rs::{get_oracle_value, decode_hex};

const BTC_BYTES_32_HEX_STR: &str =
    "4254430000000000000000000000000000000000000000000000000000000000";

const REDSTONE_MAIN_DEMO_SIGNER_PUB_KEY_HEX: &str =
  "009dd87eb41d96ce8ad94aa22ea8b0ba4ac20c45e42f71726d6b180f93c3f298e333ae7591fe1c9d88234575639be9e81e35ba2fe5ad2c2260f07db49ccb9d0d";

fn get_pub_key(hex_pub_key: &str) -> [u8; 64] {
  let pub_key_vec = decode_hex(hex_pub_key).unwrap();
  pub_key_vec.try_into().unwrap()
}

#[near_bindgen]
pub struct YourContract {
  ...
}

#[near_bindgen]
impl YourContract {
  ...

  pub fn your_contract_method(&mut self, redstone_payload_str: String) {
    ...

    // 32 bytes identifier of the data feed
    let data_feed_id_vec = decode_hex(BTC_BYTES_32_HEX_STR).unwrap();
    let data_feed_id: [u8; 32] = data_feed_id_vec.try_into().unwrap();

    // Required min number of unique signers for the requested data feed
    let unique_signers_threshold = 1;

    // Vector, containing public keys of trusted signers
    // Trusted public keys can be found here: https://github.com/redstone-finance/redstone-oracles-monorepo/blob/main/packages/oracles-smartweave-contracts/src/contracts/redstone-oracle-registry/initial-state.json
    let authorised_signers: Vec<[u8; 64]> =
      vec![get_pub_key(REDSTONE_MAIN_DEMO_SIGNER_PUB_KEY_HEX)];

    let current_timestamp_milliseconds = u128::from(near_sdk::env::block_timestamp() / 1_000_000);

    // Signer oracle data, efficiently serialized to bytes
    let redstone_payload = decode_hex(&redstone_payload).unwrap();

    // `get_oracle_value` function will:
    // - parse redstone payload,
    // - go through each signed data package,
    // - verify each signature,
    // - count unique signers for the requested data feed,
    // - after passing all checks, return the aggregated median value
    let oracle_value = get_oracle_value(
      &data_feed_id,
      unique_signers_threshold,
      &authorised_signers,
      current_timestamp_milliseconds,
      &redstone_payload,
    );

    ...
  }
}

```

### 2. Adjust your frontend code

You probably noticed, that in the first step your smart contract function requires an additional String argument (`redstone_payload`). You can get it in your front-end or your tests code using [redstone-sdk](https://www.npmjs.com/package/redstone-sdk).

#### Installation

Firstly, install it in your frontend JS or TS project

```sh
# Using NPM
npm install redstone-sdk

# Or using yarn
yarn add redstone-sdk
```

#### Usage

Then you can request the redstone payload in the following way:

```js
import redstoneSDK from "redstone-sdk";

const redstoneDataGateways = [
  "https://cache-service-direct-1.b.redstone.finance",
  "https://d33trozg86ya9x.cloudfront.net",
];

const redstonePayloadHex = await redstoneSDK.requestRedstonePayload(
  {
    dataServiceId: "redstone-main-demo",
    uniqueSignersCount: 1,
    dataFeeds: ["BTC"],
  },
  redstoneDataGateways
);

// Then you can pass the `redstonePayloadHex` as an argument to the smart contract call, e.g.
const outcome = await wallet.signAndSendTransaction({
  ...
  actions: [
    {
      type: "FunctionCall",
      params: {
        methodName: "your_contract_method",
        args: {
          redstone_payload: redstonePayloadHex,
        },
        ...
      },
    },
  ],
});
```

## 🔥 Examples

You can check out a simple example NEAR dApp in RUST powered by RedStone oracles [here.](https://github.com/redstone-finance/redstone-near-dapp-example-rust)

## 👩🏻‍💻 Development and contributions

### Code structure

The main logic is located in the [src/lib.rs](./src/lib.rs) file.
Tests are located in the [tests](./tests/) folder.

### To run tests with output printing

`cargo test -- --nocapture`

## 🙋‍♂️ Contact

Please feel free to contact RedStone team on [Discord](https://redstone.finance/discord) or send email to core@redstone.finance

## 📜 License

MIT
