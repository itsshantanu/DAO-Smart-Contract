require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

const {  ROPSTEN_API_URL, PRIVATE_KEY } =
  process.env;

module.exports = {
  solidity: '0.8.9',
  networks: {
    hardhat: {
      cahinId: 1337
    },
    ropsten: {
      url: ROPSTEN_API_URL,
      accounts: [PRIVATE_KEY],
    }
  }
};
