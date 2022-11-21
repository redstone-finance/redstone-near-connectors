# Redstone Near Connectors

Developer tools for integrating RedStone Oracles with the NEAR smart contracts and dApps.

- JS module on NPM - [redstone-near-connector-js](https://www.npmjs.com/package/redstone-near-connector-js)
- RUST crate on Crates.io - [redstone-near-connector-rs](https://crates.io/crates/redstone-near-connector-rs)

## 🔮 RedStone Oracles

RedStone is a data ecosystem that delivers frequently updated, reliable and diverse data for your dApps and smart contracts.

It uses a radically different way of putting oracle data on-chain:

- RedStone data providers need to sign provided data and broadcast it using the decentralized [Streamr](https://streamr.network/) pub-sub network. Providers **don't need to push the data on-chain**, which allows them to provide way **more types of data** with significantly **higher update frequency**
- End users can receive signed oracle data from the Streamr network and self-deliver it on-chain, attaching it to their transactions
- On-chain Smart Contracts can verify the data integrity using cryptographic signatures and timestamps

Additionally, RedStone:

- Uses token incentives to motivate data providers to maintain data integrity and uninterrupted service
- Leverages [Arweave blockchain](https://www.arweave.org/) as a cheap and permanent decentralized storage for archiving Oracle data and maintaining data providers' accountability

To learn more about RedStone oracles design check out the [RedStone docs.](https://docs.redstone.finance/docs/introduction)

## 🔗 Near blockchain

NEAR is a user-friendly and carbon-neutral blockchain, built from the ground up to be performant, secure, and infinitely scalable.

In technical terms, NEAR is a layer one, sharded, proof-of-stake blockchain built with usability in mind.

In simple terms, NEAR is **blockchain for everyone**.

To learn more about the NEAR blockchain checkout out the [official NEAR documentation.](https://docs.near.org/)

## 🚀 Getting started

- [Integrate RedStone Oracles with NEAR contracts in **RUST**](./rust/)
- [Integrate RedStone Oracles with NEAR contracts in **JS**](./js/)

If you would like to use RedStone oracles on the [Aurora]() chain, just go to the main [RedStone documentation](https://docs.redstone.finance/docs/smart-contract-devs/getting-started). It provides comprehensive explanation of integration with EVM-compatible chains.

## 👩🏻‍💻 Code structure

This repository contains implementations of near connectors for both **Typescript** and **Rust** smart contracts:

- **redstone-near-connector-rs** - [`rust` folder](./rust/)
- **redstone-near-connector-js** - [`js` folder](./js/)

## 💡 Examples
- [redstone-near-dapp-example-js](https://github.com/redstone-finance/redstone-near-dapp-example-js)
- [redstone-near-dapp-example-rust](https://github.com/redstone-finance/redstone-near-dapp-example-rust)

## 🙋‍♂️ Contact

Please feel free to contact RedStone team on [Discord](https://redstone.finance/discord) or send email to core@redstone.finance

## 📜 License

MIT
