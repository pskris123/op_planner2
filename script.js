const STORAGE_KEYS = {
    FOCUS_TASKS: 'momentum_focus_tasks',
    GOALS: 'momentum_goals',
    EVENTS: 'momentum_enhanced_events'
};
window.STORAGE_KEYS = STORAGE_KEYS;

function safeParse(json) {
    try {
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

function loadData(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = safeParse(raw);
    return Array.isArray(parsed) ? parsed : [];
}
window.loadData = loadData;

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save to localStorage', e);
    }
}
window.saveData = saveData;

/* --- Navigation --- */
function createMiniPlanner() {
    const container = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Weekly Overview';
    title.style.marginBottom = '1.5rem';
    container.appendChild(title);

    const plannerGrid = document.createElement('div');
    plannerGrid.style.display = 'grid';
    plannerGrid.style.gridTemplateColumns = '70px repeat(7, 1fr)';
    plannerGrid.style.gap = '8px';
    plannerGrid.style.fontSize = '0.75rem';

    // Create day headers
    plannerGrid.appendChild(document.createElement('div')); // Empty corner
    DAYS.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.textContent = day.substring(0, 3);
        dayHeader.style.fontFamily = "'JetBrains Mono', 'IBM Plex Mono', monospace";
        dayHeader.style.fontWeight = '600';
        dayHeader.style.textAlign = 'center';
        dayHeader.style.color = '#1A1814'; // Near black
        dayHeader.style.padding = '8px';
        dayHeader.style.background = '#FAFAF7'; // Off-white
        dayHeader.style.border = '1px solid #D9D3C7'; // Warm gray
        dayHeader.style.borderRadius = '4px';
        dayHeader.style.textTransform = 'uppercase';
        plannerGrid.appendChild(dayHeader);
    });

    // Create hour rows
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
    hours.forEach(hour => {
        // Time label
        const timeLabel = document.createElement('div');
        timeLabel.textContent = `${hour}:00`;
        timeLabel.style.fontFamily = "'JetBrains Mono', 'IBM Plex Mono', monospace";
        timeLabel.style.fontWeight = '600';
        timeLabel.style.color = '#7A7468';
        timeLabel.style.textAlign = 'right';
        timeLabel.style.padding = '6px';
        timeLabel.style.background = 'transparent';
        timeLabel.style.border = 'none';
        timeLabel.style.borderRight = '1px solid #D9D3C7';
        timeLabel.style.borderRadius = '0';
        plannerGrid.appendChild(timeLabel);

        // Day slots for this hour
        DAYS.forEach(day => {
            const slot = document.createElement('div');
            slot.style.minHeight = '30px';
            slot.style.background = 'transparent';
            slot.style.borderBottom = '1px solid #D9D3C7';
            slot.style.borderRadius = '0';
            slot.style.padding = '4px 8px';
            slot.style.overflow = 'hidden';
            slot.style.whiteSpace = 'nowrap';
            slot.style.textOverflow = 'ellipsis';
            slot.style.fontSize = '0.75rem';
            slot.style.transition = 'all 0.2s ease';

            // Find event starting in this hour on this day
            const event = events.find(ev => ev.day === day && ev.from.startsWith(String(hour).padStart(2, '0')));
            if (event) {
                slot.textContent = event.title;
                slot.title = event.title; // Tooltip on hover
                slot.style.fontWeight = '500';
                slot.style.color = '#FAFAF7';

                // Style based on priority
                if (event.priority === 'high') {
                    slot.style.background = '#1A1814'; // Near black
                    slot.style.boxShadow = 'none';
                } else if (event.priority === 'medium') {
                    slot.style.background = '#7A7468'; // Medium warm gray
                    slot.style.color = '#FAFAF7';
                    slot.style.boxShadow = 'none';
                } else {
                    slot.style.background = '#D9D3C7'; // Warm gray border color
                    slot.style.color = '#1A1814';
                    slot.style.border = '1px solid #7A7468';
                    slot.style.boxShadow = 'none';
                }
            }
            plannerGrid.appendChild(slot);
        });
    });

    container.appendChild(plannerGrid);
    return container;
}

function renderMiniPlanner(data) {
    const container = document.getElementById('mini-planner-container');
    if (container) {
        container.innerHTML = '';
        container.appendChild(createMiniPlanner(data));
    }
}

