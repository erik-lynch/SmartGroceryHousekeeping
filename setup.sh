#!/bin/bash

echo "Installing root dependencies using npm ci..."
npm ci

echo "Installing frontend dependencies using npm ci..."
cd frontend
npm ci
cd ..

echo "Installing backend dependencies using npm ci..."
cd backend
npm ci
cd ..

echo "Setup complete."
