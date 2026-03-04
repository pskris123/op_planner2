require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: true, // Reflect request origin during temporary testing/deployment
    credentials: true
}));

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

app.get('/api/debug-env', (req, res) => {
    res.json({
        mongoUriType: typeof process.env.MONGODB_URI,
        mongoUriExists: !!process.env.MONGODB_URI,
        allKeys: Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('SUPA'))
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
