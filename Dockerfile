# Stage 1: Build Stage
FROM node:22 AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

# Copy only what is needed to install dependencies and generate Prisma
COPY package*.json ./
COPY . .

RUN npm install

# Generate Prisma client (explicitly)
RUN npx prisma generate

# Now copy everything else
COPY . .

# Build the app
RUN npm run build


# Stage 2: Production Stage
FROM node:22-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 5056

CMD ["node", "dist/main"]



# FROM node:22-slim

# # Accept build arguments for environment variables
# ARG NODE_ENV
# ARG DATABASE_URL
# ARG JWT_SECRET
# ARG JWT_EXPIRES_IN
# ARG BASE_URL
# ARG MAIL_USER
# ARG MAIL_PASS
# ARG SUPER_ADMIN_EMAIL
# ARG SUPER_ADMIN_PASS
# ARG REDIS_URL
# ARG TWILIO_ACCOUNT_SID
# ARG TWILIO_AUTH_TOKEN
# ARG TWILIO_PHONE_NUMBER

# # Set working directory inside the container
# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y openssl

# # Copy package.json and install dependencies
# COPY package*.json ./
# COPY . ./

# # Install Node.js dependencies
# RUN npm install --ignore-scripts

# # Generate Prisma client
# RUN npx prisma generate

# # Build the app (NestJS -> dist/)
# RUN npm run build

# # Set environment variables inside the container
# ENV NODE_ENV=${NODE_ENV}
# ENV DATABASE_URL=${DATABASE_URL}
# ENV JWT_SECRET=${JWT_SECRET}
# ENV JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
# ENV BASE_URL=${BASE_URL}
# ENV MAIL_USER=${MAIL_USER}
# ENV MAIL_PASS=${MAIL_PASS}
# ENV SUPER_ADMIN_EMAIL=${SUPER_ADMIN_EMAIL}
# ENV SUPER_ADMIN_PASS=${SUPER_ADMIN_PASS}
# ENV REDIS_URL=${REDIS_URL}
# ENV TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
# ENV TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
# ENV TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}

# # Expose the port that the application listens on.
# EXPOSE 5055

# # Command to run the application
# CMD ["npm", "run", "start:prod"]