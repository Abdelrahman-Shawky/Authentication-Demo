FROM node:20-alpine AS dev
WORKDIR /app

COPY package*.json ./
RUN npm ci

ENV NODE_ENV=development

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
