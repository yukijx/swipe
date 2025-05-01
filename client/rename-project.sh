#!/bin/bash

# Swipe Project Reorganization Script
# This script automates the renaming of files and updating navigation references
# according to the renaming plan in RENAMING_GUIDE.md

# Set -e to exit on error
set -e

echo "=== Swipe Project Reorganization ==="
echo "This script will rename files according to the plan in RENAMING_GUIDE.md"
echo "Make sure you have committed or backed up your changes before proceeding."
read -p "Press Enter to continue or Ctrl+C to cancel..." 

# Create a new directory for renamed files
mkdir -p src/pages_new

# File mapping (old path → new path, component name)
declare -A FILE_MAP=(
  # Auth Pages
  ["src/pages/Login.tsx"]="src/pages_new/AuthLogin.tsx AuthLogin"
  ["src/pages/Register.tsx"]="src/pages_new/AuthRegister.tsx AuthRegister"
  ["src/pages/ChangePassword.tsx"]="src/pages_new/AuthChangePassword.tsx AuthChangePassword"
  
  # Profile Pages
  ["src/pages/StudentSetup.tsx"]="src/pages_new/ProfileSetupStudent.tsx ProfileSetupStudent"
  ["src/pages/ProfessorSetup.tsx"]="src/pages_new/ProfileSetupFaculty.tsx ProfileSetupFaculty"
  ["src/pages/ProfileSettings.tsx"]="src/pages_new/ProfileManagement.tsx ProfileManagement"
  ["src/pages/StudentInfo.tsx"]="src/pages_new/ProfileView.tsx ProfileView"
  
  # Home Screens
  ["src/pages/Home.tsx"]="src/pages_new/HomeStudent.tsx HomeStudent"
  ["src/pages/FacultyHome.tsx"]="src/pages_new/HomeFaculty.tsx HomeFaculty"
  
  # Listing Management
  ["src/pages/CreateListing.tsx"]="src/pages_new/ListingCreate.tsx ListingCreate"
  ["src/pages/ListListings.tsx"]="src/pages_new/ListingManagement.tsx ListingManagement"
  ["src/pages/Listing.tsx"]="src/pages_new/ListingDetail.tsx ListingDetail"
  ["src/pages/Filter.tsx"]="src/pages_new/ListingFilter.tsx ListingFilter"
  
  # Match & Swipe
  ["src/pages/Swipe.tsx"]="src/pages_new/SwipeCards.tsx SwipeCards"
  ["src/pages/Matches.tsx"]="src/pages_new/StudentMatches.tsx StudentMatches"
  ["src/pages/FacultyMatches.tsx"]="src/pages_new/FacultyInterestedStudents.tsx FacultyInterestedStudents"
  
  # Settings Pages
  ["src/pages/Settings.tsx"]="src/pages_new/SettingsMain.tsx SettingsMain"
  ["src/pages/AppSettings.tsx"]="src/pages_new/SettingsApplication.tsx SettingsApplication"
  ["src/pages/SecuritySettings.tsx"]="src/pages_new/SettingsSecurity.tsx SettingsSecurity"
  ["src/pages/PrivacySettings.tsx"]="src/pages_new/SettingsPrivacy.tsx SettingsPrivacy"
)

# Navigation mapping (old → new)
declare -A NAV_MAP=(
  ["Login"]="AuthLogin"
  ["Register"]="AuthRegister"
  ["ChangePassword"]="AuthChangePassword"
  ["StudentSetup"]="ProfileSetupStudent"
  ["ProfessorSetup"]="ProfileSetupFaculty"
  ["ProfileSettings"]="ProfileManagement"
  ["StudentInfo"]="ProfileView"
  ["Home"]="HomeStudent"
  ["FacultyHome"]="HomeFaculty"
  ["CreateListing"]="ListingCreate"
  ["ListListings"]="ListingManagement"
  ["Listing"]="ListingDetail"
  ["Filter"]="ListingFilter"
  ["Swipe"]="SwipeCards"
  ["Matches"]="StudentMatches"
  ["FacultyMatches"]="FacultyInterestedStudents"
  ["Settings"]="SettingsMain"
  ["AppSettings"]="SettingsApplication"
  ["SecuritySettings"]="SettingsSecurity"
  ["PrivacySettings"]="SettingsPrivacy"
)

# Step 1: Copy and update navigation types
echo "Creating new navigation types file..."
cp src/navigation/newTypes.tsx src/navigation/types.tsx.new

# Step 2: Copy and rename each file
echo "Creating renamed files..."
for old_path in "${!FILE_MAP[@]}"; do
  # Split the value into new_path and component_name
  IFS=' ' read -r new_path component_name <<< "${FILE_MAP[$old_path]}"
  
  # Get the old component name (filename without extension and path)
  old_filename=$(basename "$old_path")
  old_component_name="${old_filename%.*}"
  
  echo "Processing $old_path → $new_path (Renaming $old_component_name to $component_name)"
  
  if [ -f "$old_path" ]; then
    # Copy the file
    cp "$old_path" "$new_path"
    
    # Update the component name
    sed -i "s/const $old_component_name/const $component_name/g" "$new_path"
    sed -i "s/export default $old_component_name/export default $component_name/g" "$new_path"
    
    # Update navigation references
    for old_nav in "${!NAV_MAP[@]}"; do
      new_nav="${NAV_MAP[$old_nav]}"
      sed -i "s/navigation.navigate('$old_nav'/navigation.navigate('$new_nav'/g" "$new_path"
    done
  else
    echo "Warning: Source file $old_path not found"
  fi
done

# Step 3: Create the updated App.tsx
echo "Creating updated App.tsx..."
cp src/navigation/NewApp.tsx src/navigation/App.tsx.new

# Step 4: Update NavBar component
echo "Updating NavBar component..."
cp src/components/NavBar.tsx src/components/NavBar.tsx.new

echo ""
echo "=== Processing Complete ==="
echo "New files have been created in src/pages_new/"
echo "Review these files and then run the following to apply the changes:"
echo ""
echo "  # Apply new files"
echo "  mv src/navigation/types.tsx.new src/navigation/types.tsx"
echo "  mv src/navigation/App.tsx.new src/navigation/App.tsx"
echo "  mv src/components/NavBar.tsx.new src/components/NavBar.tsx"
echo "  rm -rf src/pages"
echo "  mv src/pages_new src/pages"
echo ""
echo "Run npm start to test the changes before finalizing."
echo ""
echo "Note: You'll need to handle unused files separately:"
echo "  rm src/pages/SupportSettings.tsx"
echo "  rm src/pages/SupportAbout.tsx"  
echo "  rm src/pages/StudentProfileSettings.tsx"
echo "  rm src/pages/UpdateStudentProfile.tsx" 