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
    completedMoves = [],
    letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];


var moveToPosition = function(boardConstraints, move) {
    var squaresRight = _.indexOf(letters, move[0]) + 1;
    var squaresDown = 8 - move[1] + 1;
    var posX = parseInt(boardConstraints.topLeft.x + ( squaresRight * boardConstraints.boxWidth) - boardConstraints.boxWidth/2);
    var posY = parseInt(boardConstraints.topLeft.y + ( squaresDown * boardConstraints.boxWidth) - boardConstraints.boxWidth/2);
    console.log('\t START squaresRight=', squaresRight,'squaresDown=', squaresDown);
    console.log('\t START posX=', posX,'posY=', posY);
    return {start:{X:posX,Y:posY}};
};

var decodeMove = function(move) {
    if (move.length != 2) throw "Invalid Move: " + move;
    var m1 = move.substring(0, 1);
    var m2 = move.substring(1, 2);
    var p1 = _.indexOf(config.letters, m1);
    var p2 = _.indexOf(config.letters, m2);
    var remainder1 = p1 % 8;
    var remainder2 = p2 % 8;
    var quotient1 = parseInt(p1 / 8);
    var quotient2 = parseInt(p2 / 8);
    var movePosition_START_X = config.letters[remainder1];
    var movePosition_START_Y = quotient1 + 1;
    var movePosition_END_X = config.letters[remainder2];
    var movePosition_END_Y = quotient2 + 1;
    return String(movePosition_START_X) + String(movePosition_START_Y) + String(movePosition_END_X) + String(movePosition_END_Y);
};


    robot.setMouseDelay(2);

prompt(c.red('Move mouse to the top left of the board and hit enter'), function(val) {
    var topLeft = robot.getMousePos();

    prompt(c.red('Move mouse to the bottom right of the board and hit enter'), function(val) {


        var bottomRight = robot.getMousePos();

 //       console.log('topLeft=', topLeft, 'bottomRight=', bottomRight);
	var boardConstraints = { topLeft: topLeft, bottomRight: bottomRight, boxWidth: parseInt((bottomRight.x - topLeft.x)/8), bottomRight: bottomRight, topLeft: topLeft};
console.log(boardConstraints);
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
                console.log(c.yellow(JSON.stringify(req.body)));
            while (index < gameState.moves.length - 1) {
                var s = gameState.moves[index];
                index++;
                s += gameState.moves[index];
                index++;
                Moves.push(decodeMove(s));
            }
            var engine = new Engine(config.engine);
	    console.log(Moves);
            engine.chain()
                .init()
                .setoption('MultiPV', 3)
                .position('startpos', Moves)
                .go({
                    depth: 15
                })
                .then(function(result) {
                    var J = {
                        bestMove: result.bestmove,
                        turn: turn,
                        playerTurn: playerTurn,
                    };
                    res.json(J);
 //                   if (playerTurn == config.playerName) {
 if(true){
                        console.log(c.green(JSON.stringify(J)));
                        console.log(c.green('\tmoving mouse to make move'), c.white(result.bestmove));
 //                       console.log(c.green('\t\t' + JSON.stringify(mouseMove)));
			var mtp = moveToPosition(boardConstraints, result.bestmove);
			console.log(mtp);
                        robot.moveMouseSmooth(mtp.start.X, mtp.start.Y);
			//	process.exit(-1);
                        robot.mouseToggle('down');
                        robot.dragMouse(mouseMove.end.X, mouseMove.end.Y);
                        robot.mouseClick('up');
                        console.log('\t\t' + c.yellow('[Move Complete!]'));
                    }
                });
            delete engine;

        });
        var secureServer = https.createServer({
            key: fs.readFileSync(__dirname + '/server.key'),
            cert: fs.readFileSync(__dirname + '/server.crt'),
            //    requestCert: true,
            //    rejectUnauthorized: false
        }, app).listen(config.port, function() {
            console.log('API Server Started On Port %d', config.port);
        });
    });
});
