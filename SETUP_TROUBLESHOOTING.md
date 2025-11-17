# Local Development Setup Guide

## Issue Summary

The system encountered these issues:
1. ✅ **FIXED**: `@stemlab/shared-types` package wasn't built
2. ❌ Docker isn't available in WSL2
3. ❌ PostgreSQL service isn't running

## Quick Fix Options

### Option 1: Use Docker Desktop (Recommended for Production-Like Setup)

1. **Enable WSL2 Integration in Docker Desktop:**
   - Open Docker Desktop on Windows
   - Go to Settings → Resources → WSL Integration
   - Enable integration for your WSL2 distro
   - Click "Apply & Restart"

2. **Then run:**
   ```bash
   cd /home/user/wise-lab-helper
   docker-compose up -d db
   cd packages/database && node migrate.js
   cd ../.. && npm run dev --workspace=apps/api
   ```

### Option 2: Start PostgreSQL Service in WSL2

PostgreSQL is installed but not running. Start it:

```bash
# Fix sudo permissions (if needed)
# This might require running from a root shell or fixing ownership

# OR start PostgreSQL as your user
pg_ctl -D /var/lib/postgresql/data -l /tmp/logfile start

# OR create a local PostgreSQL cluster
initdb -D ~/postgres-data
pg_ctl -D ~/postgres-data -l ~/postgres.log start
createdb stemlab_dev
```

Then create the database and user:
```bash
psql -c "CREATE USER stemlab WITH PASSWORD 'stemlab_dev_password';"
psql -c "CREATE DATABASE stemlab_dev OWNER stemlab;"
```

### Option 3: Use SQLite for Local Development (Easiest)

I can modify the database service to support SQLite as an alternative for local development. This requires no database server.

**Do you want me to add SQLite support?**

## What Was Fixed

✅ Built the `@stemlab/shared-types` package successfully

The shared types are now available and the module resolution error is fixed.

## Current Status

```
📦 Dependencies: ✅ Installed
🔧 Shared Types: ✅ Built
🗄️  Database: ❌ Not running
🚀 API Server: ⏸️  Waiting for database
```

## Recommended Next Steps

**For quickest setup:**
1. Enable Docker Desktop WSL2 integration (Option 1)
2. Or let me add SQLite support for local dev (Option 3)

**Which option would you prefer?**
