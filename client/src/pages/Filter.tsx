import React, { useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { StackScreenProps } from "@react-navigation/stack";
import { StackParamList } from "../App";

type Props = StackScreenProps<StackParamList, "Filter">;

const Filter: React.FC<Props> = ({ navigation }) => {
  
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [experienceValue, setExperienceValue] = useState(null);
  const [experienceOptions, seEexperienceOptions] = useState([
    { label: "Entry Level", value: "$entry level" },
    { label: "Mid Level", value: "mid level" },
    { label: "Senior Level", value: "senior level" },
  ]);                  

  const [payOpen, setPayOpen] = useState(false);
  const [payValue, setPayValue] = useState(null);
  const [payOptions, setPayOptions] = useState([
    { label: "$0-$10", value: "$0-$10" },
    { label: "$10-$20", value: "$10-$20" },
    { label: "$20-$30", value: "$20-$30" },
    { label: "$30+", value: "$30+" },
  ]);                                                                                                                                        

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationValue, setLocationValue] = useState(null);
  const [locationOptions, setLocationOptions] = useState([
    { label: "Remote", value: "remote" },
    { label: "In Person", value: "in person" },
  ]);

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityValue, setAvailabilityValue] = useState(null);
  const [availabilityOptions, setAvailabilityOptions] = useState([
    { label: "Full-Time", value: "fulltime" },
    { label: "Part-Time", value: "parttime" },
    { label: "Internships", value: "internships" },
  ]);

  const [employmentOpen, setEmploymentOpen] = useState(false);
  const [employmentValue, setEmploymentValue] = useState(null);
  const [employmentOptions, setEmploymentOptions] = useState([
    { label: "Morining", value: "morining" },
    { label: "Afternoon", value: "afternoon" },
    { label: "Night", value: "night" },

  ]);

  const handleApplyFilters = () => {
    console.log({
      Pay: payValue,
      Location: locationValue,
      Availability: availabilityValue,
      EmploymentTime: employmentValue,
    });
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
          setItems={seEexperienceOptions}
          placeholder="Select Your Level"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
        />
      </View>


      <View style={[styles.dropdownContainer, { zIndex: payOpen ? 4000 : 1000 }]}>
        <DropDownPicker
          open={payOpen}
          value={payValue}
          items={payOptions}
          setOpen={setPayOpen}
          setValue={setPayValue}
          setItems={setPayOptions}
          placeholder="Select Pay Per Hour"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
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
});

export default Filter;
