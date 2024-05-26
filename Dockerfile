#FROM ubuntu:latest
#LABEL authors="rob"
#
#ENTRYPOINT ["top", "-b"]

# Base on offical Node.js Alpine image
FROM node:alpine

# Set working directory
WORKDIR /usr/app

# environment settings for docker compose deployments
COPY deployment/compose/next.config.js ./

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./

# Install dependencies
RUN npm install --production

# insta pm2 manager
RUN npm install pm2@latest -g

# Copy all files
COPY ./ ./

# Build app
RUN npm run build

# Expose the listening port
EXPOSE 8081

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node

# Run npm start script when container starts
#CMD [ "npm", "start" ]
# run the app under pm2 management
#pm2 start npm --name "recipes" -- start -- -p 8080
#CMD [ "pm2", "start", "npm", "--name recipes", "--", "start", "--", "-p 8080"]
CMD [ "pm2", "start", "npm", "--name recipes", "--", "start", "--", "-p 3000"]