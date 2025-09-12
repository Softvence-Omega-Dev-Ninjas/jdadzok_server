# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install

# Copy source code
COPY . .

# Important! Copy the prisma folder
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build the app (NestJS / TS etc.)
RUN npm run build


# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 5056

CMD ["npm", "run", "start:prod"]
