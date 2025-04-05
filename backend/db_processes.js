// Establish connection with db
// Close connection with db
// Create db schema
// Add data to db
// Retrieve data from db

const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const URL = "mongodb://127.0.0.1:27017/Blockchain";

const User_Data_Schema = new mongoose.Schema({
    username: String,
    email: String,
    phoneNo: String,
    password: String,
    role: String,
    institute: String,
});

const Verifier_Data_Schema = new mongoose.Schema({
    username: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    institute: String,
    designation: String,
});

const Student_Data_Schema = new mongoose.Schema({
    username: String,
    name: String,
    institute: String,
    course: String,
    dob: Date,
    gender: String,
});

const Certificate_File_Schema = new mongoose.Schema({
    fileName: String,
    fileSize: Number,
    fileType: String,
    filePath: String,
    fileDescription: String,
    fileOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fileRespectiveUniversity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
    },
    fileTimestamp: Date,
    fileHashFromBC: String,
    fileVerified: Boolean,
    fileVerifier: String,
    verifiedDateTime: Date,
});

async function getDBConnection() {
    await mongoose
        .connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log("connected"));
}

async function closeDBConnection() {
    await mongoose.connection.close();
}

User = mongoose.model("User", User_Data_Schema);
Verifier = mongoose.model("Verifier", Verifier_Data_Schema);
Student = mongoose.model("Student", Student_Data_Schema);
CertificateFile = mongoose.model("CertificateFile", Certificate_File_Schema);
// University = mongoose.model('University', University_Schema)

module.exports = {
    getDBConnection,
    closeDBConnection,
    User,
    Verifier,
    Student,
    CertificateFile,
};
