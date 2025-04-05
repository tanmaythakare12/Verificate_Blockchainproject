require('@nomiclabs/hardhat-ethers')
require('dotenv').config()

var fs = require('fs')
var ethers = require('ethers')
const fsPromises = fs.promises
const hre = require('hardhat')

var DEPLOYED_CONTRACT_ADDRESS
// const ABI_FILE_PATH =
//   'E:/tanay/E_Mini_Project_Code/artifacts/contracts/Certificate_2.sol/Certificate_2.json'
async function getAbi() {
  const data = await fsPromises.readFile(process.env.ABI_FILE_PATH, 'utf8')
  const abi = JSON.parse(data)['abi']
  console.log(abi)
  return abi
}

async function createContract(cid, file_name, timestamp, tempFilePath) {
  const Certificate = await hre.ethers.getContractFactory('Certificate')
  const contract = await Certificate.deploy()

  await contract.deployed()
  console.log(`Contract deployed to ${contract.address}`)
  data = "Address of deployed contract: " + contract.address + '\n'
  fs.appendFile(tempFilePath, data, function(err, file){})

  DEPLOYED_CONTRACT_ADDRESS = contract.address

  let provider = new ethers.providers.AlchemyProvider(network='maticmum', process.env.API_URL)
  const abi = await getAbi()

  let signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  const new_contract = new ethers.Contract(
    DEPLOYED_CONTRACT_ADDRESS,
    abi,
    signer,
  )

  let tx = await new_contract.addCertificate(cid, file_name, timestamp)
  await tx.wait()
  // console.log(tx)

  return DEPLOYED_CONTRACT_ADDRESS
}

async function retrieveContractData(DEPLOYED_CONTRACT_ADDRESS) {
  const abi = await getAbi()
  let provider = new ethers.providers.AlchemyProvider(network='maticmum', process.env.API_URL)
  let signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  
  const new_contract = new ethers.Contract(
    DEPLOYED_CONTRACT_ADDRESS,
    abi,
    signer,
  )
  console.log('---------- ', new_contract)

  const data = await new_contract.getCertificate()
  console.log('------> ', data)
  return data
}

module.exports = {
  createContract,
  retrieveContractData,
}
