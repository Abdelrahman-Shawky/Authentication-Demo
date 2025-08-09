FROM node:20-alpine AS dev
WORKDIR /web
COPY package*.json ./
RUN npm ci

ENV NODE_ENV=development

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
