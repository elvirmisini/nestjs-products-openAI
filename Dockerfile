FROM node:20.9.0

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run build

EXPOSE 3000

ENV NODE_OPTIONS="--max-old-space-size=2048"

ENTRYPOINT ["node", "dist/main"]

# Uncomment this for debugging mode (if needed)
# ENTRYPOINT ["npm", "run", "start:debug"]
