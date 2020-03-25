var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();
var mysql = require('mysql');
var conn = mysql.createConnection({
	host:'localhost',
	port:'3306',
	user:'root',
	password:'ksj14039797!!',
	database:'o2'
});
conn.connect();
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
	secret: '123erdfert47@#3',
	resave: false,
	saveUninitialized: true,
	store: new MySQLStore({
		host:'localhost',
		port:'3306',
		user:'root',
		password:'ksj14039797!!',
		database:'o2'
	}) 
 }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/count', function(req, res){
	if(req.session.count) {
		req.session.count++;
	} else {
		req.session.count = 1;
	}
	res.send('count : '+req.session.count);
});
app.get('/auth/logout', function(req, res){ 
	req.logout();
	req.session.save(function(){
		res.redirect('/welcome');
	});
});
app.get('/welcome', function(req, res){
	if(req.user && req.user.displayName) {
		res.send(`
			<h1>Hello, ${req.user.displayName}</h1>
			<a href="/auth/logout">logout</a>
		`);
	} else {
		res.send(`
			<h1>welcome</h1>
			<ul>
				<li><a href="/auth/login">Login</a></li>
				<li><a href="/auth/register">Register</a></li>
			</ul>
		`);
	};
});
passport.serializeUser(function(user, done) {
  done(null, user.authId);
});

passport.deserializeUser(function(id, done) {
	var sql = 'SELECT * FROM users WHERE authId=?';
	conn.query(sql, [id], function(err, results){
	console.log(sql, err, results);
		if(err){
			done('There is no user.');
		} else {
			done(null, results[0]);
		}
	});
});
passport.use(new LocalStrategy(
	function(username, password, done){
		var uname = username;
		var pwd = password;
		var sql = 'SELECT * FROM users WHERE authId=?';
		conn.query(sql, ['local:'+uname], function(err, results){
			if(err) {
				return done('There is no user.');
			}
			var user = results[0];
			return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
				if (hash === user.password){
					done(null, user);
				} else {
					done(null, false);
				}
			});
		});
	}
));
passport.use(new FacebookStrategy({
    clientID: '208274913821260',
    clientSecret: '90adf4d8d8d7e2d745618a2452ec6f68',
    callbackURL: "/auth/facebook/callback",
    profileFields:['id','email','gender','link','locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
  },
  function(accessToken, refreshToken, profile, done) {
  		console.log(profile);
  		var authId = 'facebook:'+profile.id;
  		var sql = 'SELECT * FROM users WHERE authId=?';
  		conn.query(sql, [authId], function(err, results){
  			if(results.length>0){
  				done(null, results[0]);
  			} else {
  				var newuser = {
  					'authId' : authId,
  					'displayName' : profile.displayName,
  					'email': profile.emails[0].value
  				};
  				var sql = 'INSERT INTO users SET ?';
  				conn.query(sql,newuser, function(err, results){
  					if(err) {
  						console.log(err);
  						done('ERROR');
  					} else {
  						done(null, newuser);
  					}
  				})
  			}
  		});
  	}
));
app.post(
	'/auth/login',
	passport.authenticate(
		'local',
		{ 
			successRedirect: '/welcome',
			failureRedirect: '/auth/login',
			failureFlash: false
		}
	)
);
app.get(
	'/auth/facebook', 
	passport.authenticate(
		'facebook',
		{ scope: 'email' }
	)
);
app.get(
	'/auth/facebook/callback',
	passport.authenticate(
		'facebook', 
		{
			successRedirect: '/welcome',
			failureRedirect: '/auth/login'
		}
	)
);
var users = [
	{ 
		authId: 'local:egoing', 
		username:'egoing',
		password:'7YIhS/ldYlwau6eOXUrIAfRwxRPA/fPkhvqboK22/xrRHdOoAZtDKWwozfB8P3fsNyy/FTAZc4sUH2QfskmOZeE/ko4s/cB0MvaVyakzEueYl85wBsvoUZA/TGsPm34J2r76QKwuEfIc5rXFFMI1Lf4SS7Mbn/sXQXNzBab+Pts=',
		salt:'fv+x+TBRkM2bSeLAySpWbP2wuQ3ObUsQqCepxyqWCkSdkxEJeS+UI1HItd78MU03+4TGncO6vxqP976/baKeYA==',
		displayName:'Egoing'
	}
];
app.post('/auth/register', function(req, res){
	hasher({password:req.body.password}, function(err, pass, salt, hash){
		var user = {
			authId:'local:'+req.body.username,
			username:req.body.username,
			password:hash,
			salt:salt,
			displayName:req.body.displayName
		};
		var sql = 'INSERT INTO users SET ?';
		conn.query(sql, user, function(err, results){
			if(err){
				console.log(err);
				res.status(500);
			} else {
				req.login(user, function(err){
					req.session.save(function(){
						res.redirect('/welcome');
					});
				});
			}
		});
	}) 
});
app.get('/auth/register', function(req, res){
	var output = `
	<h1>Register</h1>
	<form action="/auth/register" method="post">
		<p>
			<input type="text" name="username" placeholder="username">
		</p>
		<p>
			<input type="password" name="password" placeholder="password">
		</p>
		<p>
			<input type="text" name="displayName" placeholder="displayName">
		</p>
		<p>
			<input type="submit">
		</P>
	</form>

	`;
	res.send(output);
})
app.get('/auth/login', function(req, res){
	var output = `
	<h1>Login</h1>
	<form action="/auth/login" method="post">
		<p>
			<input type="text" name="username" placeholder="username">
		</p>
		<p>
			<input type="password" name="password" placeholder="password">
		</p>
		<p>
			<input type="submit">
		</P>
	</form>
	<a href="/auth/facebook">facebook</a>
	`;
	res.send(output);
});
app.listen(3003, function(){
	console.log('Connected 3003 PORT!!!');
});