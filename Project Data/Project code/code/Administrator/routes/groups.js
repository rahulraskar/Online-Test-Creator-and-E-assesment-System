const express = require('express')
const { request, response } = require('express')
const router = express.Router()
const db = require('../../db')
const config = require('../../config')
const utils = require('../../utils')
const crypto = require('crypto-js')
const { state } = require('../../db')
const uuid = require('uuid')
const fs = require('fs')
const mailer = require('../../User/mailer/mailer')
const path = require('path')


// ------------------------------------------------------------------
// GET
// ------------------------------------------------------------------

//to get list of groups

router.get('/groups/list-groups/:adminId', (request, response) => {
    const { adminId } = request.params
    const statement = `select id,groupName,createdOn from quizGroup where adminId = '${adminId}'`
    db.query(statement, (error, data) => {
        response.send(utils.createResult(error, data))
    })
})

//to get list of members of particular group
router.get('/groups/list-members/:groupId', (request, response) => {
    const { groupId } = request.params
    const statement = `select * from user where groupId = '${groupId}'`
    db.query(statement, (error, members) => {
        if (members.length == 0) {
            response.send(utils.createResult(error, 'There are no users in this group'))
        } else {
            response.send(utils.createResult(error, members))
        }
    })
})
// ------------------------------------------------------------------
// POST
// ------------------------------------------------------------------

//to create a group
 
router.post('/groups/create-group/:nooFIdtoGenerate', (request, response) => {


    const { nooFIdtoGenerate } = request.params
    const getLastId = `select id from quizGroup order by id DESC LIMIT 1`
    let lastId = 0
    db.query(getLastId, (error, user) => {

        const record = user[0]
        lastId = record['id']
        lastId = lastId + 1
        const statement = `insert into quizGroup(id,groupName,adminId) values ('${lastId}','${groupName}','${adminId}')`
        db.query(statement, (error, data) => {
            if (error) {
                response.send(utils.createResult(error, data))
            } else {
                console.log(lastId)
                let tempId = ''
                let body = '<html> <body> listofcodes </body> </html>'
                for (let index = 0; index < nooFIdtoGenerate; index++) {
                    tempId += '<div>' + 'GRPID:' + lastId + ':STUD:' + (index + 1) + '</div><br>'
                }
                body = body.replace('listofcodes', tempId)
                // console.log(listOfIds)
                const fetchAdminEmailQuery = `select email from admin where id = ${adminId} `
                db.query(fetchAdminEmailQuery, (error, Email) => {
                    const adminEmail = Email[0];

                    mailer.sendEmail(adminEmail['email'], `Registration Codes for ${groupName}`, body, (error, info) => {
                        response.send({ status: "Success", data: 'Group created Successfully and Generated Ids are Emailed to your registered Email Id' });
                    })
                })
            }
        })
    })
})



// ------------------------------------------------------------------
// PUT
// ------------------------------------------------------------------

//to block or unblock member

router.put('/groups/block-unblock-member/:userId/:isActive', (request, response) => {
    const { userId, isActive } = request.params
    const statement = `update user set isActive = ${isActive} where id = ${userId}`
    db.query(statement, (error, data) => {
        response.send(utils.createResult(error, data))
    })
})
// ------------------------------------------------------------------
// DELETE
// ------------------------------------------------------------------

//to delete group

router.delete('/groups/delete-group/:groupId', (request, response) => {
    const { groupId } = request.params
    const statement = `delete from quizGroup where id = '${groupId}'`
    db.query(statement, (error, data) => {
        response.send(utils.createResult(error, data))
    })
})

// to delete a member from group 

router.delete('/groups/delete-member/:userId',(request,response) =>{
    const { userId } = request.params
    const statement = `delete from user where id = ${userId}`
    db.query(statement, (error, data) => {
        response.send(utils.createResult(error, data))
    })
})

module.exports = router
