import React, { useState } from "react";
import { StyleSheet } from "react-native";
import Titles from "../components/Titles";  
import InputDescriptionBox from "../components/InputDescriptionBox";
import InputBar from "../components/InputBar";  
import Button from "../components/GenericButton";  
import UploadFileButton from "../components/FileUploadButton";  
import NavBar from "../components/NavBar";
import { ThemedView } from "../components/ThemedView"; 

const CreateListing = ({ navigation }: { navigation: any }) => {
  
  return (
    <ThemedView style={styles.container} lightColor="#fff7d5" darkColor="#893030">
      
      <NavBar navigation={navigation} /> 

      {/* ✅ Title Section */}
      <ThemedView style={styles.titleContainer}>
        <Titles title="Create Listing" />
      </ThemedView>

      {/* ✅ Content Section (with spacing) */}
      <ThemedView style={styles.contentContainer}>
        <InputBar placeholder="Compensation" />

        <InputDescriptionBox placeholder="Description" style={styles.descriptionBox} />

        <UploadFileButton /> 

        <Button title="Create" onPress={() => console.log("Listing created")} />
      </ThemedView>

    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    borderColor: "#2E1512",
    borderWidth: 10,
    borderRadius: 30,
    width: "100%",
  },
  descriptionBox: {
    height: 300, // ✅ Adjusted height ONLY for this page
  },
  titleContainer: {
    marginTop: 10, // ✅ Space above the title
    marginBottom: 20, // ✅ Space below the title (separates from content)
    alignItems: "center",
  },
  contentContainer: {
    width: "100%", // ✅ Ensures content fills the width
    alignItems: "center",
    justifyContent: "flex-start",
  },

});

export default CreateListing;

