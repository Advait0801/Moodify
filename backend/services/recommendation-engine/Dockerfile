FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for TypeScript build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript and verify output exists
RUN echo "Building TypeScript..." && \
    npm run build && \
    echo "Build completed. Checking output..." && \
    ls -la . && \
    ls -la dist/ && \
    test -f dist/app.js || (echo "ERROR: dist/app.js not found after build" && exit 1) && \
    echo "Build verification passed"

# Remove dev dependencies to reduce image size (preserve dist)
RUN npm prune --production && \
    echo "After prune, checking dist..." && \
    ls -la dist/ && \
    test -f dist/app.js || (echo "ERROR: dist/app.js removed after prune" && exit 1)

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "dist/app.js"]