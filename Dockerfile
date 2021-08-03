FROM node:16-alpine

ARG NODE_ENV

WORKDIR /app

COPY package.json package-lock.json ./

RUN if [ "$NODE_ENV" != "production" ] ; \ 
    then \
        npm install; \ 
    else \
        npm install --production; \
    fi

COPY . .

CMD ["sh", "/app/scripts/start.sh"]