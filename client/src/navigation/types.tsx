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
    PrivacySettings: undefined;
    ChangePassword: undefined;
  
    // Screens with parameters
    // (Adjust these as needed for your app)
    StudentInfo: { studentId: string } | undefined;
    CreateFacultyProfile: { facultyId?: string } | undefined;
    CreateListing: { listingId?: string } | undefined;
    Listing: { listingId: string } | undefined;
    ListListings: { filter?: string } | undefined;
    Filter: { filterType?: string } | undefined;
  };
  