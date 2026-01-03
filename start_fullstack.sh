#!/bin/bash

echo "========================================"
echo "JalDrishti - Full Stack Quick Start"
echo "========================================"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Step 1: Starting Backend API..."
echo ""

# Start backend in background
uvicorn app.main:app --reload &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
echo "Waiting for backend to initialize..."
sleep 5

echo ""
echo "Step 2: Starting Frontend Dashboard..."
echo ""

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!

echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "========================================"
echo "JalDrishti is running!"
echo "========================================"
echo ""
echo "Backend API: http://localhost:8000"
echo "Frontend Dashboard: http://localhost:3000"
echo ""
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
