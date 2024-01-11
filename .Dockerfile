FROM node:14.19.1-alpine


WORKDIR /home/node/app

ENV NPM_CONFIG_LOGLEVEL=warn
ENV CI=true

COPY ./package*.json .


RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# # Install Redis server
# RUN apk --no-cache add redis

# # Expose the default Redis port
# EXPOSE 6379

# # Install supervisord
# RUN apk --no-cache add supervisor

# # Copy supervisord configuration file
# COPY supervisord.conf .

# # Use supervisord to start both Node.js and Redis
# CMD ["supervisord", "-c", "./supervisord.conf"]
