// api-render.js
// Thin wrapper around the original script.js render functions
// This ensures that authenticated data is rendered using the exact same logic as guest data.

function renderGoalsFromAPI(goals) {
    if (window.renderGoals) {
        window.renderGoals(goals);
    }
}

function renderFocusTasksFromAPI(tasks) {
    if (window.renderFocusTasks) {
        window.renderFocusTasks(tasks);
    }
}

function renderEventsFromAPI(events) {
    if (window.renderPlanner) {
        window.renderPlanner(events);
    }
}

function updateDashboardFromAPI() {
    if (window.updateDashboardWidgets) {
        const data = {
            goals: window.goalsData,
            tasks: window.focusTasksData,
            events: window.eventsData
        };
        window.updateDashboardWidgets(data);
    }
}

// Helpers for event handlers in script.js to call back to API
window.updateEventFromAPI = async (eventId, updates) => {
    try {
        await window.MomentumAPI.updateEvent(eventId, updates);
        await window.reloadData();
    } catch (error) {
        alert('Failed to update event: ' + error.message);
    }
};

window.deleteEventFromAPI = async (eventId) => {
    if (!confirm('Delete this event?')) return;
    try {
        await window.MomentumAPI.deleteEvent(eventId);
        await window.reloadData();
    } catch (error) {
        alert('Failed to delete event: ' + error.message);
    }
};

window.updateFocusTaskFromAPI = async (taskId, updates) => {
    try {
        await window.MomentumAPI.updateFocusTask(taskId, updates);
        await window.reloadData();
    } catch (error) {
        alert('Failed to update task: ' + error.message);
    }
};

window.deleteFocusTaskFromAPI = async (taskId) => {
    if (!confirm('Delete this focus task?')) return;
    try {
        await window.MomentumAPI.deleteFocusTask(taskId);
        await window.reloadData();
    } catch (error) {
        alert('Failed to delete task: ' + error.message);
    }
};

// Re-map the API creating listeners as well
// These were originally in api-render.js, we keep them here but they are simpler now
document.addEventListener('DOMContentLoaded', () => {
    const saveGoalBtn = document.getElementById('saveGoalBtn');
    if (saveGoalBtn) {
        saveGoalBtn.addEventListener('click', async (e) => {
            if (!window.isUserAuthenticated()) return;
            e.stopImmediatePropagation();

            const title = document.getElementById('goalTitleInput').value.trim();
            const stepsRaw = document.getElementById('goalStepsInput').value.split(',').map(s => s.trim()).filter(Boolean);

            if (!title || stepsRaw.length === 0) {
                alert('Enter goal title and at least one step');
                return;
            }

            try {
                await window.MomentumAPI.createGoal({ title, steps: stepsRaw });
                document.getElementById('goalTitleInput').value = '';
                document.getElementById('goalStepsInput').value = '';
                await window.reloadData();
            } catch (error) {
                alert('Failed to create goal: ' + error.message);
            }
        });
    }

    const addFocusTaskBtn = document.getElementById('addFocusTaskBtn');
    if (addFocusTaskBtn) {
        addFocusTaskBtn.addEventListener('click', async (e) => {
            if (!window.isUserAuthenticated()) return;
            e.stopImmediatePropagation();

            const val = document.getElementById('focusTaskInput').value.trim();
            if (!val) {
                alert('Enter a focus task title');
                return;
            }

            try {
                await window.MomentumAPI.createFocusTask({ title: val });
                document.getElementById('focusTaskInput').value = '';
                await window.reloadData();
            } catch (error) {
                alert('Failed to create task: ' + error.message);
            }
        });
    }

});
