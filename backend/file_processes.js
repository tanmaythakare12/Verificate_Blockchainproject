// Upload files
// Retrieve files

const multer = require('multer')
const path = require('path')
const fs = require('fs')
const db = require('./db_processes')


const MAXSIZE = 1 * 10000 * 1000
var currentFilePath = ''
var storage =   multer.diskStorage({  
  destination: function (req, file, callback) {  
    callback(null, './uploads/' + req.session.username);  
  },  
  filename: function (req, file, callback) {  
    callback(null, file.originalname);  
  }  
});  

var upload = multer({
  storage: storage,
  limits: { fileSize: MAXSIZE },
  fileFilter: function (request, file, cb) {
    // Set the filetypes, it is optional
    var filetypes = /pdf/
    var mimetype = filetypes.test(file.mimetype)

    var extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    console.log(file.originalname)

    fs.mkdir(
      path.join('./uploads/' + request.session.username),
      { recursive: true },
      function (err) {
        if (err) {
          return console.error(err)
        }
        console.log('Directory created successfully')
      },
    )

    currentFilePath = 'E:/tanay/MiniProject_polygon/backend/uploads/' + request.session.username + '/' + file.originalname
    console.log(currentFilePath)

    if (mimetype && extname) {
      return cb(null, true)
    }

    cb(
      'Error: File upload only supports the ' +
        'following filetypes - ' +
        filetypes,
    )
  },
}).single('File1')

async function uploadFile(request, response) {
  console.log(request.session.username)
  upload(request, response, (e) => {
    if (e) {
      console.log(e)
      response.redirect('file-upload-page')
    }
    console.log("no errors")
    storeFileInDB(request)
    response.redirect('file-upload-page')
  })
  // return storeFileInDB(request)
}

async function retrieveFile(file_path) {} // currently unused, undecided how to utilize

async function storeFileInDB(req) {
  // file_data contains all data about the file (name, size, type, path, description, owner, timestamp)
  // file_data is a dictionary containing the above information about the file
  // uploaded_file = req.file
  await db.getDBConnection()
  
  try {
    console.log('in try')

    var fileOwner = await db.User.findOne({
      username: req.session.username,
    }).exec()

    console.log(fileOwner)

    console.log(req.body.University1)
    const certificate_file = await db.CertificateFile.create({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: currentFilePath,
      fileDescription: req.body.Description1,
      fileOwner: fileOwner['_id'],
      fileTimestamp: Date.now(),
      fileHashFromBC: '-- document to be verified --',
      fileVerified: false,
      fileVerifier: req.body.University1,
    })

    certificate_file.save()
  } catch (e) {
    console.log(e)
  }

  // await db.closeDBConnection()
}

async function getFileFromDB(file_name, file_owner) {
  return await CertificateFile.find({
    fileName: file_name,
    fileOwner: file_owner,
  })
}

module.exports = { uploadFile, retrieveFile }
