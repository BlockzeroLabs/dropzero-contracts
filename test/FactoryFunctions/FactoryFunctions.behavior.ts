import { expect } from "chai";
import { utils } from "ethers";
import { shouldBehaveLikeAddDropData } from "../AddingDropData/DropData.behavior";
import { shouldBehaveLikeGetDropDetails } from "../GetDropDetails/DropDetails.behavior";
import BalanceTree from "../utils/balance-tree";
import { shouldBehaveLikeClaimFromDrop } from "../ClaimingDrop/ClaimingDrop.behavior";
import { shouldBehaveLikeMultipleClaimsFromDrops } from "../ClaimingDrop/ClaimingMultipleDrop.behavior";
import { shouldBehaveLikeWidthdraw } from "../WithdrawDrop/DropWithdraw.behavior";
import { shouldBehaveLikePause } from "../PausingDrop/PauseDrop.behavior";
import { shouldBehaveLikeUnPauseWithdraw } from "../UnpausingDrop/UnpauseDrop.behavior";
import { shouldBehaveLikeIsClaimed } from "../DropClaimed/DropClaimed.behavior";
import { shoudlBehaveLikeUpdateFeeReceiver } from "../UpdatingFeeReceiver/UpdateFeeReceiver.behavior";
import { shouldBehaveLikeUpdateFees } from "../UpdatingFees/UpdatingFees.behavior";
export async function shouldBehaveLikeFactoryFunctions(
  dropFactory: any,
  ercContract: any,
  tree1: BalanceTree,
  tree2: BalanceTree,
  tree3: BalanceTree,
  wallet0: any,
  wallet1: any,
): Promise<any> {
  const DUMMY_TOKEN = "0x0000000000000000000000000000000000000001";
  describe("TESTING THE CREATION OF DROP", async () => {
    it("Should create a drop", async function () {
      expect(await dropFactory.createDrop(ercContract));
    });

    it("Should create another drop", async function () {
      expect(await dropFactory.createDrop(DUMMY_TOKEN));
    });
  });
  describe("CREATING AN EXISTING DROP", async () => {
    it("Should fail while trying to create an existing drop", async function () {
      await expect(dropFactory.createDrop(ercContract)).to.be.revertedWith("FACTORY_DROP_EXISTS");
    });
  });
  describe("ADDING DROP DATA TO THE DROP", async () => {
    await shouldBehaveLikeAddDropData(dropFactory, utils.parseEther("5000000"), 1617370970, 1719117998, tree1, tree2, tree3, ercContract);
  });

  describe("GETTING DETAILS OF AN ADDED DROP", async () => {
    await shouldBehaveLikeGetDropDetails(dropFactory, ercContract, tree1, tree2);
  });

  describe("PAUSING A DROP", async () => {
    await shouldBehaveLikePause(dropFactory, ercContract, tree1, wallet0);
  });

  describe("UNPAUSING A DROP", async () => {
    await shouldBehaveLikeUnPauseWithdraw(dropFactory, ercContract, tree1, wallet0);
  });

  describe("CLAIMING A SINGLE DROP", async () => {
    await shouldBehaveLikeClaimFromDrop(dropFactory, ercContract, tree1, wallet0);
  });

  describe("CLAIMING MULTIPLE DROPS", async () => {
    await shouldBehaveLikeMultipleClaimsFromDrops(dropFactory, ercContract, tree2, wallet0);
  });

  describe("WITHDRAW A DROP", async () => {
    await shouldBehaveLikeWidthdraw(dropFactory, ercContract, tree1);
  });

  describe("IS CLAIMED", async () => {
    await shouldBehaveLikeIsClaimed(dropFactory, ercContract, tree1);
  });

  describe("UPDATE FEE RECEIVER", async () => {
    await shoudlBehaveLikeUpdateFeeReceiver(dropFactory, wallet1);
  });

  describe("UPDATE FEES", async () => {
    await shouldBehaveLikeUpdateFees(dropFactory);
  });
}
