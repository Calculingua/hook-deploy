var express = require("express");
var bodyParser = require("body-parser");
var cp = require("child_process");
var async = require("async");

module.exports = function(config){

	var app = express();
	app.use(bodyParser.json({limit: '50mb'}));
	console.log("config:", config);	
	app.use(function(req, res){
		var type = req.get("X-GitHub-Event");
		if(type == "push"){
			console.log("push repo, branch:", req.body.repository.full_name, req.body.ref);
			async.map(config.events, function(event, callback){
				if(req.body.ref == "refs/heads/" + event.branch && req.body.repository.full_name == event.repo){
					console.log("executing:", event.script);
					var out = "executing: " + event.script;
					cp.execFile(event.script, function(err, stdout, stderr){
						if(err){
							console.error("child_process error:", err);
							callback(err);
						}
						out += ("\nstdout:\n" + stdout);
						out += ("\nstderr:\n" + stderr);
						callback(null, out);
					});	
				}else{
					callback(null, "");
				}
			}, function(err, out){
				if(out.length > 0){
					console.log("completed:", out);
					res.status(200).end(out.join("\n")); 
				}else{
					res.status(202).end();
				}
			});
			
		}else{
			res.status(202).end();
		}
	});

	app.listen(config.port || 8888); 
};

