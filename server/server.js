const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());


const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const AES_SECRET = process.env.AES_SECRET || "your_aes_key_here";
const SALT = process.env.SALT || "your_salt_here";

// Connect to MongoDB (Single Connection)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Define Mongoose Schema (Single Definition)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    university: { type: String },
    major: { type: String },
    experience: { type: String },
    skills: { type: String },
    projects: { type: String },
    certifications: { type: String },
    resumeLink: { type: String },
    settings: { type: Object, default: {} }
});
const User = mongoose.model('User', UserSchema);

// AES-256 Encryption & Decryption
const encrypt = (text) => {
    const key = crypto.scryptSync(AES_SECRET, SALT, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
    const key = crypto.scryptSync(AES_SECRET, SALT, 32);
    const [iv, encrypted] = text.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Register User API
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, university, major, experience, skills, projects, certifications, resumeLink } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });
        const encryptedPassword = encrypt(password);
        const user = new User({
            name, email, password: encryptedPassword, university, major, experience, skills, projects, certifications, resumeLink
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Login User API
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        // Decrypt and compare passwords
        const decryptedPassword = decrypt(user.password);
        if (decryptedPassword !== password) return res.status(400).json({ error: 'Invalid credentials' });

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });

        res.json({ token, user });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get User Settings & Home Page Data
app.get('/user', async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Call Python Matching API
app.post('/match', async (req, res) => {
    try {
        const { job_abstracts, student_cv } = req.body;
        
        // Ensure Python API is running
        const pythonApiUrl = "http://localhost:5001/match";  // Adjust to correct Python backend port

        const response = await axios.post(pythonApiUrl, { job_abstracts, student_cv });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Python Matching API is not reachable. Make sure it's running." });
    }
});

// Start Express Server (Only One `app.listen`)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
