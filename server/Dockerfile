FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm prune --production

EXPOSE 3001

CMD ["sh", "-c", "npm run migrate && node dist/index.js"]
