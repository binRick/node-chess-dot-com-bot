_ = require('underscore'),
    c = require('chalk'),
    pj = require('prettyjson'),
    request = require('request'),
    l = console.log,
    config = require('./config'),
    uri = 'https://localhost:' + config.port + '/api';


module.exports = {
    summary: 'nodejs anyproxy rule',
    * beforeSendResponse(requestDetail, responseDetail) {
        if (requestDetail.url.includes('/cometd') && requestDetail.url.includes('chess.com') && 'response' in responseDetail && 'body' in responseDetail.response) {
            l(c.red.bgBlack("*"));
            if (responseDetail.response.body.includes('[{"data":{"game":{"id"')) {
                console.log('received response for chess.com', typeof responseDetail, 'sending to', uri);
                var dat = JSON.parse(responseDetail.response.body.toString());

                l(typeof dat);
                dat = dat[0].data.game;
		    /*
		    if(dat.status == 'finished' && dat.seq > config.initialManualMoves){
l('GAME IS FINISHED');
			    if(config.autoClickNewGame){
				    uri = 'https://localhost:' + config.port + '/newGame';
l('Clicking new Game Button @ '  + uri);
			    }
		    }*/
                l(pj.render(dat));
                var options = {
                    uri: uri,
                    method: 'POST',
                    json: dat,
                };
                request(options, function(error, response, body) {

                    l('post completed');
                    l(body);

                });

            }
        }
    },
};
