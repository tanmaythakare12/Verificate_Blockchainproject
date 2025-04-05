// Flow control of whole system
// Handle user requests
// Produce and send responses

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const flash = require("connect-flash");
// const open = require('open')

// Utility imports
const UserAuth = require("./user_auth");
const FileProcesses = require("./file_processes");
const DB_processes = require("./db_processes");
const BCProcesses = require("./bc_processes");
const CreateData = require("./create_template_data");

// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: '2020.teesha.karotra@ves.ac.in',
//     pass: '#',
//   },
// })

const upload = multer({ dest: "./uploads" });
const app = express();

// app.use('/media', express.static(path.join(__dirname + '../uploads/')));
app.use("/pdf", express.static(__dirname + "/uploads/"));
app.use("/log", express.static(__dirname + "/temp_log/"));
// app.use(express.static(path.join(__dirname, '../frontend/assets/')))
app.use(express.static(path.join(__dirname, "../frontend/assets/New_assets/")));
// app.set('views', path.join(__dirname, '../frontend/pages/'))
app.set("views", path.join(__dirname, "../frontend/pages/New_pages/"));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: "secret",
    })
);
app.use(flash());

// Display webpages and handle process requests.........

// Registration
app.get("/register", function (req, res) {
    res.render("register.ejs", {
        errorMessage: req.flash("errorMessage"),
        successMessage: req.flash("successMessage"),
    });
});

app.get("/", function (req, res) {
    res.render("landing.ejs", {
        errorMessage: req.flash("errorMessage"),
        successMessage: req.flash("successMessage"),
    });
});

app.post("/do-register", (req, res) => {
    UserAuth.registration(req, res);
});

// Login
// app.get('/', function (req, res) {
//   res.render('login.ejs')
// })

app.get("/login", function (req, res) {
    res.render("login.ejs", {
        errorMessage: req.flash("errorMessage"),
        successMessage: req.flash("successMessage"),
    });
});

app.post("/do-login", function (req, res) {
    UserAuth.login(req, res);
});

// Forget Password
app.get("/show-forgot-password", function (req, res) {
    res.render("forgot-password-email.ejs", {
        errorMessage: req.flash("errorMessage"),
        successMessage: req.flash("successMessage"),
    });
});

app.post("/do-forgot-password", async function (req, res) {
    await UserAuth.forgetPassword(req, res);
});

app.get("/otp-verification", function (req, res) {
    console.log(req.flash("errorMessage"), req.flash("successMessage"));
    res.render("forgot-password-otp.ejs", {
        errorMessage: req.flash("errorMessage"),
        successMessage: req.flash("successMessage"),
    });
});

app.post("/otp-verification", function (req, res) {
    console.log(req.flash("errorMessage"), req.flash("successMessage"));
    UserAuth.otpVerfication(req, res);
});

app.get("/reset-password", function (req, res) {
    res.render("forgot-password-reset.ejs", {
        errorMessage: req.flash("errorMessage"),
        successMessage: req.flash("successMessage"),
    });
});

app.post("/reset-password", function (req, res) {
    UserAuth.resetPassword(req, res);
});

app.post("/update-password", function (req, res) {
    UserAuth.updatePassword(req, res);
});

app.get("/faq", function (req, res) {
    if (req.session.username != null) {
        res.render("faq.ejs", {
            data: { name: req.session.username, role: req.session.role },
            errorMessage: req.flash("errorMessage"),
            successMessage: req.flash("successMessage"),
        });
    } else {
        res.redirect("/login");
    }
});

// Dashboard
app.get("/dashboard", async function (req, res) {
    if (req.session.username != null) {
        res.render("dashboard.ejs", {
            data: await CreateData.createDataForDashboard(req),
            errorMessage: req.flash("errorMessage"),
            successMessage: req.flash("successMessage"),
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/createLog", function (req, res) {
    console.log("in open logs");
    const fileName = Date.now() + ".html";
    const filePath = "./temp_log/" + fileName;
    const data = "<html><h3>Storing Certificate(s)</h3><pre>\n";
    fs.appendFile(filePath, data, function (err, file) {});
    res.send({ logUrl: "/log/" + fileName });
});

app.get("/showLogs", function (req, res) {
    logurl = req.query.logUrl;
    res.render("consoleWriter.html"); // ?logUrl=' + logurl
});

// Profile
app.get("/profile", async function (req, res) {
    if (req.session.username != null) {
        res.render("profile.ejs", {
            data: await CreateData.createDataForProfile(req),
            errorMessage: req.flash("errorMessage"),
            successMessage: req.flash("successMessage"),
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/update-profile", async function (req, res) {
    await UserAuth.updateProfile(req, res);
});

// Verify Documents
app.get("/verify-documents-page", async function (req, res) {
    if (req.session.username != null) {
        res.render("verify-documents.ejs", {
            data: await CreateData.createDataForVerifyDocuments(req),
            errorMessage: req.flash("errorMessage"),
            successMessage: req.flash("successMessage"),
        });
    } else {
        res.redirect("/login");
    }
});

// Upload files
app.get("/file-upload-page", function (req, res) {
    if (req.session.username != null) {
        res.render("file-upload.ejs", {
            data: { name: req.session.username, role: req.session.role },
            errorMessage: req.flash("errorMessage"),
            successMessage: req.flash("successMessage"),
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/upload-files", (req, res) => {
    FileProcesses.uploadFile(req, res);
});

app.get("/view-certificate-page", (req, res) => {
    if (req.session.username != null) {
        res.render("view-certificate.ejs", {
            data: { name: req.session.username, role: req.session.role },
            errorMessage: req.flash("errorMessage"),
            successMessage: req.flash("successMessage"),
        });
    } else {
        res.redirect("/login");
    }
});

/*
Currently the assumption is that somehow the verification of the certificate is performed by the verifier.
Assuming the certificate is verified, the further process is being carried out.

Blockchain upload process: 
        - Fetch path of file that is verified from db.
        - Store the file in IPFS storage.
        - Get unique key for that stored file.
        - Pass the unique key from IPFS and store it in the Smart Contract.
        - Deploy the smart contract on the test net (for now).
        - Get the hash of the deployed contract.
        - Store the hash with reference to the owner of the file (undecided: how to display the hash, as QR code or direct hash)

Blockchain retrieval process:
        - Fetch the smart contract referred to by the provided hash.
        - Fetch the unique key of IPFS storage from the contract.
        - Using the unique key, fetch the stored file from IPFS storage.
        - Open the pdf of the file in new tab in browser (currently download option is available).
*/

app.post("/bc-upload", async function (req, res) {
    console.log("calling bc upload");
    return res.redirect(await BCProcesses.bc_upload(req, res));
});

app.post("/bc-retrieve", async function (req, res) {
    console.log("calling bc retrieve");
    return res.redirect(await BCProcesses.bc_retrieval(req, res));
});

app.get("/logout", function (req, res) {
    console.log("logout");
    return UserAuth.logout(req, res);
});

// Server
var server = app.listen(3001, function () {
    console.log("App is running on Port ", server.address().port);
});
