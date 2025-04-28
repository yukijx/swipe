const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const readline = require('readline');

const CLEAR_ALL = process.argv[2] === 'all';
const SPECIFIC_COLLECTIONS = process.argv.slice(2);

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB Connected");
  promptUser();
})
.catch(err => {
  console.error("MongoDB Connection Error:", err);
  process.exit(1);
});

function promptUser() {
  if (CLEAR_ALL) {
    confirmClearAll();
  } else if (SPECIFIC_COLLECTIONS.length > 0) {
    confirmClearCollections(SPECIFIC_COLLECTIONS);
  } else {
    listCollections();
  }
}

async function listCollections() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('\nAvailable collections:');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    console.log('\nOptions:');
    console.log('  - Enter collection numbers separated by spaces to clear specific collections');
    console.log('  - Type "all" to clear all collections');
    console.log('  - Type "exit" to quit without making changes');
    
    rl.question('\nWhat would you like to do? ', (answer) => {
      if (answer.toLowerCase() === 'exit') {
        console.log('Exiting without changes.');
        closeConnection();
      } else if (answer.toLowerCase() === 'all') {
        confirmClearAll();
      } else {
        // Parse selected collection numbers
        const selectedIndices = answer.split(' ')
          .map(num => parseInt(num.trim()) - 1)
          .filter(num => !isNaN(num) && num >= 0 && num < collections.length);
        
        if (selectedIndices.length === 0) {
          console.log('No valid collections selected. Exiting.');
          closeConnection();
        } else {
          const selectedCollections = selectedIndices.map(index => collections[index].name);
          confirmClearCollections(selectedCollections);
        }
      }
    });
  } catch (error) {
    console.error('Error listing collections:', error);
    closeConnection();
  }
}

function confirmClearAll() {
  rl.question('⚠️ WARNING: This will clear ALL collections in the database. Type "CONFIRM" to proceed: ', (answer) => {
    if (answer === 'CONFIRM') {
      clearAllCollections();
    } else {
      console.log('Clear operation cancelled.');
      closeConnection();
    }
  });
}

function confirmClearCollections(collections) {
  rl.question(`⚠️ WARNING: This will clear the following collections: ${collections.join(', ')}. Type "CONFIRM" to proceed: `, (answer) => {
    if (answer === 'CONFIRM') {
      clearSpecificCollections(collections);
    } else {
      console.log('Clear operation cancelled.');
      closeConnection();
    }
  });
}

async function clearAllCollections() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Clearing all collections...');
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`Collection '${collection.name}' cleared.`);
    }
    
    console.log('✅ All collections have been cleared successfully!');
    closeConnection();
  } catch (error) {
    console.error('Error clearing collections:', error);
    closeConnection();
  }
}

async function clearSpecificCollections(collectionNames) {
  try {
    console.log('Clearing specified collections...');
    
    for (const name of collectionNames) {
      try {
        await mongoose.connection.db.collection(name).deleteMany({});
        console.log(`Collection '${name}' cleared.`);
      } catch (err) {
        console.error(`Error clearing collection '${name}':`, err);
      }
    }
    
    console.log('✅ Specified collections have been cleared.');
    closeConnection();
  } catch (error) {
    console.error('Error clearing collections:', error);
    closeConnection();
  }
}

function closeConnection() {
  rl.close();
  mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
} 