/* --- Navigation --- */
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tabs li');
    const mobileTabs = document.querySelectorAll('.mobile-nav-item');
    const pages = document.querySelectorAll('.page');
    const logoLink = document.querySelector('.logo-link');

    function switchPage(pageId) {
        // Sync Pages
        pages.forEach(p => {
            p.classList.remove('active');
            if (p.id === `page-${pageId}`) p.classList.add('active');
        });

        // Sync Desktop Tabs
        tabs.forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-page') === pageId);
        });

        // Sync Mobile Nav
        mobileTabs.forEach(mt => {
            mt.classList.toggle('active', mt.getAttribute('data-page') === pageId);
        });

        // Force scroll if we switched to planner
        if (pageId === 'planner') {
            setTimeout(scrollToCurrentTime, 100);
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            switchPage(this.getAttribute('data-page'));
        });
    });

    mobileTabs.forEach(mtab => {
        mtab.addEventListener('click', function () {
            switchPage(this.getAttribute('data-page'));
        });
    });

    if (logoLink) {
        logoLink.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default link behavior
            switchPage('dashboard');
        });
    }
});

/* --- Enhanced Calendar Integration --- */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Generate times every 5 minutes for 24 hours
let times = [];
for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
        times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
}

// Expand to 24 hours
let showPastTimes = false; // By default, hide past times
window.events = loadData(STORAGE_KEYS.EVENTS);
let events = window.events;

// Frequency handling
document.getElementById('frequency').onchange = function () {
    const freqOptions = document.getElementById('frequency-options');
    const customDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    if (this.value === 'once') {
        freqOptions.classList.remove('show');
    } else {
        freqOptions.classList.add('show');

        customDays.forEach(day => {
            const checkbox = document.getElementById(day);
            checkbox.checked = false;
        });

        if (this.value === 'weekdays') {
            ['mon', 'tue', 'wed', 'thu', 'fri'].forEach(day => {
                document.getElementById(day).checked = true;
            });
        } else if (this.value === 'weekends') {
            ['sat', 'sun'].forEach(day => {
                document.getElementById(day).checked = true;
            });
        } else if (this.value === 'daily') {
            customDays.forEach(day => {
                document.getElementById(day).checked = true;
            });
        } else if (this.value === 'weekly') {
            const currentDay = document.getElementById('day').value;
            const dayIndex = DAYS.indexOf(currentDay);
            if (dayIndex !== -1) {
                document.getElementById(SHORT_DAYS[dayIndex].toLowerCase()).checked = true;
            }
        }
    }
};

