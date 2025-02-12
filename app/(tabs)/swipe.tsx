import React, { useState, useRef } from 'react';
import { View, Text, Button, Image, StyleSheet, Platform, TouchableOpacity} from 'react-native';
import Swiper from 'react-native-deck-swiper';


export default function swipePage() {

  // THIS IS TEMPORARILY HARDCODED
  const [profiles, setProfiles] = useState([
    { id: 1, name: 'Alex Tang', major: 'CS, Junior', skills: ['Java', 'Python', 'ADA', 'R'], experience: ['AirLab RA', 'Boeing Intern'], contact: 'alextang@ou.edu', image: require("@/assets/images/swipe-page/user-icon-removebg.png") },
    { id: 2, name: 'Jamie Lee', major: 'EE, Senior', skills: ['C++', 'Embedded Systems'], experience: ['Intel Intern'], contact: 'jamielee@ou.edu', image: require("@/assets/images/swipe-page/user-icon-removebg.png") },
    { id: 3, name: 'Taylor Kim', major: 'Data Science, Junior', skills: ['SQL', 'Machine Learning'], experience: ['Data Analyst Intern'], contact: 'taylorkim@ou.edu', image: require("@/assets/images/swipe-page/user-icon-removebg.png") },
    { id: 4, name: 'Jordan Park', major: 'Cybersecurity, Senior', skills: ['Network Security', 'Python'], experience: ['Cybersecurity Intern'], contact: 'jordanpark@ou.edu', image: require("@/assets/images/swipe-page/user-icon-removebg.png") },
    { id: 5, name: 'Andre Moore', major: 'Meteorology, Senior', skills: ['Numerical Modeling', 'Python', 'Theory'], experience: ['Cybersecurity Intern'], contact: 'andremoore@ou.edu', image: require("@/assets/images/swipe-page/user-icon-removebg.png") },

  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<Swiper<any>>(null); // Create a reference to Swiper

  return (
    <View style={styles.container}>

    <TouchableOpacity style={styles.menuIcon} onPress={() => console.log("Menu Clicked")}>
      <Image source={require('@/assets/images/swipe-page/menu-icon-removebg.png')} style={styles.menuImage} />
    </TouchableOpacity>

    {/* THIS IS ACCESSING THE HARDCODED DATA */}
    {currentIndex < profiles.length ? (
          <Swiper
            ref={swiperRef} 
            
            cards={profiles}
            renderCard={(profile) => (
              <View style={styles.card}>
                <Image source={profile.image} style={styles.profileImage} />
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.details}>{profile.major}</Text>

                <Text style={styles.sectionTitle}>Skills:</Text>
                <Text style={styles.details}>{profile.skills.join(', ')}</Text>

                <Text style={styles.sectionTitle}>Experience:</Text>
                <Text style={styles.details}>{profile.experience.join(', ')}</Text>

                <Text style={styles.contactText}>{profile.contact}</Text>
              </View>
            )}
            onSwiped={() => setCurrentIndex((prev) => prev + 1)}
            onSwipedLeft={() => console.log("Swiped Left")}
            onSwipedRight={() => console.log("Swiped Right")}
            cardIndex={currentIndex}
            stackSize={3}
            backgroundColor="transparent"
          />
        ) : (
          <Text style={styles.title}>You've seen all potential matches.</Text>
        )}

{/*                 <Text style={styles.sectionTitle}>Skills</Text>
                <Text style={styles.tagContainer}> {profile.skills.map((skill, index) => (
                  <View key={index} style={styles.tag}> 
                    <Text style={styles.tagText}>{skill}</Text>
                  </View> ))}
                <Text>...</Text> 
                </Text>

                <Text style={styles.sectionTitle}>Experience</Text>

                <Text style={styles.tagContainer}> {profile.experience.map((experience, index) => (
                  <View key={index} style={styles.tag}> 
                    <Text style={styles.tagText}>{experience}</Text>
                  </View>
                ))} 
                <Text>...</Text> 
                </Text>
 */}

{/* THESE BUTTONS DON'T SWIPE AHHHHHHHH */}
      {currentIndex < profiles.length && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => swiperRef.current?.swipeLeft()}>            
            <Text style={styles.buttonText}>❌</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => swiperRef.current?.swipeRight()}>
            <Text style={styles.buttonText}>✅</Text>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent:'center',
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
    width: "100%", // Make it responsive
    maxWidth: 350, // Prevent it from getting too wide
    backgroundColor: "#fff7d5",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center", // Center content vertically
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: "absolute",  // Keeps it stacked, but we need to adjust top
    top: "50%", // Move it down
    transform: [{ translateY: -150 }], // Offset it properly
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
    marginTop: 450,
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
