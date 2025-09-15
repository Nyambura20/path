#!/bin/bash

# BrightPath Frontend Setup Script
# This script will install dependencies and start the development server

echo "🚀 BrightPath Frontend Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 16+ and try again."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Navigate to frontend directory
cd "$(dirname "$0")"

echo ""
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."

# Install dependencies
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    echo "   Try running: npm install --legacy-peer-deps"
    exit 1
fi

echo "✅ Dependencies installed successfully"

echo ""
echo "🔧 Checking configuration..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating default configuration..."
    cat > .env << EOL
# BrightPath Frontend Environment Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENV=development
GENERATE_SOURCEMAP=true
BROWSER=none
EOL
    echo "✅ Created .env file with default settings"
else
    echo "✅ .env file exists"
fi

echo ""
echo "🎨 Verifying Tailwind CSS setup..."

# Check if Tailwind config exists
if [ ! -f tailwind.config.js ]; then
    echo "❌ Tailwind configuration missing"
    exit 1
fi

echo "✅ Tailwind CSS configured"

echo ""
echo "🔍 Backend Check..."
echo "Checking if Django backend is running on http://localhost:8000..."

# Check if backend is running
if curl -s http://localhost:8000/api/ > /dev/null 2>&1; then
    echo "✅ Backend is running and accessible"
else
    echo "⚠️  Backend not detected on http://localhost:8000"
    echo "   Make sure your Django backend is running before starting the frontend"
    echo "   You can start it with: python manage.py runserver"
fi

echo ""
echo "🚀 Setup Complete!"
echo "================================"
echo ""
echo "To start the development server:"
echo "  npm start"
echo ""
echo "To build for production:"
echo "  npm run build"
echo ""
echo "The application will be available at:"
echo "  http://localhost:3000"
echo ""
echo "Make sure your Django backend is running on:"
echo "  http://localhost:8000"
echo ""

# Ask if user wants to start the dev server
read -p "Would you like to start the development server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting development server..."
    npm start
fi
