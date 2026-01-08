# Stage 1: Build
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose API port
EXPOSE 5000

# Default command (can be overridden by docker-compose for worker)
CMD ["npm", "start"]
