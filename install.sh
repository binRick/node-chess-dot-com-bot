#!/bin/bash
AP=~/anyproxy
ls ~/.anyproxy/certificates/rootCA.crt >/dev/null 2>&1 || $AP/bin/anyproxy-ca
