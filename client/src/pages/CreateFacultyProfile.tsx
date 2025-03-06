import React, { useState } from "react";
import { StyleSheet } from "react-native";
import Titles from "../components/Titles"; 
import Subheadings from "../components/Subheadings";  
import InputBar from "../components/InputBar";  
import InputDescriptionBox from "../components/InputDescriptionBox";
import ABouncyCheckbox from "../components/ABouncyCheckbox";  
import Button from "../components/GenericButton";  
import UploadFileButton from "../components/FileUploadButton";  
import NavBar from "../components/NavBar";
import { ThemedView } from "../components/ThemedView"; 

const CreateFacultyProfile = ({ navigation }: { navigation: any }) => {  
    const [isStudent, setIsStudent] = useState(false);
    const [isFaculty, setIsFaculty] = useState(false);
    
    return (
        <ThemedView style={styles.container} lightColor="#fff7d5" darkColor="#893030">
            
            <NavBar navigation={navigation} /> 

            <Titles title="Create Faculty Profile" />
           
            <InputBar placeholder="University" />
            <InputBar placeholder="Creditentials" />
            
            <InputDescriptionBox placeholder ="Biography" />
            <InputDescriptionBox placeholder ="Projects" />
            
            <UploadFileButton /> 

            <Button title="Create" onPress={() => console.log( "Account created" )} />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "#2E1512",
    borderWidth: 10,
    borderRadius: 30,
    width: "100%",
  },
});

export default CreateFacultyProfile;
