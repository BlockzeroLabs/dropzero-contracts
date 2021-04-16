import { expect } from "chai";
import { BigNumber } from "ethers";
export async function shouldBehaveLikeClaimFromDrop(dropFactory: any, ercContract: string, tree1: any, wallet0: any) {
  const proof0 = tree1.getProof(0, wallet0.address, BigNumber.from("100"));
  const proof1 = tree1.getProof(1, wallet0.address, BigNumber.from("101"));
  it("should claim a drop successfully", async function () {
    expect(await dropFactory.claimFromDrop(ercContract, 1, BigNumber.from("101"), tree1.getHexRoot(), proof1));
  });
  it("should fail while claiming an already claimed drop", async function () {
    await expect(dropFactory.claimFromDrop(ercContract, 1, BigNumber.from("101"), tree1.getHexRoot(), proof1)).to.be.revertedWith("DROP_ALREADY_CLAIMED");
  });
  it("should fail on claim due to invalid proof", async function () {
    await expect(dropFactory.claimFromDrop(ercContract, 0, BigNumber.from(100), tree1.getHexRoot(), [])).to.be.revertedWith("DROP_INVALID_PROOF");
  });
}