function tMin(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function floorToSlot(timeStr) {
    const total = tMin(timeStr);
    const floored = Math.floor(total / 5) * 5;
    const h = Math.floor(floored / 60);
    const m = floored % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function ceilToSlot(timeStr) {
    const total = tMin(timeStr);
    const ceiled = Math.ceil(total / 5) * 5;
    const h = Math.floor(ceiled / 60);
    const m = ceiled % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Helper for Add Event form - snaps to 5-min intervals
function roundToNearestSlot(timeStr) {
    return floorToSlot(timeStr);
}


function scrollToCurrentTime() {
    const container = document.querySelector('.planner-section');
    const planner = document.getElementById('planner');
    if (!container || !planner) return;

    if (planner.classList.contains('hide-past')) {
        container.scrollTop = 0;
        return;
    }

    const now = new Date();
    const h = now.getHours();
    const m = Math.floor(now.getMinutes() / 5) * 5;
    const currentTimeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    const labels = document.querySelectorAll('.time-label');
    for (let label of labels) {
        if (label.textContent === currentTimeStr) {
            container.scrollTop = label.offsetTop - container.offsetTop;
            break;
        }
    }
}

function updateNowMarker() {
    let marker = document.querySelector('.now-marker');
    const planner = document.getElementById('planner');
    const grid = document.querySelector('.planner-grid');
    if (!grid || !planner) return;

    if (!marker) {
        marker = document.createElement('div');
        marker.className = 'now-marker';
        grid.appendChild(marker);
    }

    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();

    // Each 5-min slot is 15px (row 2 starts the slots)
    // Row index = Math.floor(totalMinutes / 5) + 2
    // Extra offset = (totalMinutes % 5) * 3px (since 5 mins = 15px)
    let rIndex = Math.floor(totalMinutes / 5) + 2;
    const offset = (totalMinutes % 5) * 3;

    if (planner.classList.contains('hide-past')) {
        // In hidden mode, the current time is always at the top (row 2)
        rIndex = 2;
    }

    marker.style.gridRow = String(rIndex);
    marker.style.transform = `translateY(${offset}px)`;
}

function renderPlanner(data) {
    const eventsToUse = data || loadData(STORAGE_KEYS.EVENTS);
    const planner = document.getElementById('planner');
    if (!planner) return;

    // Apply visibility class
    if (!showPastTimes) {
        planner.classList.add('hide-past');
    } else {
        planner.classList.remove('hide-past');
    }

    // Determine visible times based on toggle
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTotalMin = currentH * 60 + currentM;

    let visibleTimes = times;
    if (planner.classList.contains('hide-past')) {
        // Find the first slot index that is NOT past (inclusive of current slot)
        const firstSlotIndex = Math.floor(currentTotalMin / 5);
        visibleTimes = times.slice(firstSlotIndex);
    }

    planner.innerHTML = '';

    // Create the grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'planner-grid';
    // Match grid size to visible rows + header row
    gridContainer.style.gridTemplateRows = `auto repeat(${visibleTimes.length}, 15px)`;

    // Create header row
    const timeHeader = document.createElement('div');
    timeHeader.className = 'time-header';
    timeHeader.textContent = 'Time';
    timeHeader.style.gridColumn = '1';
    timeHeader.style.gridRow = '1';
    gridContainer.appendChild(timeHeader);

    DAYS.forEach((day, i) => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        dayHeader.style.gridColumn = `${i + 2}`;
        dayHeader.style.gridRow = '1';
        gridContainer.appendChild(dayHeader);
    });

    // Create time slot rows with slots
    const slotRefs = {};

    visibleTimes.forEach((time, vIndex) => {
        const [h, m] = time.split(':').map(Number);
        const isPast = (h * 60 + m + 5) <= currentTotalMin; // Entire slot is past

        // Time label
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label' + (isPast ? ' past-time' : '');
        timeLabel.style.gridRow = `${vIndex + 2}`;
        timeLabel.style.gridColumn = '1';
        if (m === 0) {
            timeLabel.textContent = time;
            timeLabel.classList.add('hour-label');
        }
        gridContainer.appendChild(timeLabel);

        DAYS.forEach((day, dayIndex) => {
            const slot = document.createElement('div');
            slot.className = 'slot' + (isPast ? ' past-time' : '');
            slot.dataset.day = day;
            slot.dataset.time = time;
            slot.style.gridRow = `${vIndex + 2}`;
            slot.style.gridColumn = `${dayIndex + 2}`;

            // Store reference for event placement
            slotRefs[`${day}-${time}`] = slot;
            gridContainer.appendChild(slot);
        });
    });

    planner.appendChild(gridContainer);
    updateNowMarker();

    // Render events
    eventsToUse.forEach((ev, eventIndex) => {
        // Round times for 15-minute slot rendering
        const startSlotTime = floorToSlot(ev.from);
        const endSlotTime = ceilToSlot(ev.to);

        const startIndex = times.indexOf(startSlotTime);
        const endIndex = times.indexOf(endSlotTime);

        if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) return;

        // Find the first visible slot this event touches
        let drawSlot = null;
        let effectiveStartIndex = startIndex;

        for (let time of visibleTimes) {
            const vIndex = times.indexOf(time);
            if (vIndex >= startIndex && vIndex < endIndex) {
                drawSlot = slotRefs[`${ev.day}-${time}`];
                effectiveStartIndex = vIndex;
                break;
            }
        }

        if (!drawSlot) return;

        // Calculate height based on 15px slots (5-minute intervals)
        const slotsToSpan = endIndex - effectiveStartIndex;
        const eventHeight = slotsToSpan * 15;

        const eventDiv = document.createElement('div');
        eventDiv.className = `event ${ev.priority}`;
        eventDiv.style.height = eventHeight + 'px';
        eventDiv.style.position = 'absolute';
        eventDiv.style.width = 'calc(100% - 8px)';
        eventDiv.style.top = '0';
        eventDiv.style.left = '4px';
        eventDiv.title = `${ev.from} - ${ev.to}: ${ev.title}`;

        const content = document.createElement('div');
        content.className = 'event-content';
        content.textContent = ev.title;

        if (ev.frequency && ev.frequency !== 'once') {
            const freqSpan = document.createElement('div');
            freqSpan.className = 'event-frequency';
            freqSpan.textContent = ev.frequency;
            content.appendChild(freqSpan);

            const recurringIcon = document.createElement('div');
            recurringIcon.className = 'recurring-indicator';
            recurringIcon.textContent = '↻';
            eventDiv.appendChild(recurringIcon);
        }

        eventDiv.appendChild(content);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Delete event';
        deleteBtn.style.zIndex = '100';
        deleteBtn.style.position = 'relative';
        deleteBtn.onclick = e => {
            e.stopPropagation();
            e.preventDefault();
            if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                if (window.deleteEventFromAPI) window.deleteEventFromAPI(ev._id);
                return;
            }
            if (!confirm('Delete this event?')) return;
            const allEvents = loadData(STORAGE_KEYS.EVENTS);
            const idx = allEvents.findIndex(item =>
                item.title === ev.title &&
                item.day === ev.day &&
                item.from === ev.from &&
                item.to === ev.to
            );
            if (idx > -1) {
                allEvents.splice(idx, 1);
                saveData(STORAGE_KEYS.EVENTS, allEvents);
                events = allEvents;
                window.events = allEvents;
                renderPlanner();
                updateDashboardWidgets();
            }
        };
        eventDiv.appendChild(deleteBtn);
        // Elevate the slot's z-index so the event (and its delete button) aren't covered by later sibling slots
        drawSlot.style.zIndex = '20';
        drawSlot.appendChild(eventDiv);
    });
}

