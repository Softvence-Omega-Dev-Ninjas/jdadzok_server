# Use Node.js 22-slim image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y openssl

# copy package.json file and everything to the ./
COPY package*.json ./
COPY . ./

# Install Node.js dependencies
RUN npm install --ignore-scripts

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source code
RUN ls -a

# Build the app (NestJS -> dist/)
RUN npm run build

# Expose the port that the application listens on.
EXPOSE 5055


# Run the application.
CMD ["npm" "run", "start:prod"]
