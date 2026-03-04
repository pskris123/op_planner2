// API Service Layer
const API = {
    // Authentication
    async checkAuth() {
        // Return a mock guest user for simplified deployment
        return {
            user: {
                id: 'guest_user_id',
                name: 'Guest User',
                email: 'guest@momentum.app',
                picture: 'https://i.ibb.co/4n3L09RV/generated-image.jpg'
            }
        };
    },

    async logout() {
        return true;
    },

    // Goals API
    async getGoals() {
        const response = await fetch(`${API_BASE_URL}/api/goals`);
        if (!response.ok) throw new Error('Failed to fetch goals');
        return await response.json();
    },

    async createGoal(goalData) {
        const response = await fetch(`${API_BASE_URL}/api/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goalData)
        });
        if (!response.ok) throw new Error('Failed to create goal');
        return await response.json();
    },

    async updateGoal(goalId, updates) {
        const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update goal');
        return await response.json();
    },

    async deleteGoal(goalId) {
        const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete goal');
        return await response.json();
    },

    async toggleStep(goalId, stepId, completed) {
        const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}/steps/${stepId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed })
        });
        if (!response.ok) throw new Error('Failed to toggle step');
        return await response.json();
    },

    // Focus Tasks API
    async getFocusTasks() {
        const response = await fetch(`${API_BASE_URL}/api/focus-tasks`);
        if (!response.ok) throw new Error('Failed to fetch focus tasks');
        return await response.json();
    },

    async createFocusTask(taskData) {
        const response = await fetch(`${API_BASE_URL}/api/focus-tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Failed to create focus task');
        return await response.json();
    },

    async updateFocusTask(taskId, updates) {
        const response = await fetch(`${API_BASE_URL}/api/focus-tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update focus task');
        return await response.json();
    },

    async deleteFocusTask(taskId) {
        const response = await fetch(`${API_BASE_URL}/api/focus-tasks/${taskId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete focus task');
        return await response.json();
    },

    // Events API
    async getEvents() {
        const response = await fetch(`${API_BASE_URL}/api/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    },

    async createEvents(eventsData) {
        const response = await fetch(`${API_BASE_URL}/api/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventsData)
        });
        if (!response.ok) throw new Error('Failed to create events');
        return await response.json();
    },

    async updateEvent(eventId, updates) {
        const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update event');
        return await response.json();
    },

    async deleteEvent(eventId) {
        const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete event');
        return await response.json();
    },

    // AI Suggestions
    async getAISuggestions() {
        const response = await fetch(`${API_BASE_URL}/api/ai/suggestions`);
        if (!response.ok) throw new Error('Failed to fetch AI suggestions');
        return await response.json();
    },

    async refineGoal(title) {
        const response = await fetch(`${API_BASE_URL}/api/ai/refine-goal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });
        if (!response.ok) throw new Error('Failed to refine goal');
        return await response.json();
    }
};

const API_BASE_URL = ''; // Relative for Vercel deployment

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
    document.getElementById('logout-btn').style.display = 'none'; // Hide logout in guest mode
}

function showLoginButton() {
    document.getElementById('user-profile').style.display = 'none';
    document.getElementById('login-btn').style.display = 'none'; // Hide login button as well
    // Directly init as guest if auth check fails for some reason
    initAuth();
}

// Event Listeners for Auth
document.getElementById('login-btn').addEventListener('click', async () => {
    // Disabled for Vercel deployment
    console.log('Login disabled');
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
