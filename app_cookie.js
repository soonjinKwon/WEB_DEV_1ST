var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());

var products = {
	1:{title:'The History of Web 1'},
	2:{title:' THe next Web'}
};
app.get('/products', function(req, res){
	var output ="";
	for(var name in products){
		output +=`
			<li>
				<a href="/cart/${name}">${products[name].title}</a>
			</li>`
	}
	res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`);
});
/* cart ={
	1:1,
	2:1,
	3:0
}
*/

app.get('/cart/:id', function(req, res){
	var id = req.params.id;
	if(req.cookies.cart) {
		var cart = req.cookies.cart;
	} else {
		var cart ={};
	}
	if(!cart[id]) {
		cart[id] = 0;
	}
	cart[id] = parseInt(cart[id])+1;
	res.cookie('cart', cart);
	res.redirect('/cart');
});





app.get('/count', function(req, res){
	if ( req.cookies.count){
		var count = parseInt(req.cookies.count);
	} else {
		var count = 0;
	}
	count = count+1;
	res.cookie('count', count);
	res.send('count :'+ count);
});

app.listen(3007, function(){
	console.log('Connected 3007 PORT!!!');
});   