var express = require('express');

var http = require('http');
var path = require('path');
var mongo = require('mongodb');
var mongoose = require('mongoose');
//var monk = require('monk');
//var db = monk('localhost:27017/hello');
var fs = require('fs');
var MongoStore = require('connect-mongo')(express);
mongoose.connect('localhost:27017/hello');
var routes = require('./routes');

var db = mongoose.connection;
var jade = require('jade');

module.exports = mongoose.connections[0];

var app = express();

app.set('views' , 'views');
app.set('view engine' , 'jade');

app.use(express.bodyParser({limit:'50mb'}));



app.use(express.cookieParser('amber'));
app.use(express.session({
    store: new MongoStore({
	secret:'amber',
	//mongoose_connection:db,
	db: mongoose.connection.db
    })
}));

app.use(app.router);
app.use(express.static('./remote_tiles'));
/*
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
*/

var userSchema = mongoose.Schema(
    {user:String , pass:String, session:Object, grids:Array , gridNames:Array}
);
var userModel =  mongoose.model('users' , userSchema);


app.get('/' , function(req,res){
    console.log('/');
    res.render('index');
});


app.post('/login' , routes.login(db,userModel));

app.post('/addUser' , routes.addUser(userModel));

app.post('/save', routes.save(db,userModel));


app.post('/saveimg',function(req,res){
    console.log('post to /saveimg');
    var file = req.body.img.replace(/^data:image\/png;base64,/,"");
    var name = './remote_tiles/images/'+req.body.user+'_'+req.body.name + '.png';
    console.log('name '+ req.body.name);
    fs.writeFile(name, file,'base64', function (err) {
	console.log('error: ' + err);
    });
});


   // console.log('post to /save');
   // db.get('usercollection').insert(req.body);
   // res.send('successful insertion of '+req.name);

////////////////////////////////////////////////////////////////////////////////////////////
/*
app.post('/saves' , function(req,res){
    console.log('post to /saves');
    console.log(req.body.name);
    var obj = db.get('usercollection').find({'name':req.body.name},{}, function(e,docs){
	res.json(docs);
    });
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
    var imageFile = './remote_tiles/images/'+req.body.name+'.png';
    fs.unlink(imageFile);
});


    
});
*/

app.listen(3000);
console.log('listening on 3 thousand');
