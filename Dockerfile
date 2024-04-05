FROM node:20-alpine
WORKDIR /app

COPY package.json yarn.lock serverless.yml ./
RUN yarn install --ignore-scripts

COPY tsconfig.json tslint.json webpack.config.ts  ./
COPY src src

EXPOSE 3000/tcp

ENTRYPOINT ["yarn", "run", "docker-dev"]
