# Swap ETH to ERC20
This is the integration with Uniswap-V3 DEX for making swap of ETH to custom ERC20 token.
Swap is performed by using WETH as an input asset for swap.
Swap params, like slippage or pool fee, can be found in [deploy script](scripts/deploy.ts)


## How to setup

1. Download project
2. Copy `.env.example` to `.env` file and setup envs. For testing only `SEPOLIA_RPC_URL` is obligatory
3. Run `npm install`
4. Compile contracts by `npx hardhat compile`
5. Run tests by `REPORT_GAS=true npx hardhat test`. This will test over sepolia testnet fork


## How to deploy
1. Setup `PRIVATE_KEY` in `.env` file
2. Run `npx hardhat run scripts/deploy.ts --network sepolia`

## How to make swap on testnet
Make sure you set up `PRIVATE_KEY` in `.env` file and then execute `npx hardhat run --network sepolia scripts/swap-on-live-testnet.ts`.
To adjust the swap params just modify the [scripts/swap-on-live-testnet.ts](scripts/swap-on-live-testnet.ts)
