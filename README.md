# **SWIPE**
At the University of Oklahoma, recruiting students for research projects is challenging and time-consuming for students and principal investigators (PIs) alike. Frequently, OU faculty or PIs receive tens of emails from students seeking research and academic internship opportunities and students scout the various websites within their colleges or outside in other institutions. This becomes a tedious task and often valuable opportunities are missed or remain unfilled.

SWIPE (name under development) is a swipe-based, cross-platform, mobile app that matches students with faculty members/PIs based on their preferences and areas of interest. Students submit their general interests, and faculty submit the general needs for their research projects and labs. A customized user screening experience allows both parties to swipe or mark shortlists, exchange application materials, and submit CVs and resumes. This app will change the paradigm of the recruitment process for the OU research institutions, accelerating the process by ensuring that less obvious matches are found.

---

## **Table of Contents**
1. [About the Project](#about-the-project)
2. [Features](#features)
3. [Getting Started](#getting-started)
4. [Installation](#installation)
5. [Goals and Progress Plan](#goals-and-progress-plan)
6. [Contributing](#contributing)
7. [Contact](#contact)
8. [Acknowledgments](#acknowledgments)

---

## **About the Project**
- **Tech Stack**: 
- **REACT NATIVE** will be used for cross-platform app development using Typescript and React. This front end will work in conjunction with the Expo framework.
- **EXPO** is compatible with iOS, Android, and the web browser. The framework has a lot of APIs that will help facilitate development. It also allows you to test the app on your phone instantly by scanning a QR code instead of building the app every time. You can test the app on a browser, giving us a variety of platforms to view the changes on our codebase. 
- **JSON-SERVER** is a temporary database solution before we transition to SQLite. 
- **SQLite** provides portable local storage for a mobile app; this means that the data can be accessed even if the app is offline.  

---

## **Features**
- **Customizable User Filtering**: Students can filter and sort opportunities tailored to their needs and preferences.
- **Swipe or Mark Shortlists**: Students can quickly shortlist opportunities with a swipe or marking mechanism for easy tracking. Faculty and PIs can mark student profiles that have expressed interest in their research projects. 
- **Exchange and Submit Application Materials**: Seamlessly exchange application materials directly through the platform, including CVs and resumes.
- **Comprehensive Student Profiles**: Students can submit resumes and build detailed profiles showcasing their academic and professional achievements.
- **Faculty-Specific Features**: Faculty members can create profiles highlighting their research, provide detailed information about job postings (e.g., required experience, technical knowledge, offered pay rate), and manage applications effectively.

---

## **Getting Started**

### Prerequisites
- List of tools, dependencies, or accounts required:
  ```bash
  # Example: Install Node.js
  brew install node
  ```

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yukijx/swipe.git
   ```
2. Navigate to the project directory:
   ```bash
   cd src
   ```

### EXPO Set up 
This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

0. make sure you are cd'd into swipe_exop

1. Install dependencies
   ```bash
   npm install
   ```
2. Install ['Android Studio'](https://developer.android.com/studio)
3. Make sure you have the correct SDK on Android Studio
4. Start the emulator
5. Start the app
   ```bash
    npm run start 
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

Front-end development happens in the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project 
```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.


--- 
## Goals and Progress Plan

### Project Goals
1. **Build a functional and user-friendly mobile application**
2. **Implement core features**
3. **Ensure performance and scalability**
4. **Collaborate effectively as a team**
5. **Deliver a polished final product**

---

### Progress Plan

| **Milestone**                  | **Description**                                                                                   | **Deadline**      | **Status**          |
|---------------------------------|---------------------------------------------------------------------------------------------------|-------------------|---------------------|
| **Project Setup**               | Initialize the repository, set up a development environment, and .       | January 20, 2025  | ✅ Completed         |
| **Sprint 1 Design & Develop ** | Implement user login, registration, password recovery functionality, and the UI design associated with these functionalities.                         | TBD  | 🔄 In Progress       |
| **Sprint 2 Design & Develop **  | Develop database schema, set up Azure SQL Database, and integrate with the app backend to handle more complex requirements for user customizations.           | TBD | ⏳ Pending           |
| **Sprint 3 Design & Develop ** | Create interactive swipe functionality.                        | TBD     | ⏳ Pending           |
| **Sprint 4 Design & Develop**    | Resolve any issues in the codebase and integrate additional features (TBD once we meet up with our mentor).                | TBD    | ⏳ Pending           |
| **Capstone Presentation**       | Prepare and deliver the final presentation showcasing the app’s features and achievements.        | TBD    | ⏳ Pending           |


---

## **Contributing**
- Steps for contributing to the project:
  1. Clone the repository:
     ```bash
      git clone https://github.com/yukijx/swipe.git
     ```
  3. Create a new branch:
     ```bash
     git checkout -b feature/your-feature-name
     ```
  4. Add your changes:
     ```bash
     git add <changed files>
     ```
  5. Commit your changes:
     ```bash
     git commit -m 'Add a new feature'
     ```
  6. Push to the branch:
     ```bash
     git push origin feature/your-feature-name
     ```
  7. Open a pull request.

---

## **Contact**
GROUP H Members:

Product Owner: Yuki Zheng - Yuki.Zheng-1@ou.edu
 
Quality Assurance: Elijah DeBruyne - elijah.w.debruyne@ou.edu

Sprint Master 1: Dakota Natasha Staubach - Dakota.N.Staubach-1@ou.edu

Sprint Master 2: Ryan Williams - Ryan.T.Williams-1@ou.edu

Sprint Master 3: Alex Tang - ytang@ou.edu
  
Project Link: [https://github.com/yukijx/repo](https://github.com/yukijx/swipe.git)

---

## **Acknowledgments**
- We thank Dr. Mansoor Abdulhak for his guidance and instruction through the Capstone Design Project course at the University of Oklahoma, our mentor, Dr. Marmar Moussa, and the Moussa Lab (affiliated with the University of Oklahoma) for guidance on the development of this product.
