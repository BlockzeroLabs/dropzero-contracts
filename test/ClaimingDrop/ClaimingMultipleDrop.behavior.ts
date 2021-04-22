import { expect } from "chai";
import BalanceTree from "../utils/balance-tree";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
export async function shouldBehaveLikeMultipleClaimsFromDrops(
  dropFactory: any,
  token: any,
  tree2: BalanceTree,
  wallet0: SignerWithAddress,
  wallet1: SignerWithAddress,
) {
  const proofs: string[][] = [];

  const roots: string[] = [];

  const indexes: number[] = [];

  it("should claim the multiple claims successfully", async function () {
    indexes.push(1);
    indexes.push(0);
    const proof0 = tree2.getProof(1, wallet0.address, BigNumber.from("100"));
    const proof1 = tree2.getProof(0, wallet0.address, BigNumber.from("200"));
    proofs.push(proof0);
    proofs.push(proof1);
    roots.push(tree2.getHexRoot());
    roots.push(tree2.getHexRoot());
    await expect(() =>
      dropFactory.multipleClaimsFromDrop(token.address, indexes, [BigNumber.from("100"), BigNumber.from("200")], roots, proofs),
    ).to.changeTokenBalances(token, [wallet0, wallet1], [BigNumber.from("240"), BigNumber.from("60")]); //Total fees of these claims = 60
    const dropAddress = await dropFactory.drops(token.address);
  });
}
