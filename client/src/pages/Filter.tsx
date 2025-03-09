import React, { useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView, TextInput } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";

const API_URL = "http://localhost:5000/filter-jobs";

const Filter: React.FC = () => {
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [experienceValue, setExperienceValue] = useState(null);
  const [experienceOptions, setExperienceOptions] = useState([
    { label: "Entry Level", value: "Entry Level" },
    { label: "Mid Level", value: "Mid Level" },
    { label: "Senior Level", value: "Senior Level" },
  ]);

  const [payMin, setPayMin] = useState("");
  const [payMax, setPayMax] = useState("");

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationValue, setLocationValue] = useState(null);
  const [locationOptions, setLocationOptions] = useState([
    { label: "Remote", value: "Remote" },
    { label: "In Person", value: "In Person" },
  ]);

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityValue, setAvailabilityValue] = useState(null);
  const [availabilityOptions, setAvailabilityOptions] = useState([
    { label: "Full-Time", value: "Full-Time" },
    { label: "Part-Time", value: "Part-Time" },
    { label: "Internships", value: "Internships" },
  ]);

  const [employmentOpen, setEmploymentOpen] = useState(false);
  const [employmentValue, setEmploymentValue] = useState(null);
  const [employmentOptions, setEmploymentOptions] = useState([
    { label: "Morning", value: "Morning" },
    { label: "Afternoon", value: "Afternoon" },
    { label: "Night", value: "Night" },
  ]);

  const [filteredJobs, setFilteredJobs] = useState([]);

  const handleApplyFilters = async () => {
    try {
      const filters = {
        experience: experienceValue,
        pay_min: payMin || undefined, 
        pay_max: payMax || undefined,
        location: locationValue,
        jobType: availabilityValue,
        shift: employmentValue,
      };
  
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined)
      );
  
      const response = await axios.get(API_URL, { 
        params: cleanFilters 
      });
      
      setFilteredJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.title}>Filter Preferences</Text>

      <View style={[styles.dropdownContainer, { zIndex: experienceOpen ? 4000 : 1000 }]}>
        <DropDownPicker
          open={experienceOpen}
          value={experienceValue}
          items={experienceOptions}
          setOpen={setExperienceOpen}
          setValue={setExperienceValue}
          setItems={setExperienceOptions}
          placeholder="Select Your Level"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
        />
      </View>

      <Text style={styles.label}>Enter Pay Range ($ per hour)</Text>
      <View style={styles.payContainer}>
        <TextInput
          style={styles.input}
          placeholder="Min"
          keyboardType="numeric"
          value={payMin}
          onChangeText={setPayMin}
        />
        <Text style={styles.toText}>to</Text>
        <TextInput
          style={styles.input}
          placeholder="Max"
          keyboardType="numeric"
          value={payMax}
          onChangeText={setPayMax}
        />
      </View>

      <View style={[styles.dropdownContainer, { zIndex: locationOpen ? 3000 : 900 }]}>
        <DropDownPicker
          open={locationOpen}
          value={locationValue}
          items={locationOptions}
          setOpen={setLocationOpen}
          setValue={setLocationValue}
          setItems={setLocationOptions}
          placeholder="Select Location"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
        />
      </View>

      <View style={[styles.dropdownContainer, { zIndex: availabilityOpen ? 2000 : 800 }]}>
        <DropDownPicker
          open={availabilityOpen}
          value={availabilityValue}
          items={availabilityOptions}
          setOpen={setAvailabilityOpen}
          setValue={setAvailabilityValue}
          setItems={setAvailabilityOptions}
          placeholder="Select Job Type"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
        />
      </View>

      <View style={[styles.dropdownContainer, { zIndex: employmentOpen ? 1000 : 700 }]}>
        <DropDownPicker
          open={employmentOpen}
          value={employmentValue}
          items={employmentOptions}
          setOpen={setEmploymentOpen}
          setValue={setEmploymentValue}
          setItems={setEmploymentOptions}
          placeholder="Select Employment Time"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
        />
      </View>

      <Button title="Apply Filters" onPress={handleApplyFilters} />

      <View style={styles.results}>
        {filteredJobs.map((job, index) => (
          <Text key={index} style={styles.jobText}>{job.title} - {job.company}</Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#893030",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdown: {
    backgroundColor: "#fafafa",
  },
  dropdownBox: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
  },
  payContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    marginHorizontal: 5,
    textAlign: "center",
  },
  toText: {
    fontSize: 16,
    color: "#fff",
  },
  results: {
    marginTop: 20,
  },
  jobText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
});

export default Filter;
