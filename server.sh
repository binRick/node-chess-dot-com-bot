#!/bin/bash
AP=~/anyproxy
AP_PORT=4911
NODE_TLS_REJECT_UNAUTHORIZED="0" $AP/bin/anyproxy --port $AP_PORT --intercept --ws-intercept --rule ~/node-chess-dot-com-bot/proxy.js --silent
