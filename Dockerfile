# =============================================================================
# Playwright Test Framework - Docker Image
# =============================================================================
# Uses Node base image and installs Playwright browsers to ensure version match
#
# Usage:
#   Build:  docker build -t playwright-tests .
#   Run:    docker run --rm playwright-tests
#   Report: docker run --rm -v $(pwd)/reports:/app/playwright-report playwright-tests
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base Node image
# -----------------------------------------------------------------------------
FROM node:20-bookworm AS base

# Set working directory
WORKDIR /app

# Set environment variables
ENV CI=true

# -----------------------------------------------------------------------------
# Stage 2: Dependencies installation
# -----------------------------------------------------------------------------
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for Playwright)
RUN npm ci

# Install Playwright browsers and system dependencies
# This ensures browser versions match the installed @playwright/test version
RUN npx playwright install --with-deps chromium

# -----------------------------------------------------------------------------
# Stage 3: Test runner
# -----------------------------------------------------------------------------
FROM dependencies AS runner

# Copy source code
COPY . .

# Create directory for reports
RUN mkdir -p playwright-report test-results

# Default: run Chromium tests (fastest, most CI-compatible)
# Override with: docker run playwright-tests npm run test:browsers
CMD ["npm", "test"]

# -----------------------------------------------------------------------------
# Health check - verify Playwright is working
# -----------------------------------------------------------------------------
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD npx playwright --version || exit 1
