const express = require('express')
const { request } = require('express')
const router = express.Router()
const db = require('../../db')
const config = require('../../config')
const utils = require('../../utils')
const crypto = require('crypto-js')
const { state } = require('../../db')
const uuid = require('uuid')
const fs = require('fs')
const mailer = require('../mailer/mailer')
const path = require('path')
const multer = require('multer')
const upload = multer({ dest: 'images/' })
const jwt = require('jsonwebtoken')
// ------------------------------------------------------------------
// GET
// ------------------------------------------------------------------

router.get('/activate/:token', (request, response) => {
    const { token } = request.params
    const statement = `update user set isActive = 1,activationToken = '' where activationToken ='${token}'`
    db.query(statement, (error, data) => {
        const htmlPath = path.join(__dirname, '../templates/html/activation_result.html')
        const body = ' ' + fs.readFileSync(htmlPath)
        response.header('Content-Type', 'text/html')
        response.send(body)
    })

})

router.get('/forgot-password/:email', (request, response) => {
    const { email } = request.params
    const statement = `select id, firstName, lastName from user where email = '${email}'`
    db.query(statement, (error, users) => {
        if (error) {
            response.send(utils.createError(error))
        } else if (users.length == 0) {
            response.send(utils.createError('user does not exist'))
        } else {
            const user = users[0]
            const otp = utils.generateOTP()
            const htmlPath = path.join(__dirname,'../templates/html/send_user_otp.html')
            //const body = `Your otp = ${otp}`
            let body = ' '+fs.readFileSync(htmlPath) 
            body = body.replace('firstName',user['firstName'])
            body = body.replace('otp',otp)
            
            mailer.sendEmail(email, 'Reset your password', body, (error, info) => {
                response.send({status:'Success',data:{
                    otp:otp,
                    email:email
                }})
            })
        }
    })
})



// ------------------------------------------------------------------
// POST
// ------------------------------------------------------------------
router.post('/signup', (request, response) => {

    const { firstName, lastName, registrationCode, email, password, country } = request.body
    const encryptedPassword = crypto.SHA256(password)

    let groupId =  registrationCode.split(':')[1]
    groupId = parseInt(groupId); 

    const activationToken = uuid.v4()
    const activationLink = `http://localhost:4000/user/activate/${activationToken}`

    const htmlPath = path.join(__dirname, '../templates/html/send_user_activation_link.html')

    let body = ' ' + fs.readFileSync(htmlPath)
    body = body.replace('firstName', firstName)
    body = body.replace('activationLink', activationLink)

    const statement = `insert into user(firstName, lastName, registrationCode, email, password, country, groupId,activationToken ) values ('${firstName}','${lastName}','${registrationCode}','${email}','${encryptedPassword}','${country}','${groupId}','${activationToken}')`

    db.query(statement, (error, data) => {
        mailer.sendEmail(email, 'Welcome to online test creator and E-Assessment system ', body, (error, info) => {
            console.log(error)
            console.log(info)
            response.send(utils.createResult(error, data));
        })
    })

})

router.post('/signin', (request, response) => {
    const { email, password } = request.body
    //const statement = ` select id,firstName,lastName,isActive from user where email = '${email}' and password = '${crypto.SHA256(password)}'`
    const statement = ` select id,firstName,lastName,isActive from user where email = '${email}' and password = '${password}'`
    db.query(statement, (error, users) => {
        if (error) {
            response.send({ status: 'Error', Error: error })
        } else if (users.length == 0) {
            response.send({ status: 'Error', Error: 'Incorrect Username or Password' })
        } else {
            const user = users[0];
            if (user['isActive'] == 1) {
                const token = jwt.sign({ id: user['id'] }, config.secret)
                    response.send(utils.createResult(error, {
                    firstName: user['firstName'],
                    lastName: user['lastName'],
                    id: user['id'],
                    token: token
                 }))
                //response.send(utils.createResult(error, user))
            } else {
                response.send({ Status: 'Error', Error: 'your account is not active. please contact administrator' })
            }
        }
    })
})

router.post('/upload-image/:userId', upload.single('image'), (request, response) => {
    
    const {userId} = request.params
    const fileName = request.file.filename
  
    const statement = `update user set profileImage = '${fileName}' where id = ${userId}`
    db.query(statement, (error, data) => {
      response.send(utils.createResult(error, data))
    })
})

// ------------------------------------------------------------------
// PUT
// ------------------------------------------------------------------
router.put('/update-details/:userId', (request, response) => {
    const { firstName,lastName,email } = request.body
    const { userId } = request.params

    const statement = `update user set firstName = '${firstName}', lastName = '${lastName}',email = '${email}' where id = ${userId}`
    db.query(statement,(error,data) =>{
        // response.send({ status : 'Success' , data: 'Values updated successfully'})
        response.send(utils.createResult(error,data))
    })

})

// ------------------------------------------------------------------
// Delete
// ------------------------------------------------------------------
router.delete('/', (request, response) => {

})

module.exports = router
