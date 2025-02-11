
 



import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Texts from "../components/Texts";
import { useTheme } from "../context/ThemeContext"; //Import useTheme
import { ThemedView } from "../components/ThemedView"; //Correct import of ThemedView

const FileUploadButton: React.FC = () => {
  const { theme } = useTheme(); //Get current theme
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      setFile(result.assets[0]);
    } catch (error) {
      console.error("Error picking file:", error);
    }
  };
   //Dynamic Colors Based on Theme
   const textColor = theme === "dark" ? "#fff7d5" : "#4d231f";

  return (
    <ThemedView style={styles.container} lightColor="#fff7d5" darkColor="#4d231f"> {/* ✅ ThemedView applied */}
      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        <Text style={[styles.plusIcon, { color: textColor }]}>+</Text>
        <Texts text="Upload Documents" />
      </TouchableOpacity>

      {file && <Text style={styles.fileText}>File: {file.name}</Text>}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center", 
    borderRadius: 10,  
    margin:5,
  },
  uploadButton: {
    alignItems: "center",
    borderColor: "#2E1512",
    borderRadius: 10, 
    borderWidth: 2,
    flexDirection: "row",
    height: 50,
    justifyContent: "flex-start",  
    width: "60%", 
    paddingHorizontal: 15,
  },
  plusIcon: {
    fontSize: 30,  
    fontWeight: "bold",
    marginRight: 10,  
  },
  uploadText: {
    fontSize: 16,
  },
  fileText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default FileUploadButton;
