// In App.tsx or a separate types file
export type StackParamList = {
    // Auth Screens
    AuthLogin: undefined;
    AuthRegister: undefined;
    AuthChangePassword: undefined;
    
    // Profile Setup & Management
    ProfileSetupStudent: undefined;
    ProfileSetupFaculty: undefined;
    ProfileManagement: undefined;
    ProfileView: { studentId: string } | undefined;
    
    // Home Screens
    HomeStudent: undefined;
    HomeFaculty: undefined;
    
    // Listing Management
    ListingCreate: {
      isEditing?: boolean;
      listing?: any;
    };
    ListingManagement: { 
      filter?: string;
      filteredListings?: any[];
      filters?: {
        searchTerm?: string;
        minWage?: string;
        maxWage?: string;
        wageType?: string;
        durationMin?: string;
        durationUnit?: string;
        isPaid?: boolean | null;
      }
    } | undefined;
    ListingDetail: { listingId: string } | undefined;
    ListingFilter: { 
      filterType?: string;
      filters?: {
        searchTerm?: string;
        minWage?: string;
        maxWage?: string;
        wageType?: string;
        durationMin?: string;
        durationUnit?: string;
        isPaid?: boolean | null;
      }
    } | undefined;
    
    // Match & Swipe Related
    SwipeCards: undefined;
    StudentMatches: undefined;
    FacultyInterestedStudents: undefined;
    StudentSwipeHistory: undefined;
    
    // Settings Pages
    SettingsMain: undefined;
    SettingsApplication: undefined;
    SettingsSecurity: undefined;
    SettingsPrivacy: undefined;
    
    // Developer Tools
    DeveloperSettings: undefined;
}; 