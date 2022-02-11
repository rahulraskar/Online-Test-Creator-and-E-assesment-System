const express = require('express')
const utils = require('../../utils')
const db = require('../../db')
const multer = require('multer')
const upload = multer({ dest: 'images/' })
const router = express.Router()

// ----------------------------------------------------
// POST
// ----------------------------------------------------

// Create test (User-side)
router.post('/:userId', (request, response) => {
    const { userId } = request.params
    const { testName, testDate, testTime, duration, testType, totalMarks, passingMarks } = request.body
    const getGroupId = `select groupId from user where id = ${userId}`

    db.query(getGroupId, (error, data) => {
        if (!error) {
            const addTest = `insert into test (testName, testDate, testTime, duration, testType, totalMarks, passingMarks, groupId) values
            ('${testName}', '${testDate}', '${testTime}', '${duration}', '${testType}', '${totalMarks}', '${passingMarks}', '${data[0]['groupId']}')
          `

            db.query(addTest, (error, data1) => {
                if (error) {
                    response.send(utils.createError(error))
                } else {
                    const getTestId = `select testId from test order by testId desc limit 1;`
                    db.query(getTestId, (error, testData) => {
                        if (error) {
                            response.send(utils.createError(error))
                        }
                        const getAdminId = `select adminId from quizGroup where id = '${data[0]['groupId']}'`
                        db.query(getAdminId, (error, adminData) => {
                            if (error) {
                                response.send(utils.createError(error))
                            }
                            const insertUserTestData = `insert into userTest (adminId, userId, testId, status) 
                                                        values ('${adminData[0]['adminId']}', '${userId}', '${testData[0]['testId']}', 'WAITING')`
                            db.query(insertUserTestData, (error, insertData) => {
                                response.send(utils.createResult(error, insertData))
                            })
                        })
                    })
                }
            })
        } else {
            response.send(utils.createError(error))
        }
    })
})






module.exports = router
