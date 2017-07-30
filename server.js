#!/usr/bin/env node

var async = require('async'),
    ora = require('ora'),
    clear = require('cli-clear'),
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
    games = [],
    gameStateFile = __dirname+'/.lastGameState.json';

clear();

robot.setMouseDelay(config.mouseMoveDelay);

prompt(c.green('Which player do you want to control? Enter player name, white, or black.\n\tDefault is '+c.white(config.playerName)+': '), function(val) {
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
    prompt(c.green('Move mouse to the top left of the board and hit '+c.white('enter')), function(val) {
        var topLeft = robot.getMousePos();
        prompt(c.green('Move mouse to the bottom right of the board and hit '+c.white('enter')), function(val) {
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
                console.log(c.yellow(JSON.stringify(gameState)));
                var moveHash = md5(md5(gameState.moves) + md5(gameState.id));
                if (!_.contains(games, gameState.id))
			games.push(gameState.id);
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
                while (index < gameState.moves.length - 1) {
                    var s = gameState.moves[index];
                    index++;
                    s += gameState.moves[index];
                    index++;
                    Moves.push(config.decodeMove(s));
                }
var startedTs = Date.now();
//fs.writeFileSync(gameStateFile, JSON.stringify(gameState));
                var engine = new Engine(config.engine);
                engine.chain()
                    .init()
                    .setoption('MultiPV', config.principalVariation)
                    .setoption('Threads', config.Threads)
                    .setoption('Hash', config.Hash)
                    .position('startpos', Moves)
                    .go({
                        depth: config.depth,

                    })
                    .then(function(result) {
	//		    console.log(result);
			    var duration = Date.now() - startedTs;
                        res.json({});
                        if (turn == controlledPlayer || playerTurn==controlledPlayer) {
			    var movePosition = {
				    from: config.moveToPosition(boardConstraints, result.bestmove[0] + result.bestmove[1]),
					    to: config.moveToPosition(boardConstraints, result.bestmove[2] + result.bestmove[3]),
			    };
					    var msg = c.green('  Best move calculated in '+c.white(duration)+'ms.\tMoving mouse to perform move ' +  c.white(result.bestmove));
				var moveSpinner = spinner = ora(msg).start();
                            robot.moveMouseSmooth(movePosition.from.X, movePosition.from.Y);
			    var moveDelay = (Math.floor(Math.random() * 2) + 0) * 1000;
                            setTimeout(function() {
                            setTimeout(function() {
                                robot.mouseClick();
                                setTimeout(function() {
                                    robot.mouseClick();
                                    setTimeout(function() {
                                        robot.mouseToggle('down');
                                        setTimeout(function() {
                                            robot.moveMouseSmooth(movePosition.to.X, movePosition.to.Y);
                                            setTimeout(function() {
                                                robot.mouseToggle('up');
						moveSpinner.succeed();
//                                                console.log('\t\t' + c.yellow('[Move Complete!]'));
                                            }, config.mouseEventDelay);
                                        }, config.mouseEventDelay);
                                    }, config.mouseEventDelay);
                                }, config.mouseEventDelay);
                            }, config.mouseEventDelay);
			    }, moveDelay);
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
