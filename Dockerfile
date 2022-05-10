FROM node

ENV PORT 80

COPY build build

RUN npm install -g serve

CMD serve -s build -l ${PORT} -n