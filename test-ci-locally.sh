#!/bin/bash
set -e  # Exit on any error

#==============================================================================
# CI Environment Replication Script for Local Testing
# Mirrors GitHub Actions workflow: .github/workflows/playwright.yml
#==============================================================================

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT="${PROJECT:-chromium-desktop}"  # Default to chromium, override with: PROJECT=firefox-desktop ./test-ci-locally.sh
DATABASE_URL="postgresql://postgres:testpassword@localhost:5433/stemlab_test"
COMPOSE_FILE="docker-compose.test.yml"
TIMEOUT_DB=60
TIMEOUT_SERVICE=120

# Step counter
STEP=0

print_step() {
    STEP=$((STEP + 1))
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}Step $STEP: $1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Cleanup function
cleanup() {
    print_step "Cleanup Docker Compose (if script exits)"
    docker compose -f "$COMPOSE_FILE" down -v 2>/dev/null || true
    print_success "Cleanup complete"
}

# Register cleanup on script exit
trap cleanup EXIT

# Pre-flight checks
print_step "Pre-flight Checks"

# Check if docker compose v2 is available
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
    print_success "Docker Compose v2 found"
else
    print_error "Docker Compose v2 not found. Install it or update Docker Desktop"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version must be >= 20 (found: $(node -v))"
    exit 1
fi
print_success "Node.js version OK: $(node -v)"

# Check if ports are available
for port in 5433 3001 5173; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_error "Port $port is already in use. Stop the service or change ports in docker-compose.test.yml"
        print_info "To find what's using the port: lsof -i :$port"
        exit 1
    fi
done
print_success "All required ports (5433, 3001, 5173) are available"

#==============================================================================
# STEP 1: Checkout code (already done locally)
#==============================================================================
print_step "Verify Repository"
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory. Run from /home/user/wise-lab-helper"
    exit 1
fi
print_success "Repository verified"

#==============================================================================
# STEP 2: Setup Node.js (already done locally)
#==============================================================================
print_step "Node.js Environment"
print_info "Node version: $(node -v)"
print_info "NPM version: $(npm -v)"

#==============================================================================
# STEP 3: Install dependencies
#==============================================================================
print_step "Install Dependencies (npm ci)"
print_warning "This will delete node_modules and do a clean install"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Aborted by user"
    exit 1
fi

npm ci
print_success "Dependencies installed"

#==============================================================================
# STEP 4: Start database
#==============================================================================
print_step "Start PostgreSQL Test Database"
export COMPOSE_HTTP_TIMEOUT=200
$DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" up -d db-test
print_success "Database container started"

#==============================================================================
# STEP 5: Wait for database to be healthy
#==============================================================================
print_step "Wait for Database to be Ready"
print_info "Timeout: ${TIMEOUT_DB}s"

timeout $TIMEOUT_DB bash -c "
    while ! $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE exec -T db-test pg_isready -U postgres; do
        echo 'Waiting for database...'
        sleep 2
    done
" || {
    print_error "Database failed to become ready within ${TIMEOUT_DB}s"
    print_info "Showing database logs:"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs db-test
    exit 1
}
print_success "Database is ready"

#==============================================================================
# STEP 6: Run database migrations
#==============================================================================
print_step "Run Database Migrations"
print_info "DATABASE_URL: $DATABASE_URL"

export DATABASE_URL="$DATABASE_URL"
npm run migrate:up --workspace=packages/database

print_success "Migrations completed"

#==============================================================================
# STEP 6a: Verify UUID extension is enabled
#==============================================================================
print_step "Verify UUID Extension"

