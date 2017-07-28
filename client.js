#!/usr/bin/env node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


var request = require('request-json'),
    config = require('./config'),
client = request.createClient('https://localhost:' + config.port + '/');

var s = '{"id":2226655542,"status":"in_progress","players":[{"uid":"EugenEugenEugen","status":"playing","lag":2,"lagms":240,"gid":2226655542},{"uid":"rapidrick","status":"playing","lag":3,"lagms":381,"gid":2226655542}],"reason":"movemade","seq":14,"moves":"lBYIBJIAmCAsjsZRsAXPnDPHAH5Q","clocks":[5692,3437],"draws":[],"squares":[28,42]}';

client.post('/api', JSON.parse(s), function(err, res, body) {
    if (err) throw err;
    console.log(res.statusCode);
    console.log(typeof body);
    console.log(body);
});
