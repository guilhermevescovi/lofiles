# ---- Build Frontend stage ----
FROM node:18-alpine AS build-frontend

WORKDIR /app

# Accept build arguments for environment variables
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Install deps first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Build production bundle
RUN npm run build


# ---- Build Backend stage ----
FROM node:18-alpine AS build-backend

WORKDIR /app

# Copy backend package files
COPY server/package.json server/package-lock.json ./
RUN npm ci --no-audit --no-fund --production

# Copy backend source
COPY server/ ./

# Build TypeScript
RUN npm run build


# ---- Runtime stage ----
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy backend build and dependencies
COPY --from=build-backend /app/dist ./dist
COPY --from=build-backend /app/node_modules ./node_modules
COPY --from=build-backend /app/package.json ./package.json

# Copy frontend build artifacts
COPY --from=build-frontend /app/build ./build

# Set production environment
ENV NODE_ENV=production

# Expose port (default 3001, can be overridden)
EXPOSE 3001

# Start Express server (serves both API and static frontend)
CMD ["node", "dist/index.js"]
