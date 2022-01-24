const express = require('express')
const res = require('express/lib/response')
const app = express()
const port = 3000
const fs = require('fs')
const template = require('./lib/template.js')
const path = require('path')
const sanitizeHtml = require('sanitize-html')
const qs = require('querystring')
var bodyParser = require('body-parser')
var compression =require('compression')
const req = require('express/lib/request')


app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(compression())
app.get('*',function(request, response, next) {
  fs.readdir('./data', function(error, filelist){
    request.list = filelist
    next()
  })
})


app.get('/', function(request, response) { 


    var title = 'Welcome'
    var description = 'Hello, Node.js'
    var list = template.list(request.list)
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}
      <img src="/img/hello.jpg" style="width: 500px; display:block;">
      `,
      `<a href="/topic/create">create</a>`
    ) 
    response.send(html)
  })

app.get('/topic/create', function(request, response){

    var title = 'WEB - create'
    var list = template.list(request.list)
    var html = template.HTML(title, list, `
      <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '')
    response.send(html)
  })
  app.post('/topic/create_process', function(request, response) {
        var post = request.body;
        console.log(post)
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
          response.redirect(`/topic/${title}`)
        });
  
  })
  
  app.get('/topic/update/:pageId', function(request, response) {
 
    var filteredId = path.parse(request.params.pageId).base
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.pageId
      var list = template.list(request.list)
      var html = template.HTML(title, list,
        `
        <form action="/topic/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/topic/create">create</a> <a href="/topic/update?id=${title}">update</a>`
      )
      response.send(html)
    })
  })


app.post('/topic/update_process', function(request, response) {
          var post = request.body
          var id = post.id
          var title = post.title
          var description = post.description
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.redirect(`/topic/${title}`)
            })
          })
      })

app.post('/topic/delete_process', function(request, response) {
  var post = request.body
  var id = post.id
  var filteredId = path.parse(id).base
  fs.unlink(`data/${filteredId}`, function(error){
    response.redirect('/')
  })
  })
  app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!');
  });
  
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


app.get('/topic/:pageId',function(request, response, next) {
    var filteredId = path.parse(request.params.pageId).base
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      if(err){
        next(err)
      } else {
        var title = request.params.pageId
        var sanitizedTitle = sanitizeHtml(title)
        var sanitizedDescription = sanitizeHtml(description, {
          allowedTags:['h1']
        })
        var list = template.list(request.list)
        var html = template.HTML(sanitizedTitle, list,
          `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
          ` <a href="/topic/create">create</a>
            <a href="/topic/update/${sanitizedTitle}">update</a>
            <form action="/topic/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
        )
        response.send(html)
        
      }
    })
  })






//})




