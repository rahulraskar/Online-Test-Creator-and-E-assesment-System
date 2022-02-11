const express = require('express')
const utils = require('../../utils')
const db = require('../../db')

const router = express.Router()

// get only specific type of test details

router.get('/:testType', (request, response) => {
    const{ testType } = request.params
    
    const statement = `SELECT testId,testName,groupName,
     testDate,testTime,duration,testType
     from test t INNER JOIN quizGroup q
     ON t.groupId = q.id
     where t.testType = "${testType}" AND t.testStatus = "SCHEDULED"`
    
     db.query(statement, (error, data) => {

        if(error){
            response.send(utils.createError)
        }else{
      
            for(let index=0 ; index<data.length;index++){
            
            const test = data[index]
            
            const updateTest = `http://localhost:3000/scheduleTest/updateTest/${test["testId"]}`
            test.updateTestLink = updateTest

            const deleteTest = `http://localhost:3000/scheduleTest/deleteTest/${test["testId"]}`
            test.deleteTestLink = deleteTest
            
        }
        response.send(utils.createSuccess(data))
    }
      
    })
  })


// get all type of test details

router.get('/', (request, response) => {

  const statement = `SELECT testId,testName,groupName,
  testDate,testTime,duration,testType
  from test t INNER JOIN quizGroup q
  ON t.groupId = q.id
  where t.testStatus = "SCHEDULED"`

  db.query(statement, (error, data) => {

    if (error) {
      response.send(utils.createError)
    } else {

      for (let index = 0; index < data.length; index++) {

        const test = data[index]

        const updateTest = `http://localhost:3000/scheduleTest/updateTest/${test["testId"]}`
        test.updateTestLink = updateTest

        const deleteTest = `http://localhost:3000/scheduleTest/deleteTest/${test["testId"]}`
        test.deleteTestLink = deleteTest

      }
      response.send(utils.createSuccess(data))
    }

  })
})

// update scheduled test details

// delete scheduled test

router.delete('/deleteTest/:id',(request,response) => {
    
    const { id } = request.params
  
    const statement = `delete q,t from 
    test t INNER JOIN questionsTable q 
    ON t.testId = q.testId 
    where testId = ${id}`
    
    db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
    })
  })


module.exports = router