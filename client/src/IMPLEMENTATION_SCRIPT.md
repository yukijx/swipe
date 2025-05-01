# Swipe Project Reorganization Implementation Script

This document provides a step-by-step guide for implementing the file renaming and reorganization plan for the Swipe application.

## Preparation

```bash
# Create a new feature branch
git checkout -b feature/project-reorganization

# Ensure you're working with the latest code
git pull origin main
```

## Step 1: Create the New Navigation Types

```bash
# Create the new navigation types file
touch src/navigation/newTypes.tsx
```

Edit `src/navigation/newTypes.tsx` and add the updated navigation type definitions.

## Step 2: Authentication Pages

```bash
# Create the renamed authentication pages
cp src/pages/Login.tsx src/pages/AuthLogin.tsx
cp src/pages/Register.tsx src/pages/AuthRegister.tsx
cp src/pages/ChangePassword.tsx src/pages/AuthChangePassword.tsx
```

Update each file to use the new component names and navigation references.

## Step 3: Profile Pages

```bash
# Create the renamed profile pages
cp src/pages/StudentSetup.tsx src/pages/ProfileSetupStudent.tsx
cp src/pages/ProfessorSetup.tsx src/pages/ProfileSetupFaculty.tsx
cp src/pages/ProfileSettings.tsx src/pages/ProfileManagement.tsx
cp src/pages/StudentInfo.tsx src/pages/ProfileView.tsx
```

Update each file to use the new component names and navigation references.

## Step 4: Home Screens

```bash
# Create the renamed home screens
cp src/pages/Home.tsx src/pages/HomeStudent.tsx
cp src/pages/FacultyHome.tsx src/pages/HomeFaculty.tsx
```

Update each file to use the new component names and navigation references.

## Step 5: Listing Management Pages

```bash
# Create the renamed listing management pages
cp src/pages/CreateListing.tsx src/pages/ListingCreate.tsx
cp src/pages/ListListings.tsx src/pages/ListingManagement.tsx
cp src/pages/Listing.tsx src/pages/ListingDetail.tsx
cp src/pages/Filter.tsx src/pages/ListingFilter.tsx
```

Update each file to use the new component names and navigation references.

## Step 6: Match & Swipe Pages

```bash
# Create the renamed match and swipe pages
cp src/pages/Swipe.tsx src/pages/SwipeCards.tsx
cp src/pages/Matches.tsx src/pages/StudentMatches.tsx
cp src/pages/FacultyMatches.tsx src/pages/FacultyInterestedStudents.tsx
```

Update each file to use the new component names and navigation references.

## Step 7: Settings Pages

```bash
# Create the renamed settings pages
cp src/pages/Settings.tsx src/pages/SettingsMain.tsx
cp src/pages/AppSettings.tsx src/pages/SettingsApplication.tsx
cp src/pages/SecuritySettings.tsx src/pages/SettingsSecurity.tsx
cp src/pages/PrivacySettings.tsx src/pages/SettingsPrivacy.tsx
```

Update each file to use the new component names and navigation references.

## Step 8: Update Navigation

```bash
# Create a new App.tsx with updated navigation
cp src/navigation/App.tsx src/navigation/App.tsx.bak
```

Edit `src/navigation/App.tsx` to use the new component names and screen names.

## Step 9: Update NavBar Component

Edit `src/components/NavBar.tsx` to use the new screen names in navigation references.

## Step 10: Testing

Build and run the application to test the changes:

```bash
# Start the development server
npm start
```

Test all navigation flows and functionality to ensure everything works as expected.

## Step 11: Finalize Changes

Once testing is complete, remove the original files:

```bash
# Remove unused files
rm src/pages/SupportSettings.tsx
rm src/pages/SupportAbout.tsx
rm src/pages/StudentProfileSettings.tsx
rm src/pages/UpdateStudentProfile.tsx

# Remove old files that have been replaced
rm src/pages/Login.tsx
rm src/pages/Register.tsx
rm src/pages/ChangePassword.tsx
# ... and so on for all replaced files
```

## Step 12: Commit and Push Changes

```bash
# Add all changes
git add .

# Commit the changes
git commit -m "Reorganize project structure and improve file naming"

# Push the changes to the remote repository
git push -u origin feature/project-reorganization
```

## Step 13: Create Pull Request

Create a pull request to merge the changes into the main branch.

## Additional Notes

- If you encounter any issues during implementation, resolve them before proceeding to the next step
- Ensure all imports and navigation references are updated correctly
- Keep the old files until testing is complete, then remove them
- Consider implementing the changes in smaller, focused pull requests if needed 