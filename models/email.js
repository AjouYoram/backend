const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')

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

  // return the Promise
  const save = email.save()
  return {save, token}
}

Email.statics.findOneByEmailID = function(emailID) {
  return this.findOne({
      emailID
  }).exec()
}

Email.methods.verify = function(token) {
  return this.token === token
}



module.exports = mongoose.model('Email', Email)