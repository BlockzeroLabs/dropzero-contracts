import { expect, use } from "chai";
import { constants, ethers, Wallet, BigNumber } from "ethers";
import DropFactoryArtifact from "../artifacts/contracts/DropFactory.sol/DropFactory.json";
import BalanceTree from "./utils/balance-tree";
import ERC20Artifact from "../artifacts/contracts/test/ERC20.sol/ERC20.json";
import { deployContract, MockProvider, solidity } from "ethereum-waffle";
import web3 from "web3";
use(solidity);

describe("Testing DropFactory Contract", async () => {
  let dropFactory: any;
  let ercContract: any;
  let tree1: BalanceTree;
  let tree2: BalanceTree;
  let proofs: any = [];
  let roots: any = [];
  let indexes: any = [];
  let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const overrides = {
    gasLimit: 9000000000,
    gasPrice: 0x1,
  };

  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: "istanbul",
      mnemonic: "horn horn horn horn horn horn horn horn horn horn horn horn",
      gasLimit: 9000000000,
    },
  });

  let [wallet0, wallet1, wallet2, wallet3] = provider.getWallets();
  before("testing createDrop", async () => {
    dropFactory = await deployContract(wallet0, DropFactoryArtifact, [2000, wallet0.address, wallet1.address], overrides);
    ercContract = await deployContract(wallet0, ERC20Artifact, ["Flash", "FLASH"], overrides);
    await ercContract.approve(dropFactory.address, web3.utils.toWei("10000000"));
    tree1 = new BalanceTree([
      { account: wallet0.address, amount: BigNumber.from("100") },
      { account: wallet0.address, amount: BigNumber.from("101") },
    ]);
    tree2 = new BalanceTree([
      { account: wallet0.address, amount: BigNumber.from("100") },
      { account: wallet0.address, amount: BigNumber.from("100") },
    ]);
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

  it("Should add data to a newly created drop 2", async function () {
    expect(await dropFactory.addDropData(web3.utils.toWei("500"), 1617370970, 1719117998, tree2.getHexRoot(), ercContract.address));
  });

  it("Should fail while adding an existing drop", async function () {
    await expect(dropFactory.addDropData(1, 1617370970, 1719117998, tree1.getHexRoot(), ercContract.address)).to.be.revertedWith("DROP_EXISTS");
  });

  it("should fail while calling update fee with timelock error", async function () {
    await expect(dropFactory.updateFee(3000)).to.be.revertedWith("FACTORY_ONLY_TIMELOCK");
  });

  it("should return the drop data", async function () {
    let data = expect(await dropFactory.getDropDetails(ercContract.address, tree1.getHexRoot()));
    console.log(data);
  });

  it("should pause a drop", async function () {
    expect(await dropFactory.pause(ercContract.address, tree1.getHexRoot()));
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
