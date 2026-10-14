FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
# no dependencies to install
COPY . .
ENV NODE_ENV=production PORT=3000
VOLUME /app/storage
EXPOSE 3000
CMD ["node", "server.js"]
