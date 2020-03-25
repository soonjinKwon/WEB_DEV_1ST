var express = require('express');
var bodyParser = require('body-parser');

var multer = require('multer');
var _storage = multer.diskStorage({
	destination: function(req, file, cb){ 
		cb(null, 'uploads/')
	},
	filename: function(req, file, cb){
		cb(null, file.originalname)
	}
})
var upload = multer({storage: _storage});

var fs = require('fs');
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.locals.pretty = true;
app.use('/user', express.static('uploads')); 

app.set('views', './views_file');
app.set('view engine', 'pug');

app.get('/upload', function(req, res){
	res.render('upload');
});
app.post('/upload', upload.single('userfile'), function(req, res){
	res.send('Uploaded:'+req.file.filename);
});
 
app.get('/topic/new', function(req, res){
	fs.readdir('data', function(err, files){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		};
		res .render('new',{topics:files});
	});	
});	

app.get(['/topic', '/topic/:id'], function(req, res){
	fs.readdir('data', function(err, files){
		if(err){
			console.log(err); 
			res.status(500).send('Internal Server Error');
		};	
		var id= req.params.id;
		if(id){
			// id 값이 있을떄
			fs.readFile('data/'+id,'utf-8', function(err, data){
				if(err){
					console.log(err);
					res.status(500).send('Internal Server Error');
				};
				res.render('view', {topics:files, title:id, description:data});
			})
		} else { 
			// id 값이 없을떄
			res.render('view', {topics:files, title:'Welcome', description:'Hello JavaScript for server'});
		}
	});
});

app.post('/topic', function(req, res){
	var title = req.body.title;
	var description = req.body.description;
	fs.writeFile('data/'+title, description, function(err){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}
		res.redirect('/topic/'+title); 
	}); 
});
app.listen(3003, function(){
	console.log('Connected , 3004 Port!!')
})