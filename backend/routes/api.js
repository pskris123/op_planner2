const express = require('express');
const router = express.Router();
const verifySupabaseToken = require('../middleware/supabaseAuth');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to get Gemini instance dynamically
const getGenAI = () => {
    if (process.env.GEMINI_API_KEY) {
        return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return null;
};

// Helper to get or create user
const getOrCreateUser = async (supabaseUser) => {
    try {
        let user = await User.findOne({ supabaseId: supabaseUser.id });
        if (!user) {
            user = new User({
                supabaseId: supabaseUser.id,
                email: supabaseUser.email,
                name: supabaseUser.user_metadata?.full_name || supabaseUser.email || 'Unknown User',
                picture: supabaseUser.user_metadata?.avatar_url || '',
                goals: [],
                focusTasks: [],
                events: []
            });
            await user.save();
        }
        return user;
    } catch (err) {
        console.error("getOrCreateUser error:", err);
        throw err;
    }
};

// ============ GOALS API ============

// @route   GET /api/goals
// @desc    Get all goals for authenticated user
router.get('/goals', async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user);
        res.json(user.goals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/goals
// @desc    Create new goal
router.post('/goals', async (req, res) => {
    try {
        const { title, steps } = req.body;

        const user = await getOrCreateUser(req.user);
        user.goals.push({
            title,
            steps: steps.map(s => ({
                title: typeof s === 'string' ? s : s.title,
                completed: s.completed || false
            })),
            createdAt: Date.now()
        });

        await user.save();
        res.status(201).json(user.goals[user.goals.length - 1]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   PUT /api/goals/:id
// @desc    Update goal
router.put('/goals/:id', async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user);
        const goal = user.goals.id(req.params.id);

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        if (req.body.title) goal.title = req.body.title;
        if (req.body.steps) goal.steps = req.body.steps;

        await user.save();
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   DELETE /api/goals/:id
// @desc    Delete goal
router.delete('/goals/:id', async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user);
        user.goals.pull(req.params.id);
        await user.save();
        res.json({ message: 'Goal deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   PUT /api/goals/:goalId/steps/:stepId
// @desc    Toggle step completion
router.put('/goals/:goalId/steps/:stepId', async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user);
        const goal = user.goals.id(req.params.goalId);

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        const step = goal.steps.id(req.params.stepId);
        if (!step) {
            return res.status(404).json({ error: 'Step not found' });
        }

        step.completed = req.body.completed !== undefined ? req.body.completed : !step.completed;

        await user.save();
        res.json(step);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ FOCUS TASKS API ============

// @route   GET /api/focus-tasks
// @desc    Get all focus tasks
router.get('/focus-tasks', async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user);
        res.json(user.focusTasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/focus-tasks
// @desc    Create focus task
router.post('/focus-tasks', async (req, res) => {
    try {
        const { title } = req.body;

        const user = await getOrCreateUser(req.user);
        user.focusTasks.push({ title });

        await user.save();
        res.status(201).json(user.focusTasks[user.focusTasks.length - 1]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   PUT /api/focus-tasks/:id
// @desc    Update focus task
router.put('/focus-tasks/:id', async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user);
        const task = user.focusTasks.id(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (req.body.title) task.title = req.body.title;

        await user.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   DELETE /api/focus-tasks/:id
// @desc    Delete focus task
router.delete('/focus-tasks/:id', async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user);
        user.focusTasks.pull(req.params.id);
        await user.save();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ EVENTS API ============

// @route   GET /api/events
// @desc    Get all events
router.get('/events', async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user);
        res.json(user.events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/events
// @desc    Create event(s) - supports recurring events
router.post('/events', async (req, res) => {
    try {
        const events = Array.isArray(req.body) ? req.body : [req.body];

        const user = await getOrCreateUser(req.user);

        events.forEach(event => {
            user.events.push({
                title: event.title,
                day: event.day,
                from: event.from,
                to: event.to,
                priority: event.priority || 'medium',
                frequency: event.frequency || 'once'
            });
        });

        await user.save();
        res.status(201).json(events.length === 1 ? user.events[user.events.length - 1] : events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/events/:id
// @desc    Update event
router.put('/events/:id', async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user);
        const event = user.events.id(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (req.body.title) event.title = req.body.title;
        if (req.body.day) event.day = req.body.day;
        if (req.body.from) event.from = req.body.from;
        if (req.body.to) event.to = req.body.to;
        if (req.body.priority) event.priority = req.body.priority;
        if (req.body.frequency) event.frequency = req.body.frequency;

        await user.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
router.delete('/events/:id', async (req, res) => {
    try {
        const user = await getOrCreateUser(req.user);
        user.events.pull(req.params.id);
        await user.save();
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ AI SUGGESTIONS API ============

// @route   GET /api/ai/suggestions
// @desc    Get AI-powered productivity suggestions
router.get('/ai/suggestions', async (req, res) => {
    try {
        const genAI = getGenAI();
        if (!genAI) {
            return res.json({
                text: "To enable dynamic AI suggestions, please add your GEMINI_API_KEY to the backend .env file. I can help you find gaps in your schedule once that's set up!",
                action: null
            });
        }

        const user = await getOrCreateUser(req.user);
        const { goals, focusTasks, events } = user;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a productivity assistant for an app called "Momentum".
            The user has the following:
            GOALS: ${JSON.stringify(goals.map(g => ({ title: g.title, steps: g.steps })))}
            TASKS: ${JSON.stringify(focusTasks.map(t => t.title))}
            EXISTING SCHEDULE: ${JSON.stringify(events.map(e => ({ day: e.day, from: e.from, to: e.to, title: e.title })))}

            Current context: Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}.

            TASK:
            1. Analyze the schedule for gaps (between 8 AM and 8 PM).
            2. Suggest ONE specific action (either a focus task or a goal step) to fill a gap.
            3. If there are no obvious gaps, suggest a habit or review task.
            4. Keep the suggestion under 15 words.
            5. Return a JSON object in this format:
               {
                 "text": "Your brief suggestion string here",
                 "action": {
                   "title": "Short title of the suggested event",
                   "day": "Day Name (e.g. Monday)",
                   "from": "HH:MM",
                   "to": "HH:MM"
                 }
               }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up JSON if model returns markdown
        text = text.replace(/```json|```/g, '').trim();

        try {
            const suggestion = JSON.parse(text);
            res.json(suggestion);
        } catch (e) {
            // Fallback if parsing fails
            res.json({
                text: text.substring(0, 100),
                action: null
            });
        }
    } catch (error) {
        console.error('AI Suggestion Error:', error);
        res.status(500).json({ error: 'Failed to generate AI suggestion' });
    }
});

// @route   POST /api/ai/refine-goal
// @desc    Use AI to break down a goal into steps
router.post('/ai/refine-goal', async (req, res) => {
    try {
        const genAI = getGenAI();
        if (!genAI) {
            return res.status(400).json({ error: 'Gemini API not configured' });
        }

        const { title } = req.body;
        if (!title) return res.status(400).json({ error: 'Goal title is required' });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an expert project manager and productivity coach.
            The user has a goal: "${title}"
            
            TASK:
            Break this goal down into 5-7 actionable, logical, and specific steps.
            Keep each step concise (under 8 words).
            Return the steps as a JSON array of strings.
            
            Example Format: ["Step 1", "Step 2", "Step 3"]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json|```/g, '').trim();

        try {
            const steps = JSON.parse(text);
            res.json({ steps });
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse AI response' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
