FROM node:18

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

RUN mkdir -p /app/public/resources/product/images \
  && chmod -R 777 /app/public

EXPOSE 3000

CMD ["npm", "run", "start"]
