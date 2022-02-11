const express = require('express')
const utils = require('../../utils')
const db = require('../../db')
const router = express.Router()
// ----------------------------------------------------
// GET
// ----------------------------------------------------
//to get specific test type
router.get('/:id/:testType', (request, response) => {
    const{id,testType} = request.params
    const statement = `SELECT testId,testName,createdOn FROM test where testType = "${testType}" AND testStatus="completed" AND approveStatus IS NULL AND groupId=(SELECT id FROM quizGroup WHERE adminId="${id}")`
    db.query(statement, (error, data) => {
      for(let index=0 ; index<data.length;index++){
        const test = data[index]
        const viewtestlink = `http://localhost:4000/completedTest/viewtest/${test["testId"]}`
        test.viewTestlink = viewtestlink
        const viewresultlink = `http://localhost:4000/completedTest/viewresult/${test["testId"]}`
        test.viewResultlink = viewresultlink
      }
      response.send(utils.createResult(error, data))
      
    })
  })
//to get all test types
router.get('/:id', (request, response) => {
    const{id} = request.params
    const statement = `SELECT testId,testName,createdOn FROM test WHERE testStatus="completed" AND approveStatus IS NULL AND groupId=(SELECT id FROM quizGroup WHERE adminId="${id}")`
    db.query(statement, (error, data) => {
      for(let index=0 ; index<data.length;index++){
        const test = data[index]
        const viewtestlink = `http://localhost:4000/completedTest/viewtest/${test["testId"]}`
        test.viewTestlink = viewtestlink
        const viewresultlink = `http://localhost:4000/completedTest/viewresult/${test["testId"]}`
        test.viewResultlink = viewresultlink
      }
      response.send(utils.createResult(error, data))
    })
  })


//to view each test  
router.get('/:id/viewtest/:testId',(request,response) => {
  const {id,testId} = request.params
  const statement = `SELECT * FROM test where testId = ${testId}`
    db.query(statement, (error, data) => {
      const test = data[0]
      const groupName = `select groupName from quizGroup where groupId=(SELECT id FROM quizGroup WHERE adminId="${id}")`
      db.query(groupName,(error,groupdata) =>{
        const questionlist = `select questId,question,option_A,option_B,option_C,option_D,correct_Ans,tag,image,marks from questionsTable where testId ='${test['testId']}'`
        db.query(questionlist,(error,questiondata)=>{
          const result = {testDetails:data,groupname:groupdata,questionData:questiondata}
          response.send({status:'success',data:result})
        })
      })
    })
})

router.get('/:id/viewresult/:testId',(request,response) => {
  const {testId} = request.params
  const statement = `SELECT testId,testName,totalMarks,groupId FROM test where testId = ${testId}`
    db.query(statement, (error, data) => {
      const test = data[0]
      const resultdata = `select CONCAT(u.firstName, " ", u.lastName)AS Name,r.marks,r.result,r.percentage from user u inner join userResult r
                          on u.id = r.userId
                          where u.groupId = '${test['groupId']}' AND r.testId = '${test['testId']}'
      `
      db.query(resultdata,(error,resultData) =>{
        const result = {testDetails:data,UserResult:resultData}
        response.send({status:'success',data:result})
       
      })
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