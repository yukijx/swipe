#!/bin/bash

# Swipe Project Renaming Finalization Script
# Use this script to apply changes after testing with rename-project.sh

echo "=== Swipe Project Renaming Finalization ==="
echo "This script will apply all the renaming changes permanently."
echo "Make sure you have tested the changes and everything works correctly!"
read -p "Press Enter to continue or Ctrl+C to cancel..." 

# Check that the temporary files exist
if [ ! -d "src/pages_new" ]; then
    echo "Error: src/pages_new directory not found. Run rename-project.sh first."
    exit 1
fi

if [ ! -f "src/navigation/types.tsx.new" ]; then
    echo "Error: src/navigation/types.tsx.new not found. Run rename-project.sh first."
    exit 1
fi

# Backup original files
echo "Backing up original files..."
mkdir -p backup/navigation
mkdir -p backup/components
mkdir -p backup/pages

cp src/navigation/types.tsx backup/navigation/
cp src/navigation/App.tsx backup/navigation/
cp src/components/NavBar.tsx backup/components/
cp -r src/pages backup/

# Apply the changes
echo "Applying changes..."
mv src/navigation/types.tsx.new src/navigation/types.tsx
mv src/navigation/App.tsx.new src/navigation/App.tsx
mv src/components/NavBar.tsx.new src/components/NavBar.tsx

# Remove old pages and replace with new ones
rm -rf src/pages
mv src/pages_new src/pages

# Remove unused files
echo "Removing unused files..."
rm -f src/pages/SupportSettings.tsx
rm -f src/pages/SupportAbout.tsx
rm -f src/pages/StudentProfileSettings.tsx
rm -f src/pages/UpdateStudentProfile.tsx

echo ""
echo "=== Renaming Complete ==="
echo "Your project has been reorganized according to the new structure."
echo "Original files have been backed up to the 'backup' directory."
echo "Run 'npm start' to test the changes. If there are any issues, use:"
echo ""
echo "  # To restore from backup"
echo "  cp -r backup/pages src/"
echo "  cp backup/navigation/types.tsx src/navigation/"
echo "  cp backup/navigation/App.tsx src/navigation/"
echo "  cp backup/components/NavBar.tsx src/components/" 