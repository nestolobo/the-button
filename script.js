let state = {
    habitName: '',
    waitDays: 4,
    doDays: 2,
    streak: 0,
    lastPressed: null,
    nextAvailable: null,
    deadline: null
};

const setupDiv = document.getElementById('setup');
const trackerDiv = document.getElementById('tracker');
const scoreDiv = document.getElementById('score');
const habitNameInput = document.getElementById('habitName');
const waitDaysInput = document.getElementById('waitDays');
const doDaysInput = document.getElementById('doDays');
const habitPreview = document.getElementById('habitPreview');
const habitDisplay = document.getElementById('habitDisplay');
const saveButton = document.getElementById('saveButton');
const actionButton = document.getElementById('actionButton');
const resetButton = document.getElementById('resetButton');
const waitMessage = document.getElementById('waitMessage');
const doMessage = document.getElementById('doMessage');
const waitTime = document.getElementById('waitTime');
const doTime = document.getElementById('doTime');

function loadState() {
    const saved = localStorage.getItem('buttonState');
    if (saved) {
        state = JSON.parse(saved);
        if (state.habitName) {
            showTracker();
        }
    }
    updateScore();
}

function saveState() {
    localStorage.setItem('buttonState', JSON.stringify(state));
}

function updateScore() {
    scoreDiv.textContent = `Streak: ${state.streak}`;
}

function showSetup() {
    setupDiv.classList.remove('hidden');
    trackerDiv.classList.add('hidden');
}

function showTracker() {
    setupDiv.classList.add('hidden');
    trackerDiv.classList.remove('hidden');
    habitDisplay.textContent = state.habitName;
    updateTrackerState();
}

function updateTrackerState() {
    const now = new Date().getTime();

    if (state.deadline && now > state.deadline) {
        if (state.streak > 0) {
            alert('Your streak reset to zero.');
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
        waitMessage.classList.add('hidden');

        if (state.deadline && now < state.deadline) {
            doMessage.classList.remove('hidden');
            updateDoTime();
        } else {
            doMessage.classList.add('hidden');
        }
    } else {
        actionButton.disabled = true;
        waitMessage.classList.remove('hidden');
        doMessage.classList.add('hidden');
        updateWaitTime();
    }
}

function updateWaitTime() {
    if (!state.nextAvailable) return;

    const now = new Date().getTime();
    const diff = state.nextAvailable - now;

    if (diff <= 0) {
        updateTrackerState();
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = '';
    if (days > 0) timeString += `${days} day${days !== 1 ? 's' : ''} `;
    if (hours > 0) timeString += `${hours} hour${hours !== 1 ? 's' : ''} `;
    if (minutes > 0 || timeString === '') timeString += `${minutes} minute${minutes !== 1 ? 's' : ''}`;

    waitTime.textContent = timeString.trim();
}

function updateDoTime() {
    if (!state.deadline) return;

    const now = new Date().getTime();
    const diff = state.deadline - now;

    if (diff <= 0) {
        updateTrackerState();
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = '';
    if (days > 0) timeString += `${days} day${days !== 1 ? 's' : ''} `;
    if (hours > 0) timeString += `${hours} hour${hours !== 1 ? 's' : ''} `;
    if (minutes > 0 || timeString === '') timeString += `${minutes} minute${minutes !== 1 ? 's' : ''}`;

    doTime.textContent = timeString.trim();
}

habitNameInput.addEventListener('input', () => {
    habitPreview.textContent = habitNameInput.value || 'lift weights';
});

saveButton.addEventListener('click', () => {
    state.habitName = habitNameInput.value || 'lift weights';
    state.waitDays = parseInt(waitDaysInput.value) || 4;
    state.doDays = parseInt(doDaysInput.value) || 2;
    state.streak = 0;
    state.lastPressed = null;
    state.nextAvailable = null;
    state.deadline = null;

    saveState();
    updateScore();
    showTracker();
});

actionButton.addEventListener('click', () => {
    const now = new Date().getTime();

    if (state.deadline && now <= state.deadline) {
        state.streak++;
    } else {
        state.streak = 1;
    }

    state.lastPressed = now;
    state.nextAvailable = now + (state.waitDays * 24 * 60 * 60 * 1000);
    state.deadline = state.nextAvailable + (state.doDays * 24 * 60 * 60 * 1000);

    saveState();
    updateScore();
    updateTrackerState();
});

resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset your settings? Your streak will be preserved.')) {
        const currentStreak = state.streak;
        state = {
            habitName: '',
            waitDays: 4,
            doDays: 2,
            streak: currentStreak,
            lastPressed: null,
            nextAvailable: null,
            deadline: null
        };
        saveState();
        habitNameInput.value = '';
        waitDaysInput.value = 4;
        doDaysInput.value = 2;
        habitPreview.textContent = 'lift weights';
        showSetup();
    }
});

setInterval(() => {
    if (!trackerDiv.classList.contains('hidden')) {
        updateTrackerState();
    }
}, 1000);

loadState();