const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));


const IP = process.env.SERVER_IP || 'localhost';
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const AES_SECRET = process.env.AES_SECRET || "your_aes_key_here";
const SALT = process.env.SALT || "your_salt_here";

app.listen(PORT, IP, () => console.log(`Server running on http://${IP}:${PORT}`));

// Connect to MongoDB (Single Connection)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Define Mongoose Schema (Single Definition)
const UserSchema = new mongoose.Schema({
    // Basic info (from registration)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isFaculty: { type: Boolean, default: false },
    
    // Student specific fields
    university: { type: String },
    major: { type: String },
    experience: { type: String },
    skills: { type: String },
    projects: { type: String },
    certifications: { type: String },
    resumeText: { type: String },  // New field for resume text
    
    // Professor specific fields
    department: { type: String },
    researchInterests: { type: String },
    biography: { type: String },
    publications: { type: String },
    officeHours: { type: String },
    contactInfo: { type: String },

    // Common fields
    settings: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    // Profile image
    profileImage: {
        url: String,
        publicId: String  // For Cloudinary reference
    },

    // Privacy settings
    privacySettings: {
        name: { type: Boolean, default: true },
        university: { type: Boolean, default: true },
        major: { type: Boolean, default: true },
        experience: { type: Boolean, default: true },
        skills: { type: Boolean, default: true },
        projects: { type: Boolean, default: true },
        certifications: { type: Boolean, default: true },
        profileImage: { type: Boolean, default: true },
        resumeText: { type: Boolean, default: false }
    }
});

// Add a pre-save middleware to update the updatedAt field
UserSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const User = mongoose.model('User', UserSchema);

// Add this near your other mongoose schemas
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


// Multer config for profile pics
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}${ext}`);
  }
});

const upload = multer({ storage });

// Register User API
app.post('/register', async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password,
            university,
            major,
            experience,
            skills,
            projects,
            certifications,
            resumeText,  // Changed from resumeLink
            isFaculty 
        } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });
        
        
        const encryptedPassword = encrypt(password);
        const user = new User({
            name, 
            email, 
            password: encryptedPassword,
            university,
            major,
            experience,
            skills,
            projects,
            certifications,
            resumeText,  // Changed from resumeLink
            isFaculty: isFaculty || false
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

        // Generate JWT Token with isFaculty claim
        const token = jwt.sign({ 
            id: user._id, 
            email: user.email,
            isFaculty: user.isFaculty 
        }, JWT_SECRET, { expiresIn: '2h' });

        res.json({ token, user: { ...user.toObject(), password: undefined } });

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
        const pythonApiUrl = "http://localhost:5000/match";  // Adjust to correct Python backend port

        const response = await axios.post(pythonApiUrl, { job_abstracts, student_cv });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Python Matching API is not reachable. Make sure it's running." });
    }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware to check if user is faculty
const isFaculty = (req, res, next) => {
    if (!req.user.isFaculty) {
        return res.status(403).json({ error: 'Access denied. Faculty only.' });
    }
    next();
};

// Protected route example for faculty only
app.get('/faculty-only', verifyToken, isFaculty, async (req, res) => {
    try {
        // Handle faculty-only logic here
        res.json({ message: 'Faculty access granted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add these routes after your existing routes
app.post('/listings/create', verifyToken, isFaculty, async (req, res) => {
    try {
        const { 
            title, 
            description, 
            requirements, 
            duration,  // { value: number, unit: string }
            wage      // { type: string, amount: number, isPaid: boolean }
        } = req.body;

        const listing = new Listing({
            facultyId: req.user.id,
            title,
            description,
            requirements,
            duration,
            wage
        });
        await listing.save();
        res.status(201).json(listing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/listings', verifyToken, async (req, res) => {
    try {
        const listings = await Listing.find({ active: true })
            .populate('facultyId', 'name email university -password');
        res.json(listings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this after your existing routes
app.post('/user/setup', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;
        
        console.log('Received profile update:', updateData);
        
        // Validate the update data based on user type
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Filter fields based on user type
        const allowedFields = user.isFaculty ? [
            'university',
            'department',
            'researchInterests',
            'biography',
            'publications',
            'officeHours',
            'contactInfo'
        ] : [
            'university',
            'major',
            'experience',
            'skills',
            'projects',
            'certifications',
            'resumeText'
        ];

        // Only update allowed fields
        const filteredData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $set: filteredData,
                updatedAt: new Date()
            },
            { new: true, select: '-password' }
        );

        console.log('Updated user:', updatedUser);
        res.json(updatedUser);
    } catch (error) {
        console.error('Profile setup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add this with your other routes
app.get('/listings/faculty', verifyToken, isFaculty, async (req, res) => {
    try {
        const listings = await Listing.find({ 
            facultyId: req.user.id,
            active: true 
        }).sort({ createdAt: -1 }); // Most recent first
        
        res.json(listings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a route to delete listings
app.delete('/listings/:id', verifyToken, isFaculty, async (req, res) => {
    try {
        const listing = await Listing.findOne({
            _id: req.params.id,
            facultyId: req.user.id
        });

        if (!listing) {
            return res.status(404).json({ error: 'Listing not found or unauthorized' });
        }

        // Soft delete by setting active to false
        listing.active = false;
        await listing.save();
        
        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this with your other routes
app.put('/listings/:id', verifyToken, isFaculty, async (req, res) => {
    try {
        const listing = await Listing.findOne({
            _id: req.params.id,
            facultyId: req.user.id
        });

        if (!listing) {
            return res.status(404).json({ error: 'Listing not found or unauthorized' });
        }

        // Update the listing
        Object.assign(listing, req.body);
        await listing.save();
        
        res.json(listing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user profile
app.get('/user/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId)
            .select('-password -settings'); // Exclude sensitive fields
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
app.put('/user/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;
        
        // Get current user to check type
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Filter allowed fields based on user type
        const allowedFields = user.isFaculty ? [
            'name',
            'university',
            'department',
            'researchInterests',
            'biography',
            'publications',
            'officeHours',
            'contactInfo'
        ] : [
            'name',
            'university',
            'major',
            'experience',
            'skills',
            'projects',
            'certifications',
            'resumeText'
        ];

        // Filter out non-allowed fields
        const filteredData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        // Update the user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $set: filteredData,
                updatedAt: new Date()
            },
            { new: true, select: '-password -settings' }
        );

        res.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to upload profile image
app.post('/user/profile/image', verifyToken, upload.single('profileImage'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      const imageUrl = `http://${IP}:${PORT}/uploads/${req.file.filename}`;
      const userId = req.user.id;
  
      if (!userId) {
        return res.status(401).json({ error: 'Missing user ID in token' });
      }
  
      // Debugging logs
      console.log('Uploading image for user:', userId);
      console.log('Saving image URL:', imageUrl);
  
      // Ensure the field is created/updated even if it doesn't exist
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'profileImage.url': imageUrl,
            updatedAt: new Date(),
          }
        },
        { new: true, upsert: false }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ profileImage: { url: updatedUser.profileImage.url } });
  
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });
  


