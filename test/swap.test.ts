import { ethers } from "hardhat";
import { deploySwapper } from "../scripts/deploy";
import { SEPOLIA_WETH_ADDRESS, SEPOLIA_SWAP_ROUTER_ADDRESS, usdcAddress } from "../scripts/consts";
import { expect } from "chai";
import { Swapper } from "../typechain-types";
import { IERC20, IWeth } from "../typechain-types/IErc20.sol";


describe("Swap", async function () {
    let swapper: Swapper;
    let weth: IWeth;
    let usdc: IERC20;

    beforeEach(async function () {
        swapper = await deploySwapper();
        weth = await ethers.getContractAt("IWeth", SEPOLIA_WETH_ADDRESS);
        usdc = await ethers.getContractAt("IERC20", usdcAddress);
    })

    it("Cannot swap when not enough ETH funds", async function () {
        const user = (await ethers.getSigners())[1];
        await expect(
            swapper.connect(user).swapEtherToToken(usdcAddress, 10, {value: BigInt(2e10)})
        ).to.be.revertedWith("Swapper::swapEtherToToken: Not enough founds");
    })

    it("ETH to USDC using WETH", async function () {
        const swapperAddress = await swapper.getAddress();
        const user = (await ethers.getSigners())[19];

        // 1. Check initial balances
        expect(await weth.balanceOf(user.address)).to.be.equal(0);
        expect(await usdc.balanceOf(user.address)).to.be.equal(0);
        expect(await weth.balanceOf(swapperAddress)).to.be.equal(0);

        // 2. Perform swap
        const ethToSwap = BigInt(7930685705895820);
        await expect(
            swapper.connect(user).swapEtherToToken(usdcAddress, 5e5, {value: ethToSwap})
        ).to.be.emit(weth, "Deposit").withArgs(swapperAddress, ethToSwap)
        .to.be.emit(weth, "Approval").withArgs(swapperAddress, SEPOLIA_SWAP_ROUTER_ADDRESS, ethToSwap)
        .to.be.emit(swapper, "ReceivedFromSwap");

        // 3. Check post swap balances
        expect(await usdc.balanceOf(user.address)).to.be.gte(5e5);
        expect(await weth.balanceOf(swapperAddress)).to.be.equal(0);
    })
})
