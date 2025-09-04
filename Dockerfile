# ---- Build stage ----
FROM node:18-alpine AS build

WORKDIR /app

# Accept build arguments for environment variables
ARG REACT_APP_GITHUB_TOKEN

# Set environment variables for the build
ENV REACT_APP_GITHUB_TOKEN=$REACT_APP_GITHUB_TOKEN

# Install deps first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Build production bundle
RUN npm run build


# ---- Runtime stage ----
FROM nginx:stable-alpine AS runtime

# Copy custom nginx config for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]


