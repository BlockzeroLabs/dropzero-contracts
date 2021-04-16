import { expect } from "chai";
import BalanceTree from "../utils/balance-tree";

export async function shouldBehaveLikeWidthdraw(dropFactory: any, ercContract: string, tree1: BalanceTree) {
  it("should withdraw a drop successfully", async function () {
    expect(await dropFactory.withdraw(ercContract, tree1.getHexRoot()));
  });
}
