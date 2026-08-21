#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Installing dependencies..."
pnpm install

echo "Starting the project in development mode..."
pnpm run dev
