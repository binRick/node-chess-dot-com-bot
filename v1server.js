#!/usr/bin/env node

var async = require('async'),
    Engine = require('node-uci').Engine,
    pem = require('pem'),
    fs = require('fs'),
    express = require('express'),
    _ = require('underscore'),
    c = require('chalk'),
    config = require('./config'),
    pj = require('prettyjson'),
    https = require('https'),
engine = new Engine(config.engine);



pem.createCertificate({
    days: 1,
    selfSigned: true
}, function(err, keys) {
    app = express();

    app.get('/', function(req, res) {
        res.send('Hello World!');
    });
    app.post('/api/', function(req, res) {
        console.log(typeof req.body);
	console.log(req.body);
	res.json({rick:123});
	/*
        var Moves = ['e2e4', 'e7e5'];
        engine.chain()
            .init()
            .setoption('MultiPV', 3)
            .position('startpos', Moves)
            .go({
                depth: 15
            })
            .then(function(result) {
                console.log(c.green('Moves: ') + c.white(Moves.join(' ')));
                console.log(c.green('\tBest Move: ') + c.white(result.bestmove));
                var J = {
			Moves: Moves,
                    bestMove: result.bestmove
                };
                res.json(J);
            });
	    */

    });

    https.createServer({
        key: keys.serviceKey,
        cert: keys.certificate
    }, app).listen(config.port);
});
