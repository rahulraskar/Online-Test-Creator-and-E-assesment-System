const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
const config = require('../code/config')
const cors = require('cors')
const app = express()


const adminRouter = require('./Administrator/routes/admin')
const discussionRouter = require('./Administrator/routes/discussion')
const scheduledTestRouter = require('./Administrator/routes/scheduled_test')
const completedTestRouter = require('./Administrator/routes/completed_test')
const groupsRouter = require('./Administrator/routes/groups')
const testAprovalRouter = require('./Administrator/routes/test_approval')
const testRouter = require('./Administrator/routes/update_test')
const createTestRouter = require('./Administrator/routes/create_test')

//add a middleware for getting the id from token
function getAdminId(request, response, next) {

    if (request.url == '/admin/signin' || request.url == '/admin/signup') {
      
    // do not check for token for signin / signup
    // forgot password
        next()
    } else {
  
      try {
        const token = request.headers['token']
        const data = jwt.verify(token, config.secret)
  
        // add a new key named adminId with logged in admin's id
        request.adminId = data['id']
  
        console.log('Admin Id : '+request.adminId)

        // go to the actual route
        next()
        
      } catch (ex) {
        response.status(401)
        response.send({status: 'error', error: 'protected api'})
      }
    }
  }
  
app.use(getAdminId)

app.use(cors('*'))
app.use(bodyParser.json())
app.use(morgan('combined'))
app.use(express.static('images/'))


//Routers
app.use('/admin', adminRouter)
app.use('/scheduleTest',scheduledTestRouter)
app.use('/discussion',discussionRouter)
app.use('/completedTest',completedTestRouter)
app.use('/admin/groups',groupsRouter)
app.use('/test_approval',testAprovalRouter)
app.use('/admin',testRouter)
app.use('/admin/test',createTestRouter)


app.get('/',(request,response) =>{

    console.log(`${request.url}`)
    response.send('This is Admin Server')
})



app.listen(3000,'0.0.0.0',(error) =>{
    if(error){
        console.log(error)
    }else{
        console.log(`Server Listening on Port 3000`)
    }
})
