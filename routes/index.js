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
		var newUser = new userModel({'user':req.body.user , 'pass':req.body.pass , 'grids':[]});
		newUser.save(function(err){console.log('saved' + newUser.user)});
		res.send(newUser);
	    }else{
		req.session.user = req.body.user;
		res.send(docs.grids);
	    }
	});
    }
}


exports.save = function(db,userModel){
    return function(req,res){
	console.log(req.body);
	var s = userModel.findOne({'user':req.body.user} , function(err,docs){
	    var arr = docs.grids;
	    arr.push( req.body);
	    docs.grids = arr;
	    docs.save(function(){});
	});
    }
}
