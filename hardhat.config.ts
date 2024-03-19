import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      forking: {
        url: process.env.SEPOLIA_RPC_URL ?? "",
        blockNumber: 5509803,
      },
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL ?? "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY ?? ""
    },
  },

  mocha: {
    timeout: 120_000
  }

};

export default config;
