import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import BalanceTree from "../utils/balance-tree";

export async function shouldBehaveLikeWidthdraw(dropFactory: any, token: any, tree1: BalanceTree, wallet0: SignerWithAddress) {
  it("should withdraw a drop successfully", async function () {
    await expect(() => dropFactory.withdraw(token.address, tree1.getHexRoot())).to.changeTokenBalance(token, wallet0, "4999999999999999999999899");
  });
}