function createRecurringEvents(baseEvent) {
    const frequency = baseEvent.frequency;
    const customDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    if (frequency === 'once') {
        return [baseEvent];
    }

    const recurringEvents = [];
    const selectedDays = [];

    if (frequency === 'custom') {
        customDays.forEach((day, index) => {
            if (document.getElementById(day).checked) {
                selectedDays.push(DAYS[index]);
            }
        });
    } else if (frequency === 'daily') {
        selectedDays.push(...DAYS);
    } else if (frequency === 'weekdays') {
        selectedDays.push('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');
    } else if (frequency === 'weekends') {
        selectedDays.push('Saturday', 'Sunday');
    } else if (frequency === 'weekly') {
        selectedDays.push(baseEvent.day);
    }

    selectedDays.forEach(day => {
        recurringEvents.push({
            ...baseEvent,
            day: day,
            frequency: frequency
        });
    });

    return recurringEvents;
}

document.getElementById('addBtn').onclick = async () => {
    const title = document.getElementById('title').value.trim();
    const day = document.getElementById('day').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const priority = document.getElementById('priority').value;
    const frequency = document.getElementById('frequency').value;

    if (!title || !from || !to) {
        alert('Please fill in all required fields');
        return;
    }

    if (tMin(to) <= tMin(from)) {
        alert('"To" time must be later than "From" time');
        return;
    }

    const fromRounded = roundToNearestSlot(from);
    const toRounded = roundToNearestSlot(to);

    const baseEvent = {
        title,
        day,
        from: fromRounded,
        to: toRounded,
        priority,
        frequency
    };

    const newEvents = createRecurringEvents(baseEvent);

    if (window.isUserAuthenticated && window.isUserAuthenticated()) {
        try {
            await window.MomentumAPI.createEvents(newEvents);
            document.getElementById('title').value = '';
            document.getElementById('from').value = '';
            document.getElementById('to').value = '';
            document.getElementById('frequency').value = 'once';
            document.getElementById('frequency-options').classList.remove('show');
            if (window.reloadData) await window.reloadData();
        } catch (error) {
            alert('Failed to create event: ' + error.message);
        }
        return;
    }

    events.push(...newEvents);
    saveData(STORAGE_KEYS.EVENTS, events);

    renderPlanner();
    updateDashboardWidgets();

    // Clear form
    document.getElementById('title').value = '';
    document.getElementById('from').value = '';
    document.getElementById('to').value = '';
    document.getElementById('frequency').value = 'once';
    document.getElementById('frequency-options').classList.remove('show');
};

/* --- Dashboard: Focus Tasks --- */
const focusTaskInput = document.getElementById('focusTaskInput');
const addFocusTaskBtn = document.getElementById('addFocusTaskBtn');
const todaysFocusList = document.getElementById('todays-focus-list');

function renderFocusTasks(data) {
    const tasks = data || loadData(STORAGE_KEYS.FOCUS_TASKS);
    todaysFocusList.innerHTML = '';
    tasks.forEach((task, idx) => {
        const li = document.createElement('li');
        const titleSpan = document.createElement('span');
        titleSpan.textContent = task.title;
        li.appendChild(titleSpan);

        const controls = document.createElement('span');
        const edit = document.createElement('button');
        edit.className = 'small-btn';
        edit.textContent = 'Edit';
        edit.addEventListener('click', async () => {
            const newTitle = prompt('Edit task title', task.title);
            if (newTitle !== null && newTitle.trim()) {
                if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                    try {
                        await window.MomentumAPI.updateFocusTask(task._id, { title: newTitle.trim() });
                        await window.reloadData();
                    } catch (err) { alert('Failed to edit task: ' + err.message); }
                    return;
                }
                tasks[idx].title = newTitle.trim();
                saveData(STORAGE_KEYS.FOCUS_TASKS, tasks);
                renderFocusTasks();
                updateDashboardWidgets();
            }
        });

        const del = document.createElement('button');
        del.className = 'small-btn';
        del.textContent = 'Delete';
        del.addEventListener('click', async () => {
            if (!confirm('Delete this focus task?')) return;
            if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                try {
                    await window.MomentumAPI.deleteFocusTask(task._id);
                    await window.reloadData();
                } catch (err) { alert('Failed to delete task: ' + err.message); }
                return;
            }
            tasks.splice(idx, 1);
            saveData(STORAGE_KEYS.FOCUS_TASKS, tasks);
            renderFocusTasks();
            updateDashboardWidgets();
        });

        controls.appendChild(edit);
        controls.appendChild(del);
        li.appendChild(controls);

        todaysFocusList.appendChild(li);
    });
}

