FROM mcr.microsoft.com/playwright:v1.17.1-focal

WORKDIR /tester

COPY package*.json ./

RUN npm ci

COPY . .

CMD [ "npm", "run", "test:docker" ]
