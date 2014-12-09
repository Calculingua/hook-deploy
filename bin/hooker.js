#! /usr/bin/env node

if(process.argv.length < 3){
	console.log("You need to enter a path to the config file.");
	return 1;
}

var path = process.argv[2];

var config = require(path);
var hook = require("../")(config);