addFocusTaskBtn.onclick = () => {
    if (window.isUserAuthenticated && window.isUserAuthenticated()) return;
    const val = focusTaskInput.value.trim();
    if (!val) {
        alert('Enter a focus task title');
        return;
    }
    const tasks = loadData(STORAGE_KEYS.FOCUS_TASKS);
    tasks.push({
        title: val
    });
    saveData(STORAGE_KEYS.FOCUS_TASKS, tasks);
    focusTaskInput.value = '';
    renderFocusTasks();
    updateDashboardWidgets();
};

/* --- Goals --- */
const goalTitleInput = document.getElementById('goalTitleInput');
const goalStepsInput = document.getElementById('goalStepsInput');
const saveGoalBtn = document.getElementById('saveGoalBtn');
const goalsContainer = document.getElementById('goals-container');

function renderGoals(data) {
    const goals = data || loadData(STORAGE_KEYS.GOALS);
    goalsContainer.innerHTML = '';

    goals.forEach((goal, gIndex) => {
        const container = document.createElement('section');
        container.className = 'goal';

        const h2 = document.createElement('h2');
        h2.textContent = goal.title;
        container.appendChild(h2);

        // roadmap
        const roadmap = document.createElement('div');
        roadmap.className = 'roadmap';
        roadmap.setAttribute('aria-label', `Goal roadmap for ${goal.title}`);
        goal.steps.forEach(step => {
            const m = document.createElement('div');
            m.className = 'milestone';
            m.textContent = step.title;
            roadmap.appendChild(m);
        });
        container.appendChild(roadmap);

        // progress
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progress = document.createElement('div');
        progress.className = 'progress';
        const completedCount = goal.steps.filter(s => s.completed).length;
        const percent = goal.steps.length ? Math.round((completedCount / goal.steps.length) * 100) : 0;
        progress.style.width = percent + '%';
        progressBar.appendChild(progress);
        container.appendChild(progressBar);

        // step list
        const ul = document.createElement('ul');
        ul.className = 'goal-steps';
        goal.steps.forEach((step, sIndex) => {
            const li = document.createElement('li');
            li.className = step.completed ? 'completed' : '';
            const left = document.createElement('span');
            left.textContent = step.title;
            left.style.flex = '1';
            li.appendChild(left);

            const controls = document.createElement('span');

            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = step.completed ? 'Mark Incomplete' : 'Mark Complete';
            toggleBtn.className = 'small-btn';
            toggleBtn.addEventListener('click', async () => {
                if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                    try {
                        await window.MomentumAPI.toggleStep(goal._id, step._id, !step.completed);
                        await window.reloadData();
                    } catch (err) { alert('Failed to toggle step: ' + err.message); }
                    return;
                }
                const gs = loadData(STORAGE_KEYS.GOALS);
                gs[gIndex].steps[sIndex].completed = !gs[gIndex].steps[sIndex].completed;
                saveData(STORAGE_KEYS.GOALS, gs);
                renderGoals();
                updateDashboardWidgets();
            });

            const editBtn = document.createElement('button');
            editBtn.className = 'small-btn';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', async () => {
                const newTitle = prompt('Edit step title', step.title);
                if (newTitle !== null && newTitle.trim()) {
                    if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                        try {
                            const updatedSteps = goal.steps.map((s, i) => i === sIndex ? { ...s, title: newTitle.trim() } : s);
                            await window.MomentumAPI.updateGoal(goal._id, { steps: updatedSteps });
                            await window.reloadData();
                        } catch (err) { alert('Failed to edit step: ' + err.message); }
                        return;
                    }
                    const gs = loadData(STORAGE_KEYS.GOALS);
                    gs[gIndex].steps[sIndex].title = newTitle.trim();
                    saveData(STORAGE_KEYS.GOALS, gs);
                    renderGoals();
                    updateDashboardWidgets();
                }
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'small-btn';
            delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', async () => {
                if (!confirm('Delete step?')) return;
                if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                    try {
                        const updatedSteps = goal.steps.filter((_, i) => i !== sIndex);
                        await window.MomentumAPI.updateGoal(goal._id, { steps: updatedSteps });
                        await window.reloadData();
                    } catch (err) { alert('Failed to delete step: ' + err.message); }
                    return;
                }
                const gs = loadData(STORAGE_KEYS.GOALS);
                gs[gIndex].steps.splice(sIndex, 1);
                saveData(STORAGE_KEYS.GOALS, gs);
                renderGoals();
                updateDashboardWidgets();
            });

            controls.appendChild(toggleBtn);
            controls.appendChild(editBtn);
            controls.appendChild(delBtn);
            li.appendChild(controls);

            ul.appendChild(li);
        });
        container.appendChild(ul);

        // goal-level controls: edit/delete
        const goalControls = document.createElement('div');
        goalControls.style.marginTop = '8px';
        const editGoalBtn = document.createElement('button');
        editGoalBtn.className = 'small-btn';
        editGoalBtn.textContent = 'Edit Goal Title';
        editGoalBtn.addEventListener('click', async () => {
            const newTitle = prompt('Edit goal title', goal.title);
            if (newTitle !== null && newTitle.trim()) {
                if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                    try {
                        await window.MomentumAPI.updateGoal(goal._id, { title: newTitle.trim() });
                        await window.reloadData();
                    } catch (err) { alert('Failed to edit goal: ' + err.message); }
                    return;
                }
                const gs = loadData(STORAGE_KEYS.GOALS);
                gs[gIndex].title = newTitle.trim();
                saveData(STORAGE_KEYS.GOALS, gs);
                renderGoals();
                updateDashboardWidgets();
            }
        });

        const delGoalBtn = document.createElement('button');
        delGoalBtn.className = 'small-btn';
        delGoalBtn.textContent = 'Delete Goal';
        delGoalBtn.addEventListener('click', async () => {
            if (!confirm('Delete entire goal?')) return;
            if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                try {
                    await window.MomentumAPI.deleteGoal(goal._id);
                    await window.reloadData();
                } catch (err) { alert('Failed to delete goal: ' + err.message); }
                return;
            }
            const gs = loadData(STORAGE_KEYS.GOALS);
            gs.splice(gIndex, 1);
            saveData(STORAGE_KEYS.GOALS, gs);
            renderGoals();
            updateDashboardWidgets();
        });

        const refineGoalBtn = document.createElement('button');
        refineGoalBtn.className = 'small-btn';
        refineGoalBtn.innerHTML = 'AI Refine';
        refineGoalBtn.title = 'Use AI to break this goal into steps';
        refineGoalBtn.addEventListener('click', async () => {
            refineGoalBtn.textContent = 'Refining...';
            try {
                let newSteps;
                if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                    const res = await window.MomentumAPI.refineGoal(goal.title);
                    newSteps = res.steps.map(s => ({ title: s, completed: false }));
                } else {
                    // Mock guest refine
                    newSteps = [
                        { title: "Research " + goal.title, completed: false },
                        { title: "Set milestones", completed: false },
                        { title: "Begin execution", completed: false }
                    ];
                }

                if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                    await window.MomentumAPI.updateGoal(goal._id, { steps: newSteps });
                    await window.reloadData();
                } else {
                    const gs = loadData(STORAGE_KEYS.GOALS);
                    gs[gIndex].steps = newSteps;
                    saveData(STORAGE_KEYS.GOALS, gs);
                    renderGoals();
                    updateDashboardWidgets();
                }
                alert('Goal refined by AI!');
            } catch (error) {
                alert('Refinement failed: ' + error.message);
            } finally {
                refineGoalBtn.innerHTML = 'AI Refine';
            }
        });

        goalControls.appendChild(editGoalBtn);
        goalControls.appendChild(refineGoalBtn);
        goalControls.appendChild(delGoalBtn);
        container.appendChild(goalControls);

        goalsContainer.appendChild(container);
    });
}

