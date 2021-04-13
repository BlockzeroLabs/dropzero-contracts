const shell = require("shelljs")

// The environment variables are loaded in hardhat.config.ts
const mnemonic = process.env.MNEMONIC
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file")
}

module.exports = {
  istanbulReporter: ["html", "lcov", "text"],
  onCompileComplete: async function (_config) {
    await run("typechain")
  },
  onIstanbulComplete: async function (_config) {
    // We need to do this because solcover generates bespoke artifacts.
    shell.rm("-rf", "./artifacts")
    shell.rm("-rf", "./typechain")
  },
  providerOptions: {
    mnemonic,
  },
  skipFiles: ["mocks", "test"],
  coverage: {
    host: "hardhat",
    network_id: "31337",
    port: 8555,
    gas: 0x989680, // <-- Change here for gasLimit
  },
}
