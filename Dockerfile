FROM node:22-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml serverless.yml ./
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate && pnpm install --frozen-lockfile --ignore-scripts

COPY tsconfig.json tslint.json webpack.config.ts  ./
COPY src src

EXPOSE 3000/tcp

ENTRYPOINT ["pnpm", "run", "docker-dev"]
