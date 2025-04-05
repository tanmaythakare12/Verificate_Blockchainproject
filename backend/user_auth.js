// Registration
// Login
// Forget Password
// Reset Password
// Logout

require('dotenv').config()
const db = require('./db_processes')
const nodemailer = require('nodemailer');

const pass = String(process.env.EMAIL_PASSWORD)
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
      request.flash('successMessage', 'Registration successful')
      return response.redirect('login')
    } else {
      request.flash('errorMessage', 'Passwords do not match')
      throw 'Passwords do not match'
    }
  } catch (e) {
    request.flash('errorMessage', 'Some error occured, please try again later.')
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
      request.session.email = user.email
      request.session.save()
      console.log(request.session.username)
      // if (user.role == 'Student') {
      //   return response.send('show-dashboard')
      // } else if (user.role == 'Verifier') {
      //   return response.send('show-verifier-dashboard')
      // }
      request.flash('successMessage', 'Login successful')
      return response.redirect('dashboard')
    } else {
      request.flash('errorMessage', 'Invalid Password')
      throw 'Invalid Username / Password '
    }
    // db.closeDBConnection()
  } catch (e) {
    request.flash('errorMessage', 'User not found, please register.')
    console.log('in catch')
    await db.closeDBConnection()
    console.error(e)
    return response.redirect('login')
  }
}

async function forgetPassword(request, response) {
  const random = Math.floor(Math.random() * 9000 + 1000)
  email = request.body.Email

  try {
    await db.getDBConnection()

    const user = await db.User.findOne({ email: email }).exec()
    if (user == null) {
      console.log('user is null')
      request.flash('errorMessage', 'User does not exist. Register to continue')
      // throw 'not found'
      response.redirect('/register')
    }
    else {
      request.session.otp = random;
      request.session.email = email;
      request.session.save();
      var mailOptions = {
        from: '2020.tanmay.thakare@ves.ac.in',
        to: email,
        subject: 'Subject',
        text: 'OTP is : ' + random,
      }
      console.log(random, email)
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          request.flash('errorMessage', 'Some error occured, please try again later.')
          console.log(error)
          response.redirect('login')
        } else {
          request.flash('successMessage', 'OTP is sent to your email.')
          console.log(request.flash('successMessage'))
          response.redirect('otp-verification')
        }
      })
      response.redirect('otp-verification')
    }
  } catch (e) {
    console.log('not found')
    // response.redirect('/register')
  }
} // Send email with link for reset password

async function otpVerfication(request, response) {
  otp =
    request.body.digit1 +
    request.body.digit2 +
    request.body.digit3 +
    request.body.digit4
  random = request.session.otp
  if (otp == random) {
    request.flash('successMessage', 'Enter new password')
    response.redirect('reset-password')
  } else {
    request.flash('errorMessage', 'OTP is invalid')
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
      await db.User.updateOne(
        { email: request.session.email },
        { password: password },
      )
      console.log('Password reset successful')
      request.flash('successMessage', 'Password reset successful. Login to continue')
      request.session.destroy()
      response.redirect('/login')
    } else {
      request.flash('errorMessage', 'Passwords do not match')
      console.log('Passwords do not match')
      response.redirect('/reset-password')
    }
  } catch (e) {
    // request.flash('errorMessage', 'Some error occured, please try again later.')
    console.error(e)
    response.redirect('/reset-password')
  }
}


async function updateProfile(request, response) {
  try {
    console.log('in update profile')
    await db.getDBConnection()

    const user = await db.User.updateOne({username: request.session.username}, {phoneNo: request.body.PhoneNo})
    console.log(user)
    request.flash('successMessage', 'Profile updated successfully.')
  } catch (e) {
    request.flash('errorMessage', 'Some error occured, please try again later.')
    console.log(e)
  }

  return response.redirect('/profile')
}

async function updatePassword(request, response) {
  try {
    await db.getDBConnection()
    
    const user = await db.User.findOne({username: request.session.username}).exec()
    if (user['password'] === request.body.OldPassword) {
      password = request.body.Password
      confirmPassword = request.body.ConfirmPassword
      if (password == confirmPassword) {
        console.log(request.session.email)
        await db.User.updateOne(
          { email: request.session.email },
          { password: password },
        )
      }
      request.flash('successMessage', 'Password updated')
    }
    else {
      request.flash('errorMessage', 'Old password is incorrect')
      console.log('old password incorrect')
    }
    response.redirect('/profile')
  } catch (e) {
    request.flash('errorMessage', 'Some error occured, please try again later.')
    console.log(e)
    response.redirect('/profile')
  }
}

function logout(request, response) {
  request.flash('successMessage', 'Successfully logged out.')
  request.session.destroy()
  console.log('Logout successful')
  return response.redirect('/')
}

module.exports = {
  registration,
  login,
  forgetPassword,
  otpVerfication,
  resetPassword,
  updateProfile,
  updatePassword,
  logout,
}
