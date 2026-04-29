FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN cp -r src/db/migrations dist/db/migrations

EXPOSE 3001

CMD ["npm", "start"]