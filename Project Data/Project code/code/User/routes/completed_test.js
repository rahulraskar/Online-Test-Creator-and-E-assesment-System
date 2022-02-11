const express = require('express')
const utils = require('../../utils')
const db = require('../../db')
const { request, response } = require('express')

const router = express.Router()
// ----------------------------------------------------
// GET
// ----------------------------------------------------
//to list specific type of completed test
router.get('/:userId/:testType', (request, response) => {
    const{userId,testType} = request.params
    const statement = `SELECT testId,testName,createdOn FROM test WHERE testType = "${testType}" testStatus="completed" AND approveStatus IS NULL AND groupId=(select groupId from user where id="${userId}")`
    db.query(statement, (error, data) => {
      for(let index=0 ; index<data.length;index++){
        const test = data[index]
        const viewtestlink = `http://localhost:4000/completedTest/${test["groupId"]}/viewtest/${test["testId"]}`
        test.viewTestlink = viewtestlink
        const viewresultlink = `http://localhost:4000/completedTest/${test["groupId"]}/viewresult/${test["testId"]}`
        test.viewResultlink = viewresultlink
      }
      response.send(utils.createResult(error, data))
      
    })
  })

  //to list all completed test
router.get('/:userId', (request, response) => {
    const{userId} = request.params
    const statement = `SELECT testId,testName,createdOn FROM test WHERE testStatus="completed" AND approveStatus IS NULL AND groupId=(select groupId from user where id="${userId}")`
    db.query(statement, (error, data) => {
      for(let index=0 ; index<data.length;index++){
        const test = data[index]
        const viewtestlink = `http://localhost:4100/completedTest/${test["groupId"]}/viewtest/${test["testId"]}`
        test.viewTestlink = viewtestlink
        const viewresultlink = `http://localhost:4100/completedTest/${test["groupId"]}/${test["Id"]}/viewresult/${test["testId"]}`
        test.viewResultlink = viewresultlink
      }
      response.send(utils.createResult(error, data))
    })
  })


  
//to view details of specific test with questions
router.get('/:userId/viewtest/:testId',(request,response) => {
  const {userId,testId} = request.params
  const statement = `SELECT * FROM test where testId = "${testId}"`
    db.query(statement, (error, data) => {
      const test = data[0]
      const groupName = `select groupName from quizGroup where groupId=(select groupId from user where id="${userId}")`
      db.query(groupName,(error,groupdata) =>{
        const questionlist = `select questId,question,option_A,option_B,option_C,option_D,correct_Ans,tag,image,marks from questionsTable where testId ='${test['testId']}'`
        db.query(questionlist,(error,questiondata)=>{
          const result = {testDetails:data,groupname:groupdata,questionData:questiondata}
          response.send({status:'success',data:result})
        })
      })
    })
})

//to view result of each test 
router.get('/:userId/viewresult/:testId',(request,response) => {
  const {id,groupid,testId} = request.params
  const statement = `SELECT t.testDate,t.testTime,u.result,t.noOfQuestions,u.correctAnswer,u.attemptedQuestions,u.percentage,u.marks
                      FROM test t INNER JOIN userResult u ON
                      t.testId = u.testId
                      WHERE t.testId = "${testId}"  AND u.userId = "${userId}"`
    db.query(statement, (error, data) => {
    response.send(utils.createResult(error, data))
    })
})

// ----------------------------------------------------




// ----------------------------------------------------
// POST
// ----------------------------------------------------

router.post('', (request, response) => {
  response.send()
})

// ----------------------------------------------------


// ----------------------------------------------------
// PUT
// ----------------------------------------------------

router.put('', (request, response) => {
  response.send()
})

// ----------------------------------------------------



// ----------------------------------------------------
// DELETE
// ----------------------------------------------------

router.delete('', (request, response) => {
  response.send()
})

// ----------------------------------------------------

module.exports = router