// Get public profile (for viewing other users' profiles)
app.get('/user/profile/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId)
            .select('name university department researchInterests biography publications isFaculty'); // Only public fields
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Public profile fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});


// Filter Jobs API
app.get('/filter-jobs', async (req, res) => {
    try {
        const { 
            experience, 
            pay_min, 
            pay_max, 
            location, 
            jobType, 
            shift 
        } = req.query;

        const filter = {};

        if (experience) filter.experienceLevel = experience;
        if (location) filter.locationType = location;
        if (jobType) filter.jobType = jobType;
        if (shift) filter.shiftTiming = shift;

        if (pay_min || pay_max) {
            filter.payPerHour = {};
            if (pay_min) filter.payPerHour.$gte = Number(pay_min);
            if (pay_max) filter.payPerHour.$lte = Number(pay_max);
        }

        const jobs = await Job.find(filter);
        res.json(jobs);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update the filter listings route
app.get('/filter-listings', verifyToken, async (req, res) => {
    try {
        const { 
            searchTerm,
            minWage,
            maxWage,
            wageType,
            durationMin,
            durationUnit,
            isPaid
        } = req.query;

        const filter = { active: true };

        // Text search across title and description
        if (searchTerm) {
            filter.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Filter by wage
        if (minWage || maxWage || wageType) {
            filter.wage = {};
            if (wageType) filter.wage.type = wageType;
            if (minWage || maxWage) {
                filter.wage.amount = {};
                if (minWage) filter.wage.amount.$gte = Number(minWage);
                if (maxWage) filter.wage.amount.$lte = Number(maxWage);
            }
        }

        // Filter by paid/unpaid
        if (isPaid !== undefined) {
            filter['wage.isPaid'] = isPaid === 'true';
        }

        // Filter by duration
        if (durationMin && durationUnit) {
            filter['duration.value'] = { $gte: Number(durationMin) };
            filter['duration.unit'] = durationUnit;
        }

        const listings = await Listing.find(filter)
            .populate('facultyId', 'name email university -password')
            .sort({ createdAt: -1 });
            
        res.json(listings);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Start Express Server (Only One `app.listen`)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

