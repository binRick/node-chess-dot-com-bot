#!/bin/bash
export NODE_TLS_REJECT_UNAUTHORIZED="0"
/usr/local/bin/anyproxy --port 4911 --intercept --ws-intercept --rule $1 --silent
