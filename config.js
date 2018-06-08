var _ = require('underscore'),
    os = require('os');

module.exports = {
    playerName: 'chessbenzell',
	MultiPV: 1, //Min: 1, Max: 500
//The number of alternate lines of analysis to display. Specify 1 to just get the best line. Asking for more lines slows down the search.
    Threads: os.cpus.length-1, //Min: 1, Max: 128
//The number of threads to use during the search. This number should be set to the number of cores in your CPU.
	
    Hash: 16, //Min: 1, Max: 1048576
	//The amount of memory to use for the hash during search, specified in MB (megabytes). This number should be smaller than the amount of physical memory for your system.
	Skill: 20, //Min: 0, Max: 20
//How well you want Stockfish to play. At level 0, Stockfish will make dumb moves. Level 20 is best/strongest play.
	//
//Min: 0, Max: 5000
//The minimum amount of time to analyze, in milliseconds.
	Ponder: true, //Whether or not the engine should analyze when it is the opponent's turn.
    depth: 8,
	mouseDelays: {
		beforeMouseRelease: 100, //wait 100ms before releasing mouse
	},
    principalVariation: 2,
    mouseEventDelay: 1,
    mouseMoveDelay: 1,
    port: 4912,
    engine: __dirname + '/stockfish-8-mac/Mac/stockfish-8-64',
    letters: 'a b c d e f g h i j k l m n o p q r s t u v w x y z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z 0 1 2 3 4 5 6 7 8 9 ! ?'.split(' '),
    moveToPosition: function(boardConstraints, move) {
        var squaresRight = _.indexOf(this.letters, move[0]) + 1;
        var squaresDown = 8 - move[1] + 1;
        var posX = parseInt(boardConstraints.topLeft.x + (squaresRight * boardConstraints.boxWidth) - boardConstraints.boxWidth / 2);
        var posY = parseInt(boardConstraints.topLeft.y + (squaresDown * boardConstraints.boxWidth) - boardConstraints.boxWidth / 2);
        return {
            X: posX,
            Y: posY
        };
    },
    decodeMove: function(move) {
        if (move.length != 2) throw "Invalid Move: " + move;
        var m1 = move.substring(0, 1);
        var m2 = move.substring(1, 2);
        var p1 = _.indexOf(this.letters, m1);
        var p2 = _.indexOf(this.letters, m2);
        var remainder1 = p1 % 8;
        var remainder2 = p2 % 8;
        var quotient1 = parseInt(p1 / 8);
        var quotient2 = parseInt(p2 / 8);
        var movePosition_START_X = this.letters[remainder1];
        var movePosition_START_Y = quotient1 + 1;
        var movePosition_END_X = this.letters[remainder2];
        var movePosition_END_Y = quotient2 + 1;
        return String(movePosition_START_X) + String(movePosition_START_Y) + String(movePosition_END_X) + String(movePosition_END_Y);
    },
};
