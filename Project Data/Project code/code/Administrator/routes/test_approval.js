const express = require('express')
const utils = require('../../utils')
const db = require('../../db')
const { request, response } = require('express')

const router = express.Router()
// ----------------------------------------------------
// GET
// ----------------------------------------------------

//get all test that need approval
router.get('/:id', (request, response) => {
    const{ id } = request.params
    
    const statement = `SELECT ut.userId,CONCAT(u.firstName, " ", u.lastName)AS name,t.testId,t.testName,q.groupName,
     t.testDate,t.testTime,t.duration
     from test t INNER JOIN quizGroup q
     ON t.groupId = q.id INNER JOIN userTest ut
     ON t.testId = ut.testId INNER JOIN user u
     ON ut.userId = u.id
     WHERE q.adminId = "${id}"
     AND ut.status = "WAITING"` 
    
     db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
    })
  })

//list according to status user tests
router.get('/:id/:status', (request, response) => {
  const{ id,status } = request.params
  
  const statement = `SELECT ut.userId,CONCAT(u.firstName, " ", u.lastName)AS name,t.testId,t.testName,q.groupName,
   t.testDate,t.testTime,t.duration
   from test t INNER JOIN quizGroup q
   ON t.groupId = q.id INNER JOIN userTest ut
   ON t.testId = ut.testId INNER JOIN user u
   ON ut.userId = u.id
   WHERE q.adminId = "${id}"
   AND ut.status = "${status}"` 
  
   db.query(statement,(error,data) => {
      if(error){
          response.send(utils.createError(error))
      }else{
          response.send(utils.createResult(error,data))
      }
  })
})

//view each test for details for approval

router.get('/viewtest/:testId',(request,response) => {
    const {testId} = request.params
    const statement = `SELECT * FROM test where testId = "${testId}"`
      db.query(statement, (error, data) => {
        const test = data[0]
        const groupName = `select groupName from quizGroup where id = '${test['groupId']}'`
        db.query(groupName,(error,groupdata) =>{
          // const result = {testDetails:data,groupname:groupdata}
          // response.send({status:'success',data:result})
          const questionlist = `select questId,question,option_A,option_B,option_C,option_D,correct_Ans,tag,image,marks from questionsTable where testId ='${test['testId']}'`
          db.query(questionlist,(error,questiondata)=>{
            const result = {testDetails:data,groupname:groupdata,questionData:questiondata}
            response.send({status:'success',data:result})
          })
        })
      })
  })

//getting data for disapproval
router.get('/viewtest/disapprove/:testId', (request, response) => {
    const {testId} = request.params
    
    const statement = `SELECT testId
     from test 
     WHERE testId = "${testId}"` 
    
     db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
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
//to approve the status of test as approved
router.put('/viewtest/approve/:testId',(request,response) => {
    const {testId} = request.params
    
    const statement = `UPDATE userTest SET status = "APPROVED"
                       WHERE testId = "${testId}"` 
    
     db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
    })
  })

//set reason for disapproval
router.put('/viewtest/disapprove/:testId', (request, response) => {
    const {testId} = request.params
    const {reason} = request.body
    const statement = `UPDATE userTest SET status = "DISAPPROVED",reason = "${reason}"
     WHERE testId = "${testId}"` 
    
     db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
    })
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