// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { ContractFactory, Contract, Wallet } from "ethers";
import DropFactory from "../artifacts/contracts/DropFactory.sol/DropFactory.json";

async function getAddres() {
  const [Factory] = await ethers.getSigners();
  console.log(Factory.address);
}

async function deployDropFactory(): Promise<void> {
  const [Factory] = await ethers.getSigners();
  console.log("Factory address", Factory.address);
  const factory = new ContractFactory(DropFactory.abi, DropFactory.bytecode, Factory);
  let tx = await factory.deploy(2000, "0x43D964B802c2Ce187653F6A01D6678E6cA0DC9Bb", "0x2A85e6904f509ce75998a0E226193AD70c201bD4", {
    gasLimit: 3000000,
  });
  console.log(tx.hash);
}

deployDropFactory();

