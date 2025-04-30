// In App.tsx or a separate types file
export type StackParamList = {
    // Screens with no params
    Login: undefined;
    Register: undefined;
    Settings: undefined;
    ProfileSettings: undefined;
    SecuritySettings: undefined;
    AppSettings: undefined;
    Home: undefined;
    FacultyHome: undefined;
    StudentSetup: undefined;
    ProfessorSetup: undefined;
    Swipe: undefined;
    Matches: undefined;
    FacultyMatches: undefined;
    PrivacySettings: undefined;
    ChangePassword: undefined;
  
    // Screens with parameters
    // (Adjust these as needed for your app)
    StudentInfo: { studentId: string } | undefined;
    CreateFacultyProfile: { facultyId?: string } | undefined;
    CreateListing: {
      isEditing?: boolean;
      listing?: any;
    };
    Listing: { listingId: string } | undefined;
    ListListings: { 
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
    Filter: { 
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
};
  