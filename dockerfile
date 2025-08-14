# -------------------
# Base image
# -------------------
FROM node:22-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
  dumb-init \
  && rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nuxt -u 1001

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.13.1

# -------------------
# Install dependencies
# -------------------
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with frozen lockfile for reproducible builds
RUN pnpm install --frozen-lockfile --prod=false

# -------------------
# Build stage
# -------------------
FROM deps AS build

# Copy source code
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

# Build the application
RUN pnpm build

# -------------------
# Production runner
# -------------------
FROM base AS runner

# Set production environment
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
ENV HOST=0.0.0.0
ENV PORT=3000

# Create necessary directories
RUN mkdir -p /app/.data && \
  mkdir -p /app/logs

# Copy built application
COPY --from=build --chown=nuxt:nodejs /app/.output ./.output
COPY --from=build --chown=nuxt:nodejs /app/server ./server
COPY --from=build --chown=nuxt:nodejs /app/drizzle.config.ts ./
COPY --from=build --chown=nuxt:nodejs /app/package.json ./

# Copy only production dependencies
COPY --from=deps --chown=nuxt:nodejs /app/node_modules ./node_modules

# Set proper permissions
RUN chown -R nuxt:nodejs /app && \
  chmod -R 755 /app

# Switch to non-root user
USER nuxt

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/ai-models', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", ".output/server/index.mjs"]
