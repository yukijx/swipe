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

// Define Python API URL from environment variable or use default
const PYTHON_API_HOST = process.env.PYTHON_API_HOST || "localhost";
const PYTHON_API_PORT = process.env.PYTHON_API_PORT || 5000;
const pythonApiUrl = `http://${PYTHON_API_HOST}:${PYTHON_API_PORT}/match`;

app.listen(PORT, IP, () => console.log(`Server running on http://${IP}:${PORT}`));

// Connect to MongoDB (Single Connection)
if (!process.env.MONGO_URI) {
  console.error('*** WARNING: MONGO_URI environment variable is not set ***');
  console.error('*** Please set MONGO_URI in your .env file ***');
  console.error('*** Using fallback connection string for local development ***');
  process.env.MONGO_URI = 'mongodb://localhost:27017/swipe';
}

console.log('Attempting to connect to MongoDB at:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB Connected Successfully");
  
  // List the collections in the database
  mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      console.log('Available collections:');
      collections.forEach(collection => {
        console.log('- ' + collection.name);
      });
    })
    .catch(err => console.error('Error listing collections:', err));
})
.catch(err => {
  console.error("*** MongoDB Connection Error ***");
  console.error(err);
  console.error("*** Make sure MongoDB is running and the connection string is correct ***");
});

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
        console.log("Match request received");
        
        // Get user from token
        const user = req.user;
        if (!user) {
            return res.status(401).send({ error: 'Authentication required' });
        }
        
        // Log the Python API URL being used
        console.log(`Using Python API URL: ${pythonApiUrl}`);
        
        // Continue with the existing code
        const pythonResponse = await axios.post(pythonApiUrl, { userId: user.id });
        res.json(pythonResponse.data);
    } catch (err) {
        res.status(500).json({ error: "Python Matching API is not reachable. Make sure it's running." });
    }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    try {
        console.log('*** verifyToken middleware called ***');
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        console.log('Auth header received:', authHeader);
        
        if (!authHeader) {
            console.log('No authorization header provided');
            return res.status(401).json({ error: 'No token provided' });
        }
        
        // Extract token - remove common prefixes
        let token = authHeader;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (authHeader.startsWith('bearer ')) {
            token = authHeader.substring(7);
        } else if (authHeader.startsWith('TOKEN ')) {
            token = authHeader.substring(6);
        }
        
        console.log('Extracted token prefix:', token.substring(0, 10) + '...');
        
        // Verify the token with detailed error handling
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
            console.log('Token verified successfully. User:', {
                id: decoded.id,
                email: decoded.email,
                isFaculty: decoded.isFaculty
            });
            
        req.user = decoded;
        next();
        } catch (jwtError) {
            console.error('JWT verification error details:', jwtError);
            
            // Try to decode without verification for debugging
            try {
                const decodedUnverified = jwt.decode(token);
                console.log('Token could be decoded but not verified:', decodedUnverified);
                console.log('JWT_SECRET length:', JWT_SECRET.length);
                console.log('JWT_SECRET prefix:', JWT_SECRET.substring(0, 5) + '...');
            } catch (decodeError) {
                console.error('Could not even decode token:', decodeError);
            }
            
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (err) {
        console.error('Token verification general error:', err.message);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware to check if user is faculty
const isFaculty = (req, res, next) => {
    console.log('*** isFaculty middleware called ***');
    console.log('Checking if user is faculty. User:', req.user);
    
    if (!req.user) {
        console.log('No user in request. Token may not have been verified.');
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!req.user.isFaculty) {
        console.log('Access denied: User is not faculty. isFaculty =', req.user.isFaculty);
        return res.status(403).json({ error: 'Access denied. Faculty only.' });
    }
    
    console.log('Faculty check passed. Proceeding to route handler.');
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
app.post('/listings/create', async (req, res) => {
    try {
        // 1. Verify the token manually
        const authHeader = req.headers['authorization'];
        console.log('Auth header in /listings/create:', authHeader);
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        // Extract token - remove "Bearer " if present
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader;
        
        // Verify the token
        let user;
        try {
            user = jwt.verify(token, JWT_SECRET);
            console.log('Token verified in /listings/create. User:', {
                id: user.id,
                email: user.email,
                isFaculty: user.isFaculty
            });
        } catch (err) {
            console.error('Token verification error in /listings/create:', err.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // 2. Check if user is faculty
        if (!user.isFaculty) {
            console.log('User is not faculty. isFaculty =', user.isFaculty);
            return res.status(403).json({ error: 'Access denied. Faculty only.' });
        }
        
        // 3. Process the request
        console.log('Request body in /listings/create:', JSON.stringify(req.body, null, 2));
        
        const { 
            title, 
            description, 
            requirements, 
            duration,
            wage
        } = req.body;

        // Validate required fields
        if (!title || !description || !requirements) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create new listing
        const listing = new Listing({
            facultyId: mongoose.Types.ObjectId.isValid(user.id) ? 
                new mongoose.Types.ObjectId(user.id) : user.id,
            title,
            description,
            requirements,
            duration,
            wage
        });
        
        // Save to database
        console.log('Saving listing to database with faculty ID:', user.id);
        console.log('Full listing data:', JSON.stringify(listing, null, 2));
        await listing.save();
        console.log('Listing saved successfully with ID:', listing._id);
        console.log('Saved listing facultyId:', listing.facultyId, 'of type:', typeof listing.facultyId);
        
        res.status(201).json(listing);
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/listings', verifyToken, async (req, res) => {
    try {
        // Get the user's ID from the token
        const userId = req.user.id;
        
        // Get the listings that the user has already swiped on
        const swipedListings = await Swipe.find({ studentId: userId })
            .select('listingId');
        
        // Extract just the listing IDs
        const swipedListingIds = swipedListings.map(swipe => swipe.listingId);
        
        // Find all active listings that haven't been swiped on
        const listings = await Listing.find({ 
            active: true,
            _id: { $nin: swipedListingIds }
        }).populate('facultyId', 'name email university -password');
        
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get a single listing by ID
app.get('/listings/:id', verifyToken, async (req, res) => {
    try {
        const listing = await Listing.findOne({ 
            _id: req.params.id,
            active: true 
        }).populate('facultyId', 'name email university department -password');
        
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        
        res.json(listing);
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add this after your existing routes
app.post('/user/setup', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;
        
        console.log('Received profile setup data:', updateData);
        
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

        // For student profiles, ensure these fields are required
        if (!user.isFaculty) {
            if (!updateData.university || !updateData.university.trim()) {
                return res.status(400).json({ error: 'University is required' });
            }
            if (!updateData.major || !updateData.major.trim()) {
                return res.status(400).json({ error: 'Major is required' });
            }
            if (!updateData.skills || !updateData.skills.trim()) {
                return res.status(400).json({ error: 'Skills are required' });
            }
        }

        // Only update allowed fields
        const filteredData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});
            
        // Check that we have data to update
        if (Object.keys(filteredData).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $set: filteredData,
                updatedAt: new Date()
            },
            { new: true, select: '-password' }
        );

        console.log('Updated user profile, fields:', Object.keys(updatedUser.toObject()));
        res.json(updatedUser);
    } catch (error) {
        console.error('Profile setup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add this with your other routes
app.get('/listings/faculty', verifyToken, isFaculty, async (req, res) => {
    try {
        console.log('Faculty listings requested by user:', req.user.id);
        console.log('User claims from token:', { 
            id: req.user.id, 
            email: req.user.email, 
            isFaculty: req.user.isFaculty 
        });
        
        // Verify the user exists and is faculty in the database
        const user = await User.findById(req.user.id);
        if (!user) {
            console.error('User not found in database:', req.user.id);
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('User from database:', { 
            id: user._id, 
            email: user.email, 
            isFaculty: user.isFaculty 
        });
        
        if (!user.isFaculty) {
            console.error('User is not faculty in database but passed middleware:', req.user.id);
            return res.status(403).json({ error: 'Not authorized as faculty' });
        }
        
        // *** UPDATED QUERY APPROACH - Using the same method as the debug endpoint ***
        const facultyId = req.user.id;
        console.log('Finding listings for faculty ID:', facultyId);
        
        // Use simple direct query to match the successful debug endpoint approach
        const listings = await Listing.find({ 
            facultyId: facultyId,
            active: true 
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${listings.length} listings for faculty ID: ${facultyId}`);
        
        if (listings.length === 0) {
            // Try the alternate approach if no results found
            console.log('No listings found with direct ID match, trying ObjectId approach...');
            
            const objectIdQuery = { 
                facultyId: mongoose.Types.ObjectId.isValid(facultyId) ? 
                    new mongoose.Types.ObjectId(facultyId) : facultyId,
                active: true 
            };
            
            const objectIdListings = await Listing.find(objectIdQuery).sort({ createdAt: -1 });
            console.log(`Found ${objectIdListings.length} listings using ObjectId approach`);
            
            if (objectIdListings.length > 0) {
                console.log('ObjectId approach successful, returning listings');
                return res.json(objectIdListings);
            }
            
            // Last resort - try with $or query
            console.log('Trying $or query as last resort...');
            const orQuery = {
                $or: [
                    { facultyId: facultyId },
                    { facultyId: mongoose.Types.ObjectId.isValid(facultyId) ? 
                        new mongoose.Types.ObjectId(facultyId) : facultyId }
                ],
                active: true
            };
            
            const orListings = await Listing.find(orQuery).sort({ createdAt: -1 });
            console.log(`Found ${orListings.length} listings using $or approach`);
            
            return res.json(orListings);
        }
        
        res.json(listings);
    } catch (error) {
        console.error('Error fetching faculty listings:', error);
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
        console.log('Fetching profile for user ID:', userId);
        
        // Use lean() to get a plain JavaScript object instead of a Mongoose document
        const user = await User.findById(userId)
            .select('-password -settings') // Exclude sensitive fields
            .lean();
        
        if (!user) {
            console.error('User not found for ID:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        // For debugging purposes, log the fields that are being returned
        console.log('Profile data fields:', Object.keys(user));
        
        // Check if essential fields exist for students
        if (!user.isFaculty) {
            if (!user.university && !user.major && !user.skills) {
                console.warn('Student profile appears to be incomplete:', 
                    {university: user.university, major: user.major, skills: user.skills});
            }
        }

        // Add a timestamp for caching busting
        user._timestamp = new Date().toISOString();

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
app.get('/user/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Verify the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the requester is faculty
        const requesterId = req.user.id;
        const requester = await User.findById(requesterId);
        
        // If faculty is requesting a student profile, show more details
        if (requester.isFaculty && !user.isFaculty) {
            // Return more student details for faculty members
            const studentProfile = await User.findById(userId)
                .select('name email university major experience skills projects certifications resumeText profileImage');
            return res.json(studentProfile);
        } else {
            // For non-faculty or when viewing faculty profiles, return limited info
            const publicProfile = await User.findById(userId)
                .select('name university department researchInterests biography isFaculty profileImage');
            return res.json(publicProfile);
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
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

// Define Swipe Schema
const SwipeSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    listingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Listing', 
        required: true 
    },
    interested: { 
        type: Boolean, 
        required: true 
    },
    facultyAccepted: { 
        type: Boolean, 
        default: null // null = pending, true = accepted, false = rejected
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Create a compound index to ensure a student can only swipe on a listing once
SwipeSchema.index({ studentId: 1, listingId: 1 }, { unique: true });

const Swipe = mongoose.model('Swipe', SwipeSchema);

// Student swipes on a listing (right or left)
app.post('/swipe', verifyToken, async (req, res) => {
    try {
        const { listingId, interested } = req.body;
        const studentId = req.user.id;
        
        // Validate if user is a student
        const user = await User.findById(studentId);
        if (!user || user.isFaculty) {
            return res.status(403).json({ error: 'Only students can swipe on listings' });
        }

        // Check if listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        
        // Check if already swiped
        const existingSwipe = await Swipe.findOne({ studentId, listingId });
        if (existingSwipe) {
            return res.status(400).json({ error: 'You have already swiped on this listing' });
        }
        
        // Create new swipe record
        const swipe = new Swipe({
            studentId,
            listingId,
            interested,
            facultyAccepted: null // Start as pending
        });
        
        await swipe.save();
        
        // If student is interested, it's a potential match pending faculty approval
        let isMatch = false;
        
        res.status(201).json({ 
            message: 'Swipe recorded successfully',
            isMatch
        });
        
    } catch (error) {
        console.error('Error in swipe endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Faculty accepts or rejects a student's interest
app.post('/swipe/respond', verifyToken, isFaculty, async (req, res) => {
    try {
        const { swipeId, accept } = req.body;
        const facultyId = req.user.id;
        
        // Find the swipe record
        const swipe = await Swipe.findById(swipeId);
        if (!swipe) {
            return res.status(404).json({ error: 'Swipe record not found' });
        }
        
        // Check if this swipe is for a listing owned by this faculty
        const listing = await Listing.findById(swipe.listingId);
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        
        if (listing.facultyId.toString() !== facultyId) {
            return res.status(403).json({ error: 'You can only respond to swipes on your own listings' });
        }
        
        // Update the swipe record with faculty's response
        swipe.facultyAccepted = accept;
        await swipe.save();
        
        res.status(200).json({ 
            message: `Student interest ${accept ? 'accepted' : 'rejected'} successfully`,
            swipe
        });
        
    } catch (error) {
        console.error('Error in faculty swipe response endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all matches for a student (only show accepted matches)
app.get('/matches/student', verifyToken, async (req, res) => {
    try {
        const studentId = req.user.id;
        
        // Get all listings the student has swiped right on AND faculty has accepted
        const swipes = await Swipe.find({ 
            studentId, 
            interested: true,
            facultyAccepted: true // Only return accepted matches
        });
        
        // Get the listing details for each match
        const matchedListingIds = swipes.map(swipe => swipe.listingId);
        const matchedListings = await Listing.find({
            _id: { $in: matchedListingIds }
        }).populate('facultyId', 'name email department');
        
        res.json(matchedListings);
        
    } catch (error) {
        console.error('Error getting student matches:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all students who matched with a faculty's listings
app.get('/matches/faculty', verifyToken, isFaculty, async (req, res) => {
    try {
        const facultyId = req.user.id;
        
        // Get all listings by this faculty
        const listings = await Listing.find({ facultyId });
        const listingIds = listings.map(listing => listing._id);
        
        // Get all students who swiped right on these listings
        const swipes = await Swipe.find({
            listingId: { $in: listingIds },
            interested: true
        });
        
        // Get student details
        const studentIds = [...new Set(swipes.map(swipe => swipe.studentId))];
        const matchedStudents = await User.find({
            _id: { $in: studentIds }
        }).select('name email university major skills');
        
        // Map students to the listings they matched with
        const matchesWithListings = [];
        for (const student of matchedStudents) {
            // Find all listings this student matched with
            const studentSwipes = swipes.filter(swipe => 
                swipe.studentId.toString() === student._id.toString()
            );
            
            const matchedListingIds = studentSwipes.map(swipe => swipe.listingId);
            const studentListings = await Listing.find({
                _id: { $in: matchedListingIds }
            }).select('title');
            
            // Add the swipe status to each match
            matchesWithListings.push({
                student,
                listings: studentListings,
                swipes: studentSwipes.map(swipe => ({
                    _id: swipe._id,
                    listingId: swipe.listingId,
                    status: swipe.facultyAccepted === null ? 'pending' : 
                            swipe.facultyAccepted ? 'accepted' : 'rejected'
                }))
            });
        }
        
        res.json(matchesWithListings);
        
    } catch (error) {
        console.error('Error getting faculty matches:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to check all listings - temporary, should be removed in production
app.get('/debug/all-listings', verifyToken, async (req, res) => {
    try {
        // Get the user's ID from the token
        const userId = req.user.id;
        
        // Check if user is faculty (faculty can see all listings)
        const user = await User.findById(userId);
        
        if (user && user.isFaculty) {
            // Faculty sees all listings
            const allListings = await Listing.find({}).select('_id title facultyId active createdAt');
            return res.json(allListings);
        }
        
        // For students, filter out listings they've already swiped on
        const swipedListings = await Swipe.find({ studentId: userId })
            .select('listingId');
        
        // Extract just the listing IDs
        const swipedListingIds = swipedListings.map(swipe => swipe.listingId);
        
        // Find all listings that haven't been swiped on
        const allListings = await Listing.find({
            _id: { $nin: swipedListingIds }
        }).select('_id title facultyId active createdAt');
        
        // Log useful info for debugging
        console.log(`Returning ${allListings.length} listings to user ${userId}`);
        console.log(`Filtered out ${swipedListingIds.length} previously swiped listings`);
        
        res.json(allListings);
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to get listings for a specific faculty ID
app.get('/debug/faculty-listings/:facultyId', async (req, res) => {
    try {
        const facultyId = req.params.facultyId;
        console.log('Debug: Finding listings for faculty ID:', facultyId);
        
        // Query supporting both string and ObjectId formats
        const query = { 
            active: true,
            $or: [
                { facultyId: facultyId },  // String comparison
                { facultyId: mongoose.Types.ObjectId.isValid(facultyId) ? 
                   new mongoose.Types.ObjectId(facultyId) : facultyId }  // ObjectId comparison
            ]
        };
        
        const listings = await Listing.find(query).sort({ createdAt: -1 });
        console.log(`Found ${listings.length} listings for faculty ID: ${facultyId}`);
        
        if (listings.length > 0) {
            console.log('First listing details:', JSON.stringify(listings[0], null, 2));
        }
        
        res.json(listings);
    } catch (error) {
        console.error('Error in debug faculty listings endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Unprotected test endpoint for faculty listings - token passed as query param instead of header
app.get('/test/faculty-listings', async (req, res) => {
    try {
        console.log('*** TEST ENDPOINT CALLED ***');
        console.log('Request query params:', req.query);
        
        // Get token from query param instead of header
        const token = req.query.token;
        if (!token) {
            return res.status(400).json({ error: 'Token required as query parameter' });
        }
        
        // Manually decode token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
            console.log('Test endpoint - token decoded:', {
                id: decoded.id,
                email: decoded.email,
                isFaculty: decoded.isFaculty
            });
        } catch (err) {
            console.error('Test endpoint - token verification error:', err.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        const facultyId = decoded.id;
        console.log('Test endpoint - finding listings for faculty ID:', facultyId);
        
        // Same query as the debug endpoint
        const listings = await Listing.find({ 
            facultyId: facultyId,
            active: true 
        }).sort({ createdAt: -1 });
        
        console.log(`Test endpoint - found ${listings.length} listings using direct approach`);
        
        if (listings.length === 0) {
            console.log('Test endpoint - trying alternative approaches...');
            
            // Try ObjectId approach
            if (mongoose.Types.ObjectId.isValid(facultyId)) {
                const objectIdListings = await Listing.find({ 
                    facultyId: new mongoose.Types.ObjectId(facultyId),
                    active: true 
                }).sort({ createdAt: -1 });
                
                console.log(`Test endpoint - found ${objectIdListings.length} listings using ObjectId approach`);
                
                if (objectIdListings.length > 0) {
                    return res.json(objectIdListings);
                }
            }
            
            // Try $or approach as last resort
            const orQuery = {
                $or: [
                    { facultyId: facultyId },
                    { facultyId: mongoose.Types.ObjectId.isValid(facultyId) ? 
                        new mongoose.Types.ObjectId(facultyId) : facultyId }
                ],
                active: true
            };
            
            const orListings = await Listing.find(orQuery).sort({ createdAt: -1 });
            console.log(`Test endpoint - found ${orListings.length} listings using $or approach`);
            
            return res.json(orListings);
        }
        
        res.json(listings);
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Simplified faculty listings endpoint using minimal middleware
app.get('/listings/faculty-simple', async (req, res) => {
    try {
        // Get token from authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        // Extract token and verify
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if faculty
        if (!decoded.isFaculty) {
            return res.status(403).json({ error: 'Faculty access only' });
        }
        
        // Get faculty listings with simple query
        const listings = await Listing.find({ 
            facultyId: decoded.id,
            active: true 
        }).sort({ createdAt: -1 });
        
        res.json(listings);
    } catch (err) {
        console.error('Error in simplified faculty endpoint:', err);
        res.status(500).json({ error: err.message });
    }
});

// Debug endpoint to validate tokens - no protection, for debugging only
app.get('/debug/validate-token', (req, res) => {
    try {
        console.log('Token validation endpoint called');
        const token = req.query.token;
        
        if (!token) {
            return res.status(400).json({ error: 'No token provided in query parameter' });
        }
        
        console.log('Validating token:', token.substring(0, 15) + '...');
        
        try {
            // Try to verify the token
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('Token verified successfully:', decoded);
            return res.json({ 
                valid: true, 
                decoded: decoded
            });
        } catch (jwtError) {
            console.error('Token verification failed:', jwtError);
            
            // Try to decode it anyway for debugging
            try {
                const decodedPayload = jwt.decode(token);
                return res.json({
                    valid: false,
                    error: jwtError.message,
                    decodedPayload: decodedPayload 
                });
            } catch (decodeError) {
                return res.json({
                    valid: false,
                    error: 'Could not verify or decode token'
                });
            }
        }
    } catch (error) {
        console.error('Error in token validation endpoint:', error);
        return res.status(500).json({ error: 'Server error validating token' });
    }
});

// Endpoint to refresh a token with correct authentication
app.post('/refresh-token', async (req, res) => {
    try {
        const { userId, email, isFaculty } = req.body;
        
        // Validate required fields
        if (!userId || !email || isFaculty === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Verify that the user exists in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify that the email matches
        if (user.email !== email) {
            return res.status(403).json({ error: 'Email mismatch' });
        }
        
        // Generate a new token with the correct claims
        const token = jwt.sign({ 
            id: userId, 
            email: email,
            isFaculty: user.isFaculty
        }, JWT_SECRET, { expiresIn: '24h' });
        
        // Return the new token
        return res.json({ token });
    } catch (error) {
        console.error('Error refreshing token:', error);
        return res.status(500).json({ error: 'Server error refreshing token' });
    }
});

// Test endpoint for faculty listings that works with token as query parameter
app.get('/test/faculty-listings', async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            console.error('Token verification error:', err);
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Check if user is faculty
        if (!decoded.isFaculty) {
            console.error('User is not faculty:', decoded.id);
            return res.status(403).json({ error: 'Not authorized as faculty' });
        }
        
        // Get user's faculty ID
        const facultyId = decoded.id;
        
        // Find all active listings for this faculty
        const listings = await Listing.find({ 
            facultyId: facultyId,
            active: true 
        }).sort({ createdAt: -1 });
        
        res.json(listings);
    } catch (error) {
        console.error('Error in test faculty-listings endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add test endpoint for a single listing that works with token as query parameter
app.get('/test/listing/:id', async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            console.error('Token verification error:', err);
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Get the listing ID from the request parameters
        const listingId = req.params.id;
        
        // Find the listing
        const listing = await Listing.findOne({ 
            _id: listingId,
            active: true 
        }).populate('facultyId', 'name email university department -password');
        
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        
        res.json(listing);
    } catch (error) {
        console.error('Error in test listing endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get swipe history for the current user
app.get('/swipes/history', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get all swipes by this user
        const swipes = await Swipe.find({ studentId: userId })
            .sort({ createdAt: -1 })
            .select('listingId interested createdAt');
        
        // For each swipe, check if it resulted in a match (for now, all interested swipes are matches)
        const swipesWithMatchInfo = swipes.map(swipe => ({
            listingId: swipe.listingId,
            interested: swipe.interested,
            createdAt: swipe.createdAt,
            isMatch: swipe.interested // In the current implementation, all interested swipes are matches
        }));
        
        res.json(swipesWithMatchInfo);
    } catch (error) {
        console.error('Error retrieving swipe history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start Express Server (Only One `app.listen`)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

