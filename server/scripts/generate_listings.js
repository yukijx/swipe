const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Define the Listing Schema
const ListingSchema = new mongoose.Schema({
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    duration: {
        value: { type: Number, required: true },
        unit: { type: String, required: true, enum: ['days', 'weeks', 'months', 'years'] }
    },
    wage: {
        type: { type: String, required: true, enum: ['hourly', 'monthly', 'total'] },
        amount: { type: Number, required: true },
        isPaid: { type: Boolean, default: true }
    },
    createdAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

const Listing = mongoose.model('Listing', ListingSchema);

// Predefined research listings
const researchListings = [
    {
        title: "Machine Learning Research Assistant",
        description: "Join our lab in developing novel deep learning algorithms for computer vision applications. Work on state-of-the-art models and contribute to publications.",
        requirements: "Strong Python programming skills, experience with PyTorch or TensorFlow, background in machine learning fundamentals",
        duration: { value: 6, unit: "months" },
        wage: { type: "hourly", amount: 25, isPaid: true }
    },
    {
        title: "Quantum Computing Research Project",
        description: "Research position focusing on quantum algorithm development and implementation using IBM's quantum computers. Opportunity to work with cutting-edge quantum technology.",
        requirements: "Background in quantum mechanics, linear algebra proficiency, programming experience in Qiskit",
        duration: { value: 12, unit: "months" },
        wage: { type: "monthly", amount: 2000, isPaid: true }
    },
    {
        title: "Renewable Energy Systems Analysis",
        description: "Study the integration of renewable energy sources into existing power grids. Conduct simulations and analyze system efficiency improvements.",
        requirements: "Knowledge of power systems, MATLAB experience, strong analytical skills",
        duration: { value: 8, unit: "months" },
        wage: { type: "hourly", amount: 20, isPaid: true }
    },
    {
        title: "Biomedical Data Analysis Project",
        description: "Analyze large-scale medical imaging datasets using advanced statistical methods. Help develop new diagnostic tools for early disease detection.",
        requirements: "Statistics background, experience with R or Python, knowledge of medical imaging",
        duration: { value: 4, unit: "months" },
        wage: { type: "hourly", amount: 22, isPaid: true }
    },
    {
        title: "Climate Change Impact Study",
        description: "Research position analyzing climate data and modeling future environmental impacts. Work with international climate science teams.",
        requirements: "Environmental science background, experience with climate models, data analysis skills",
        duration: { value: 12, unit: "months" },
        wage: { type: "monthly", amount: 2200, isPaid: true }
    },
    {
        title: "Robotics Control Systems Development",
        description: "Work on developing advanced control systems for autonomous robots. Focus on human-robot interaction and safety protocols.",
        requirements: "Control systems knowledge, C++ programming, robotics experience",
        duration: { value: 6, unit: "months" },
        wage: { type: "hourly", amount: 28, isPaid: true }
    },
    {
        title: "Natural Language Processing Research",
        description: "Develop and improve NLP models for multilingual text analysis. Work on sentiment analysis and language understanding projects.",
        requirements: "NLP experience, Python programming, knowledge of transformer models",
        duration: { value: 9, unit: "months" },
        wage: { type: "monthly", amount: 2400, isPaid: true }
    },
    {
        title: "Cybersecurity Protocol Analysis",
        description: "Research position in analyzing and improving network security protocols. Focus on identifying vulnerabilities and developing countermeasures.",
        requirements: "Network security knowledge, cryptography background, programming skills",
        duration: { value: 6, unit: "months" },
        wage: { type: "hourly", amount: 26, isPaid: true }
    }
];

// Function to generate and save listings
async function generateAndSaveListings(facultyId, count = 5) {
    try {
        console.log(`Generating ${count} listings...`);
        
        for (let i = 0; i < count; i++) {
            const listingTemplate = researchListings[i % researchListings.length];
            const listing = new Listing({
                ...listingTemplate,
                facultyId
            });
            await listing.save();
            console.log(`Created listing: ${listing.title}`);
        }

        console.log('Finished generating listings');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
    }
}

// Replace this with your faculty user ID
const FACULTY_ID = '67b8aeeb837418ab6caff905'; // Dr. John Smith's ID

// Generate listings
generateAndSaveListings(FACULTY_ID, 20); 