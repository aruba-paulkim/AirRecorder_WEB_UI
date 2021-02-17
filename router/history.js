var express = require('express');
var app = express.Router();
var fs = require('fs'); 
var crypto = require('crypto'); 
var debug = false;


app.get('/history', function(req, res){
	if(debug) console.log(req.session.user_id+" | GET /history");
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var part='', keyword='', history='';
		fs.readdir(__dirname+'/../history/', "utf8", function(err, history){
		    if (err) {
		       res.status(500);
		       throw err;
		    }

			res.render('history', {
				sess:req.session,
				part:part,
				keyword:keyword,
				history:history.reverse(),
				crypto:crypto
			});	
		});
	}
});
	
	
app.post('/history', function(req, res){
	if(debug) console.log(req.session.user_id+" | POST /history");
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var part='', keyword='', history='';
		if(req.body.part && req.body.keyword ) {
			part = req.body.part;
			keyword = req.body.keyword;
		}
		fs.readdir(__dirname+'/../history/', "utf8", function(err, history){
		    if (err) {
		       res.status(500);
		       throw err;
		    }
			
			res.render('history', {
				sess:req.session,
				part:part,
				keyword:keyword,
				history:history.reverse()
			});	
		});
	}
});


app.get('/history/:str_hash', function(req, res){
	if(debug) console.log(req.session.user_id+" | GET /history/"+req.params.str_hash);
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var execute_datetime='', ip_address='', command_name='', log='';
		fs.readdir(__dirname+'/../history/', "utf8", function(err, history){
		    if (err) {
		       res.status(500);
		       throw err;
		    }
			
		    var cnt = 0;
		    for ( var i = 0 ; i < history.length ; i++) {
		    	var tmp = history[i].split('@');
		    	execute_datetime = tmp[0];
		    	ip_address = tmp[1];
		    	command_name = tmp[2];
				var hash = crypto.createHash('sha256');
				hash.update(history[i]);
				str_hash = hash.digest('hex');
				if(req.params.str_hash == str_hash) {
					//read file
					var log = fs.readFileSync(__dirname+'/../history/'+history[i], 'utf8');
					res.render('history_form', {
						sess:req.session,
						execute_datetime:execute_datetime,
						ip_address:ip_address,
						command_name:command_name,
						log:log
					});	
				} else {
					cnt++;
				}
		    }
		    if(cnt == history.length) {
		    	res.end('<!DOCTYPE html><head><title></title><meta http-equiv="content-type" content="text/html;charset=UTF-8"><script>alert("no data"); window.location = "/history/";</script></head></html>');
		    }
		});
	}
});	


app.get('/history/:seq/delete', function(req, res){
	if(debug) console.log(req.session.user_id+" | GET /history/"+req.params.seq+"/delete");
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var params =[req.params.seq];
		fs.readdir(__dirname+'/../history/', "utf8", function(err, history){
		    if (err) {
		       res.status(500);
		       throw err;
		    }

		    var cnt = 0;
		    for ( var i = 0 ; i < history.length ; i++) {
		    	var tmp = history[i].split('@');
		    	execute_datetime = tmp[0];
		    	ip_address = tmp[1];
		    	command_name = tmp[2];
				var hash = crypto.createHash('sha256');
				hash.update(history[i]);
				str_hash = hash.digest('hex');
				if(req.params.seq == str_hash) {
					//delete file
					var log = fs.unlinkSync(__dirname+'/../history/'+history[i], 'utf8');
					res.redirect('/history');
				} else {
					cnt++;
				}
		    }
		    if(cnt == history.length) {
		    	res.end('<!DOCTYPE html><head><title></title><meta http-equiv="content-type" content="text/html;charset=UTF-8"><script>alert("no data"); window.location = "/history/";</script></head></html>');
		    }
		});
	}
});	

module.exports = app;
