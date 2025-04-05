
const db = require('./db_processes')


var universities = {
    name: "Teesha K",
    role: "user",

    university: [
        {
        id: 1,
        name: "Mumbai University",
        },
        {
        id: 2,
        name: "Gujarat University",
        },
        {
        id: 3,
        name: "Vellore University",
        },
        {
        id: 4,
        name: "Maharashtra State Board",
        },
    ]
}


var profile = {
    name: "Teesha K",
    email: "teeshak@gmail.com",
    phoneNo: "1234567890",
    role: "user",

    university: [
        {
        id: 1,
        name: "Mumbai University",
        },
        {
        id: 2,
        name: "Gujarat University",
        },
        {
        id: 3,
        name: "Vellore University",
        },
        {
        id: 4,
        name: "Maharashtra State Board",
        },
    ],

    documents: [
        {
        no: 1,
        hash: "skrughiwoejnseghisodv",
        name: "Aadhar Card",
        description: "AC",
        },
        {
        no: 2,
        hash: "skrughiwoejnseghisodv",
        name: "Pan Card",
        description: "PC",
        },
        {
        no: 3,
        hash: "skrughiwoejnseghisodv",
        name: "Certificate",
        description: "Hackathon Certificate",
        },
    ]
}

var verifyDocs = {
    name: "Teesha K",
    role: "verifier",

    documents: [
        {
        no: 1,
        view: "path/here",
        name: "Aadhar Card",
        description: "AC",
        },
        {
        no: 2,
        view: "path/here",
        name: "Pan Card",
        description: "PC",
        },
        {
        no: 3,
        view: "path/here",
        name: "Certificate",
        description: "Hackathon Certificate",
        },
    ]
}


async function createDataForProfile(req) {
    await db.getDBConnection()
    user = await db.User.findOne({username: req.session.username}).exec()
    
    data = {
        name: req.session.username,
        role: req.session.role,
        email: user.email,
        phoneNo: user.phoneNo,
    }
    docs = []
    certificates = await db.CertificateFile.find({fileOwner: user}).exec()
    
    for (var i = 0; i < certificates.length; i++) {
        var doc = {}
        doc['no'] = i+1
        doc['hash'] = certificates[i]['fileHashFromBC']
        doc['name'] = certificates[i]['fileName']
        doc['description'] = certificates[i]['fileDescription']
        doc['verifier'] = certificates[i]['fileVerifier']
        docs.push(doc)
    }

    data['documents'] = docs

    console.log(data)
    return docs
}

async function createDataForVerifyDocuments(req) {
    await db.getDBConnection()
    user = await db.User.findOne({username: req.session.username}).exec()
    // documents = await db.CertificateFile.findOne({fileVerifier: user.institute}).exec()
    
    data = {
        name: req.session.username,
        role: req.session.role,
    }
    docs = []
    certificates = await db.CertificateFile.find({fileVerifier: user.institute, fileVerified: false}).exec()
    
    for (var i = 0; i < certificates.length; i++) {
        var doc = {}
        doc['no'] = i+1
        doc['unique'] = certificates[i]['_id']
        doc['view'] = certificates[i]['filePath']
        doc['name'] = certificates[i]['fileName']
        doc['description'] = certificates[i]['fileDescription']

        const user = await db.User.findOne({ _id: certificates[i]['fileOwner']}).exec()
        console.log('-------------', user['username'])
        doc['owner'] = user['username']

        docs.push(doc)
    }

    data['documents'] = docs

    console.log(data)
    return data
}

// no. of cert verified today ---
// no. of cert uploaded today ---
// no. of users registed ---
// no. of cert verified total ---
// no. of .......

async function createDataForDashboard(request) {
    try {
        await db.getDBConnection()

        const allCertificates = await db.CertificateFile.find({}).exec()
        const verifiedCertificates = []
        const dateToday = new Date().getDate() + '-' + new Date().getMonth() + '-' + new Date().getFullYear()
        var totalCertificatesVerifiedToday = 0
        var totalCerficatesUploadedToday = 0
        for (var i = 0; i < allCertificates.length; i++) {
            var certificatesUploadDate = allCertificates[i]['fileTimestamp'].getDate() + '-'  
                        + allCertificates[i]['fileTimestamp'].getMonth() + '-' 
                        + allCertificates[i]['fileTimestamp'].getFullYear()
            if (dateToday === certificatesUploadDate) totalCerficatesUploadedToday++

            if (allCertificates[i]['fileVerified'] == true) {
                verifiedCertificates.push(allCertificates[i])
                var certificatesVerificationDate = allCertificates[i]['verifiedDateTime'].getDate() + '-'  
                        + allCertificates[i]['verifiedDateTime'].getMonth() + '-' 
                        + allCertificates[i]['verifiedDateTime'].getFullYear()

                if (dateToday === certificatesVerificationDate) totalCertificatesVerifiedToday++
            }
        }

        const totalUsers = await db.User.find({role: 'user'}).exec()

        console.log(totalCertificatesVerifiedToday, verifiedCertificates.length, totalCerficatesUploadedToday, totalUsers.length, allCertificates.length)

        const data = {
            name: request.session.username, 
            role: request.session.role,
            verifiedToday: totalCertificatesVerifiedToday,
            uploadedToday: totalCerficatesUploadedToday,
            verifiedTotal: verifiedCertificates.length,
            uploadedTotal: allCertificates.length,
            totalUsers: totalUsers.length,
        }

        data['documents'] = await createDataForProfile(request)
        return data

    } catch (e) {
        console.log(e)
    }
}

// async function createDataForProfile() {}

module.exports = {
    createDataForProfile,
    createDataForVerifyDocuments,
    createDataForDashboard,
}