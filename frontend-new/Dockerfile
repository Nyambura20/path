FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./

ARG REACT_APP_API_BASE_URL=/api
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV GENERATE_SOURCEMAP=false

RUN npm run build
RUN npm install -g serve

EXPOSE 3000
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]
