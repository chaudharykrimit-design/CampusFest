const { MongoClient } = require('mongodb');

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Please define MONGODB_URI environment variable");

    const client = await MongoClient.connect(uri);
    const db = client.db('campusfest');
    cachedDb = db;
    return db;
}

module.exports = connectToDatabase;
