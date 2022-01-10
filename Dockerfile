FROM mcr.microsoft.com/playwright:v1.17.2-focal

WORKDIR /tester

COPY package*.json ./

RUN npm ci

COPY . .

CMD [ "npm", "run", "test:docker" ]
