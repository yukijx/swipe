# A PowerShell script to clear the MongoDB database

# Check if node is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion"
}
catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js first."
    exit 1
}

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to the script directory
Set-Location $scriptDir

# Run the clear_database.js script
Write-Host "🗑️  Database cleanup utility"
Write-Host "============================"

if ($args.Count -eq 0) {
    # If no arguments provided, run the interactive mode
    node scripts/clear_database.js
}
else {
    # Otherwise, pass all arguments to the script
    node scripts/clear_database.js $args
} 