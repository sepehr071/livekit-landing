#!/bin/bash

# React LiveKit Integration - Dependency Installation Script
echo "🚀 Installing React LiveKit Integration Dependencies..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Verify installations
echo "✅ Verifying installations..."

# Check if key dependencies are installed
if npm list livekit-client > /dev/null 2>&1; then
    echo "✅ livekit-client installed successfully"
else
    echo "❌ livekit-client installation failed"
fi

if npm list @livekit/components-react > /dev/null 2>&1; then
    echo "✅ @livekit/components-react installed successfully"
else
    echo "❌ @livekit/components-react installation failed"
fi

if npm list @rive-app/canvas > /dev/null 2>&1; then
    echo "✅ @rive-app/canvas installed successfully"
else
    echo "❌ @rive-app/canvas installation failed"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Ensure Flask backend is running on port 5050"
echo "2. Configure your .env file with LiveKit and OpenRouter credentials"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Visit http://localhost:5173 to test the application"
echo ""
echo "📖 For detailed instructions, see IMPLEMENTATION_GUIDE.md"