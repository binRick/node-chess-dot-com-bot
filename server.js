#!/usr/bin/env node

var async = require('async'),
    robot = require("robotjs"),
    md5 = require('md5'),
    Engine = require('node-uci').Engine,
    fs = require('fs'),
    express = require('express'),
    _ = require('underscore'),
    c = require('chalk'),
    config = require('./config'),
    pj = require('prettyjson'),
    https = require('https'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    prompt = require('cli-prompt'),
    completedMoves = [];



robot.setMouseDelay(config.mouseMoveDelay);

prompt(c.red('Which player do you want to control? Enter player name, white, or black. Default is '+config.playerName+': '), function(val) {
    if (val == 'white')
        var controlledPlayer = 'white';
    else if(val=='black')
        var controlledPlayer = 'black';
    else{
	    if(val=='')
		    val=config.playerName;
	    var controlledPlayer=val;
    }
    console.log(c.green('Controlling player ') + c.white(controlledPlayer));
    prompt(c.red('Move mouse to the top left of the board and hit enter'), function(val) {
        var topLeft = robot.getMousePos();
        prompt(c.red('Move mouse to the bottom right of the board and hit enter'), function(val) {
            var bottomRight = robot.getMousePos();
            var boardConstraints = {
                topLeft: topLeft,
                bottomRight: bottomRight,
                boxWidth: parseInt((bottomRight.x - topLeft.x) / 8),
                bottomRight: bottomRight,
                topLeft: topLeft
            };
            var app = express();
            app.use(bodyParser.json());
            app.use(cors());
            app.use(function(req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next();
            });
            app.get('/', function(req, res) {
                res.send('Hello World!');
            });
            app.post('/api/', function(req, res) {
                var gameState = req.body;
                var moveHash = md5(gameState.moves);
                if (_.contains(completedMoves, moveHash)) {
                    return res.json({});
                }
                completedMoves.push(moveHash);
                var index = 0;
                var Moves = [];
                if (gameState.seq % 2 == 0) {
                    var turn = 'white';
                    var playerTurn = gameState.players[0].uid;
                } else {
                    var turn = 'black';
                    var playerTurn = gameState.players[1].uid;
                }
                //console.log(c.yellow(JSON.stringify(req.body)));
                while (index < gameState.moves.length - 1) {
                    var s = gameState.moves[index];
                    index++;
                    s += gameState.moves[index];
                    index++;
                    Moves.push(config.decodeMove(s));
                }
                var engine = new Engine(config.engine);
                engine.chain()
                    .init()
                    .setoption('MultiPV', 3)
                    .position('startpos', Moves)
                    .go({
                        depth: 15
                    })
                    .then(function(result) {
                        res.json({});
                        if (turn == controlledPlayer || playerTurn==controlledPlayer) {
                            console.log(c.green('\tMoving mouse to perform move'), c.white(result.bestmove));
                            var mtp = config.moveToPosition(boardConstraints, result.bestmove[0] + result.bestmove[1]);
                            var mtp2 = config.moveToPosition(boardConstraints, result.bestmove[2] + result.bestmove[3]);
                            robot.moveMouseSmooth(mtp.X, mtp.Y);
                            setTimeout(function() {
                                robot.mouseClick();
                                setTimeout(function() {
                                    robot.mouseClick();
                                    setTimeout(function() {
                                        robot.mouseToggle('down');
                                        setTimeout(function() {
                                            robot.moveMouseSmooth(mtp2.X, mtp2.Y);
                                            setTimeout(function() {
                                                robot.mouseToggle('up');
                                                console.log('\t\t' + c.yellow('[Move Complete!]'));
                                            }, config.mouseEventDelay);
                                        }, config.mouseEventDelay);
                                    }, config.mouseEventDelay);
                                }, config.mouseEventDelay);
                            }, config.mouseEventDelay);
                        }
                    });
                delete engine;
            });
            var secureServer = https.createServer({
                key: fs.readFileSync(__dirname + '/server.key'),
                cert: fs.readFileSync(__dirname + '/server.crt'),
            }, app).listen(config.port, function() {
                console.log('API Server Started On Port %d', config.port);
            });
        });
    });
});
