# Deployment Troubleshooting Guide

This document describes how to build and deploy the application locally, and explains the specific deployment failure that was fixed.

## Local Build and Deploy Commands

### Prerequisites
- Install `dfx` (Internet Computer SDK)
- Install `pnpm` (or `npm`)

### Standard Build and Deploy Process

1. **Start the local Internet Computer replica:**
   ```bash
   dfx start --clean --background
   ```

2. **Deploy the backend and frontend:**
   ```bash
   dfx deploy
   ```

3. **For frontend development with hot reload:**
   ```bash
   cd frontend
   pnpm start
   ```

4. **Build frontend for production:**
   ```bash
   cd frontend
   pnpm build
   ```

## Previous Deployment Failure

### The Problem
The deployment was failing during the frontend build step with a TypeScript/Vite compilation error. The root cause was in `frontend/src/hooks/useInternetIdentity.ts` on line 53:

