import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber, utils } from "ethers";
import BalanceTree from "../utils/balance-tree";

export async function shouldBehaveLikeAddDropData(
  dropFactory: any,
  amount: BigNumber,
  startDate: number,
  endDate: number,
  tree1: BalanceTree,
  tree2: BalanceTree,
  tree3: BalanceTree,
  token: any,
  wallet0: SignerWithAddress,
) {
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  it("Should fail while adding a non-existing drop", async function () {
    await expect(dropFactory.addDropData(500, startDate, endDate, tree2.getHexRoot(), ZERO_ADDRESS)).to.be.revertedWith("FACTORY_DROP_DOES_NOT_EXIST");
  });

  it("Should add data to a newly created drop", async function () {
    await expect(() => dropFactory.addDropData(amount, startDate, endDate, tree1.getHexRoot(), token.address)).to.changeTokenBalance(
      token,
      wallet0,
      utils.parseEther("-5000000"),
    );

    console.log("Wallet balance after creating the drop", (await token.balanceOf(wallet0.address)).toString());

    const dropAddress = await dropFactory.drops(token.address);

    expect(await (await token.balanceOf(dropAddress)).toString()).to.be.equal(utils.parseEther("5000000"));
  });

  it("Should fail while adding data with invalid start date", async function () {
    await expect(dropFactory.addDropData(amount, 1719117998, 1719116998, tree3.getHexRoot(), token.address)).to.be.revertedWith("DROP_INVALID_START_DATE");
  });

  it("Should fail while adding data with invalid end date", async function () {
    await expect(dropFactory.addDropData(amount, 1618314240, 1618314140, tree3.getHexRoot(), token.address)).to.be.revertedWith("DROP_INVALID_END_DATE");
  });

  it("Should fail while adding an existing drop", async function () {
    await expect(dropFactory.addDropData(1, 1617370970, 1719117998, tree1.getHexRoot(), token.address)).to.be.revertedWith("DROP_EXISTS");
  });

  it("Should add data to a newly created drop tree 2", async function () {
    await expect(() => dropFactory.addDropData(amount, startDate, endDate, tree2.getHexRoot(), token.address)).to.changeTokenBalance(
      token,
      wallet0,
      utils.parseEther("-5000000"),
    );

    const dropAddress = await dropFactory.drops(token.address);

    expect(await (await token.balanceOf(dropAddress)).toString()).to.be.equal(utils.parseEther("10000000"));
  });
}
