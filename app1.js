var express = require('express');
var app = express();
app.locals.pretty = true;
app.set('view engine','pug');
app.set('views','./views');
app.use(express.static('public'));
app.get('/template', function(req, res){
  res.render('temp', {time:Date(), _title:'pug'});
});
app.get('/', function(req, res){
    res.send('Hello home page');
});

app.listen(3003, function(){
	console.log('Connected 3003 PORT!!!');
});
	