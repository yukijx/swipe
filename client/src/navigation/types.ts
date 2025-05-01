export type StackParamList = {
  AppSettings: undefined;
  ChangePassword: undefined;
  CreateFacultyProfile: { facultyId?: string } | undefined;
  CreateListing: {
    isEditing?: boolean;
    listing?: any;
  } | undefined;
  DeveloperSettings: undefined;
  FacultyHome: undefined;
  FacultyMatches: undefined;
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
  Home: undefined;
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
  Login: undefined;
  Matches: undefined;
  PrivacySettings: undefined;
  ProfessorSetup: undefined;
  ProfileSettings: undefined;
  Register: undefined;
  Settings: undefined;
  SecuritySettings: undefined;
  StudentInfo: { studentId?: string } | undefined;
  StudentSetup: undefined;
  StudentSwipeHistory: undefined;
  Swipe: undefined;
}; 