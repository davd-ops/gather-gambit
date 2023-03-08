/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-gas-reporter";
require("dotenv").config({ path: "./.env" });

const config: HardhatUserConfig = {
  // Your type-safe config goes here
};

export default config;

module.exports = {
  gasReporter: {
    currency: "USD",
    token: "ETH",
    gasPrice: 20,
    enabled: process.env.COIN_MARKET_CAP ? true : false,
    coinmarketcap: process.env.COIN_MARKET_CAP,
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v5",
  },
  networks: {
    hardhat: {
      blockGasLimit: 45_000_000,
      throwOnCallFailures: false,
    },
    // localhost: {
    //   url: "http://127.0.0.1:8545/",
    //   /*
    //     notice no mnemonic here? it will just use account 0 of the hardhat node to deploy
    //     (you can put in a mnemonic here to set the deployer locally)

    //   */
    // },
    mainnet: {
      url: process.env.MAINNET_ALCHEMY_API_KEY_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [process.env.GOERLI_MM_PK],
    },

    fantom_testnet: {
      url: process.env.Fantom_Test_RPC_URL,
      accounts: [process.env.Fantom_testnet_PK],
    },
    fantom: {
      url: process.env.Fantom_RPC_URL,
      accounts: [process.env.fantom_Mainnet_PK],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.EXPLORER_API_KEY,
      ftmTestnet: process.env.Fantom_scanner,
      opera: process.env.Fantom_scanner,
    },
  },
};
