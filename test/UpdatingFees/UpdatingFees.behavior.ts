import { Contract } from "@ethersproject/contracts";
import { expect } from "chai";

export async function shouldBehaveLikeUpdateFees(dropFactory: Contract) {
  it("should fail while updating fees with exceeded error", async function () {
    await expect(dropFactory.updateFee(4000)).to.be.revertedWith("FACTORY_MAX_FEE_EXCEED");
  });
  it("should successfully update the fees", async function () {
    expect(await dropFactory.updateFee(1000));
  });
}