saveGoalBtn.onclick = () => {
    if (window.isUserAuthenticated && window.isUserAuthenticated()) return;
    const title = goalTitleInput.value.trim();
    const stepsRaw = goalStepsInput.value.split(',').map(s => s.trim()).filter(Boolean);
    if (!title || stepsRaw.length === 0) {
        alert('Enter goal title and at least one step');
        return;
    }

    const steps = stepsRaw.map(s => ({
        title: s,
        completed: false
    }));
    const goals = loadData(STORAGE_KEYS.GOALS);
    goals.push({
        title,
        steps,
        createdAt: Date.now()
    });
    saveData(STORAGE_KEYS.GOALS, goals);

    goalTitleInput.value = '';
    goalStepsInput.value = '';
    renderGoals();
    updateDashboardWidgets();
};

document.getElementById('add-goal-btn').addEventListener('click', () => {
    document.querySelector('[data-page="goals"]').click();
});

/* --- AI Suggestions --- */
let currentAISuggestion = null;

async function refreshAISuggestions() {
    const textEl = document.getElementById('ai-suggestion-text');
    const btn = document.getElementById('schedule-btn');

    if (!textEl) return;

    textEl.textContent = 'Analyzing your schedule...';
    btn.style.display = 'none';

    try {
        let suggestion;
        if (window.isUserAuthenticated && window.isUserAuthenticated()) {
            suggestion = await window.MomentumAPI.getAISuggestions();
        } else {
            // Rule-based fallback for guest mode
            suggestion = getGuestAISuggestion();
        }

        if (suggestion && suggestion.text) {
            textEl.textContent = suggestion.text;
            if (suggestion.action) {
                currentAISuggestion = suggestion.action;
                btn.style.display = 'inline-block';
                btn.querySelector('span').textContent = 'Schedule Now';
            }
        }
    } catch (error) {
        console.error('Failed to get AI suggestions:', error);
        textEl.textContent = 'Ready for a productive session? Add some goals to get started.';
    }
}

