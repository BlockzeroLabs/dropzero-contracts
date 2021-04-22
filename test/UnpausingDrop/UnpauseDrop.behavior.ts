import { expect } from "chai";

import BalanceTree from "../utils/balance-tree";

const DUMMY_TOKEN = "0x0000000000000000000000000000000000000001";

export async function shouldBehaveLikeUnPauseWithdraw(dropFactory: any, token: any, tree1: BalanceTree) {
  it("should fail while unpausing a drop of unowned drop", async function () {
    await expect(dropFactory.unpause(DUMMY_TOKEN, tree1.getHexRoot())).to.be.revertedWith("NOT_OWNER");
  });

  it("should unpause a drop", async function () {
    expect(await dropFactory.unpause(token.address, tree1.getHexRoot()));
  });
}
