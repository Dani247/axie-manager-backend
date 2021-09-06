FROM node:15.11.0-buster-slim
WORKDIR .
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "start"]