import { expect } from "chai";
import BalanceTree from "../utils/balance-tree";

export async function shouldBehaveLikeAddDropData(
  dropFactory: any,
  amount: any,
  startDate: number,
  endDate: number,
  tree1: BalanceTree,
  tree2: BalanceTree,
  tree3: BalanceTree,
  ercContract: string,
) {
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  it("Should fail while adding a non-existing drop", async function () {
    await expect(dropFactory.addDropData(500, startDate, endDate, tree2.getHexRoot(), ZERO_ADDRESS)).to.be.revertedWith("FACTORY_DROP_DOES_NOT_EXIST");
  });

  it("Should add data to a newly created drop", async function () {
    expect(await dropFactory.addDropData(amount, startDate, endDate, tree1.getHexRoot(), ercContract));
  });

  it("Should fail while adding data with invalid start date", async function () {
    await expect(dropFactory.addDropData(amount, 1719117998, 1719116998, tree3.getHexRoot(), ercContract)).to.be.revertedWith("DROP_INVALID_START_DATE");
  });

  it("Should fail while adding data with invalid end date", async function () {
    await expect(dropFactory.addDropData(amount, 1618314240, 1618314140, tree3.getHexRoot(), ercContract)).to.be.revertedWith("DROP_INVALID_END_DATE");
  });

  it("Should fail while adding an existing drop", async function () {
    await expect(dropFactory.addDropData(1, 1617370970, 1719117998, tree1.getHexRoot(), ercContract)).to.be.revertedWith("DROP_EXISTS");
  });

  it("Should add data to a newly created drop tree 2", async function () {
    expect(await dropFactory.addDropData(amount, 1617370970, 1719117998, tree2.getHexRoot(), ercContract));
  });
}
