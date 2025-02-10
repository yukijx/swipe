import React from 'react';
import { View, Text, Button, Image, StyleSheet, Platform, TouchableOpacity} from 'react-native';


export default function swipePage() {
  return (
    <View style={styles.container}>

  {/* Menu Icon in Top Right Corner */}
  <TouchableOpacity style={styles.menuIcon} onPress={() => console.log("Menu Clicked")}>
    <Image source={require('@/assets/images/swipe-page/menu-icon-removebg.png')} style={styles.menuImage} />
  </TouchableOpacity>


      {/* Profile Card */}
      <View style={styles.card}>

        {/* User Icon */}
        <View style={styles.userIcon}>

          <Image 
            source={require('@/assets/images/swipe-page/user-icon-removebg.png')} 
            style={styles.profileImage} 
          />
        </View>

        {/* Name & Details */}
        {/*This is a placeholder, will be handled with backend*/}
        <Text style={styles.name}>Alex Tang</Text>
        <Text style={styles.details}>Major, Classification, GPA</Text>

        {/* Skills Section */}
        {/*This is a placeholder, will be handled with backend*/}
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.tagContainer}>
          {["JAVA", "PYTHON", "COMPUTER VISION", "R", "C++", "MATLAB"].map((skill) => (
            <View key={skill} style={styles.tag}>
              <Text style={styles.tagText}>{skill}</Text>
            </View>
          ))}
          <Text style={styles.moreText}>...</Text>
        </View>

        {/* Experience Section */}
        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={styles.tagContainer}>
          {["AIRLAB RA", "BOEING INTERN", "APP DEV", "OU IT EMPLOYEE"].map((exp) => (
            <View key={exp} style={styles.tag}>
              <Text style={styles.tagText}>{exp}</Text>
            </View>
          ))}
          <Text style={styles.moreText}>...</Text>
        </View>

        {/* Contact Info */}
        <Text style={styles.contactText}>alextang@ou.edu</Text>
      </View>    
    
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>❌</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>✔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#893030',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#fff',
  },
  menuIcon: {
    position: 'absolute',
    top: 40,  // distance from top
    right: 20, // distance from right
    zIndex: 20, // put it above other components
    color: '#FFFFFF' //idk why its not turning white T.T
  },
  menuImage: {
    width: 50,  // Adjust icon size
    height: 50,
    resizeMode: 'contain',
    color: '#FFFFFF'
  },
  card: {
    width: 300,
    backgroundColor: "#fff7d5",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, 
  },
  userIcon: {
    width: 50,  
    height: 50,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 60, 
    height: 60,
    resizeMode: "contain", // Prevents stretching
  },
  profileText: {
    fontSize: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  details: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 5,
  },
  tag: {
    backgroundColor: "#803636",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    margin: 4,
  },
  tagText: {
    color: "white",
    fontSize: 12,
  },
  moreText: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
  contactText: {
    fontSize: 12,
    color: "#555",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginTop: 20,
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: "#622b26",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 24,
    color: "white",
  },

});
