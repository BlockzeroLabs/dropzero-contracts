import { Signer } from "@ethersproject/abstract-signer";
import DropFactoryArtifact from "../artifacts/contracts/DropFactory.sol/DropFactory.json";
import ERC20Artifact from "../artifacts/contracts/test/ERC20.sol/ERC20.json";
import { deployContract } from "ethereum-waffle";

export async function deployStubErc20(deployer: Signer, name: string, symbol: string): Promise<any> {
  // const erc20Artifact: Artifact = await hre.artifacts.readArtifact(ERC20Artifact);
  const erc20: any = await deployContract(deployer, ERC20Artifact, [name, symbol]);
  return erc20;
}

export async function deployStubFactory(deployer: Signer, fee: number, feeReceiver: string, timelock: string): Promise<any> {
  const dropFactory: any = await deployContract(deployer, DropFactoryArtifact, [fee, feeReceiver, timelock]);
  return dropFactory;
}
