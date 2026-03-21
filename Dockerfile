FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript
RUN npm run build

# Expose the app
EXPOSE 3000

# Run the server
CMD ["npm", "start"]
