require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "polygonMumbai",
  networks: {
    polygonMumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/rU12MnHXkCSiPwUOhinSTEBaVi2eoWNF",
      accounts: ['0x61e88acdbc334ceb62bd183e261d4ca41e9969d8995dd556b4d449a1ae9a880a'],
    }
  },
};