function getGuestAISuggestion() {
    const es = loadData(STORAGE_KEYS.EVENTS);
    const gs = loadData(STORAGE_KEYS.GOALS);

    if (gs.length === 0) {
        return { text: "Add your first goal to get personalized productivity tips!", action: null };
    }

    // Basic gap analyzer for guest (very simple version)
    const today = new Date();
    const todayName = DAYS[(today.getDay() + 6) % 7];
    const morningSlot = "10:00";

    const existing = es.find(ev => ev.day === todayName && ev.from === morningSlot);
    if (!existing) {
        const goal = gs[0];
        return {
            text: `You have a gap tomorrow morning. Want to work on '${goal.title}'?`,
            action: {
                title: `Focus: ${goal.title}`,
                day: todayName,
                from: morningSlot,
                to: "11:30"
            }
        };
    }

    return { text: "Keep pushing towards your goals! You're doing great.", action: null };
}

/* --- Dashboard widgets update --- */
function updateDashboardWidgets(data) {
    // ... (rest of the function)
    const { goals: goalsIn, tasks: tasksIn, events: eventsIn } = data || {};
    // Render the mini planner
    renderMiniPlanner(eventsIn);

    // Upcoming deadlines
    const deadlinesList = document.getElementById('upcoming-deadlines-list');
    if (deadlinesList) {
        deadlinesList.innerHTML = '';
        const goals = goalsIn || loadData(STORAGE_KEYS.GOALS);
        goals.forEach(goal => {
            if (Array.isArray(goal.steps) && goal.steps.length > 0) {
                const lastStep = goal.steps[goal.steps.length - 1];
                const li = document.createElement('li');
                li.textContent = `${lastStep.title || lastStep} — ${goal.title}`;
                deadlinesList.appendChild(li);
            }
        });
    }

    // Today's Focus
    const today = new Date();
    const todayIndex = (today.getDay() + 6) % 7;
    const todayName = DAYS[todayIndex];

    const allEvents = eventsIn || loadData(STORAGE_KEYS.EVENTS);
    const todayEvents = allEvents.filter(ev => ev.day === todayName);

    const todaysList = document.getElementById('todays-focus-list');
    if (todaysList) {
        todaysList.innerHTML = '';

        // Add events
        todayEvents.sort((a, b) => tMin(a.from) - tMin(b.from)).forEach((ev) => {
            const li = document.createElement('li');
            const titleSpan = document.createElement('span');
            const timeRange = ev.from && ev.to ? `${ev.from}-${ev.to}` : '';
            const frequencyTag = ev.frequency && ev.frequency !== 'once' ? ` [${ev.frequency}]` : '';
            titleSpan.textContent = `[Event] ${timeRange} ${ev.title}${frequencyTag}`;
            li.appendChild(titleSpan);

            const controls = document.createElement('span');
            const edit = document.createElement('button');
            edit.className = 'small-btn';
            edit.textContent = 'Edit';
            edit.onclick = () => {
                const newTitle = prompt('Edit event title', ev.title);
                if (newTitle !== null && newTitle.trim()) {
                    if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                        if (window.updateEventFromAPI) window.updateEventFromAPI(ev._id, { title: newTitle.trim() });
                    } else {
                        const es = loadData(STORAGE_KEYS.EVENTS);
                        const eventToUpdate = es.find(e => JSON.stringify(e) === JSON.stringify(ev));
                        if (eventToUpdate) {
                            eventToUpdate.title = newTitle.trim();
                            saveData(STORAGE_KEYS.EVENTS, es);
                            renderPlanner();
                            updateDashboardWidgets();
                        }
                    }
                }
            };

            const del = document.createElement('button');
            del.className = 'small-btn';
            del.textContent = 'Delete';
            del.onclick = () => {
                if (!confirm('Delete this event?')) return;
                if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                    if (window.deleteEventFromAPI) window.deleteEventFromAPI(ev._id);
                } else {
                    const es = loadData(STORAGE_KEYS.EVENTS);
                    const idx = es.findIndex(e => JSON.stringify(e) === JSON.stringify(ev));
                    if (idx > -1) {
                        es.splice(idx, 1);
                        saveData(STORAGE_KEYS.EVENTS, es);
                        renderPlanner();
                        updateDashboardWidgets();
                    }
                }
            };

            controls.appendChild(edit);
            controls.appendChild(del);
            li.appendChild(controls);
            todaysList.appendChild(li);
        });

        // Add focus tasks
        const focusTasks = tasksIn || loadData(STORAGE_KEYS.FOCUS_TASKS);
        focusTasks.forEach((task, idx) => {
            const li = document.createElement('li');
            const titleSpan = document.createElement('span');
            titleSpan.textContent = task.title;
            li.appendChild(titleSpan);

            const controls = document.createElement('span');
            const edit = document.createElement('button');
            edit.className = 'small-btn';
            edit.textContent = 'Edit';
            edit.onclick = () => {
                const newTitle = prompt('Edit task title', task.title);
                if (newTitle !== null && newTitle.trim()) {
                    if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                        if (window.updateFocusTaskFromAPI) window.updateFocusTaskFromAPI(task._id, { title: newTitle.trim() });
                    } else {
                        const ts = loadData(STORAGE_KEYS.FOCUS_TASKS);
                        ts[idx].title = newTitle.trim();
                        saveData(STORAGE_KEYS.FOCUS_TASKS, ts);
                        updateDashboardWidgets();
                    }
                }
            };

            const del = document.createElement('button');
            del.className = 'small-btn';
            del.textContent = 'Delete';
            del.onclick = () => {
                if (!confirm('Delete this focus task?')) return;
                if (window.isUserAuthenticated && window.isUserAuthenticated()) {
                    if (window.deleteFocusTaskFromAPI) window.deleteFocusTaskFromAPI(task._id);
                } else {
                    const ts = loadData(STORAGE_KEYS.FOCUS_TASKS);
                    ts.splice(idx, 1);
                    saveData(STORAGE_KEYS.FOCUS_TASKS, ts);
                    updateDashboardWidgets();
                }
            };

            controls.appendChild(edit);
            controls.appendChild(del);
            li.appendChild(controls);
            todaysList.appendChild(li);
        });
    }

    // Update global events variable
    window.events = allEvents;
    events = allEvents;

    // Refresh AI suggestions
    refreshAISuggestions();
}

