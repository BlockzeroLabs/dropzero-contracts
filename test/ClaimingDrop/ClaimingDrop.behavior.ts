import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import BalanceTree from "../utils/balance-tree";
export async function shouldBehaveLikeClaimFromDrop(
  dropFactory: Contract,
  tree1: BalanceTree,
  wallet0: SignerWithAddress,
  wallet1: SignerWithAddress,
  token: Contract,
) {
  const proof1 = tree1.getProof(1, wallet0.address, BigNumber.from("101"));
  it("should claim a drop successfully", async function () {
    console.log("Wallet0 balance before claim", (await token.balanceOf(wallet0.address)).toString());

    await expect(() => dropFactory.claimFromDrop(token.address, 1, BigNumber.from("101"), tree1.getHexRoot(), proof1)).to.changeTokenBalances(
      token,
      [wallet0, wallet1],
      [BigNumber.from("81"), BigNumber.from("20")],
    );
    console.log("Wallet0 balance After claim", (await token.balanceOf(wallet0.address)).toString());
    const dropAddress = await dropFactory.drops(token.address);
    console.log("Drop Address Balance AFTER claim", (await token.balanceOf(dropAddress)).toString());
  });

  it("should fail while claiming an already claimed drop", async function () {
    await expect(dropFactory.claimFromDrop(token.address, 1, BigNumber.from("101"), tree1.getHexRoot(), proof1)).to.be.revertedWith("DROP_ALREADY_CLAIMED");
  });

  it("should fail on claim due to invalid proof", async function () {
    await expect(dropFactory.claimFromDrop(token.address, 0, BigNumber.from("100"), tree1.getHexRoot(), [])).to.be.revertedWith("DROP_INVALID_PROOF");
  });
}
