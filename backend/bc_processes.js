const { Web3Storage, getFilesFromPath } = require('web3.storage')
const { ethers } = require('hardhat')
const fs = require('fs')
const temp = require('temp').track()
const deploy = require('../scripts/deploy.js')
require('dotenv').config({ path: __dirname + '../../.env' })

const db = require('./db_processes')
var hash = ''

async function makeGatewayURL(cid) {
  return `https://${cid}.ipfs.w3s.link`
}

// async function storeFiles(path) {
//   var imageFile = getFiles(path)
//   const uploadName = [namePrefix, caption].join('|')
//   const metadataFile = jsonFile('metadata.json', {
//     path: imageFile.name,
//   })
//   const token = process.env.IPFS_TOKEN
//   const Web3Storage = new Web3Storage({ token })
//   const cid = await Web3Storage.put([imageFile, metadataFile], {
//     name: uploadName,
//   })

//   const metadataGatewayURL = makeGatewayURL(cid, 'metadata.json')
//   const imageGatewayURL = makeGatewayURL(cid, imageFile.name)
//   const imageURI = `ipfs://${cid}/${imageFile.name}`
//   const metadataURI = `ipfs://${cid}/metadata.json`
//   console.log(imageURI)
//   return {cid, metadataGatewayURL, imageGatewayURL, imageURI, metadataURI}
// }

async function storeToIPFS(file_path, tempFilePath) {
  const token = process.env.IPFS_TOKEN
  const client = new Web3Storage({ token })
  const files = await getFilesFromPath(file_path)
  const cid = await client.put(files)
  console.log('cid: ', cid)
  data = 'CID from IPFS: ' + cid + '\n'
  fs.appendFile(tempFilePath, data, function(err, file){})

  return cid
}

async function retrieveFromIPFS(file_cid) {
  const gatewayURL = await makeGatewayURL(file_cid)
  return gatewayURL
  // const token = process.env.IPFS_TOKEN
  // const client = new Web3Storage({ token })
  // const res = await client.get(file_cid)
  // if (!res.ok) {throw new Error(`failed to get ${cid} - [${res.status}] ${res.statusText}`)}
  
  // const files = await res.files()
  // for (const file of files) {
  //   console.log(file.path)
  // }
  // storeFiles('E:/tanay/New_miniProj/uploads/tanay')
}
// Ends here.............

// Tanmmay Code starting here.........
// Deployment of contract on blockchain (testnet)
async function deployCertificateContract(ipfs_file_cid, tempFilePath) {
  return deploy.createContract(ipfs_file_cid, 'file___name', Date.now(), tempFilePath)
}

// Retrieval of contract from blockchain (testnet)
async function retrieveCertificateContract(contract_addr) {
  return deploy.retrieveContractData(contract_addr)
}
// Ends here.........

async function bc_upload(request, response) {
  var fileName = request.body.Logurl.slice(5)
  console.log(fileName)

  const tempFilePath = './temp_log/' + fileName

  console.log('in bc upload')
  data = 'Starting blockchain upload processes\n'
  fs.appendFile(tempFilePath, data, function(err, file){})

  console.log(request.body)
  data = JSON.stringify(request.body) + '\n'
  fs.appendFile(tempFilePath, data, function(err, file){})

  var data = await request.body
  docs = []

  for(const key in data) {
    // console.log(key)

    try {
      await db.getDBConnection()

      doc = await db.CertificateFile.find({_id: key}).exec()
      // docs.push(doc)
      console.log(doc)
      data = 'Document details: \n'
      data += doc + '\n'
      fs.appendFile(tempFilePath, data, function(err, file){})

      const file_path = doc[0].filePath
      console.log(file_path)
      data = 'File path: ' + file_path + '\n'
      fs.appendFile(tempFilePath, data, function(err, file){})

      const file_cid = await storeToIPFS(file_path, tempFilePath) // This function returns cid received from ipfs storage
      hash = await deployCertificateContract(file_cid, tempFilePath) // This function deploys store cid in smart contract and then deploys it
      console.log('hash: ', hash)

      doc = await db.CertificateFile.updateOne({_id: key}, {fileHashFromBC: hash, fileVerified: true, verifiedDateTime: Date.now()})

      console.log(doc)
      data = 'Uploading successfully completed\n'
      fs.appendFile(tempFilePath, data, function(err, file){})
    } catch (e) {
      console.log(e)
    }
  }

  console.log(docs)



  // bc_retrieval(request, response)
  return '/dashboard'
}

async function bc_retrieval(request, response) {
  console.log('hash 2: ', request.body.HashKey)
  const data = await retrieveCertificateContract(
    request.body.HashKey,
  )
  console.log("cid: ", data[0])
  const gatewayURL = await retrieveFromIPFS(data[0])
  return gatewayURL
}

module.exports = {
  bc_upload,
  bc_retrieval,
}
