import { expect } from "chai";
import BalanceTree from "../utils/balance-tree";
export async function shouldBehaveLikeGetDropDetails(dropFactory: any, ercContract: any, tree1: BalanceTree, tree2: BalanceTree) {
  it("returns the drop details tree 1 root", async function () {
    let data = expect(await dropFactory.getDropDetails(ercContract.address, tree1.getHexRoot()));
    console.log(data);
  });

  it("returns the drop details tree 2 root", async function () {
    let data = expect(await dropFactory.getDropDetails(ercContract.address, tree2.getHexRoot()));
    console.log(data);
  });
}
