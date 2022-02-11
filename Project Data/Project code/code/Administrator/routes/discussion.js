const express = require('express')
const utils = require('../../utils')
const db = require('../../db')


const router = express.Router()

// get only specific type of test discussion

router.get('/:testType', (request, response) => {
    const{testType} = request.params
    
    const statement = `SELECT testId,testName,groupName,
     testDate,testTime,duration,testType
     from test t INNER JOIN quizGroup q
     ON t.groupId = q.id
     where t.testType = "${testType}"`
    
     db.query(statement, (error, data) => {

        if(error){
            response.send(utils.createError)
        }else{
      
            for(let index=0 ; index<data.length;index++){
            
            const test = data[index]
            
            const startTest = `http://localhost:3000/test/viewtest/${test["testId"]}`
            test.startTestLink = startTest

            const viewresult = `http://localhost:3000/test/viewresult/${test["testId"]}`
            test.viewResult = viewresult

            const viewDisc = `http://localhost:3000/discussion/viewDiscussion/${test["testId"]}`
            test.viewDiscussion = viewDisc

            const testdelete = `http://localhost:3000/test/reset/${test["testId"]}`
            test.testDelete = testdelete
            
        }
        response.send(utils.createSuccess(data))
    }
      
    })
  })

// get all type test discussion 

  router.get('/', (request, response) => {
    
    const statement = `SELECT testId,testName,groupName,
    testDate,testTime,testType,duration
    from test t INNER JOIN quizGroup q
    ON t.groupId = q.id`
    
     db.query(statement, (error, data) => {

        if(error){
            response.send(utils.createError)
        }else{
      
            for(let index=0 ; index<data.length;index++){
            
            const test = data[index]
            
            const startTest = `http://localhost:3000/admin/viewtest/${test["testId"]}`
            test.startTestLink = startTest

            const viewresult = `http://localhost:3000/admin/viewresult/${test["testId"]}`
            test.viewResult = viewresult

            const viewDisc = `http://localhost:3000/discussion/viewDiscussion/${test["testId"]}`
            test.viewDiscussion = viewDisc

            const testdelete = `http://localhost:3000/admin/reset/${test["testId"]}`
            test.resetReplyLink = testdelete
            
        }
        response.send(utils.createSuccess(data))
    }
      
    })
  })

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
    
   db.query(statement, (error, data) => {

    if(error){
        response.send(utils.createError)
    }else{
  
        for(let index=0 ; index<data.length;index++){
        
        const test = data[index]
        
        const postReply = `http://localhost:3000/discussion/create/${test["discussionId"]}`
        test.postReplyLink = postReply

        const editReply = `http://localhost:3000/discussion/edit/${test["discussionId"]}`
        test.editReplyLink = editReply

        const deleteReply = `http://localhost:3000/discussion/reset/${test["discussionId"]}`
        test.resetReplyLink = deleteReply

        
    }
    response.send(utils.createSuccess(data))
}
  
})
})

// post reply for existing query

router.put('/create/:id',(request,response) => {
    
    const { id } = request.params
    const { adminId ,Response} = request.body
    
    const statement = `update discussion set adminId ='${adminId}',
    response ='${Response}' where discussionId = ${id}`
    
    db.query(statement, (error, data) => {

        if(error){
            response.send(utils.createError)
        }else{
      
            for(let index=0 ; index<data.length;index++){
            
            const test = data[index]
            
            const editReply = `http://localhost:3000/discussion/edit/${test["discussionId"]}`
            test.editReplyLink = editReply
    
            const deleteReply = `http://localhost:3000/discussion/reset/${test["discussionId"]}`
            test.resetReplyLink = deleteReply
    
            
        }
        response.send(utils.createSuccess(data))
    }      
    })
})
    
// edit existing reply from admin     

router.put('/edit/:id',(request,response) => {
    
    const { id } = request.params
    const { adminId ,Response} = request.body
    
    const statement = `update discussion set adminId = '${adminId}',
    response ='${Response}' where discussionId = ${id}`
    
    db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
    })
})

// reset existing reply from admin 

router.put('/reset/:id',(request,response) => {
    
    const { id } = request.params
    
    const statement = `update discussion set adminId = NULL,
    response =NULL where discussionId = ${id}`
    
    db.query(statement,(error,data) => {
        if(error){
            response.send(utils.createError(error))
        }else{
            response.send(utils.createResult(error,data))
        }
    })
})

module.exports = router