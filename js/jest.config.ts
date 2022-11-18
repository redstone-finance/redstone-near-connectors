import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  roots: ["<rootDir>/"],
  testMatch: ["**/test/**/?(*.)+(test).+(ts)"],
  transform: {
    "^.+\\.(ts|js)$": "ts-jest",
  },
  transformIgnorePatterns: ["near-sdk-js"],
  testEnvironment: "node",
};

export default config;
