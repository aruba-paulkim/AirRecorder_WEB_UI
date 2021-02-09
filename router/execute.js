var express = require('express');
var app = express.Router();
var async = require('async');
var crypto = require('crypto');
var fs = require("fs");
var util = require('util');


const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(__dirname+'/../db/arwebui.db');
var debug = false;

var AirRecorderVersion = "1.6.9";

function pubDEC(EncryptMSG){
	var PUBKEY = fs.readFileSync(__dirname+'/public.key');
	var msg = crypto.publicDecrypt(PUBKEY, Buffer.from(EncryptMSG, 'base64'));
	return msg;
}


app.get('/execute', function(req, res){
	if(debug) console.log(req.session.user_id+" | GET /execute");
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var params=[], sql = '', devices='', commands='';

		sql = "SELECT * from DEVICES where deleted_yn='N' ";
		if(debug) { console.log(sql); console.log(params); }

		db.all(sql, params, function(err, rows) {
			if(err) {console.log(err); res.redirect('/error'); }
			
			if(rows.length > 0) {
				devices = JSON.parse(JSON.stringify(rows));
				sql = "SELECT * FROM COMMANDS where deleted_yn='N' ";
				if(debug) { console.log(sql); console.log(params); }

				db.all(sql, params, function(err, rows) {
					if(err) {console.log(err); res.redirect('/error'); }

					if(rows.length > 0) {
						commands = JSON.parse(JSON.stringify(rows));

						res.render('execute', {
							sess:req.session,
							devices:devices,
							commands:commands
						});	
					} else { }
				});
			} else { }
		});
	}
});


app.post('/execute', function(req, res){
	if(debug) console.log(req.session.user_id+" | POST /execute");
	if(!req.session.user_id) {
		res.redirect('/');
	} else {
		var params=[], sql = '', sel_devices='', devices='', commands='', ips = '', params='';

		if(req.body.sel_devices === undefined ) {
			res.end('<script>alert("You have to select device"); history.back();</script>');
			return;
		} else {
			res.end('<!DOCTYPE html><head><title></title><meta http-equiv="content-type" content="text/html;charset=UTF-8"><script>alert("reuqest successfully"); history.back();</script></head></html>');

			if(req.body.sel_devices.length == 1) { 
				sel_devices = req.body.sel_devices;
			} else {
				sel_devices = req.body.sel_devices.join();
			}

			params =[req.body.sel_command];
			sql = "SELECT * FROM COMMANDS where deleted_yn='N' and seq=?";
			if(debug) { console.log(sql); console.log(params); }

			db.all(sql, params, function(err, rows) {
				if(err) {console.log(err); res.redirect('/error'); }
				
				if(rows.length > 0) {
					commands = JSON.parse(JSON.stringify(rows));
					
					for(i=0; i<req.body.sel_devices.length; i++) {
						params = [ req.body.sel_devices[i] ];
						sql = "SELECT * from DEVICES where deleted_yn='N' and seq = ?";
						if(debug) { console.log(sql); console.log(params); }
						
						db.all(sql, params, function(err, rows) {
							if(err) {console.log(err); res.redirect('/error'); }
							
							if(rows.length > 0) {
								devices = JSON.parse(JSON.stringify(rows));
								ip_address = devices[0].ip_address;
								username = devices[0].username;
								password = pubDEC(devices[0].password);
								enable_pw = pubDEC(devices[0].enable_pw);
		
								///usr/bin/java -jar AirRecorder-1.5.2-release.jar 192.168.10.2 -c ../commands/ap_list.txt -u admin -p enable -e enable
								const exec = util.promisify(require('child_process').exec);
								async function AirRecorder() {
									var d = new Date(),
									month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear(),
									hour = d.getHours(), min = d.getMinutes(), sec = d.getSeconds();
									if (month < 10) month = '0' + month;
									if (day < 10) day = '0' + day;
									if (hour < 10) hour = '0' + hour;
									if (min < 10) min = '0' + min;
									if (sec < 10) sec = '0' + sec;
									var now = [year, month, day].join('') + '' + [hour,min,sec].join('');
									cmd = "java -jar "+__dirname+"/AirRecorder-"+AirRecorderVersion+"-release.jar ";
									cmd+= ip_address+" ";
									cmd+= "-c "+__dirname+"/.."+commands[0].filepath+" ";
									cmd+= "-u "+username+" ";
									cmd+= "-p "+password+" ";
									cmd+= "-e "+enable_pw+" ";
									cmd+= "--log-file "+__dirname+"/../history/"+now+"^"+ip_address+"^"+commands[0].command_name;
									if(debug) { console.log(cmd); }
									try {
											const { stdout, stderr } = await exec(cmd);
									} catch (err) {
										console.error(err);
									}
								}
								AirRecorder();
							}
						});
					}
				}
			});
		}
	}
});



module.exports = app;