# Redstone Near Connectors

Developer tools for integrating RedStone Oracles with the NEAR smart contracts and dApps.

- JS module on NPM - [redstone-near-connector-js](https://www.npmjs.com/package/redstone-near-connector-js)
- RUST crate on Crates.io - [redstone-near-connector-rs](https://crates.io/crates/redstone-near-connector-rs)

## 🔮 RedStone Oracles

RedStone is a data ecosystem that delivers frequently updated, reliable and diverse data for your dApps and smart contracts.

It uses a radically different way of putting oracle data on-chain:

- RedStone data providers need to sign provided data, but don't need to push the data on-chain. It allows them to provide way more data with the significantly higher update frequency
- RedStone leverages the decentralized [Streamr](https://streamr.network/) pub-sub network to deliver signed oracle data from providers to the end users
- End users can self-deliver signed Oracle data on-chain
- On-chain Smart Contracts verify the data integrity using cryptographic signatures and timestamps
- RedStone uses token incentives to motivate data providers to maintain data integrity and uninterrupted service
- Additionally, RedStone leverages the Arweave blockchain as a cheap and permanent storage for archiving Oracle data and maintaining data providers' accountability

## 🔗 Near blockchain

NEAR is a user-friendly and carbon-neutral blockchain, built from the ground up to be performant, secure, and infinitely scalable.

In technical terms, NEAR is a layer one, sharded, proof-of-stake blockchain built with usability in mind.

In simple terms, NEAR is **blockchain for everyone**.

## 🚀 Getting started

- [Integrate RedStone Oracles with NEAR contracts in **RUST**](./rust/)
- [Integrate RedStone Oracles with NEAR contracts in **JS**](./js/)

If you would like to use RedStone oracles on the [Aurora]() chain, just go to the main [RedStone documentation](https://docs.redstone.finance/docs/smart-contract-devs/getting-started). It provides comprehensive explanation of integration with EVM-compatible chains.

## 👩🏻‍💻 Code structure

This repository contains implementations of near connectors for both **Typescript** and **Rust** smart contracts:

- **redstone-near-connector-rs** - [`rust` folder](./rust/)
- **redstone-near-connector-js** - [`js` folder](./js/)

## 🙋‍♂️ Contact

Please feel free to contact RedStone team on [Discord](https://redstone.finance/discord) or send email to core@redstone.finance

## 📜 License

MIT
