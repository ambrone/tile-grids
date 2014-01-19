var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/hello');

var app = express();

app.set('views' , 'views');
app.set('view engine' , 'jade');

app.use(express.bodyParser());
app.use(app.router);
app.use(express.static('./remote_tiles'));

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


app.get('/' , routes.index(db));



app.post('/saves' , function(req,res){
    console.log('post to /saves');
   
    console.log(req.body.name);
    var obj = db.get('usercollection').find({'name':req.body.name},{}, function(e,docs){
	res.json(docs);
    });

});

app.post('/save', function(req, res){
    console.log('post to /save');

    db.get('usercollection').insert(req.body);
    res.send('success');

});


app.post('/getlast', function(req,res){
    console.log('get to /getlast');
    console.log(req.body.name);
    
    db.get('usercollection').find({'name':req.body.name},{},function(e,docs){
	res.json(docs);
    });
    
});

app.post('/update', function(req,res){
    console.log('post to /update');
    console.log(req.body.name);

    db.get('usercollection').update({'name':req.body.name},req.body,function(e,docs){
	console.log('docs: '+docs);
	res.json(docs);

    });
});

app.get('/test' , function(req,res){
    console.log('get to /test');
    db.get('usercollection').find({},'img', function(e,docs){
	res.json(docs);
    });

});

app.post('/delete' , function(req, res){
    console.log('post to /delete');
    console.log(req.body);
    db.get('usercollection').remove({'name':req.body.name}, function(e,docs){
	res.json(docs);
    });
});

app.post('/saveimg',function(req,res){
    console.log('post to /saveimg');
//    console.log(req.body.img);
    db.get('usercollection').update({'name':req.body.name},{$set:{'img':req.body.img}},function(e,docs){
	//console.log(res.json.docs);
	res.send('successfully updated' + req.body.name);
    });
});


app.listen(3000);
console.log('listening on 3 thousand');
