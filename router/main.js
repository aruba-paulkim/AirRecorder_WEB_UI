
module.exports = function(app, fs)
{

	const sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database(__dirname+'/../db/arwebui.db');
	var debug = false;

	var crypto = require('crypto');
	function privENC(originMSG){
		var PRIVKEY = fs.readFileSync(__dirname+'/private.key');
		var encmsg = crypto.privateEncrypt(PRIVKEY, Buffer.from(originMSG, 'utf8') ).toString('base64');
		return encmsg;
	}


	app.get('/',function(req,res){
		if(debug) console.log(req.session.user_id+" | GET /");
		if(req.session.user_id) {
			res.redirect('/execute');
		}
		res.render('index', {
			sess : req.session
		});
	});


	app.get('/error',function(req,res){
		if(debug) console.log(req.session.user_id+" | GET /error");
		res.end('ERROR');
	});


	app.post('/login', function(req, res){
		if(debug) console.log(req.session.user_id+" | POST /login");
		var sess = req.session;
		
		var sql = "SELECT * from USERS where user_pw=? and user_id=?";
		var params = [privENC(req.body.user_pw), req.body.user_id];
		if(debug) { console.log(sql); console.log(params); }

		db.all(sql, params, function(err, rows) {
			if(err) {console.log(err); res.redirect('/error'); }
			
			if(rows.length == 1) {
				var user = JSON.parse(JSON.stringify(rows));
				sess.user_id = user[0]['user_id']
				sess.user_name = user[0]['user_name']
				res.redirect('/execute');
			} else if(rows.length > 1) {
				res.redirect('/error');
			} else {
				res.end("<script>alert('incorrect id or pw'); location.href='/';</script>");
			}
		});
	});


	app.get('/logout', function(req, res){
		if(debug) console.log(req.session.user_id+" | GET /logout");
		
		if(req.session.user_id) {
			req.session.destroy(function(err){
				if(err) {console.log(err); res.redirect('/error'); }
				else{res.redirect('/');}
			});
		} else {
			res.redirect('/');
		}
	});
	

	var devices = require('./devices.js');
	app.use('/', devices);

	var commands = require('./commands.js');
	app.use('/', commands);

	var execute = require('./execute.js');
	app.use('/', execute);

	var history = require('./history.js');
	app.use('/', history);
	
}
