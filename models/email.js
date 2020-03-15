const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const config = require('../config');

const Email = new Schema({
    emailID: String,
    token: String,
    sessionActivity: { type: Date, expires: 60*10, default: Date.now}
})



Email.statics.create = function(emailID) {

  const token = crypto.randomBytes(20).toString('hex');

  const email = new this({
    emailID,
    token
  })

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmailID,
      pass: config.gamilPW
    }
  });

  let mailOptions = {
    from: config.gmailID,    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
    to: emailID,                     // 수신 메일 주소
    subject: '[아주요람]이메일 인증',   // 제목
    html: '<p>인증코드를 입력해주세요</p>' + '<h1>인증코드: ' + token + '</h1>'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log(error);
    else console.log('Email sent: ' + info.response);
  });

  // return the Promise
  return email.save()
}

module.exports = mongoose.model('Email', Email)