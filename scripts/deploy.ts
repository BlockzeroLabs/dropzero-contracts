// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { ContractFactory, Contract, Wallet } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import DropFactory from "../artifacts/contracts/DropFactory.sol/DropFactory.json";
import Drop from "../artifacts/contracts/Drop.sol/Drop.json";

//import TimelockContract from '../artifacts/contracts/timelock-controller/AquaTimelockController.sol/AquaTimelockController.json';
import { Printer } from "prettier";
async function getAddres() {
  const [Factory] = await ethers.getSigners();
  console.log(Factory.address);
}

//async function predictAddress() {
//  const [liquidityProvider] = await ethers.getSigners();
//  let nonce = await liquidityProvider.getTransactionCount();
//  let address = await ethers.utils.getContractAddress({ from: liquidityProvider.address, nonce });
//  console.log(address);
//}
async function deployDropFactory(): Promise<void> {
  // Hardhat always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  // await run("compile");
  // We get the contract to deploy
  const [Factory] = await ethers.getSigners();
  console.log("Factory address", Factory.address);
  const factory = new ContractFactory(DropFactory.abi, DropFactory.bytecode, Factory);
  // fee reciever address is the account 1 from my metamask rinkeby
  // timelock address is the account 3 from my metamask rinkeby

  let tx = await factory.deploy(2000, "0x43D964B802c2Ce187653F6A01D6678E6cA0DC9Bb", "0x2A85e6904f509ce75998a0E226193AD70c201bD4", {
    gasLimit: 3000000,
  });
  console.log(tx.hash);
}

deployDropFactory();
//async function deployUniHandler(): Promise<void> {
//  const [liquidityProvider] = await ethers.getSigners()
//  console.log(liquidityProvider.address)
//  const factory = new ContractFactory(
//    UniswapHandler.abi,
//    UniswapHandler.bytecode,
//    liquidityProvider
//  );
//  let tx = await factory
//    .deploy(
//      '0x7b6315822f43bda90d296bc09516d5dfdea2e76d', '0xe7Ef8E1402055EB4E89a57d1109EfF3bAA334F5F',
//      {
//        gasLimit: 3000000,
//      }
//    )
//  console.log(tx)
//}
//async function deployAquaPremiumContract(): Promise<void> {
//  const [liquidityProvider] = await ethers.getSigners()
//  console.log(liquidityProvider.address)
//  const factory = new ContractFactory(
//    AquaPremium.abi,
//    AquaPremium.bytecode,
//    liquidityProvider
//  );
//  let tx = await factory
//    .deploy(
//      '1000', '0xe7Ef8E1402055EB4E89a57d1109EfF3bAA334F5F',
//      {
//        gasLimit: 3000000,
//      }
//    )
//  console.log(tx)
//}
//async function deployTimelockContract(): Promise<void> {
//  const [liquidityProvider] = await ethers.getSigners()
//  console.log(liquidityProvider.address)
//  const factory = new ContractFactory(
//    UniswapHandler.abi,
//    UniswapHandler.bytecode,
//    liquidityProvider
//  );
//  let tx = await factory
//    .deploy(
//      '0x97a58ab811a74a6a4cbf3deb7fbe7f5ad4f73094', '0x057d80180f20f7A0143EcE6a92F466db41e9A5c2',
//      {
//        gasLimit: 3000000,
//      }
//    )
//  console.log(tx)
//}
//async function getPremimumAddress() {
//  const [liquidityProvider] = await ethers.getSigners()
//  console.log(liquidityProvider.address)
//  const AquaFactory = new ContractFactory(
//    AquaPrimary.abi,
//    AquaPrimary.bytecode,
//    liquidityProvider
//  );
//  const AquaContract = await AquaFactory.attach("0x7b6315822f43bda90d296bc09516d5dfdea2e76d")
//  console.log((await AquaContract.owner()).toString())
//}
//getPremimumAddress()
//  .then(() => process.exit(0))
//  .catch((error: Error) => {
//    console.error(error);
//    process.exit(1);
//  });
