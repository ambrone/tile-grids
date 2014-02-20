exports.index =function(db, userModel){
    return function(req, res){
	res.render('index', {});
    };
}


/*	if(req.session.user != undefined){
	    userModel.findOne({user:req.session.user},function(err,thing){
		if(err)console.log(err);
		//res.render('loggedin', {'user':req.session.user, 'grids' : thing.grids});
		res.json(thing.grids);
	    });
	   
	}*/

exports.login = function(db,userModel){
    return function(req,res){
	userModel.findOne({'user':req.body.user},function(err,docs){
	    if(docs == null){
		res.send('invalid login');
	    }else if(req.body.pass == docs.pass){
		
		console.log(req.body.pass);
		console.log(docs.pass);
		req.session.user = req.body.user;
		res.send('login');
		//res.send(docs.grids); this one works but is slow and send all the grids at once, want to just send names then load each as theyre clicked
	    }else{
		res.send('invalid login');
	    }
	});
    }
}

exports.addUser = function(userModel){
    return function(req,res){
	userModel.findOne({'user':req.body.user},function(err,docs){
	    if(docs != null){
		res.send('username taken');
	    }else{
		console.log('req.body.pass'+req.body.pass);
		var newUser = new userModel(
		    {'user':req.body.user ,
		     'pass':req.body.pass ,
		     'grids':[]
		    });
		newUser.save(function(err){console.log('saved ' + newUser.user)});
		res.send(newUser);
		console.log(newUser);
	    }
	});
    }
}


exports.save = function(db,userModel){
    return function(req,res){

	var s = userModel.findOne({'user':req.body.user} , function(err,docs){
	    var arr = docs.grids;
	    arr.push( req.body);
	    docs.grids = arr;
	    docs.save(function(){});
	    res.send('saved grid');
	});
    }
}
