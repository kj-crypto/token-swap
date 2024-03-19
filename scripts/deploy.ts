import { ethers } from "hardhat";
import { SEPOLIA_SWAP_ROUTER_ADDRESS, SEPOLIA_V3FACTORY_ADDRESS, SEPOLIA_WETH_ADDRESS } from "./consts";

const POOL_FEE = 3000;
const SLIPPAGE = 500;

export async function deploySwapper() {
  const swapper = await ethers.deployContract("Swapper",
    [
      SEPOLIA_SWAP_ROUTER_ADDRESS,
      SEPOLIA_V3FACTORY_ADDRESS,
      SEPOLIA_WETH_ADDRESS,
      POOL_FEE,
      SLIPPAGE,
    ],
  );
  await swapper.waitForDeployment();
  return swapper;
}

async function main() {
  const swapper = await deploySwapper();
  console.log(`Swapper deployed to ${swapper.target}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
