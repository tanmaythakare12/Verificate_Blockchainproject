// Registration
// Login
// Forget Password
// Reset Password
// Logout

const db = require('./db_processes')
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: '2020.tanmay.thakare@ves.ac.in',
    pass: 'nvnvmbuhreuzdtbx',
  },
})

async function registration(request, response) {
  try {
    await db.getDBConnection()
    const username = request.body.Username
    const email = request.body.Email
    const phoneNo = request.body.PhoneNo
    const password = request.body.Password
    const confirmPassword = request.body.ConfirmPassword

    if (password == confirmPassword) {
      const user = await new db.User({
        username: username,
        email: email,
        phoneNo: phoneNo,
        password: password,
        role: 'user',
        institute: '',
      })
      await user.save()
      console.log(user)
      console.log('Registration successful')
      return response.redirect('login')
    } else {
      throw 'Passwords do not match'
    }
  } catch (e) {
    console.error(e)
    await db.closeDBConnection()
    return response.redirect('register')
  }
}

async function login(request, response) {
  try {
    await db.getDBConnection()
    const email = request.body.Email
    console.log(email)
    const password = request.body.Password
    const user = await db.User.findOne({ email: email }).exec()
    console.log('Student found', user)

    if (user['password'] == password) {
      console.log('Login successful')
      request.session.username = user.username
      request.session.role = user.role
      request.session.save()
      console.log(request.session.username)
      // if (user.role == 'Student') {
      //   return response.send('show-dashboard')
      // } else if (user.role == 'Verifier') {
      //   return response.send('show-verifier-dashboard')
      // }
      return response.redirect('dashboard')
    } else {
      throw 'Invalid Username / Password '
    }
    // db.closeDBConnection()
  } catch (e) {
    console.log('in catch')
    await db.closeDBConnection()
    console.error(e)
    return response.redirect('login')
  }
}

async function forgetPassword(request, response) {
  const random = Math.floor(Math.random() * 9000 + 1000)
  email = request.body.Email
  request.session.otp = random;
  request.session.email = email;
  request.session.save();
  var mailOptions = {
    from: '2020.teesha.karotra@ves.ac.in',
    to: email,
    subject: 'Subject',
    text: 'OTP is : ' + random,
  }
  console.log(random, email)
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
      responce.redirect('login')
    } else {
      console.log('Email sent')
      responce.redirect('otp-verification')
    }
  })
  response.redirect('otp-verification')
} // Send email with link for reset password

async function otpVerfication(request, response) {
  otp =
    request.body.digit1 +
    request.body.digit2 +
    request.body.digit3 +
    request.body.digit4
  random = request.session.otp
  if (otp == random) {
    response.redirect('reset-password')
  } else {
    response.redirect('otp-verification')
    // , {data: 'OTP is incorrect'}
  }
}

async function resetPassword(request, response) {
  try {
    await db.getDBConnection()
    password = request.body.Password
    confirmPassword = request.body.ConfirmPassword
    if (password == confirmPassword) {
      console.log(request.session.email)
      await db.User.findOneAndUpdate(
        { email: request.session.email },
        { password: password },
        { returnOriginal: false },
      )
      console.log('Password reset successful')
      request.session.destroy()
      responce.redirect('login')
    } else {
      console.log('Passwords do not match')
      responce.redirect('reset-password')
    }
  } catch (e) {
    console.error(e)
    response.send('reset-password')
  }
}

async function updateProfile(req, res) {
  try {
    await db.getDBConnection()

    updates = {phoneNo: req.body.phoneNo}
    user = await db.User.findOneAndUpdate({username: req.session.username}, updates).exec()
    console.log(user)
  } catch (e) {
    console.log(e)
  }

  return res.redirect('/profile')
}

function logout(request, response) {
  request.session.destroy()
  console.log('Logout successful')
  return response.redirect('show-login')
}

module.exports = {
  registration,
  login,
  forgetPassword,
  otpVerfication,
  resetPassword,
  updateProfile,
  logout,
}
