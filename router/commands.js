var express = require('express');
var app = express.Router();
var fs = require("fs");

const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(__dirname+'/../db/arwebui.db');
var debug = false;

	
app.get('/commands', function(req, res){
	if(debug) console.log(req.session.user_id+" | GET /commands");
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var params=[], part='', keyword='', commands='';
		
		var sql = "SELECT * FROM COMMANDS where deleted_yn='N' ";
		sql += "order by create_date desc";
		if(debug) { console.log(sql); console.log(params); }

		db.all(sql, params, function(err, rows) {
			if(err) {console.log(err); res.redirect('/error'); }
			
			if(rows.length > 0) {
				commands = JSON.parse(JSON.stringify(rows));
			} else {}
			
			res.render('commands', {
				sess:req.session,
				part:part,
				keyword:keyword,
				commands:commands
			});		
		});
	}
});
	
	
app.post('/commands', function(req, res){
	if(debug) console.log(req.session.user_id+" | POST /commands");
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var params=[], part='', keyword='', commands='';
		var sql = "SELECT * FROM COMMANDS where deleted_yn='N' ";
		if(req.body.part && req.body.keyword ) {
			part = req.body.part.replace(/'/g, '').replace(/"/g, '');
			keyword = req.body.keyword.replace(/'/g, '').replace(/"/g, '');
			sql += "and "+part+" like '%"+keyword+"%' ";
		}
		sql += "order by create_date desc";
		if(debug) { console.log(sql); console.log(params); }

		db.all(sql, params, function(err, rows) {
			if(err) {console.log(err); res.redirect('/error'); }
			
			if(rows.length > 0) {
				commands = JSON.parse(JSON.stringify(rows));
			} else {}
			
			res.render('commands', {
				sess:req.session,
				part:part,
				keyword:keyword,
				commands:commands
			});		
		});
	}
});


app.get('/command/:seq', function(req, res){
	if(debug) console.log(req.session.user_id+" | GET /command/"+req.params.seq);
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var params=[], seq='0', command_name = '', description = '', contents = ''
		var create_date='', deleted_yn='';
		
		if(req.params.seq != 0) {
			params = [ req.params.seq ];
			var sql = "SELECT * FROM COMMANDS where seq=? and deleted_yn='N'";
			sql += "order by create_date desc";
			if(debug) { console.log(sql); console.log(params); }

			db.all(sql, params, function(err, rows) {
				if(err) {console.log(err); res.redirect('/error'); }
				
				if(rows.length > 0) {
					var tmp = JSON.parse(JSON.stringify(rows));

					seq = tmp[0]['seq'];
					command_name  = tmp[0]['command_name'];
					description  = tmp[0]['description'];
					filepath   = tmp[0]['filepath'];
					var fs = require("fs");
					contents=fs.readFileSync(__dirname+'/..'+filepath);
					
					res.render('command_form', {
						sess : req.session,
						seq:seq,
						command_name:command_name,
						description:description,
						contents:contents
					});
				} else { }
			});
		} else {
			res.render('command_form', {
				sess : req.session,
				seq:seq,
				command_name:command_name,
				description:description,
				contents:contents
			});
		}
	}
});


app.post('/command/:seq', function(req, res){
	if(debug) console.log(req.session.user_id+" | POST /command/"+req.params.seq);
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var params=[], seq='', command_name = '', description = '', contents = '';

		if(req.body.command_name === '' || req.body.contents === '') {
			res.end('<!DOCTYPE html><head><title></title><meta http-equiv="content-type" content="text/html;charset=UTF-8"><script>alert("* 는 필수 입니다."); history.back();</script></head></html>');
		} else {
			var timestamp = Date.now();
			filepath = "/commands/"+req.body.command_name.replace(/ /g, '_')+"_"+timestamp;

			
			fs.writeFile(__dirname+"/.."+filepath, req.body.contents, function(err) {
				if( err ) { console.error(err); return; }
			});
			
			if(req.params.seq != 0) {
				// 수정
				var params = [ req.body.command_name.replace(/ /g, '_'), req.body.description, filepath, req.params.seq ];
				var sql ="UPDATE COMMANDS set ";
				sql += "command_name=?, description=?, filepath=? ";
				sql += "where seq=?";
				if(debug) { console.log(sql); console.log(params); }

				db.all(sql, params, function(err, rows) {
					if(err) {console.log(err); res.redirect('/error'); }
					res.redirect('/commands');
				});
			} else {
				// 신규추가
				var params = [ req.body.command_name.replace(/ /g, '_'), req.body.description, filepath ];
				var sql ="INSERT INTO COMMANDS (";
				sql += "command_name,description,filepath,create_date,deleted_yn";
				sql += ") VALUES (?,?,?,DATETIME('now','localtime'),'N')";
				if(debug) { console.log(sql); console.log(params); }

				db.all(sql, params, function(err, rows) {
					if(err) {console.log(err); res.redirect('/error'); }
					res.redirect('/commands');
				});
			}
		}
	}
});


app.get('/command/:seq/delete', function(req, res){
	if(debug) console.log(req.session.user_id+" | GET /command/"+req.params.seq+"/delete");
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var params =[req.params.seq];
		var sql = "UPDATE COMMANDS set deleted_yn='Y' where seq=?";
		if(debug) { console.log(sql); console.log(params); }

		db.all(sql, params, function(err, rows) {
			if(err) {console.log(err); res.redirect('/error'); }
			res.redirect('/commands');
		});
	}
});	

	
	
module.exports = app;