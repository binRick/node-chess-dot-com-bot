var _ = require('underscore'),
    os = require('os');

module.exports = {
    Threads: os.cpus.length,
    Hash: 32,
    depth: 15,
    principalVariation: 3,
    playerName: 'rapidrick',
    mouseEventDelay: 10,
    mouseMoveDelay: 10,
    port: 4912,
    //engine: __dirname + '/stockfish-8-mac/Mac/stockfish-8-64',
    engine: __dirname + '/Stockfish/src/stockfish',
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
