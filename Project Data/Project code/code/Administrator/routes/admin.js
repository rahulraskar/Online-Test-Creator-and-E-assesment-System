const express = require('express')
const { request, response } = require('express')
const db = require('../../db')
const utils = require('../../utils')
const config = require('../../config')
const mailer = require('../../mailer')
const crypto = require('crypto-js')
const { SHA224, SHA256 } = require('crypto-js')
const multer = require('multer')
const upload = multer({ dest: 'images/' })
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const fs = require('fs')
const path = require('path')

const router = express.Router()

//GET *****************************************************

router.get('/profile/:id', (request, response) => {
  const { id } = request.params
  const statement = `select firstName, lastName, email from admin where id = '${id}'`
  db.query(statement, (error, admins) => {
    if (error) {
      response.send({ status: 'error', error: error })
    } else {
      if (admins.length == 0) {
        response.send({ status: 'error', error: 'admin does not exist' })
      } else {
        const admin = admins[0]
        response.send(utils.createResult(error, admin))
      }
    }
  })
})

router.get('/activate/:token', (request, response) => {
  const {token} = request.params

  const statement = `update admin set active = 1, activationToken = '' where activationToken = '${token}'`
  db.query(statement, (error, data) => {
    const htmlPath = path.join(__dirname, '/../templates/activation_result.html')
    const body = '' + fs.readFileSync(htmlPath)
    response.header('Content-Type', 'text/html')
    response.send(body)
  })

})

//GET end ************************************************

//POST *****************************************************

router.post('/signup', (request, response) => {
  const { firstName, lastName, email, password, orgnizationType, orgnizationName, country } = request.body

  const activationToken = uuid.v4()
  //console.log(activationToken);
  const activationLink = `http://localhost:3000/admin/activate/${activationToken}`

  const htmlPath = path.join(__dirname, '/../templates/send_activation_link.html')
  let body = '' + fs.readFileSync(htmlPath)
  body = body.replace('firstName', firstName)
  body = body.replace('activationLink', activationLink)

  const statement = `insert into admin (firstName, lastName, email, password, orgnizationType, orgnizationName, country, activationToken) values
                ('${firstName}', '${lastName}', '${email}', '${crypto.SHA256(password)}', '${orgnizationType}', '${orgnizationName}', '${country}', '${activationToken}')
    `

  db.query(statement, (error, data) => {
    mailer.sendEmail(email, 'Welcome to Online Quiz', body, (error, info) => {
      console.log(error)
      console.log(info)
      response.send(utils.createResult(error, data))
    })
  })
})

router.post('/upload-profile-picture/:adminId', upload.single('image'), (request, response) => {
  const { adminId } = request.params
  const fileName = request.file.filename

  const statement = `update admin set profileImage = '${fileName}' where id = '${adminId}'`
  db.query(statement, (error, data) => {
    response.send(utils.createResult(error, data))
  })
})

router.post('/signin', (request, response) => {
  const { email, password } = request.body
  const statement = `select id, firstName, lastName from admin where email = '${email}' and password = '${crypto.SHA256(password)}'`

  db.query(statement, (error, admins) => {
    const result = {}
    if (error) {
      response.send({ status: 'error', error: error })
    } else {
      if (admins.length == 0) {
        response.send({ status: 'error', error: 'admin does not exist' })
      } else {
        const admin = admins[0]
        const token = jwt.sign({ id: admin['id'] }, config.secret)
        response.send(utils.createResult(error, {
          firstName: admin['firstName'],
          lastName: admin['lastName'],
          token: token
        }))
      }
    }
  })
})


//POST end ************************************************

//PUT *****************************************************

router.put('/update-profile/:id', (request, response) => {
  const { id } = request.params
  const { firstName, lastName, email, orgnizationType, orgnizationName, country } = request.body

  const statement = `update admin set
                    firstName = '${firstName}',
                    lastName = '${lastName}',
                    email = '${email}',
                    orgnizationType = '${orgnizationType}',
                    orgnizationName = '${orgnizationName}',
                    country = '${country}'
                  where id = '${id}'
                  `
  db.query(statement, (error, data) => {
    response.send(utils.createResult(error, data))
  })
})

router.put('/update-password/:id', (request, response) => {
  const { id } = request.params
  const { password, newPassword, reEnteredPassword } = request.body

  if (newPassword != reEnteredPassword) {
    response.send('Passwords do not match')
  } else {
    const statement = `update admin set password = '${crypto.SHA256(newPassword)}'
                      where id = ${id} and password = '${crypto.SHA256(password)}'`

    db.query(statement, (error, admin) => {
      if (error) {
        response.send(utils.createError(error))
      } else {
        if (admin.affectedRows == 0) {
          response.send('Incorrect passsword')
        } else {
          response.send(utils.createSuccess(admin))
        }
      }
    })
  }
})


//PUT end ************************************************


module.exports = router