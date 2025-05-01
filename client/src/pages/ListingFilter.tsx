import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { StackScreenProps } from "@react-navigation/stack";
import { StackParamList } from "../navigation/types";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { getBackendURL } from "../utils/network";
import ThemedView from "../components/ThemedView";

type Props = StackScreenProps<StackParamList, "Filter">;

interface FilterParams {
  searchTerm?: string;
  minWage?: string;
  maxWage?: string;
  wageType?: string;
  durationMin?: string;
  durationUnit?: string;
  isPaid?: boolean | null;
}

const ListingFilter = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? '#333' : '#fff';
  const backgroundColor = theme === 'light' ? '#fff7d5' : '#333';
  
  // State for filter parameters
  const [filterParams, setFilterParams] = useState<FilterParams>({});
  const [isApplying, setIsApplying] = useState(false);
  
  // Search term input
  const [searchTerm, setSearchTerm] = useState("");
  
  // Wage dropdowns
  const [wageTypeOpen, setWageTypeOpen] = useState(false);
  const [wageTypeValue, setWageTypeValue] = useState<string | null>(null);
  const [wageTypeOptions] = useState([
    { label: "Hourly", value: "hourly" },
    { label: "Monthly", value: "monthly" },
    { label: "Total", value: "total" },
  ]);
  
  // Wage range inputs
  const [minWage, setMinWage] = useState("");
  const [maxWage, setMaxWage] = useState("");
  
  // Duration dropdowns
  const [durationUnitOpen, setDurationUnitOpen] = useState(false);
  const [durationUnitValue, setDurationUnitValue] = useState<string | null>(null);
  const [durationUnitOptions] = useState([
    { label: "Days", value: "days" },
    { label: "Weeks", value: "weeks" },
    { label: "Months", value: "months" },
    { label: "Years", value: "years" },
  ]);
  
  // Duration value input
  const [durationMin, setDurationMin] = useState("");
  
  // Paid/Unpaid dropdown
  const [isPaidOpen, setIsPaidOpen] = useState(false);
  const [isPaidValue, setIsPaidValue] = useState<string | null>(null);
  const [isPaidOptions] = useState([
    { label: "Paid Only", value: "true" },
    { label: "Unpaid Only", value: "false" },
    { label: "Both", value: "null" },
  ]);
  
  // Load any previously saved filters from route params or AsyncStorage
  useEffect(() => {
    const loadFilters = async () => {
      try {
        // Check for filters in route params
        if (route.params?.filters) {
          const savedFilters = route.params.filters;
          setFilterParams(savedFilters);
          
          // Update UI based on saved filters
          setSearchTerm(savedFilters.searchTerm || "");
          setMinWage(savedFilters.minWage || "");
          setMaxWage(savedFilters.maxWage || "");
          setWageTypeValue(savedFilters.wageType || null);
          setDurationMin(savedFilters.durationMin || "");
          setDurationUnitValue(savedFilters.durationUnit || null);
          setIsPaidValue(
            savedFilters.isPaid === true 
              ? "true" 
              : savedFilters.isPaid === false 
                ? "false" 
                : null
          );
        } else {
          // Try to load from AsyncStorage
          const savedFilters = await AsyncStorage.getItem("listingFilters");
          if (savedFilters) {
            const filters = JSON.parse(savedFilters);
            setFilterParams(filters);
            
            // Update UI based on saved filters
            setSearchTerm(filters.searchTerm || "");
            setMinWage(filters.minWage || "");
            setMaxWage(filters.maxWage || "");
            setWageTypeValue(filters.wageType || null);
            setDurationMin(filters.durationMin || "");
            setDurationUnitValue(filters.durationUnit || null);
            setIsPaidValue(
              filters.isPaid === true 
                ? "true" 
                : filters.isPaid === false 
                  ? "false" 
                  : null
            );
          }
        }
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };
    
    loadFilters();
  }, [route.params]);
  
  const handleApplyFilters = async () => {
    try {
      setIsApplying(true);
      
      // Validate inputs that should be numbers
      if (minWage && isNaN(Number(minWage))) {
        Alert.alert("Invalid Input", "Minimum wage must be a number");
        return;
      }
      
      if (maxWage && isNaN(Number(maxWage))) {
        Alert.alert("Invalid Input", "Maximum wage must be a number");
        return;
      }
      
      if (durationMin && isNaN(Number(durationMin))) {
        Alert.alert("Invalid Input", "Duration must be a number");
        return;
      }
      
      // Build filter parameters
      const newFilters: FilterParams = {
        searchTerm: searchTerm.trim() || undefined,
        minWage: minWage || undefined,
        maxWage: maxWage || undefined,
        wageType: wageTypeValue || undefined,
        durationMin: durationMin || undefined,
        durationUnit: durationUnitValue || undefined,
        isPaid: isPaidValue 
          ? isPaidValue === "true" 
            ? true 
            : isPaidValue === "false" 
              ? false 
              : null
          : undefined
      };
      
      // Save filters to AsyncStorage
      await AsyncStorage.setItem("listingFilters", JSON.stringify(newFilters));
      
      // Get auth token
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Authentication Error", "Please log in again");
        navigation.navigate("Login");
        return;
      }
      
      // Test the API endpoint with the filters
      const queryParams = new URLSearchParams();
      if (newFilters.searchTerm) queryParams.append("searchTerm", newFilters.searchTerm);
      if (newFilters.minWage) queryParams.append("minWage", newFilters.minWage);
      if (newFilters.maxWage) queryParams.append("maxWage", newFilters.maxWage);
      if (newFilters.wageType) queryParams.append("wageType", newFilters.wageType);
      if (newFilters.durationMin) queryParams.append("durationMin", newFilters.durationMin);
      if (newFilters.durationUnit) queryParams.append("durationUnit", newFilters.durationUnit);
      if (newFilters.isPaid !== undefined && newFilters.isPaid !== null) {
        queryParams.append("isPaid", String(newFilters.isPaid));
      }
      
      // Try to fetch results with the filters
      const response = await axios.get(
        `${getBackendURL()}/filter-listings?${queryParams}`,
        {
          headers: {
            Authorization: token
          }
        }
      );
      
      const filteredListings = response.data;
      
      // Navigate back to ListListings with the filtered results
      navigation.navigate("ListListings", { 
        filteredListings,
        filters: newFilters
      });
      
    } catch (error) {
      console.error("Error applying filters:", error);
      Alert.alert(
        "Error", 
        "Failed to apply filters. Please check your connection and try again."
      );
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setMinWage("");
    setMaxWage("");
    setWageTypeValue(null);
    setDurationMin("");
    setDurationUnitValue(null);
    setIsPaidValue(null);
    setFilterParams({});
    AsyncStorage.removeItem("listingFilters");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: textColor }]}>Filter Research Opportunities</Text>
        
        {/* Search term */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Search</Text>
          <TextInput 
            style={[styles.textInput, { backgroundColor }]}
            placeholder="Search by keywords"
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        
        {/* Wage filters */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Compensation</Text>
          
          <View style={[styles.dropdownContainer, { zIndex: wageTypeOpen ? 1000 : 0 }]}>
            <DropDownPicker
              open={wageTypeOpen}
              value={wageTypeValue}
              items={wageTypeOptions}
              setOpen={setWageTypeOpen}
              setValue={setWageTypeValue}
              placeholder="Wage Type"
              style={[styles.dropdown, { backgroundColor }]}
              dropDownContainerStyle={styles.dropdownBox}
              textStyle={{ color: textColor }}
            />
          </View>
          
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <TextInput 
                style={[styles.textInput, { backgroundColor }]}
                placeholder="Min Wage"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={minWage}
                onChangeText={setMinWage}
              />
            </View>
            <View style={styles.halfWidth}>
              <TextInput 
                style={[styles.textInput, { backgroundColor }]}
                placeholder="Max Wage"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={maxWage}
                onChangeText={setMaxWage}
              />
            </View>
          </View>
          
          <View style={[styles.dropdownContainer, { zIndex: isPaidOpen ? 900 : 0 }]}>
            <DropDownPicker
              open={isPaidOpen}
              value={isPaidValue}
              items={isPaidOptions}
              setOpen={setIsPaidOpen}
              setValue={setIsPaidValue}
              placeholder="Paid or Unpaid"
              style={[styles.dropdown, { backgroundColor }]}
              dropDownContainerStyle={styles.dropdownBox}
              textStyle={{ color: textColor }}
            />
          </View>
        </View>
        
        {/* Duration filters */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Duration</Text>
          
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <TextInput 
                style={[styles.textInput, { backgroundColor }]}
                placeholder="Min Duration"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={durationMin}
                onChangeText={setDurationMin}
              />
            </View>
            <View style={[styles.halfWidth, { zIndex: durationUnitOpen ? 800 : 0 }]}>
              <DropDownPicker
                open={durationUnitOpen}
                value={durationUnitValue}
                items={durationUnitOptions}
                setOpen={setDurationUnitOpen}
                setValue={setDurationUnitValue}
                placeholder="Unit"
                style={[styles.dropdown, { backgroundColor }]}
                dropDownContainerStyle={styles.dropdownBox}
                textStyle={{ color: textColor }}
              />
            </View>
          </View>
        </View>
        
        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClearFilters}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.applyButton, 
              isApplying ? styles.disabledButton : null
            ]} 
            onPress={handleApplyFilters}
            disabled={isApplying}
          >
            {isApplying ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  filterSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdown: {
    borderColor: "#ddd",
  },
  dropdownBox: {
    borderColor: "#ddd",
  },
  textInput: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#666",
    paddingVertical: 12,
    borderRadius: 6,
    marginRight: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  applyButton: {
    flex: 2,
    backgroundColor: "#893030",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ListingFilter;