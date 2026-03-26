"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoClient = exports.Db = exports.Collection = void 0;
exports.connectToMongoDB = connectToMongoDB;
exports.getMongoDb = getMongoDb;
exports.disconnectFromMongoDB = disconnectFromMongoDB;
const mongodb_1 = require("mongodb");
Object.defineProperty(exports, "Collection", { enumerable: true, get: function () { return mongodb_1.Collection; } });
Object.defineProperty(exports, "Db", { enumerable: true, get: function () { return mongodb_1.Db; } });
Object.defineProperty(exports, "MongoClient", { enumerable: true, get: function () { return mongodb_1.MongoClient; } });
// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soccer-bot';
const DB_NAME = process.env.MONGODB_DB_NAME || 'soccer-bot';
let client = null;
let db = null;
// Connection state
let isConnecting = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;
async function connectToMongoDB() {
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
        client = new mongodb_1.MongoClient(MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 3000, // Faster timeout
            socketTimeoutMS: 10000, // Faster timeout
            retryWrites: true,
            w: 'majority'
        });
        await client.connect();
        db = client.db(DB_NAME);
        // Create indexes for better performance
        await createIndexes();
        console.log('✅ Connected to MongoDB successfully');
        connectionRetries = 0;
        return db;
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        connectionRetries++;
        if (connectionRetries < 2) { // Only retry once
            console.log(`🔄 Retrying MongoDB connection (${connectionRetries}/2)...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Shorter delay
            return connectToMongoDB();
        }
        else {
            console.error('❌ MongoDB connection failed permanently, switching to file storage');
            throw error; // Let the caller handle the fallback
        }
    }
    finally {
        isConnecting = false;
    }
}
async function createIndexes() {
    if (!db)
        return;
    try {
        // Create index for daily data
        await db.collection('daily_data').createIndex({ date: 1 }, { unique: true });
        console.log('📊 MongoDB indexes created');
    }
    catch (error) {
        console.log('⚠️ Index creation failed (may already exist):', error);
    }
}
async function getMongoDb() {
    if (!db) {
        return await connectToMongoDB();
    }
    return db;
}
async function disconnectFromMongoDB() {
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
