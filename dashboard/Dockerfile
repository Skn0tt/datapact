FROM node:18

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD "./docker-entrypoint.sh"
