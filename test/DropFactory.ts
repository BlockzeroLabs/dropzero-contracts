import { use } from "chai";
import { BigNumber, utils } from "ethers";
import { deployStubErc20, deployStubFactory } from "./stubs";
import BalanceTree from "./utils/balance-tree";
import { shouldBehaveLikeFactoryFunctions } from "./FactoryFunctions/FactoryFunctions.behavior";
import TimeLockArtifact from "../artifacts/contracts/test/TimeLockController.sol/TimelockController.json";
import { deployContract, solidity } from "ethereum-waffle";

import hre from "hardhat";

use(solidity);

describe("Testing DropFactory Contract", async () => {
  let dropFactory: any;
  let ercContract: any;
  let timeLockContract: any;
  let tree1: BalanceTree;
  let tree2: BalanceTree;
  let tree3: BalanceTree;

  const [wallet0, wallet1, wallet2, wallet3] = await hre.ethers.getSigners();
 
  before("Initiating unit tests", async () => {
    timeLockContract = await deployContract(wallet0, TimeLockArtifact, [1617370970, [wallet0.address], [wallet0.address]]);
    dropFactory = await deployStubFactory(wallet0, 2000, wallet0.address, wallet0.address);
    ercContract = await deployStubErc20(wallet0, "Flash", "FLASH");

    await ercContract.approve(dropFactory.address, utils.parseEther("90000000"));
    tree1 = new BalanceTree([
      { account: wallet0.address, amount: BigNumber.from("100") },
      { account: wallet0.address, amount: BigNumber.from("101") },
    ]);
    tree2 = new BalanceTree([
      { account: wallet0.address, amount: BigNumber.from("200") },
      { account: wallet0.address, amount: BigNumber.from("100") },
    ]);
    tree3 = new BalanceTree([
      { account: wallet0.address, amount: BigNumber.from("300") },
      { account: wallet0.address, amount: BigNumber.from("400") },
    ]);
  });

  describe("TESTING FACTORY FUNCTIONS", async () => {
    it("Testing Factory Functions", async function () {
      await shouldBehaveLikeFactoryFunctions(dropFactory, ercContract.address, tree1, tree2, tree3, wallet0, wallet1);
    });
  });
});
