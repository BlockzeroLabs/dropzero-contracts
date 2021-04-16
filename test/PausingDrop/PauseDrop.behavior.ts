import { expect } from "chai";
import BalanceTree from "../utils/balance-tree";
import { BigNumber } from "ethers";
const DUMMY_TOKEN = "0x0000000000000000000000000000000000000001";
export async function shouldBehaveLikePause(dropFactory: any, ercContract: string, tree1: BalanceTree, wallet0: any) {
  it("should fail while pausing a drop of unowned drop", async function () {
    await expect(dropFactory.pause(DUMMY_TOKEN, tree1.getHexRoot())).to.be.revertedWith("NOT_OWNER");
  });
  it("should pause a drop", async function () {
    expect(await dropFactory.pause(ercContract, tree1.getHexRoot()));
  });

  it("should fail claiming an inactive drop", async function () {
    const proof0 = tree1.getProof(0, wallet0.address, BigNumber.from("100"));
    const proof1 = tree1.getProof(1, wallet0.address, BigNumber.from("101"));
    await expect(dropFactory.claimFromDrop(ercContract, 1, BigNumber.from("101"), tree1.getHexRoot(), proof1)).to.be.revertedWith("DROP_NOT_ACTIVE");
  });
}
