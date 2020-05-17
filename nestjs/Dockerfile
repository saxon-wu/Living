## Normal image
# FROM node:12.16.1-alpine3.9

## With python for sharp image
FROM nikolaik/python-nodejs:python3.7-nodejs12-alpine AS builder

## Create app directory
WORKDIR /app
## A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY ./package*.json ./
COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

# RUN npm install pm2 -g
# RUN npm ci
# RUN npm cache clean --force 

## Remove _libvips dir and copy libvip library, it can skip download from http.
RUN rm -rf /root/.npm/_libvips
COPY ./sharp/libvips-8.9.1-linuxmusl-x64.tar.gz /root/.npm/_libvips/

## Remove _prebuilds dir and copy sharp library, it can skip download from http. NOTICE: THE SHARP LIBRARY WITH HASH OF FILE NAME
RUN rm -rf /root/.npm/_prebuilds
COPY ./sharp/1a2cac-sharp-v0.25.2-napi-v3-linuxmusl-x64.tar.gz /root/.npm/_prebuilds/

RUN npm config set registry https://registry.npm.taobao.org 
RUN npm config set sharp_dist_base_url https://npm.taobao.org/mirrors/sharp-libvips/v8.9.1/

# RUN npm install -g @nestjs/cli@7.1.5

## Install app dependencies
RUN npm install

## RUN mkdir uploads
RUN npm run build


FROM nikolaik/python-nodejs:python3.7-nodejs12-alpine
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
CMD [ "npm", "run", "start:prod" ]
