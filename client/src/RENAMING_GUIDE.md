# Project Renaming Guide

This document outlines the strategy for renaming files and updating navigation in the Swipe application to improve clarity and maintainability.

## File Renaming Plan

### Authentication Pages
- `Login.tsx` → `AuthLogin.tsx`
- `Register.tsx` → `AuthRegister.tsx`
- `ChangePassword.tsx` → `AuthChangePassword.tsx`

### Profile Setup & Management
- `StudentSetup.tsx` → `ProfileSetupStudent.tsx`
- `ProfessorSetup.tsx` → `ProfileSetupFaculty.tsx`
- `ProfileSettings.tsx` → `ProfileManagement.tsx`
- `StudentInfo.tsx` → `ProfileView.tsx`

### Home Screens
- `Home.tsx` → `HomeStudent.tsx`
- `FacultyHome.tsx` → `HomeFaculty.tsx`

### Listing Management
- `CreateListing.tsx` → `ListingCreate.tsx`
- `ListListings.tsx` → `ListingManagement.tsx`
- `Listing.tsx` → `ListingDetail.tsx`

### Match & Swipe Related
- `Swipe.tsx` → `SwipeCards.tsx`
- `Matches.tsx` → `StudentMatches.tsx`
- `FacultyMatches.tsx` → `FacultyInterestedStudents.tsx`
- `StudentSwipeHistory.tsx` → (already appropriately named)
- `Filter.tsx` → `ListingFilter.tsx`

### Settings Pages
- `Settings.tsx` → `SettingsMain.tsx`
- `AppSettings.tsx` → `SettingsApplication.tsx`
- `SecuritySettings.tsx` → `SettingsSecurity.tsx`
- `PrivacySettings.tsx` → `SettingsPrivacy.tsx`

## Unused Pages To Be Removed
1. `SupportSettings.tsx`
2. `SupportAbout.tsx` 
3. `StudentProfileSettings.tsx`
4. `UpdateStudentProfile.tsx`

## Implementation Steps

### 1. Create New Files
Create the renamed versions of each file, updating component names and references to renamed files. Example:
```jsx
// In AuthLogin.tsx (formerly Login.tsx)
const AuthLogin = ({ navigation }) => { ... }
// Update navigation.navigate('Register') to navigation.navigate('AuthRegister')
```

### 2. Update Navigation Types
Update the navigation type definitions in `types.tsx` to reflect the new screen names:
```tsx
export type StackParamList = {
  AuthLogin: undefined;
  AuthRegister: undefined;
  // ...etc
};
```

### 3. Update App.tsx Navigation
Update the navigation stack in App.tsx to use the new component names and screen names:
```jsx
<Stack.Navigator>
  <Stack.Screen name="AuthLogin" component={AuthLogin} />
  <Stack.Screen name="AuthRegister" component={AuthRegister} />
  {/* ...etc */}
</Stack.Navigator>
```

### 4. Update Navigation References
Update all navigation references across components:
- `navigation.navigate('Login')` → `navigation.navigate('AuthLogin')`
- `navigation.navigate('Register')` → `navigation.navigate('AuthRegister')`
- etc.

### 5. Update NavBar and Other Navigation Components
Update any components that handle navigation directly:
```jsx
onPress={() => navigation.navigate(isFaculty ? 'HomeFaculty' : 'HomeStudent')}
```

### 6. Delete Unused Files
After confirming the application is working correctly with the new structure, delete the unused files.

## Testing Procedure
1. Test all navigation flows
2. Verify login/register/authentication flows
3. Test student and faculty specific screens
4. Verify all listing management functions
5. Test matching and swiping functionality
6. Test settings screens

## Future Considerations
- Consider implementing a more robust navigation system with nested navigators
- Add type checking for navigation parameters throughout the codebase
- Implement comprehensive error handling for navigation edge cases 