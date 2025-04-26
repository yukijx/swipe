const mongoose = require('mongoose');
require('dotenv').config();

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

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');

    console.log('Creating test listing...');
    const testListing = new Listing({
      facultyId: new mongoose.Types.ObjectId('6611dcef06ffdaea73c0cd5f'), // Use a valid user ID from your database
      title: 'Test Listing from Script',
      description: 'Test description',
      requirements: 'Test requirements',
      duration: {
        value: 3,
        unit: 'months'
      },
      wage: {
        type: 'hourly',
        amount: 15,
        isPaid: true
      }
    });

    const savedListing = await testListing.save();
    console.log('Test listing created successfully:');
    console.log(JSON.stringify(savedListing, null, 2));

    // Check existing listings
    console.log('Fetching all listings...');
    const allListings = await Listing.find({}).lean();
    console.log(`Found ${allListings.length} listings in the database`);
    
    // List the collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log('- ' + collection.name);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main(); 