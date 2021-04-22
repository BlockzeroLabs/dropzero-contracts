import { expect } from "chai";
import BalanceTree from "../utils/balance-tree";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
const DUMMY_TOKEN = "0x0000000000000000000000000000000000000001";
export async function shouldBehaveLikePause(dropFactory: any, token: any, tree1: BalanceTree, wallet0: SignerWithAddress) {
  it("should fail while pausing a drop of unowned drop", async function () {
    await expect(dropFactory.pause(DUMMY_TOKEN, tree1.getHexRoot())).to.be.revertedWith("NOT_OWNER");
  });
  it("should pause a drop", async function () {
    expect(await dropFactory.pause(token.address, tree1.getHexRoot()));
  });

  it("should fail claiming an inactive drop", async function () {
    const proof0 = tree1.getProof(0, wallet0.address, BigNumber.from("100"));
    const proof1 = tree1.getProof(1, wallet0.address, BigNumber.from("101"));
    await expect(dropFactory.claimFromDrop(token.address, 1, BigNumber.from("101"), tree1.getHexRoot(), proof1)).to.be.revertedWith("DROP_NOT_ACTIVE");
  });
}
