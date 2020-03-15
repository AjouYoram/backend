const User = require('../../../models/user')
const Email = require('../../../models/email')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const config = require('../../../config');

/*
    POST /api/auth
    {
        username,
        password
    }
*/

exports.register = (req, res) => {
    const { username, password } = req.body
    let newUser = null

    // create a new user if does not exist
    const create = (user) => {
        if(user) {
            throw new Error('username exists')
        } else {
            return User.create(username, password)
        }
    }

    // count the number of the user
    const count = (user) => {
        newUser = user
        return User.countDocuments({}).exec()
    }

    // assign admin if count is 1
    const assign = (count) => {
        if(count === 1) {
            return newUser.assignAdmin()
        } else {
            // if not, return a promise that returns false
            return Promise.resolve(false)
        }
    }

    // respond to the client
    const respond = (isAdmin) => {
      res.json({
          message: 'registered successfully',
          admin: isAdmin ? true : false
      })
  }

  // run when there is an error (username exists)
  const onError = (error) => {
      res.status(409).json({
          message: error.message
      })
  }

  // check username duplication
  User.findOneByUsername(username)
  .then(create)
  .then(count)
  .then(assign)
  .then(respond)
  .catch(onError)
}

/*
    POST /api/auth/login
    {
        username,
        password
    }
*/

exports.login = (req, res) => {
  const {username, password} = req.body
  const secret = req.app.get('jwt-secret')

  // check the user info & generate the jwt
  const check = (user) => {
      if(!user) {
          // user does not exist
          throw new Error('login failed1')
      } else {
          // user exists, check the password
          if(user.verify(password)) {
              // create a promise that generates jwt asynchronously
              const p = new Promise((resolve, reject) => {
                  jwt.sign(
                      {
                          _id: user._id,
                          username: user.username,
                          admin: user.admin
                      }, 
                      secret, 
                      {
                          expiresIn: '7d',
                          issuer: 'https://github.com/shhan730',
                          subject: 'userInfo'
                      }, (err, token) => {
                          if (err) reject(err)
                          resolve(token) 
                      })
              })
              return p
          } else {
              throw new Error('login failed2')
          }
      }
  }

  // respond the token 
  const respond = (token) => {
      res.json({
          message: 'logged in successfully',
          token
      })
  }

  // error occured
  const onError = (error) => {
      res.status(403).json({
          message: error.message
      })
  }

  // find the user
  User.findOneByUsername(username)
  .then(check)
  .then(respond)
  .catch(onError)

}

/*
    GET /api/auth/check
*/

exports.check = (req, res) => {
  res.json({
      success: true,
      info: req.decoded
  })
}

/*
    POST /api/auth/email
    {
        emailID
    }
*/

exports.email = (req, res) => {
    const emailID = req.body.emailID

    // create a new user if does not exist
    const check = (user) => {
        if(user) {
            throw new Error('ID exists')
        }
    }

    const create = () => {
        return Email.create(emailID)
    }

    const sendEmail = ({save, token}) => {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: config.gmailID,
              pass: config.gmailPW
            }
          });
        
          let mailOptions = {
            from: config.gmailID,    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
            to: emailID,                     // 수신 메일 주소
            subject: '[아주요람]이메일 인증',   // 제목
            html: '<p>인증코드를 입력해주세요</p>' + '<h1>인증코드: ' + token + '</h1>'
          };
        
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) throw new Error(error);
            else console.log('Email sent: ' + info.response);
          });
          return save;
    }

    const respond = () => {
        res.json({
            message: 'success',
        })
    }

    const onError = (error) => {
        res.status(409).json({
            message: error.message
        })
    }

    User.findOneByUsername(emailID)
    .then(check)
    .then(create)
    .then(sendEmail)
    .then(respond)
    .catch(onError)
    
}

/*
    POST /api/auth/verifyEmail
    {
        emailID,
        token
    }
*/

exports.verifyEmail = (req,res) => {
    const emailId = req.body.emailID;
    const token = req.body.token;


}