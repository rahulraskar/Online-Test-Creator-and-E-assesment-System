const express = require('express')
const utils = require('../../utils')
const db = require('../../db')
const multer = require('multer')
const upload = multer({ dest: 'images/' })
const router = express.Router()

// ----------------------------------------------------
// GET
// ----------------------------------------------------

//Get questions
router.get('/test_questions/:test_id',(request,response) =>{
        
  const { test_id } = request.params

  const questions = `select q.questId,q.question,q.option_A,q.option_B,q.option_C,q.option_D,q.correct_Ans,q.tag,q.image,q.marks 
  from test t inner join questionsTable q on q.testId = '${test_id}'`

  db.query(questions,(error,questionData) =>{
      const resultSet = { 'Questions':questionData }
      response.send(utils.createResult(error,resultSet))
  })
})

//Get groups
router.get('/groups',(request,response) =>{
        
  const questions = `select groupName from quizGroup`

  db.query(questions,(error, groupData) =>{
      response.send(utils.createResult(error,groupData))
  })
})

// ----------------------------------------------------
// POST
// ----------------------------------------------------

// Create test (Admin-side)
router.post('/create-test', (request, response) => {
  const { testName, testDate, testTime, duration, testType, totalMarks, passingMarks, groupId } = request.body

  const statement = `insert into test (testName, testDate, testTime, duration, testType, totalMarks, passingMarks, groupId) values
  ('${testName}', '${testDate}', '${testTime}', '${duration}', '${testType}', '${totalMarks}', '${passingMarks}', '${groupId}')
`

  db.query(statement, (error, data) => {
    response.send(utils.createResult(error, data))
  })
})

//Add question
router.post('/add-question', upload.single('que_image'), (request, response) => {
  const { question, option_A, option_B, option_C, option_D, correct_Ans, tag, marks, testId } = request.body
  const fileName = request.file.filename

  const statement = `insert into questionsTable (question, option_A, option_B, option_C, option_D, correct_Ans, tag, image, marks, testId) values
  ('${question}', '${option_A}', '${option_B}', '${option_C}', '${option_D}', '${correct_Ans}', '${tag}','${fileName}', '${marks}', '${testId}')
`

  db.query(statement, (error, data) => {
    response.send(utils.createResult(error, data))
  })
})

//To update test images
router.post('/upload-image/:questId', upload.single('quest_image'), (request, response) => {
    
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

// ----------------------------------------------------
// PUT
// ----------------------------------------------------

// For updating specific question
router.put('/edit_question/:id', (request, response) => {

  const { question ,option_A ,option_B,option_C,option_D,correct_Ans, tag, marks } = request.body
  const { id } = request.params
  const statement = `update questionsTable set question = '${question}' ,option_A  = '${option_A}',option_B = '${option_B}'
                     ,option_C = '${option_C}',option_D = '${option_D}',correct_Ans = '${correct_Ans}',tag = '${tag}', marks = '${marks}' 
                     where questId = '${id}'`

  db.query(statement,(error,data) =>{
      response.send(utils.createResult(error,data));
  })
  
})
// ----------------------------------------------------
// DELETE
// ----------------------------------------------------

//To delete particular question from test
router.delete('/delete_question/:id', (request, response) => {

  const { id } = request.params
  const statement = `delete from questionsTable where questId = '${id}'`
  db.query(statement,(error,data) =>{
      response.send(utils.createResult(error,data))
  })
})

module.exports = router
