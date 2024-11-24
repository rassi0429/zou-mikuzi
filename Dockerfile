FROM node:20.6
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build
RUN npx prisma generate
CMD ["npm", "run", "start"]
