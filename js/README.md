# redstone-near-connector-js

Javascript (Typescript) library for integrating RedStone Oracles with NEAR Smart Contracts and dApps.

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

Install [redstone-near-connector-js](https://www.npmjs.com/package/redstone-near-connector-js) dependency in your smart contract NPM project

```sh
npm install redstone-near-connector-js
```

#### Usage

Now you can use the `getOracleValue` function in your smart contract code in the following way:

```js
import { NearBindgen, near, call, view } from "near-sdk-js";
import { getOracleValue } from "redstone-near-connector-js";

@NearBindgen({})
class YourContract {

  ...

  @call({}) // Public method
  your_contract_method({ redstone_payload }: { redstone_payload: Uint8Array }) {

    ...

    // 32 bytes identifier of the data feed (hex)
    const dataFeedId = "4254430000000000000000000000000000000000000000000000000000000000";

    // Required min number of unique signers for the requested data feed
    const uniqueSignersThreshold = 2;

    // Array, containing public keys (hex) of trusted signers
    // Trusted public keys can be found here: https://github.com/redstone-finance/redstone-oracles-monorepo/blob/main/packages/oracles-smartweave-contracts/src/contracts/redstone-oracle-registry/initial-state.json
    const authorisedSigners = [SIGNER_1_PUB_KEY_HEX, SIGNER_2_PUB_KEY_HEX];

    // Block timestamp milliseconds
    const currentTimestampMilliseconds = near.blockTimestamp() / 1_000_000;

    // `getOracleValue` function will:
    // - parse redstone payload,
    // - go through each signed data package,
    // - verify each signature,
    // - count unique signers for the requested data feed,
    // - after passing all checks, return the aggregated median value
    const oracleValue = getOracleValue({
      dataFeedId,
      uniqueSignersThreshold,
      authorisedSigners,
      currentTimestampMilliseconds,
      redstonePayload: redstone_payload,
      keccak256: near.keccak256,
      ecrecover: near.ecrecover,
    });

    ...
  }
}
```

### 2. Adjust your frontend code

You probably noticed, that in the first step your smart contract function requires an additional String argument (`redstone_payload`). You can get it in your front-end or your tests code using [redstone-sdk](https://www.npmjs.com/package/redstone-sdk).

#### Installation

Firstly, install it in your frontgend JS or TS project

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
    uniqueSignersCount: 2,
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

You can check out a simple example NEAR dApp powered by RedStone oracles [here.](https://github.com/redstone-finance/synths-on-near-js)

## 👩🏻‍💻 Development and contributions

### Code structure

Source code ([src](./src/) folder):

- [index.ts](./src/index.ts) - entrypoint file
- [core.ts](./src/core.ts) - main redstone logic - payload parsing, signature verification
- [assert.ts](./src/assert.ts) - assertion function
- [bytes.ts](./src/bytes.ts) - bytes utilities for conversion between different bytes representations
- [math.ts](./src/math.ts) - implementation of the `getMedianValue` function

Tests are located in the [test](./test/) folder.

### To run tests with output printing

`yarn test`

## 🙋‍♂️ Contact

Please feel free to contact RedStone team on [Discord](https://redstone.finance/discord) or send email to core@redstone.finance

## 📜 License

MIT
