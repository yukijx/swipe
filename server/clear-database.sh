#!/bin/bash

# A script to clear the MongoDB database

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

# Run the clear_database.js script
echo "🗑️  Database cleanup utility"
echo "============================"

if [ $# -eq 0 ]; then
    # If no arguments provided, run the interactive mode
    node scripts/clear_database.js
else
    # Otherwise, pass all arguments to the script
    node scripts/clear_database.js "$@"
fi 