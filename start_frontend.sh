#!/bin/bash

echo "================================"
echo "JalDrishti Frontend - Quick Start"
echo "================================"
echo ""

cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
else
    echo "Dependencies already installed."
    echo ""
fi

echo "Starting Next.js development server..."
echo ""
echo "Dashboard will be available at:"
echo "http://localhost:3000"
echo ""
echo "API Backend should be running at:"
echo "http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