/* --- Schedule Now functionality --- */
const scheduleNowBtn = document.getElementById('schedule-btn');
scheduleNowBtn.addEventListener('click', async () => {
    if (!currentAISuggestion) return;

    if (window.isUserAuthenticated && window.isUserAuthenticated()) {
        try {
            await window.MomentumAPI.createEvents({
                ...currentAISuggestion,
                priority: 'high',
                frequency: 'once'
            });
            await window.reloadData();
            alert('AI-suggested session added to your planner!');
            refreshAISuggestions();
        } catch (error) {
            alert('Failed to schedule session: ' + error.message);
        }
    } else {
        const es = loadData(STORAGE_KEYS.EVENTS);
        es.push({
            ...currentAISuggestion,
            priority: 'high',
            frequency: 'once'
        });
        saveData(STORAGE_KEYS.EVENTS, es);
        renderPlanner();
        updateDashboardWidgets();
        alert('AI-suggested session added to your planner!');
        refreshAISuggestions();
    }
});

window.renderGoals = renderGoals;
window.renderFocusTasks = renderFocusTasks;
window.renderPlanner = renderPlanner;
window.updateDashboardWidgets = updateDashboardWidgets;
window.renderMiniPlanner = renderMiniPlanner;
window.scrollToCurrentTime = scrollToCurrentTime;

/* --- Initialization --- */
(function init() {
    if (window.isUserAuthenticated && window.isUserAuthenticated()) return;
    events = loadData(STORAGE_KEYS.EVENTS);
    renderGoals();
    renderFocusTasks();
    renderPlanner();
    updateDashboardWidgets();
    refreshAISuggestions();

    // Scroll to current time after rendering a bit of a delay to ensure layout is done
    setTimeout(scrollToCurrentTime, 100);

    // Keep "Now" marker updated every minute
    setInterval(updateNowMarker, 60000);

    // Toggle past times listener
    const toggleBtn = document.getElementById('togglePastBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            showPastTimes = !showPastTimes;
            this.textContent = showPastTimes ? 'Hide Past Times' : 'Show Past Times';
            renderPlanner();
            if (showPastTimes) {
                // If showing, scroll back to where we were
                scrollToCurrentTime();
            }
        });
    }
})();
