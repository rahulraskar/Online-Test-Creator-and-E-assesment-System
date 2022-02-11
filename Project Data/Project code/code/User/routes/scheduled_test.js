const express = require('express')
const utils = require('../../utils')
const db = require('../../db')
const config = require('../../config')
const fs = require('fs')
const { request, response } = require('express')

const router = express.Router()

// get only specific type of test details

router.get('/:testType', (request, response) => {
  const { testType } = request.params

  const statement = `SELECT testId,testName,groupName,
    testDate,testTime,duration,testType
    from test t INNER JOIN quizGroup q
    ON t.groupId = q.id
    where t.testType = "${testType}" AND t.testStatus = "SCHEDULED"`

  db.query(statement, (error, data) => {

    if (error) {
      response.send(utils.createError)
    } else {

      for (let index = 0; index < data.length; index++) {

        const test = data[index]

        const startTest = `http://localhost:3000/scheduleTest/startTest/${test["testId"]}`
        test.startTestLink = startTest

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

        const startTest = `http://localhost:3000/user/scheduleTest/startTest/${test["testId"]}`
        test.startTestLink = startTest

      }
      response.send(utils.createSuccess(data))
    }

  })
})

// fetch test details at start test UI

router.get('/startTest/:testId', (request, response) => {
  const { testId } = request.params

  const statement = `select testTime,duration from 
    test where testId = ${testId}`

  db.query(statement, (error, data) => {

    if (error) {
      response.send(utils.createError)
    } else {

      const test = data[0]

      const startTest = `http://localhost:3000/user/scheduleTest/loadQuestions/${testId}`
      test.startTestLink = startTest

      response.send(utils.createSuccess(data))
    }
  })
})


// fetch all questions after starting the test

router.get('/loadQuestions/:testId', (request, response) => {
  const { testId } = request.params

  const statement = `select q.question ,q.option_A,q.option_B,
    q.option_C,q.option_D,q.marks from 
    test t INNER JOIN questionsTable q
    ON t.testId = q.testId
    where t.testId = ${testId}`


  db.query(statement, (error, data) => {
    if (error) {
      response.send(utils.createError(error))
    } else {

      const questions = []

      // iterate over the collection and modify the structure
      for (let index = 0; index < data.length; index++) {

        const quest = data[index];
        const question = {
          question: quest['question'],
          optionA: quest['option_A'],
          optionB: quest['option_B'],
          optionC: quest['option_C'],
          optionD: quest['option_D'],
          questionMarks: quest['marks'],
          image: quest['image']
        }
        questions.push(question)

      }
      response.send(utils.createSuccess(questions))
    }
  })
})

// get question image

router.get('/image/:filename', (request, response) => {
  const { filename } = request.params

  const file = fs.readFileSync(__dirname + '/../../images/' + filename)
  response.send(file)

})

// Submit Test
router.post('/submitTest/:testId/:userId', (request, response) => {
  const { testId, userId } = request.params
  const data = request.body
  const values = []
  for (let i = 0; i < data.length; i++) {
    values.push([testId, data[i].questId, data[i].resp, userId])
  }

  // Bulk insertion of user responses into userResponse table
  const statement = `insert into userResponse (testId,questionId,response,userId)
                     values ?`

  db.query(statement, [values], (error, success) => {
    if (error) {
      response.send(utils.createError(error))
    } else {

      // correct answers

      const correctAnswer = `select * FROM userResponse u INNER JOIN questionsTable q
      ON u.questionId = q.questId WHERE u.response = q.correct_Ans AND 
      u.userId = '${userId}' AND u.testId = '${testId}'`

      const correctQId = []
      db.query(correctAnswer, (error, correct_ans) => {

        if (error) {
          response.send(utils.createError(error))
        } else {
          //console.log(correct_ans)
          for (let i = 0; i < correct_ans.length; i++) {
            // console.log(correct_ans[i].testId,correct_ans[i].questionId)
            correctQId.push([correct_ans[i].testId, correct_ans[i].questionId, correct_ans[i].marks])
          }

          let totalMarksObtained = 0;

          for (let i = 0; i < correctQId.length; i++) {
            // console.log("Marks :"+correctQId[i][2])
            //console.log(correctQId[i])
            totalMarksObtained = totalMarksObtained + correctQId[i][2]
          }
          // total questions

          const totalQuestions = `select noOfQuestions FROM test
        where testId = '${testId}'`

          db.query(totalQuestions, (error, total_qs) => {

            if (error) {
              response.send(utils.createError(error))
            } else {

              const total_q = total_qs[0]

              console.log("Total Questions :" + total_q['noOfQuestions'])

              console.log("correct ans :" + correct_ans.length)

              // attempted questions 
              console.log("Total Attempted Questions :" + values.length)

              // wrong answers--> Attempted - Correct
              console.log("Total Wrong Questions :" + parseInt(values.length - correct_ans.length))

              // unanswered questions --> total question - attempted question
              console.log("Total Unanswered :" + parseInt(total_q['noOfQuestions'] - values.length))

              // Total Marks
              console.log("Total Marks :" + parseInt(totalMarksObtained))

              const marksOfTest = `select totalMarks,passingMarks from test where testId = '${testId}'`

              db.query(marksOfTest, (error, totalTestMarks) => {

                if (error) {
                  response.send(utils.createError(error))
                } else {
                  let resultStatus = ''
                  // calculate percentage

                  let percentage = 0, res = 0;
                  console.log("total test Marks :" + totalTestMarks[0]['totalMarks'])
                  res = parseFloat(totalMarksObtained / totalTestMarks[0]['totalMarks'])
                  percentage = res * 100

                  console.log("Percentage :" + parseFloat(percentage))

                  // set PASS/FAIL status

                  if (totalMarksObtained < totalTestMarks[0]['passingMarks'])
                    resultStatus = 'FAIL'
                  else
                    resultStatus = 'PASS'

                  // insertion of users result data into userResult table
                  const userResult = `insert into userResult
              (testId,isPresent,attemptedQuestions,correctAnswer,result,percentage,marks,userId)
              values('${testId}',1,'${values.length}','${correct_ans.length}','${resultStatus}','${percentage}','${totalMarksObtained}','${userId}')`

                  db.query(userResult, (error, success) => {
                    if (error) {
                      response.send(utils.createError(error))
                    } else {
                      response.send(utils.createSuccess("Test Submited Successfully..."))

                    }
                  })
                }

              })
            }
          })
        }
      })
    }
  })

})




module.exports = router