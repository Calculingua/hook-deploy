var express = require("express");
var bodyParser = require("body-parser");
var cp = require("child_process");
var config = require("./config.json");
console.log("config:", config);

var app = express();
app.use(bodyParser.json());
app.use(function(req, res){
	var type = req.get("X-GitHub-Event");
	if(type == "push"){
		console.log("push");
		console.log("repo:", req.body.ref);
		if(req.body.ref == "refs/heads/" + config.branch && req.body.repository.full_name == config.repo){
			console.log("executing");	
			cp.execFile(config.script, function(err, stdout, stderr){
				if(err){
					console.error(err);
				}
				res.status(200).end(stdout); 
			});	
		}
		else{
			res.status(202).end();
		}
	}else{
		res.status(202).end();
	}
});

app.listen(8123); 

