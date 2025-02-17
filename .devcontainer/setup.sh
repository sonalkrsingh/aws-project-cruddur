#!/bin/bash

echo "🔧 Installing Node.js Dependencies..."
cd /workspaces/${localWorkspaceFolderBasename}/frontend-react-js
npm install

echo "🔧 Installing Backend Dependencies..."
cd /workspaces/${localWorkspaceFolderBasename}/backend-flask
pip install -r requirements.txt

echo "🔧 Installing PostgreSQL Client..."
sudo apt update && sudo apt install -y postgresql-client libpq-dev

echo "✅ Setup Complete!"
