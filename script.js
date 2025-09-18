let state = {
    habitName: '',
    waitTime: 0, // in milliseconds
    doTime: 0, // in milliseconds
    streak: 0,
    lastPressed: null,
    nextAvailable: null,
    deadline: null
};

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const trackerDiv = document.getElementById('tracker');
const scoreDiv = document.getElementById('score');
const habitNameInput = document.getElementById('habitName');
const habitPreview = document.getElementById('habitPreview');
const habitDisplay = document.getElementById('habitDisplay');
const habitTitle = document.getElementById('habitTitle');
const actionButton = document.getElementById('actionButton');
const waitMessage = document.getElementById('waitMessage');
const doMessage = document.getElementById('doMessage');
const mainPrompt = document.getElementById('mainPrompt');
const waitTime = document.getElementById('waitTime');
const doTime = document.getElementById('doTime');

// Wait time inputs
const waitDaysInput = document.getElementById('waitDays');
const waitHoursInput = document.getElementById('waitHours');
const waitMinutesInput = document.getElementById('waitMinutes');

// Do time inputs
const doDaysInput = document.getElementById('doDays');
const doHoursInput = document.getElementById('doHours');
const doMinutesInput = document.getElementById('doMinutes');

function loadState() {
    const saved = localStorage.getItem('buttonState');
    if (saved) {
        state = JSON.parse(saved);
        if (state.habitName) {
            const now = new Date().getTime();

            // Log current phase and time remaining
            if (state.nextAvailable && now < state.nextAvailable) {
                const waitRemaining = state.nextAvailable - now;
                console.log('Phase: Waiting');
                console.log('Time until button available:', formatTimeWithSeconds(waitRemaining));
            } else if (state.deadline && now < state.deadline) {
                const doRemaining = state.deadline - now;
                console.log('Phase: Action required');
                console.log('Time remaining to press button:', formatTimeWithSeconds(doRemaining));
            } else {
                console.log('Phase: Ready to start');
                console.log('Button available now');
            }

            console.log('Current streak:', state.streak);

            showTracker();
        }
    }
    updateScore();
}

function saveState() {
    localStorage.setItem('buttonState', JSON.stringify(state));
}

function updateScore() {
    scoreDiv.textContent = state.streak;
}

function goToStep2() {
    state.habitName = habitNameInput.value || 'lift weights';
    habitPreview.textContent = state.habitName;
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
}

function goToStep3() {
    const days = parseInt(waitDaysInput.value) || 0;
    const hours = parseInt(waitHoursInput.value) || 0;
    const minutes = parseInt(waitMinutesInput.value) || 0;

    state.waitTime = (days * 24 * 60 * 60 * 1000) +
                     (hours * 60 * 60 * 1000) +
                     (minutes * 60 * 1000);

    if (state.waitTime === 0) {
        state.waitTime = 4 * 24 * 60 * 60 * 1000; // Default to 4 days
    }

    step2.classList.add('hidden');
    step3.classList.remove('hidden');
}

function startTracking() {
    const days = parseInt(doDaysInput.value) || 0;
    const hours = parseInt(doHoursInput.value) || 0;
    const minutes = parseInt(doMinutesInput.value) || 0;

    state.doTime = (days * 24 * 60 * 60 * 1000) +
                   (hours * 60 * 60 * 1000) +
                   (minutes * 60 * 1000);

    if (state.doTime === 0) {
        state.doTime = 2 * 24 * 60 * 60 * 1000; // Default to 2 days
    }

    state.streak = 0;
    state.lastPressed = null;
    state.nextAvailable = null;
    state.deadline = null;

    saveState();
    updateScore();
    showTracker();
}

function showTracker() {
    step1.classList.add('hidden');
    step2.classList.add('hidden');
    step3.classList.add('hidden');
    trackerDiv.classList.remove('hidden');
    habitDisplay.textContent = state.habitName;
    habitTitle.textContent = state.habitName;
    updateTrackerState();
}

function updateTrackerState() {
    const now = new Date().getTime();

    if (state.deadline && now > state.deadline) {
        if (state.streak > 0) {
            alert('your streak reset to zero');
        }
        state.streak = 0;
        state.lastPressed = null;
        state.nextAvailable = null;
        state.deadline = null;
        saveState();
        updateScore();
    }

    if (!state.nextAvailable || now >= state.nextAvailable) {
        actionButton.disabled = false;
        mainPrompt.classList.remove('hidden');
        habitTitle.classList.add('hidden');
        waitMessage.classList.add('hidden');

        if (state.deadline && now < state.deadline) {
            doMessage.classList.remove('hidden');
            updateDoTime();
        } else {
            doMessage.classList.add('hidden');
        }
    } else {
        actionButton.disabled = true;
        mainPrompt.classList.add('hidden');
        habitTitle.classList.remove('hidden');
        waitMessage.classList.remove('hidden');
        doMessage.classList.add('hidden');
        updateWaitTime();
    }
}

function formatTime(milliseconds) {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    let parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

    return parts.join(' ');
}

function formatTimeWithSeconds(milliseconds) {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    let parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

    return parts.join(' ');
}

function updateWaitTime() {
    if (!state.nextAvailable) return;

    const now = new Date().getTime();
    const diff = state.nextAvailable - now;

    if (diff <= 0) {
        updateTrackerState();
        return;
    }

    waitTime.textContent = formatTime(diff);
}

function updateDoTime() {
    if (!state.deadline) return;

    const now = new Date().getTime();
    const diff = state.deadline - now;

    if (diff <= 0) {
        updateTrackerState();
        return;
    }

    doTime.textContent = formatTime(diff);
}

habitNameInput.addEventListener('input', () => {
    habitPreview.textContent = habitNameInput.value || 'lift weights';
});

actionButton.addEventListener('click', () => {
    const now = new Date().getTime();

    if (state.deadline && now <= state.deadline) {
        state.streak++;
    } else {
        state.streak = 1;
    }

    state.lastPressed = now;
    state.nextAvailable = now + state.waitTime;
    state.deadline = state.nextAvailable + state.doTime;

    saveState();
    updateScore();
    updateTrackerState();
});

function resetSettings() {
    if (confirm('reset settings? your streak will be preserved')) {
        const currentStreak = state.streak;
        state = {
            habitName: '',
            waitTime: 0,
            doTime: 0,
            streak: currentStreak,
            lastPressed: null,
            nextAvailable: null,
            deadline: null
        };
        saveState();
        habitNameInput.value = '';
        waitDaysInput.value = 4;
        waitHoursInput.value = 0;
        waitMinutesInput.value = 0;
        doDaysInput.value = 2;
        doHoursInput.value = 0;
        doMinutesInput.value = 0;
        habitPreview.textContent = 'lift weights';
        trackerDiv.classList.add('hidden');
        step1.classList.remove('hidden');
    }
}

// Handle Enter key navigation
habitNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') goToStep2();
});

[waitDaysInput, waitHoursInput, waitMinutesInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') goToStep3();
    });
});

[doDaysInput, doHoursInput, doMinutesInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startTracking();
    });
});

setInterval(() => {
    if (!trackerDiv.classList.contains('hidden')) {
        updateTrackerState();
    }
}, 1000);

loadState();