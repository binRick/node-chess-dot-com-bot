#!/bin/bash
AP_PORT=4911
AP=~/anyproxy
ls ~/.anyproxy/certificates/rootCA.crt >/dev/null 2>&1 || $AP/bin/anyproxy-ca
which firewall-cmd >/dev/null 2>&1 && sudo firewall-cmd --add-port=8002/tcp --permanent && sudo firewall-cmd --add-port=${AP_PORT}/tcp --permanent && sudo firewall-cmd --reload
