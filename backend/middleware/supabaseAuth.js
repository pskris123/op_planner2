const { createClient } = require('@supabase/supabase-js');

const isSupabaseConfigured = process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_project_url';

const supabase = isSupabaseConfigured
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
    : null;

const verifySupabaseToken = async (req, res, next) => {
    // TEMPORARY: Bypass auth for Vercel deployment if IGNORE_AUTH is set
    if (process.env.IGNORE_AUTH === 'true') {
        req.user = {
            id: 'guest_user_id',
            email: 'guest@momentum.app',
            user_metadata: {
                full_name: 'Guest User',
                avatar_url: 'https://i.ibb.co/4n3L09RV/generated-image.jpg'
            }
        };
        return next();
    }

    if (!supabase) {
        console.warn('⚠️ Supabase Auth is not configured. Authentication will fail.');
        return res.status(503).json({ error: 'Authentication service not configured' });
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Supabase auth error:', error);
        res.status(500).json({ error: 'Authentication service error' });
    }
};

module.exports = verifySupabaseToken;
