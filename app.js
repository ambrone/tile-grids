var express = require('express');

var http = require('http');
var https = require('https');
var path = require('path');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var fs = require('fs');
var MongoStore = require('connect-mongo')(express);
mongoose.connect('localhost:27017/hello');
var routes = require('./routes');

//hat
var db = mongoose.connection;
var jade = require('jade');
var bcrypt = require('bcrypt');
var gm = require('gm').subClass({ imageMagick: true });
module.exports = mongoose.connections[0];

var app = express();

app.set('views' , 'views');
app.set('view engine' , 'jade');

app.use(express.bodyParser({limit:'50mb'}));

app.use(express.cookieParser('amber'));
app.use(express.session({
    store: new MongoStore({
	secret:'amber',
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

app.get('/' , routes.index(userModel));

app.post('/login' , routes.login(userModel,bcrypt));

app.post('/addUser' , routes.addUser(userModel,bcrypt));

app.post('/save', routes.save(userModel,bcrypt));


app.post('/saveimg',function(req,res){
    console.log('post to /saveimg '+ req.body.user + req.body.name);
    var file = req.body.img.replace(/^data:image\/png;base64,/,"");
    var name = './remote_tiles/images/'+req.body.user+'_'+req.body.name;
    console.log('name '+'.png'+ req.body.name);
    fs.writeFile(name+'.png', file,'base64', function (err) {
	console.log('write error: ' + err);
	//if image is smaller than 100x100, make thumbnail same as image, otherwise crop for thumb
	gm(name+'.png').size(function(err,val){
	    if(val.height <= 100 || val.width<=100){
		name = name.slice(15);
		gm(name+'.png').write(name+'_th.png',function(err){
		    name = name.slice(15);
		    res.send(name + '_th.png');
		});
	    }else{
		gm(name+'.png').crop(100,100,0,0).write(name+'_th.png',function(err){
		    console.log(err)
		    name = name.slice(15);
		    res.send(name+'_th.png');
		});
	    }
	})
    })
})

app.post('/recallGrid' , routes.recallGrid(userModel));

app.post('/update',routes.update(userModel));

app.post('/delete' , routes.delete(fs,userModel));

app.post('/logout', routes.logout());

var options = {
    key:fs.readFileSync('./tiles.key'),
    cert:fs.readFileSync('./tiles.crt')
}
//app.listen(3000);
https.createServer(options, app).listen(443);
console.log('listening on 3 thousand');
