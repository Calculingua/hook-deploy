var express = require("express");
var bodyParser = require("body-parser");
var cp = require("child_process");

module.exports = function(config){

	var app = express();
	app.use(bodyParser.json({limit: '50mb'}));
	console.log("config:", config);	
	app.use(function(req, res){
		var type = req.get("X-GitHub-Event");
		if(type == "push"){
			console.log("push repo, branch:", req.body.repository.full_name, req.body.ref);
			
			var event, out = "";
			for(var i = 0; i < config.events.length; i++){
				event = config.events[i];
				if(req.body.ref == "refs/heads/" + event.branch && req.body.repository.full_name == event.repo){
					console.log("executing:", event.script);
					out += "\nexecuting: " + event.script;
					cp.execFile(event.script, function(err, stdout, stderr){
						if(err){
							console.error("child_process error:", err);
							return res.status(500).end(err);
						}
						console.log("out, err: "+ stdout + " " + stderr);
						out += ("stdout:\n\n" + stdout);
						out += ("\nstderr:\n\n" + stderr + "\n\n");
					});	
				}
			}
			if(out.length > 0){
				console.log("completed:", out);
				res.status(200).end(out); 
			}else{
				res.status(202).end();
			}
		}else{
			res.status(202).end();
		}
	});

	app.listen(config.port || 8123); 
};

