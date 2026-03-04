require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// Connect to MongoDB
const connectDB = require('./config/database');

const app = express();

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection failed in middleware:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: true, // Reflect request origin during temporary testing/deployment
    credentials: true
}));

// Add the debug route here before auth middleware
app.get('/api/debug-env', (req, res) => {
    res.json({
        mongoUriType: typeof process.env.MONGODB_URI,
        mongoUriExists: !!process.env.MONGODB_URI,
        allKeys: Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('SUPA'))
    });
});

// Full diagnostic endpoint - tests auth + DB together
app.get('/api/test-auth-db', async (req, res) => {
    const results = { steps: [] };
    try {
        // Step 1: Check env vars
        results.steps.push({ step: 'env', supabaseUrl: !!process.env.SUPABASE_URL, supabaseKey: !!process.env.SUPABASE_ANON_KEY, mongoUri: !!process.env.MONGODB_URI });

        // Step 2: Check auth header
        const authHeader = req.headers.authorization;
        results.steps.push({ step: 'authHeader', exists: !!authHeader, value: authHeader ? authHeader.substring(0, 20) + '...' : null });

        // Step 3: Test Supabase
        const { createClient } = require('@supabase/supabase-js');
        const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        results.steps.push({ step: 'supabaseClient', created: true });

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const { data, error } = await supa.auth.getUser(token);
                results.steps.push({ step: 'supabaseGetUser', success: !error, userId: data?.user?.id, error: error?.message });
            } catch (e) {
                results.steps.push({ step: 'supabaseGetUser', success: false, error: e.message });
            }
        }

        // Step 4: Test MongoDB
        const mongoose = require('mongoose');
        results.steps.push({ step: 'mongooseState', readyState: mongoose.connection.readyState });

        try {
            await connectDB();
            results.steps.push({ step: 'connectDB', success: true, readyState: mongoose.connection.readyState });
        } catch (e) {
            results.steps.push({ step: 'connectDB', success: false, error: e.message });
        }

        res.json(results);
    } catch (e) {
        results.steps.push({ step: 'fatal', error: e.message, stack: e.stack });
        res.status(500).json(results);
    }
});

// Routes
const verifySupabaseToken = require('./middleware/supabaseAuth');
app.use('/api', verifySupabaseToken, require('./routes/api'));

// Health check route
app.get('/', (req, res) => {
    res.json({
        message: 'Momentum API Server (Supabase Auth)',
        status: 'running'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server locally (ignored by Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Export the app for Vercel Serverless Functions
module.exports = app;
