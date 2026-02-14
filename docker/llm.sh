#!/usr/bin/env bash
set -eou pipefail

echo -e "Here is my compose.yaml:"
cat compose.yaml
echo -e "-----------\n"
#echo -e "Here is my Analyzer.py:"
#cat Analyzer.py
echo -e "-----------\n"
#echo -e "Here is my Logger.py:"
#cat Logger.py
echo -e "-----------\n"
echo -e "Here is my analyzer.Dockerfile:"
cat analyzer.Dockerfile
echo -e "-----------\n"
echo -e "Here is my mitmproxy.Dockerfile:"
cat mitmproxy.Dockerfile
echo -e "-----------\n"
echo -e "Here is game_state.log:"
cat logs/game_state.log
echo -e "-----------\n"
echo -e "Here is best_moves.log:"
cat logs/best_moves.log
echo -e "-----------\n"

echo -e "If you send me a new script, send me the entire script. do not send me a piece of the script."
