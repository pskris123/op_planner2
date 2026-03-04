// Supabase Configuration (Placeholder values - update with your actual project details)
const SUPABASE_URL = 'https://osbbvyprcjgoswpelfyi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zYmJ2eXByY2pnb3N3cGVsZnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTE2NDMsImV4cCI6MjA4ODE2NzY0M30.KM1KrE7j-XUs8RMhwLeCe5A6IbeQ-i1xSHt4CLa1FeY';

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// API Service Layer
const API = {
    // Authentication
    async checkAuth() {
        if (!supabase) return null;
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (session && session.user) {
                // Map Supabase user to the format expected by the app
                return {
                    user: {
                        id: session.user.id,
                        name: session.user.user_metadata.full_name || session.user.email,
                        email: session.user.email,
                        picture: session.user.user_metadata.avatar_url || 'https://i.ibb.co/4n3L09RV/generated-image.jpg'
                    }
                };
            }
            return null;
        } catch (error) {
            console.error('Auth check failed:', error);
            return null;
        }
    },

    async logout() {
        if (!supabase) return false;
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Logout failed:', error);
            return false;
        }
    },

    // Goals API
    async getGoals() {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/goals`, {
            headers: {
                'Authorization': `Bearer ${session?.access_token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch goals');
        return await response.json();
    },

    async createGoal(goalData) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(goalData)
        });
        if (!response.ok) throw new Error('Failed to create goal');
        return await response.json();
    },

    async updateGoal(goalId, updates) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update goal');
        return await response.json();
    },

    async deleteGoal(goalId) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session?.access_token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete goal');
        return await response.json();
    },

    async toggleStep(goalId, stepId, completed) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/steps/${stepId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ completed })
        });
        if (!response.ok) throw new Error('Failed to toggle step');
        return await response.json();
    },

    // Focus Tasks API
    async getFocusTasks() {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/focus-tasks`, {
            headers: {
                'Authorization': `Bearer ${session?.access_token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch focus tasks');
        return await response.json();
    },

    async createFocusTask(taskData) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/focus-tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Failed to create focus task');
        return await response.json();
    },

    async updateFocusTask(taskId, updates) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/focus-tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update focus task');
        return await response.json();
    },

    async deleteFocusTask(taskId) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/focus-tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session?.access_token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete focus task');
        return await response.json();
    },

    // Events API
    async getEvents() {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/events`, {
            headers: {
                'Authorization': `Bearer ${session?.access_token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    },

    async createEvents(eventsData) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(eventsData)
        });
        if (!response.ok) throw new Error('Failed to create events');
        return await response.json();
    },

    async updateEvent(eventId, updates) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update event');
        return await response.json();
    },

    async deleteEvent(eventId) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session?.access_token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete event');
        return await response.json();
    },

    // AI Suggestions
    async getAISuggestions() {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/ai/suggestions`, {
            headers: {
                'Authorization': `Bearer ${session?.access_token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch AI suggestions');
        return await response.json();
    },

    async refineGoal(title) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${API_BASE_URL}/api/ai/refine-goal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ title })
        });
        if (!response.ok) throw new Error('Failed to refine goal');
        return await response.json();
    }
};

const API_BASE_URL = ''; // Keep relative for Vercel

// Authentication State Management
let currentUser = null;
let isAuthenticated = false;

async function initAuth() {
    const authData = await API.checkAuth();

    if (authData && authData.user) {
        currentUser = authData.user;
        isAuthenticated = true;
        showUserProfile(authData.user);
        await loadAllData();
    } else {
        showLoginButton();
    }
}

function showUserProfile(user) {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('user-profile').style.display = 'flex';
    document.getElementById('user-avatar').src = user.picture;
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('logout-btn').style.display = 'block'; // Show logout again
}

function showLoginButton() {
    document.getElementById('user-profile').style.display = 'none';
    document.getElementById('login-btn').style.display = 'block';
}

// Event Listeners for Auth
document.getElementById('login-btn').addEventListener('click', async () => {
    if (!supabase) {
        alert('Authentication service is not initialized. Please check your configuration.');
        return;
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) console.error('Login failed:', error.message);
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    const success = await API.logout();
    if (success) {
        currentUser = null;
        isAuthenticated = false;
        showLoginButton();
        // Clear UI
        document.getElementById('goals-container').innerHTML = '';
        document.getElementById('todays-focus-list').innerHTML = '';
        document.getElementById('planner').innerHTML = '';
    }
});

// Data Loading Functions
async function loadAllData() {
    try {
        // Load all data from backend
        const [goals, focusTasks, events] = await Promise.all([
            API.getGoals(),
            API.getFocusTasks(),
            API.getEvents()
        ]);

        // Store in global variables for compatibility with existing code
        window.goalsData = goals;
        window.focusTasksData = focusTasks;
        window.eventsData = events;

        // Render all sections
        renderGoalsFromAPI(goals);
        renderFocusTasksFromAPI(focusTasks);
        renderEventsFromAPI(events);
        updateDashboardFromAPI();

        // Ensure we scroll to current time after all data is rendered
        if (window.scrollToCurrentTime) {
            setTimeout(window.scrollToCurrentTime, 150);
        }
    } catch (error) {
        console.error('Failed to load data:', error);
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            showLoginButton();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
});

// Helper function to show loading state
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Loading...</p>';
    }
}

// Helper function to show error
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<p style="text-align:center;color:var(--danger);">${message}</p>`;
    }
}

// Export for use in other scripts
window.MomentumAPI = API;
window.isUserAuthenticated = () => isAuthenticated;
window.getCurrentUser = () => currentUser;
window.reloadData = loadAllData;
