const express = require('express')
const utils = require('../../utils')
const db = require('../../db')


const router = express.Router()

// view discussion for test

router.get('/viewDiscussion/:testId',(request,response) => {

    const { testId } = request.params

    const statement = `select q.questId,question,option_A,option_B,option_C,option_D,
    discussionId,query,response,d.testId,
    u.id,concat(u.firstName," ",u.lastName) AS userName,
    adminId
    
    from
   
    discussion  d INNER JOIN questionsTable q  
    ON d.questId = q.questId
    
    INNER JOIN user u
    on d.userId = u.id
   
    where d.testId = ${testId};`
    
    db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
    })
  })

// post query for a question

router.post('/ask/:userId/:questId',(request,response) => {
    
    const { userId,questId } = request.params
    const { query,testId} = request.body
    
    const statement = `INSERT INTO discussion (questId,userId,query,testId)VALUES("${questId}","${userId}","${query}","${testId}")`
    
    db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
    })
  })
    
// edit existing query     

router.put('/edit/:distId',(request,response) => {
    
    const { distId } = request.params
    const { query } = request.body
    
    const statement = `UPDATE discussion SET query = '${query}'
     WHERE discussionId = "${distId}"`
    
    db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
    })
})

// delete the query

router.delete('/delete/:distId',(request,response) => {
    
    const { distId } = request.params
    
    const statement = `DELETE FROM discussion WHERE discussionId = ${distId}`
    
    db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
    })
})

module.exports = router