UUID_CHECK=$($DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" exec -T db-test psql -U postgres -d stemlab_test -tAc "SELECT COUNT(*) FROM pg_extension WHERE extname='uuid-ossp';")
if [ "$UUID_CHECK" -eq "1" ]; then
    print_success "UUID extension (uuid-ossp) is enabled"
else
    print_error "UUID extension (uuid-ossp) is NOT enabled"
    print_info "Migration should have: CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
    exit 1
fi

#==============================================================================
# STEP 7: Seed test database
#==============================================================================
print_step "Seed Test Database"

npm run seed:e2e --workspace=packages/database

print_success "Database seeded with test data"

#==============================================================================
# STEP 8: Start API and web servers
#==============================================================================
print_step "Start API and Web Servers"

$DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" up -d api-test web-test
print_success "API and Web containers started"

#==============================================================================
# STEP 9a: Wait for API to be healthy
#==============================================================================
print_step "Wait for API to be Ready"
print_info "Timeout: ${TIMEOUT_SERVICE}s"
print_info "URL: http://localhost:3001/health"

timeout $TIMEOUT_SERVICE bash -c '
    while ! curl -f http://localhost:3001/health 2>/dev/null; do
        echo "Waiting for API..."
        sleep 2
    done
' || {
    print_error "API failed to become ready within ${TIMEOUT_SERVICE}s"
    print_info "Showing API logs:"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs api-test
    exit 1
}
print_success "API is ready"

# Show API health status
API_HEALTH=$(curl -s http://localhost:3001/health | jq '.' 2>/dev/null || curl -s http://localhost:3001/health)
print_info "API Health: $API_HEALTH"

#==============================================================================
# STEP 9b: Wait for web server to be ready
#==============================================================================
print_step "Wait for Web Server to be Ready"
print_info "Timeout: ${TIMEOUT_SERVICE}s"
print_info "URL: http://localhost:5173"

timeout $TIMEOUT_SERVICE bash -c '
    while ! curl -f http://localhost:5173 2>/dev/null; do
        echo "Waiting for web server..."
        sleep 2
    done
' || {
    print_error "Web server failed to become ready within ${TIMEOUT_SERVICE}s"
    print_info "Showing web logs:"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs web-test
    exit 1
}
print_success "Web server is ready"

#==============================================================================
# STEP 10: Install Playwright Browsers
#==============================================================================
print_step "Install Playwright Browsers"
cd apps/web

# Install specific browser based on project
case "$PROJECT" in
    chromium-desktop|chromium-scaled|mobile-touch|mobile-portrait)
        print_info "Installing Chromium for project: $PROJECT"
        npx playwright install --with-deps chromium
        ;;
    firefox-desktop)
        print_info "Installing Firefox for project: $PROJECT"
        npx playwright install --with-deps firefox
        ;;
    webkit-desktop)
        print_info "Installing WebKit for project: $PROJECT"
        npx playwright install --with-deps webkit
        ;;
    *)
        print_warning "Unknown project: $PROJECT. Installing all browsers."
        npx playwright install --with-deps
        ;;
esac

print_success "Playwright browsers installed"
cd ../..

#==============================================================================
# STEP 11: Run Playwright tests
#==============================================================================
print_step "Run Playwright Tests"
cd apps/web

export CI=true
export PLAYWRIGHT_SKIP_SERVER=true
export BASE_URL=http://localhost:5173

print_info "Project: $PROJECT"
print_info "Base URL: $BASE_URL"
print_info "CI Mode: true"

if npm run test:e2e -- --project="$PROJECT"; then
    print_success "Tests passed!"
    TEST_RESULT=0
else
    print_error "Tests failed!"
    TEST_RESULT=1
fi

cd ../..

#==============================================================================
# Show Results
#==============================================================================
print_step "Test Results Summary"

if [ $TEST_RESULT -eq 0 ]; then
    print_success "All tests passed for project: $PROJECT"
    echo ""
    print_info "View the HTML report with:"
    echo "  cd apps/web && npm run test:e2e:report"
else
    print_error "Tests failed for project: $PROJECT"
    echo ""
    print_info "View the HTML report with:"
    echo "  cd apps/web && npm run test:e2e:report"
    echo ""
    print_info "Show Docker logs:"
    echo "  docker compose -f docker-compose.test.yml logs"
fi

#==============================================================================
# STEP 12: Show Docker Compose logs (only on failure)
#==============================================================================
if [ $TEST_RESULT -ne 0 ]; then
    print_step "Docker Compose Logs (on failure)"
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs --tail=100
fi

#==============================================================================
# STEP 13: Cleanup happens automatically via trap
#==============================================================================

exit $TEST_RESULT
