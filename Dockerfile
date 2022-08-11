FROM mcr.microsoft.com/playwright:v1.25.0-jammy

WORKDIR /tester

COPY package*.json ./

RUN npm ci

COPY . .

CMD [ "npm", "run", "test:docker" ]
