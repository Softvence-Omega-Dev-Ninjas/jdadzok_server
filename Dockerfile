# Stage 1: Build Stage
FROM node:22 AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

# Copy only what is needed to install dependencies and generate Prisma
COPY package*.json ./
COPY . .

RUN npm install

# Generate Prisma client (explicitly)
RUN npm run prisma:generate

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

ENV NODE_ENV=development

EXPOSE 5056

CMD ["npm", "run", "start:prod"]
