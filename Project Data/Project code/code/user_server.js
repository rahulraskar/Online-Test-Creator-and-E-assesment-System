const express = require('express')
const { request } = require('https')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const config = require('../code/config')

const completedTestRouter = require('./User/routes/completed_test')
const userRouter = require('./User/routes/user')
const scheduledTestRouter = require('./User/routes/scheduled_test')
const discussionRouter = require('./User/routes/discussion')
const userHostedTest = require('./User/routes/hosted_test')
// const groupsRouter = require('./Administrator/routes/groups')
const createTestRouter = require('./User/routes/create_test')

app.use(cors('*'))
app.use(bodyParser.json())
app.use(express.static('images/'))

app.use('/user',userRouter)
// app.use('/admin',groupsRouter)
app.use('/completedTest',completedTestRouter)
app.use('/user/scheduleTest',scheduledTestRouter)
app.use('/discussion',discussionRouter)
app.use('/user/hostedTest',userHostedTest)
app.use('/user/createTest',createTestRouter)

//add a middleware for getting the id from token

function getUserId(request, response, next) {

    if (request.url == '/user/signin' 
        || request.url == '/user/signup') {
      
    // do not check for token for signin / signup
    
    next()
    } else {
  
      try {
        const token = request.headers['token']
        console.log(token)
        const data = jwt.verify(token, config.secret)

  
        // add a new key named userId with logged in user's id
        request.userId = data['id']
        console.log('User Id : '+request.userId)
        // go to the actual route
        next()
        
      } catch (ex) {
        response.status(401)
        response.send({status: 'error', error: 'protected api'})
      }
    }
  }
  
  app.use(getUserId)


app.get('/',(request,response) =>{

    console.log(`${request.url}`)
    response.send('This is User Server')
})

app.listen(4000,'0.0.0.0',(error) =>{
    if(error){
        console.log(error)
    }else{
        console.log(`Server Listening on Port 4000`)
    }
})



