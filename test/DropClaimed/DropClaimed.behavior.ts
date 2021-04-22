import { expect } from "chai";
import BalanceTree from "../utils/balance-tree";

export async function shouldBehaveLikeIsClaimed(dropFactory: any, ercContract: any, tree1: BalanceTree) {
  it("should return the status if a drop is claimed or not", async function () {
    const status = await dropFactory.isDropClaimed(ercContract.address, 1, tree1.getHexRoot());
    console.log("Is Drop Claimed", status);
  });
}
