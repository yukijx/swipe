# Database Management Tools

This directory contains scripts to help manage your MongoDB database for the Swipe application.

## Clearing the Database

If you need to clear your database (e.g., to remove old schema versions or start fresh), you can use the database clearing scripts.

### On Windows (PowerShell)

```powershell
# Interactive mode (recommended for first use)
.\clear-database.ps1

# Clear all collections at once
.\clear-database.ps1 all

# Clear specific collections
.\clear-database.ps1 users listings swipes
```

### On macOS/Linux (Bash)

```bash
# Make the script executable first (one-time setup)
chmod +x clear-database.sh

# Interactive mode (recommended for first use)
./clear-database.sh

# Clear all collections at once
./clear-database.sh all

# Clear specific collections
./clear-database.sh users listings swipes
```

## Generating Sample Data

You can generate sample listings for a faculty member using the sample data generation scripts.

### On Windows (PowerShell)

```powershell
# Generate 10 sample listings for a faculty member
.\generate-sample-data.ps1 <faculty-id>

# Generate a specific number of listings
.\generate-sample-data.ps1 <faculty-id> 20
```

### On macOS/Linux (Bash)

```bash
# Make the script executable first (one-time setup)
chmod +x generate-sample-data.sh

# Generate 10 sample listings for a faculty member
./generate-sample-data.sh <faculty-id>

# Generate a specific number of listings
./generate-sample-data.sh <faculty-id> 20
```

## How to Find Faculty ID

To find a faculty ID:

1. Log in as a faculty user
2. Open your browser developer tools (F12)
3. Go to the Application tab
4. Look for LocalStorage under the Storage section
5. Click on your app's domain
6. Find the "token" entry
7. Decode the JWT token at [jwt.io](https://jwt.io) to see the user ID

Alternatively, you can check the MongoDB database directly:

```javascript
// Using MongoDB Compass or mongo shell
db.users.findOne({isFaculty: true})
```

## Safety Notes

- The database clearing tools will ask for confirmation before deleting data
- Always backup your database before performing destructive operations
- In production, these scripts should be used with extreme caution 