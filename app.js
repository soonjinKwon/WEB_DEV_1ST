var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.locals.pretty = true;
app.set('view engine','pug');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.get('/template', function(req, res){
  res.render('temp', {time:Date(), title:'pug'});
});
app.get('/form', function(req,res){
  res.render('form');s
}); 
app.get('/form_receiver',function(req, res){
  var title = req.query.title;
  var description = req.query.description;
  res.send(title+''+description);
}); 
app.post('/form_receiver',function(req, res){
  var title = req.body.title;
  var description = req.body.description;
  res.send(title+''+description);
});
app.get('/topic', function(req,res){
  var topics = [
    'Javascript is ....',
    'Nodjs is .....',
    'Express is .....'
  ];  
  var output = `
  <a href="/topic?id=0">Javascript</a><br>
  <a href="/topic?id=1">Nodejs</a><br>
  <a href="/topic?id=2">Express</a><br>
  ${topics[req.query.id]}
  `
  res.send(output);
})

app.get('/', function(req, res){
    res.send('Hello home page');
});
app.get('/dynamic', function(req, res){
  var lis = '';
  for(var i=0; i<5; i++){
    lis = lis + '<li>coding</li>';
  };
  var time = Date();
  var output = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title></title>
    </head>
    <body>
        Hello, Dynamic!
        <ul>
          ${lis}
        </ul>
        ${time}
    </body>
  </html>`;
  res.send(output);
});
app.get('/route', function(req, res){
    res.send('Hello Router, <img src="/route.png">');
});
app.get('/login', function(req, res){
    res.send('<h1>Login please</h1>');
});
app.listen(3005, function(){
    console.log('Conneted 3005 port!');
});