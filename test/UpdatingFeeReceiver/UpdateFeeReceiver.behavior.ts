import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

export async function shoudlBehaveLikeUpdateFeeReceiver(dropFactory: Contract, wallet1: SignerWithAddress) {
  it("should successfully update fee receiver", async function () {
    expect(await dropFactory.updateFeeReceiver(wallet1.address));
  });
}
