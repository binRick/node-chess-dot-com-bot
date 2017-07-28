// ==UserScript==
// @name         chessBot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @require https://code.jquery.com/jquery-2.1.4.min.js
// @description  try to take over the world!
// @author       You
// @include       http*://www.chess.com*
// @grant        none
// ==/UserScript==


(function(open) {
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener("readystatechange", function() {
            try{
                var J = JSON.parse(this.response);
                if(J && typeof J =='object' && typeof J[0] =='object'&& typeof J[0].data =='object'&& typeof J[0].data.game =='object'&& typeof J[0].data.game.reason =='string'&&  J[0].data.game.reason =='movemade'&&  J[0].data.game.status =='in_progress'){
                    var R = J[0].data.game;
                    $.ajax('https://localhost:4912/api', {
                        data : JSON.stringify(R),
                        contentType : 'application/json',
                        type : 'POST'
                    }, function( data ) {
                    });

                
                }

            }catch( E){}
        }, false);
        open.apply(this, arguments);
    };
})(XMLHttpRequest.prototype.open);
