FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Build CSS
COPY src/ ./src/
COPY tailwind.config.js ./
COPY postcss.config.js ./
RUN npm run build:css

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
