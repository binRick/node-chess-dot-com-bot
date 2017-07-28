#!/usr/bin/env node

var robot = require('robotjs'),
    config = require('./config'),
    boardConstraints = {
        topLeft: {
            x: 40,
            y: 209
        },
        bottomRight: {
            x: 461,
            y: 630
        },
        boxWidth: 52
    };


var move = process.argv[2];
if (move.length != 4)
    process.exit(-1);

var move = {
    start: config.moveToPosition(boardConstraints, move[0] + move[1]),
    end: config.moveToPosition(boardConstraints, move[2] + move[3]),
};
console.log('move=', move);
robot.moveMouseSmooth(move.start.X, move.start.Y);
setTimeout(function() {
    robot.mouseClick();
    setTimeout(function() {
        robot.mouseClick();
        setTimeout(function() {
            robot.mouseToggle('down');
            setTimeout(function() {
      //          robot.dragMouse(move.end.X, move.end.Y);
      robot.moveMouseSmooth(move.end.X, move.end.Y);
                setTimeout(function() {
                    robot.mouseToggle('up');
                }, 5);
            }, 5);
        }, 5);
    }, 5);
}, 5);
