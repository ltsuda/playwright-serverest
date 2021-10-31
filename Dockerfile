FROM mcr.microsoft.com/playwright:focal

WORKDIR /tester

COPY package*.json ./

RUN npm ci

COPY . .

CMD [ "npm", "run", "test:docker" ]
