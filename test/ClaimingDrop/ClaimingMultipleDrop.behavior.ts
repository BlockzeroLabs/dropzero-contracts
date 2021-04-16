import { expect } from "chai";
import BalanceTree from "../utils/balance-tree";
import { BigNumber } from "ethers";
export async function shouldBehaveLikeMultipleClaimsFromDrops(
  dropFactory: any, 
  ercContract: string, 
  tree2: BalanceTree, 
  wallet0: any) {
 
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
    expect(await dropFactory.multipleClaimsFromDrop(ercContract, indexes, [BigNumber.from("100"), BigNumber.from("200")], roots, proofs));
  });
}
