# A PowerShell script to generate sample listings data

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

# Check if the first argument is provided
if (-not $args[0]) {
    Write-Host "Error: Faculty ID is required."
    Write-Host "Usage: .\generate-sample-data.ps1 <facultyId> [numberOfListings]"
    exit 1
}

# Get arguments
$facultyId = $args[0]
$numListings = if ($args[1]) { $args[1] } else { 10 }  # Default to 10 listings if not specified

# Run the generate_listings.js script
Write-Host "Generating $numListings sample listings for faculty ID: $facultyId"
node scripts/generate_listings.js $facultyId $numListings

# Print success message if the script exits successfully
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sample data generation completed successfully!"
    Write-Host "You can now check the listings for this faculty."
} 