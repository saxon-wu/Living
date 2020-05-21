#!/bin/sh

if [ "$NODE_ENV" = "development" ]; then
    echo ">>>>>> Development mode"
    npm install
    npm run start:dev
else
    echo ">>>>>> Production mode"
    npm install --only=production 
    npm run build 
    npm run start:prod
fi