#!/bin/bash
AP=~/anyproxy
AP_PORT=4911
AP_SILENT=1
if [ "$AP_SILENT" == "1" ]; then export AP_SILENT="--silent"; else export AP_SILENT=""; fi

NODE_TLS_REJECT_UNAUTHORIZED="0" $AP/bin/anyproxy --port $AP_PORT --intercept --ws-intercept --rule ~/node-chess-dot-com-bot/proxy.js $AP_SILENT
#NODE_TLS_REJECT_UNAUTHORIZED="0" $AP/bin/anyproxy --port $AP_PORT --intercept --rule ~/node-chess-dot-com-bot/proxy.js $AP_SILENT
