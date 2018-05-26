#!/bin/bash
NODE_TLS_REJECT_UNAUTHORIZED="0" ~/Desktop/anyproxy/bin/anyproxy --port 4911 --intercept --ws-intercept --rule ~/Desktop/node-chess-dot-com-bot/proxy.js --silent
