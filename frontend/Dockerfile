FROM node:latest
WORKDIR /app
COPY ./frontend ./
RUN npm install && npm run build
RUN npm install -g serve
EXPOSE 5173
CMD  npm run dev