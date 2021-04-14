import { expect, use } from "chai";
import { Contract, BigNumber } from "ethers";
import DropFactoryArtifact from "../artifacts/contracts/DropFactory.sol/DropFactory.json";
import BalanceTree from "./utils/balance-tree";
import ERC20Artifact from "../artifacts/contracts/test/ERC20.sol/ERC20.json";
import TimeLockArtifact from "../artifacts/contracts/test/TimeLockController.sol/TimelockController.json";
import { deployContract, MockProvider, solidity } from "ethereum-waffle";
import web3 from "web3";

import hre from "hardhat";
use(solidity);

describe("Testing DropFactory Contract", async () => {
  let dropFactory: any;
  let ercContract: any;
  let timeLockContract: any;
  let tree1: BalanceTree;
  let tree2: BalanceTree;
  let tree3: BalanceTree;
  const proofs: string[][] = [];
  const roots: string[] = [];
  const indexes: number[] = [];
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const overrides = {
    gasLimit: 9000000000,
    gasPrice: 0x1,
  };
  const [wallet0, wallet1, wallet2, wallet3] = await hre.ethers.getSigners();
  before("testing createDrop", async () => {
    timeLockContract = await deployContract(wallet0, TimeLockArtifact, [1617370970, [wallet0.address], [wallet0.address]]);
    dropFactory = await deployContract(wallet0, DropFactoryArtifact, [2000, wallet0.address, wallet0.address], overrides);
    ercContract = await deployContract(wallet0, ERC20Artifact, ["Flash", "FLASH"], overrides);
    await ercContract.approve(dropFactory.address, web3.utils.toWei("90000000"));
    tree1 = new BalanceTree([
      { account: wallet0.address, amount: BigNumber.from("100") },
      { account: wallet0.address, amount: BigNumber.from("101") },
    ]);
    tree2 = new BalanceTree([
      { account: wallet0.address, amount: BigNumber.from("100") },
      { account: wallet0.address, amount: BigNumber.from("100") },
    ]);
    tree3 = new BalanceTree([
      { account: wallet0.address, amount: BigNumber.from("100") },
      { account: wallet0.address, amount: BigNumber.from("100") },
    ]);
  });
  it("Should fail while adding a non-existing drop", async function () {
    await expect(dropFactory.addDropData(1, 1617370970, 1719117998, tree1.getHexRoot(), ercContract.address)).to.be.revertedWith("FACTORY_DROP_DOES_NOT_EXIST");
  });
  it("Should create a drop", async function () {
    await dropFactory.createDrop(ercContract.address, overrides);
    let dropData = (await dropFactory.drops(ercContract.address)).toString();
    expect(dropData).to.not.be.equal(ZERO_ADDRESS);
  });
  it("Should fail while trying to create an existing drop", async function () {
    await expect(dropFactory.createDrop(ercContract.address)).to.be.revertedWith("FACTORY_DROP_EXISTS");
  });
  it("Should create another drop", async function () {
    expect(await dropFactory.createDrop(ZERO_ADDRESS));
  });
  it("Should add data to a newly created drop", async function () {
    expect(await dropFactory.addDropData(web3.utils.toWei("5000000"), 1617370970, 1719117998, tree1.getHexRoot(), ercContract.address));
  });
  it("Should fail while adding data with invalid start date", async function () {
    await expect(dropFactory.addDropData(web3.utils.toWei("5000000"), 1719117998, 1719116998, tree3.getHexRoot(), ercContract.address)).to.be.revertedWith(
      "DROP_INVALID_START_DATE",
    );
  });
  it("Should fail while adding data with invalid end date", async function () {
    await expect(dropFactory.addDropData(web3.utils.toWei("5000000"), 1618314240, 1618314140, tree3.getHexRoot(), ercContract.address)).to.be.revertedWith(
      "DROP_INVALID_END_DATE",
    );
  });

  it("Should add data to a newly created drop 2", async function () {
    expect(await dropFactory.addDropData(web3.utils.toWei("500"), 1617370970, 1719117998, tree2.getHexRoot(), ercContract.address));
  });

  it("Should fail while adding an existing drop", async function () {
    await expect(dropFactory.addDropData(1, 1617370970, 1719117998, tree1.getHexRoot(), ercContract.address)).to.be.revertedWith("DROP_EXISTS");
  });
  it("should successfully update the fees", async function () {
    expect(await dropFactory.updateFee(1000));
  });
  it("should successfully update fee receiver", async function () {
    expect(await dropFactory.updateFeeReceiver(wallet1.address));
  });

  it("should fail while updating fees with exceeded error", async function () {
    await expect(dropFactory.updateFee(4000)).to.be.revertedWith("FACTORY_MAX_FEE_EXCEED");
  });

  it("should return the drop data", async function () {
    let data = expect(await dropFactory.getDropDetails(ercContract.address, tree1.getHexRoot()));
    console.log(data);
  });
  it("should pause a drop", async function () {
    expect(await dropFactory.pause(ercContract.address, tree1.getHexRoot()));
  });

  it("should fail claiming an inactive drop", async function () {
    const proof0 = tree1.getProof(0, wallet0.address, BigNumber.from("100"));
    const proof1 = tree1.getProof(1, wallet0.address, BigNumber.from("101"));
    await expect(dropFactory.claimFromDrop(ercContract.address, 1, BigNumber.from("101"), tree1.getHexRoot(), proof1)).to.be.revertedWith("DROP_NOT_ACTIVE");
  });

  it("should fail while pausing a drop of unowned drop", async function () {
    await expect(dropFactory.pause(ZERO_ADDRESS, tree1.getHexRoot())).to.be.revertedWith("NOT_OWNER");
  });
  it("should unpause a drop", async function () {
    expect(await dropFactory.unpause(ercContract.address, tree1.getHexRoot()));
  });
  it("should fail while unpausing a drop of unowned drop", async function () {
    await expect(dropFactory.unpause(ZERO_ADDRESS, tree1.getHexRoot())).to.be.revertedWith("NOT_OWNER");
  });
  it("should fail on claim due to invalid proof", async function () {
    await expect(dropFactory.claimFromDrop(ercContract.address, 0, BigNumber.from(100), tree1.getHexRoot(), [])).to.be.revertedWith("DROP_INVALID_PROOF");
  });
  it("should claim the drop successfully", async function () {
    const proof0 = tree1.getProof(0, wallet0.address, BigNumber.from("100"));
    const proof1 = tree1.getProof(1, wallet0.address, BigNumber.from("101"));
    expect(await dropFactory.claimFromDrop(ercContract.address, 1, BigNumber.from("101"), tree1.getHexRoot(), proof1));
  });
  it("should return the status if a drop is claimed or not", async function () {
    const status = await dropFactory.isDropClaimed(ercContract.address, 1, tree1.getHexRoot());
    console.log("Is Drop Claimed", status);
  });
  it("should fail while claiming an already claimed drop", async function () {
    const proof0 = tree1.getProof(0, wallet0.address, BigNumber.from("100"));
    const proof1 = tree1.getProof(1, wallet0.address, BigNumber.from("101"));
    await expect(dropFactory.claimFromDrop(ercContract.address, 1, BigNumber.from("101"), tree1.getHexRoot(), proof1)).to.be.revertedWith(
      "DROP_ALREADY_CLAIMED",
    );
  });

  it("should withdraw a drop successfully", async function () {
    expect(await dropFactory.withdraw(ercContract.address, tree1.getHexRoot()));
  });

  it("should claim the multiple claims successfully", async function () {
    indexes.push(1);
    indexes.push(0);
    const proof0 = tree2.getProof(1, wallet0.address, BigNumber.from("100"));
    const proof1 = tree2.getProof(0, wallet0.address, BigNumber.from("100"));
    proofs.push(proof0);
    proofs.push(proof1);
    roots.push(tree2.getHexRoot());
    roots.push(tree2.getHexRoot());
    expect(await dropFactory.multipleClaimsFromDrop(ercContract.address, indexes, [BigNumber.from("100"), BigNumber.from("100")], roots, proofs));
  });
});
