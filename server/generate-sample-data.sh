#!/bin/bash

# A script to generate sample listings data

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

# Check if the first argument is provided
if [ -z "$1" ]; then
    echo "Error: Faculty ID is required."
    echo "Usage: $0 <facultyId> [numberOfListings]"
    exit 1
fi

# Get arguments
FACULTY_ID="$1"
NUM_LISTINGS="${2:-10}"  # Default to 10 listings if not specified

# Run the generate_listings.js script
echo "Generating $NUM_LISTINGS sample listings for faculty ID: $FACULTY_ID"
node scripts/generate_listings.js "$FACULTY_ID" "$NUM_LISTINGS"

# Print success message if the script exits successfully
if [ $? -eq 0 ]; then
    echo "✅ Sample data generation completed successfully!"
    echo "You can now check the listings for this faculty."
fi 