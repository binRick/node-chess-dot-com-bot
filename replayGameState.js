#!/usr/bin/env node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


var request = require('request-json'),
    config = require('./config'),
client = request.createClient('https://localhost:' + config.port + '/');

var fs = require('fs');

var s = JSON.parse(fs.readFileSync(process.argv[2]).toString()),
	l = console.log;

l(s);


client.post('/api', s, function(err, res, body) {
    if (err) throw err;
    console.log(res.statusCode);
    console.log(typeof body);
    console.log(body);
});
