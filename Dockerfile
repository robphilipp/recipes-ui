#FROM ubuntu:latest
#LABEL authors="rob"
#
#ENTRYPOINT ["top", "-b"]

# Base on offical Node.js Alpine image
FROM node:alpine
LABEL authors="rob"

ENV NEXTAUTH_SECRET=caa8eeccc7d0e6e3f02d7f3a0c21bd43ed30b4f7cfe897448bb92ff4890bf6ef
ENV NEXTAUTH_URL=localhost:8081

# Set working directory
WORKDIR /usr/app

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./

#
# Install dependencies
RUN npm install --production

# bcrypt -- for password encryption for auth and emails
RUN npm install bcrypt -g

# migrate-mongo -- to bring the recipes schema to the latest version
RUN npm install migrate-mongo -g

# pm2 -- service manager for nodejs
RUN npm install pm2@latest -g

# Copy all files
COPY ./ ./
# environment settings for docker compose deployments
COPY ./deployment/compose/next.config.js /usr/app

# copy the migrations file
COPY ./deployment/mongo/migrate-mongo-config.js ./dbmigrations/

# Build app
RUN npm run build

# # migrate mongo to the latest version
#WORKDIR /usr/app/dbmigrations
#RUN migrate-mongo up

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