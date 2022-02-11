
const { response } = require('express')
const express = require('express')
const router = express.Router()
const db = require('../../db')
const config = require('../../config')
const utils = require('../../utils')

const path = require('path')
const multer = require('multer')
const fs = require('fs')
const upload = multer({ dest: 'quest_images/' })

//------------------------------------------------------------------------
// GET
//------------------------------------------------------------------------

//for getting data about specific test = test settings  +  questions 
// router.get('/test_settings/:test_id', (request, response) => {

//     const { test_id } = request.params
    
//     const testsettings = `select t.testId,t.testName,t.testDate,t.testTime,t.testType,t.duration,t.totalMarks,t.passingMarks,t.noOfQuestions,
//     g.groupName from test t inner join quizGroup g on t.groupId = g.id where t.testId = '${ test_id }'`
//     db.query(testsettings,(error,testData) =>{
//         const questions = `select q.questId,q.question,q.option_A,q.option_B,q.option_C,q.option_D,q.correct_Ans,q.tag,q.image,q.marks 
//         from test t inner join questionsTable q on q.testId = '${test_id}'`
//         db.query(questions,(error,questionData) =>{
//             const resultSet = { 'Test Settings':testData,'Questions':questionData }
//             response.send(utils.createResult(error,resultSet))
//         })    
//     })    
// })

// to get the test settings only
router.get('/test/test_settings/:test_id',(request,response) =>{
        
        const { test_id } = request.params
        const testsettings = `select t.testId,t.testName,t.testDate,t.testTime,t.testType,t.duration,t.totalMarks,t.passingMarks,t.noOfQuestions,
                              g.groupName from test t inner join quizGroup g on t.groupId = g.id where t.testId = '${ test_id }'`

        db.query(testsettings,(error,testData) =>{
            
            const resultSet = { 'Test Settings':testData }
            response.send(utils.createResult(error,resultSet))
        })
})

//to get the test questions only
router.get('/test/test_questions/:test_id',(request,response) =>{
        
    const { test_id } = request.params

    const questions = `select q.questId,q.question,q.option_A,q.option_B,q.option_C,q.option_D,q.correct_Ans,q.tag,q.image,q.marks 
    from test t inner join questionsTable q on q.testId = '${test_id}'`

    db.query(questions,(error,questionData) =>{
        const resultSet = { 'Questions':questionData }
        response.send(utils.createResult(error,resultSet))
    })
})


//to fetch all group names from quiz group table 
router.get("/test/fetch_group_name",(request,response) =>{
    const fetch_group_statement = `select groupName from quizGroup`
    db.query(fetch_group_statement,(error,data) =>{
        response.send(utils.createResult(error,data))
    })
})


//------------------------------------------------------------------------
// POST

//------------------------------------------------------------------------


router.post('', (request, resposne) => {
    
})

//------------------------------------------------------------------------
// PUT
//------------------------------------------------------------------------

// For Updating specific question

router.put('/test/edit_question/:id', (request, response) => {

    const { question ,option_A ,option_B,option_C,option_D,correct_Ans,tag,image,marks } = request.body
    const { id } = request.params
    const statement = `update questionsTable set question = '${question}' ,option_A  = '${option_A}',option_B = '${option_B}'
                       ,option_C = '${option_C}',option_D = '${option_D}',correct_Ans = '${correct_Ans}',tag = '${tag}',image  = '${image}',marks = '${marks}' 
                       where questId = '${id}'`

    db.query(statement,(error,data) =>{
        response.send(utils.createResult(error,data));
    })
    
})


//For updating test settings


router.put('/test/edit_test_settings/:testId',(request,response) => {

    const { testName ,testDate ,testTime ,duration ,testType ,totalMarks ,passingMarks ,noOfQuestions ,groupName } = request.body;
    const { testId } = request.params    

    const groupIdStatement = `select id from quizGroup where groupName = '${groupName}'`;
    db.query(groupIdStatement,(error,groupData) => {

        const group = groupData[0]
    
        const updateTestSettings = `update test set testName = '${ testName }' ,testDate = '${ testDate }' ,testTime = '${ testTime }' 
        ,duration  = '${ duration }' ,testType = '${ testType }'  ,totalMarks = '${ totalMarks }' ,passingMarks = '${ passingMarks }'  
        ,noOfQuestions = '${ noOfQuestions }'  , groupId = '${group['id']}'  where testId = '${ testId }'`

        db.query(updateTestSettings,(error,data) => {
            response.send(utils.createResult(error,data))
        })
    })        
})

//to update test images
router.post('/test/upload-image/:questId', upload.single('quest_image'), (request, response) => {
    
    const { questId } = request.params
    const fileName = request.file.filename
  
    const getQuestionImage = `select image from questionsTable where questid = ${ questId }`
    db.query(getQuestionImage,(error,imageData) =>{

        const question_image = imageData[0]
        if(question_image['image'] != null){
            const path = `./quest_images/${ question_image['image']}`
            fs.unlink(path, (err) => {
                if (err) {
                    response.send(utils.createResult(err,null))
                    return
                }
            })
        }    
        const updateImage = `update questionsTable set image = '${fileName}' where questid = ${ questId }`
        db.query(updateImage, (error, data) => {
            response.send(utils.createResult(error, data))
        })
    }) 
})

  

//------------------------------------------------------------------------
// DELETE
//------------------------------------------------------------------------

//to delete particular question from test

router.delete('/test/delete_question/:id', (request, response) => {

    const { id } = request.params
    const statement = `delete from questionsTable where questId = '${id}'`
    db.query(statement,(error,data) =>{
        response.send(utils.createResult(error,data))
    })
})

module.exports = router