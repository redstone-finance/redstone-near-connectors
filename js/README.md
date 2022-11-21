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

// Trusted public keys can be found here: https://github.com/redstone-finance/redstone-oracles-monorepo/blob/main/packages/oracles-smartweave-contracts/src/contracts/redstone-oracle-registry/initial-state.json
const REDSTONE_MAIN_DEMO_SIGNER_PUB_KEY_HEX =
  "009dd87eb41d96ce8ad94aa22ea8b0ba4ac20c45e42f71726d6b180f93c3f298e333ae7591fe1c9d88234575639be9e81e35ba2fe5ad2c2260f07db49ccb9d0d";

function getDataFeedIdForSymbol(symbol: string): string {
  const symbolToDataFeedId = {
    NEAR: "4e45415200000000000000000000000000000000000000000000000000000000",
    BTC: "4254430000000000000000000000000000000000000000000000000000000000",
    ETH: "4554480000000000000000000000000000000000000000000000000000000000",
    TSLA: "54534c4100000000000000000000000000000000000000000000000000000000",
    EUR: "4555520000000000000000000000000000000000000000000000000000000000",
  };
  return symbolToDataFeedId[symbol];
}

@NearBindgen({})
class YourContract {

  ...

  @call({}) // Public method
  your_contract_method({ redstone_payload }: { redstone_payload: Uint8Array }) {

    ...

    // 32 bytes identifier of the data feed (hex)
    const dataFeedId = getDataFeedIdForSymbol(symbol);

    // Required min number of unique signers for the requested data feed
    const uniqueSignersThreshold = 1;

    // Array, containing public keys (hex) of trusted signers
    const authorisedSigners = [REDSTONE_MAIN_DEMO_SIGNER_PUB_KEY_HEX];

    // Block timestamp milliseconds
    const currentTimestampMilliseconds = Number(near.blockTimestamp() / BigInt(1_000_000));

    // `getOracleValue` function will:
    // - parse redstone payload,
    // - go through each signed data package,
    // - verify each signature,
    // - count unique signers for the requested data feed,
    // - after passing all checks, return the aggregated median value
    const oracleValue =  getOracleValue({
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

You probably noticed, that in the first step your smart contract function requires an additional Uint8Array argument (`redstone_payload`). You can get it in your front-end or your tests code using [redstone-sdk](https://www.npmjs.com/package/redstone-sdk).

#### Installation

Firstly, install redstone-sdk and ethers in your frontend JS or TS project

```sh
# Using NPM
npm install redstone-sdk ethers

# Or using yarn
yarn add redstone-sdk ethers
```

#### Usage

Then you can request the redstone payload in the following way:

```js
import redstoneSDK from "redstone-sdk";
import { arrayify } from "ethers/lib/utils";

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
          redstone_payload: Object.values(arrayify(`0x${redstonePayload}`)),
        },
        ...
      },
    },
  ],
});
```

## 🔥 Examples

You can check out a simple example NEAR dApp powered by RedStone oracles [here.](https://github.com/redstone-finance/redstone-near-dapp-example-js)

## 👩🏻‍💻 Development and contributions

### Code structure

Source code ([src](./src/) folder):

- [index.ts](./src/index.ts) - entrypoint file
- [core.ts](./src/core.ts) - main redstone payload parsing logic
- [assert.ts](./src/assert.ts) - assertion function
- [bytes.ts](./src/bytes.ts) - bytes utilities for conversion between different bytes representations
- [math.ts](./src/math.ts) - implementation of the `getMedianValue` function

Tests are located in the [test](./test/) folder.

### To run tests

```sh
yarn test
```

## 🙋‍♂️ Contact

Please feel free to contact RedStone team on [Discord](https://redstone.finance/discord) or send email to core@redstone.finance

## 📜 License

MIT
