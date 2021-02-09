
var express = require('express');
var app = express.Router();
var fs = require("fs");

const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(__dirname+'/../db/arwebui.db');
var debug = false;

var crypto = require('crypto');
function privENC(originMSG){
	var PRIVKEY = fs.readFileSync(__dirname+'/private.key');
	var encmsg = crypto.privateEncrypt(PRIVKEY, Buffer.from(originMSG, 'utf8') ).toString('base64');
	return encmsg;
}


app.get('/devices', function(req, res){
	if(debug) console.log(req.session.user_id+" | GET /devices");
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var params=[], part='', keyword='', devices='';
		
		var sql = "SELECT * from DEVICES where deleted_yn='N' ";
		sql += "order by create_date desc";
		if(debug) { console.log(sql); console.log(params); }

		db.all(sql, params, function(err, rows) {
			if(err) {console.log(err); res.redirect('/error'); }
			
			if(rows.length > 0) {
				devices = JSON.parse(JSON.stringify(rows));
			} else {}
			
			res.render('devices', {
				sess:req.session,
				part:part,
				keyword:keyword,
				devices:devices
			});		
		});
	}
});
	

app.post('/devices', function(req, res){
	if(debug) console.log(req.session.user_id+" | POST /devices");
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var params=[], part='', keyword='', devices='';

		var sql = "SELECT * from DEVICES where deleted_yn='N' ";
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
				devices = JSON.parse(JSON.stringify(rows));
			} else {}
				
			res.render('devices', {
				sess:req.session,
				part:part,
				keyword:keyword,
				devices:devices
			});		
		});
	}
});

	
	
app.get('/device/:seq', function(req, res){
	if(debug) console.log(req.session.user_id+" | GET /device/"+req.params.seq);
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var seq=req.params.seq, params=[];
		var device_name='', ip_address='', username='', password='', enable_pw='';
			
		if(seq != 0) {
			params = [ req.params.seq ];
			var sql = "SELECT * from DEVICES where seq=? and deleted_yn='N' ";
			if(debug) { console.log(sql); console.log(params); }

			db.all(sql, params, function(err, rows) {
				if(err) {console.log(err); res.redirect('/error'); }
				
				if(rows.length > 0) {
					var tmp = JSON.parse(JSON.stringify(rows));
				
					seq=tmp[0]['seq'];
					device_name=tmp[0]['device_name'];
					ip_address=tmp[0]['ip_address'];
					username=tmp[0]['username'];

					res.render('device_form', {
						sess:req.session,
						seq:seq,
						device_name:device_name,
						ip_address:ip_address,
						username :username
					});
				} else {
				}
			});
		} else {
			res.render('device_form', {
				sess : req.session,
				seq:seq,
				device_name:device_name,
				ip_address:ip_address,
				username :username
			});
		}	
	}
});


app.post('/device/:seq', function(req, res){
		if(debug) console.log(req.session.user_id+" | POST /device/"+req.params.seq);
		if(!req.session.user_id) {
			res.redirect('/');
		} else {
			var seq=req.params.seq, device_name='', ip_address='', username='', password='', enable_pw='';

			if(req.body.device_name === '' || req.body.ip_address == '' ||
				req.body.username === '' || req.body.password === '' 
				) {
				res.end('<!DOCTYPE html><head><title></title><meta http-equiv="content-type" content="text/html;charset=UTF-8"><script>alert("* 는 필수 입니다."); history.back();</script></head></html>');
			} else {
				if(req.params.seq != 0) {
					// update
					var params = [
						req.body.device_name, req.body.ip_address, req.body.username, 
						privENC(req.body.password), privENC(req.body.enable_pw), req.params.seq
					];

					var sql ="UPDATE DEVICES set device_name=?,ip_address=?,";
					sql += "username=?,password=?,enable_pw=? where seq=? ";
					if(debug) { console.log(sql); console.log(params); }

					db.all(sql, params, function(err, rows) {
						if(err) {console.log(err); res.redirect('/error'); }
						res.redirect('/devices');
					});
				} else {
					// add
					var params = [
						req.body.device_name, req.body.ip_address, req.body.username, 
						privENC(req.body.password), privENC(req.body.enable_pw)
					];
					
					var sql ="INSERT INTO DEVICES (";
					sql += "device_name,ip_address, username,password,enable_pw,create_date,deleted_yn) ";
					sql += "VALUES (?,?,?,?,?,DATETIME('now','localtime'),'N')";
					if(debug) { console.log(sql); console.log(params); }

					db.all(sql, params, function(err, rows) {
						if(err) {console.log(err); res.redirect('/error'); }
						res.redirect('/devices');
					});
				}
			}
		}
	});


	app.get('/device/:seq/delete', function(req, res){
		if(debug) console.log(req.session.user_id+" | GET /device/"+req.params.seq+"/delete");
		if(!req.session.user_id) {
			res.redirect('/');
		} else {
			var params =[req.params.seq];
			var sql = "UPDATE DEVICES set deleted_yn='Y' where seq=?";
			if(debug) { console.log(sql); console.log(params); }

			db.all(sql, params, function(err, rows) {
				if(err) {console.log(err); res.redirect('/error'); }
				res.redirect('/devices');
			});
		}
	});		

	
module.exports = app;
