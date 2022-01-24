const express = require('express')
const router = express.Router()
const app = express()
const template = require('../lib/template.js')

app.get('/', function(request, response) { 
    let title = 'Welcome'
    let description = 'Hello, Node.js'
    let list = template.list(request.list)
    let html = template.HTML(title, list,
      `
      <h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px display:block margin-top:10px">
      `,
      `<a href="/topic/create">create</a>`
    ) 
    response.send(html)
  })
  module.exports = router