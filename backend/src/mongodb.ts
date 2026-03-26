import { Collection, Db, MongoClient } from 'mongodb';

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soccer-bot';
const DB_NAME = process.env.MONGODB_DB_NAME || 'soccer-bot';

export { Collection, Db, MongoClient };

let client: MongoClient | null = null;
let db: Db | null = null;

// Connection state
let isConnecting = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  if (isConnecting) {
    // Wait for connection to complete
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (db) {
      return db;
    }
  }

  isConnecting = true;

  try {
    console.log('🔄 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    db = client.db(DB_NAME);
    
    // Create indexes for better performance
    await createIndexes();
    
    console.log('✅ Connected to MongoDB successfully');
    connectionRetries = 0;
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    connectionRetries++;
    
    if (connectionRetries < MAX_RETRIES) {
      console.log(`🔄 Retrying MongoDB connection (${connectionRetries}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * connectionRetries));
      return connectToMongoDB();
    } else {
      console.error('❌ Max MongoDB connection retries reached');
      throw error;
    }
  } finally {
    isConnecting = false;
  }
}

async function createIndexes() {
  if (!db) return;
  
  try {
    // Create index for daily data
    await db.collection('daily_data').createIndex({ date: 1 }, { unique: true });
    console.log('📊 MongoDB indexes created');
  } catch (error) {
    console.log('⚠️ Index creation failed (may already exist):', error);
  }
}

export async function getMongoDb(): Promise<Db> {
  if (!db) {
    return await connectToMongoDB();
  }
  return db;
}

export async function disconnectFromMongoDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});
