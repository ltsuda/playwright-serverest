FROM mcr.microsoft.com/playwright:v1.20.0-focal

WORKDIR /tester

COPY package*.json ./

RUN npm ci

COPY . .

CMD [ "npm", "run", "test:docker" ]