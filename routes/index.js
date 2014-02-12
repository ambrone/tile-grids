exports.index =function(db){
    return function(req, res){
	var collection = db.get('usercollection');
	collection.find({},{},function(e,docs){
	    if(typeof createdUser != undefined){
		res.render('index', {'saves': docs});
	    }
	    else{
		res.render('index', {'saves':docs, 'createdUser':createdUser});
	    }
	});
    };
}

exports.login =function(db){
    return function(req, res){
	var collection = db.get('usercollection');
	collection.find({},{},function(e,docs){
	    if(typeof createdUser != undefined){
		res.render('index', {'saves': docs});
	    }
	    else{
		res.render('index', {'saves':docs, 'createdUser':createdUser});
	    }
	});
    };
}


exports.saves = function(db){
//    console.log(db.get('usercollection'));
    console.log('saves');
}

