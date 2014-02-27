exports.index =function(){
    console.log('poop');
    return function(req, res){
	console.log('req.session.user '+ req.session.user);
	if(req.session.user){
	    res.render('index', {user:req.session.user});
	}else{
	    res.render('index',{});
	}
    };
}


exports.login = function(userModel,bcrypt){
    return function(req,res){
	userModel.findOne({'user':req.body.user},function(err,docs){
	    if(docs == null){
		res.send('invalid login');
	    }else{
		bcrypt.compare(req.body.pass, docs.pass, function(err, response) {
		    if(response == true){
			console.log('response == true');
			console.log(req.body.pass +'  passes  '+docs.pass);
			console.log('req.body.remember '+req.body.remember);
			if(req.body.remember == 'true'){
			    req.session.user = req.body.user;
			    console.log('req.session.user set by exports.login');
			}
			//send list of names of user's grids
			res.send(docs.gridNames);
			//res.send(docs.grids); this one works but is slow and send all the grids at once
		    }else if(response == false){
			res.send('invalid login');
		    }
		});
	    }
	});
    }
}

exports.addUser = function(userModel,bcrypt){
    return function(req,res){
	console.log('43'+req.body.remember);
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(req.body.pass, salt, function(err, hash) {
		// Store hash in your password B.
		userModel.findOne({'user':req.body.user},function(err,docs){
		    if(docs != null){
			res.send('username taken');
		    }else{
			console.log('req.body.pass'+req.body.pass +' '+hash);
			var newUser = new userModel({
			    'user':req.body.user ,
			    'pass':hash,
			    'grids':[],
			    'gridNames':[]
			});
			console.log('req.body.remember '+req.body.remember);
			if(req.body.remember = 'true'){
			    req.session.user = req.body.user;
			    console.log(60+req.body.remember);
			}
			newUser.save(function(err){console.log('saved ' + newUser.user)});
			res.send(newUser);
//			console.log(newUser);
			console.log(req.session.user);
		    }
		});
	    });
	});
	
    }
}


exports.save = function(userModel , bcrypt){
    return function(req,res){
	var s = userModel.findOne({'user':req.body.user} , function(err,docs){
	    var arr = docs.grids;
	    arr.push( req.body);
	    docs.grids = arr;
	    var names = docs.gridNames;
	    names.push(req.body.name);
	    docs.gridNames = names;
	    docs.save(function(){});
	    res.send('saved grid');
	});
    }
}

exports.recallGrid = function(userModel){
    return function(req,res){
	console.log('post to /recallGrid');
	var g = userModel.findOne({'user':req.body.user},function(err,docs){
	    //var grids = docs.grids;
	    docs.grids.forEach(function(grid,index){
		if(grid.name == req.body.name && grid.user == req.body.user){
		    res.send(grid);
		    return;
		}
	    });

	});
    }
}

exports.update = function(userModel){
    return function(req,res){
	console.log('post to /update');
	var g = userModel.findOne({'user':req.body.user},function(err,docs){
	    var match;
	    docs.grids.forEach(function(grid,index){
		if(grid.name == req.body.name){
		    match = index;
		}
	    })
	    docs.grids.splice(match,1,req.body);
	    docs.save(function(){});
	    res.send(docs.grids[match]);
	});
    }
}

exports.delete = function(fs,userModel){
    return function(req,res){
	console.log('post to /delete');
	var g = userModel.findOne({'user':req.body.user},function(err,docs){
	    var match;
	    docs.grids.forEach(function(grid,index){
		if(grid.name == req.body.name){
		    console.log('found '+grid.name+' for user ' + req.body.user);
		    match = index;
		    return;
		}
	    });
	    docs.grids.splice(match,1);
	    docs.gridNames.splice(docs.gridNames.indexOf(req.body.name),1);
	    docs.save(function(){});
	    var imageFile = './remote_tiles/images/'+req.body.user +'_'+req.body.name+'.png';
	    fs.unlink(imageFile);
	    res.send(req.body.name +' deleted');

	})
    }
}

exports.logout = function(){
    return function(req,res){
	console.log('logging out ' + req.session.user);
	req.session.destroy(function(){
	    res.clearCookie('connect.sid',{path:'/'});
	})
    }
}

var s = 'ryan';
function removeLetters(letter,str){
    if(str[0] == letter){
	return removeLetters(letter,str.slice(1));
    }else{
	return str[0] + removeLetters(letter,str.slice(1));
    }    
}
