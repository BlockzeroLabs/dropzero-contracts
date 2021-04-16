import { expect } from "chai";

export async function shoudlBehaveLikeUpdateFeeReceiver(dropFactory: any, wallet1: any) {
  it("should successfully update fee receiver", async function () {
    expect(await dropFactory.updateFeeReceiver(wallet1.address));
  });
}
