const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        // Ensure uri is exactly a string 
        const uri = String(process.env.MONGODB_URI);
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
            console.log(`✅ MongoDB Connected`);
            return mongoose;
        }).catch(err => {
            console.error(`❌ Error connecting to MongoDB: ${err.message}`);
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

module.exports = connectDB;
