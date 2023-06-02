FROM node:latest
COPY ./backend ./
# RUN python3 ./change.py.py
RUN npm i
EXPOSE 3000
EXPOSE 3001
CMD DEBUG=colyseus:* npm run go