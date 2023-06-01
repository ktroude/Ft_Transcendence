#!/bin/bash

(cd ./backend && python3 ./change_ip.py) && (cd ./frontend && python3 ./change_ip.py) 
cat backend/.env | grep REDIRECT | cut -d"'" -f2
