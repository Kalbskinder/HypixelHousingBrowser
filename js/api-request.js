const API_KEY = ''; // Hypixel API key

let houses = []; // Array for house data
let currentPage = 0; // Current page
const resultsPerPage = 10; // Results per page
const limitKey = 'apiCallCounter'; // Key for cookie storage
const countdownKey = 'apiCallCountdown'; // Key for storing countdown
const limitThreshold = 6; // Limit before showing the modal
const modal = document.getElementById('rateLimitModal'); // Modal element
const modalMessage = document.getElementById('modalMessage'); // Modal message element

let countdownInterval; // Store the interval for countdown
let timeRemaining = 0; // Time remaining until next API call

// Function to get the current API call counter from localStorage
function getApiCallCounter() {
    const count = parseInt(localStorage.getItem(limitKey)) || 0;
    return count;
}

// Function to set the API call counter in localStorage
function setApiCallCounter(count) {
    localStorage.setItem(limitKey, count);
}

// Function to decrement the API call counter every minute
function startCounterDecrement() {
    setInterval(() => {
        let count = getApiCallCounter();
        if (count > 0) {
            count--;
            setApiCallCounter(count);
        }
    }, 60000); // Decrement every minute
}

// Function to fetch house data
async function fetchHouseData() {
    const currentCount = getApiCallCounter();
    if (currentCount >= limitThreshold) {
        // Calculate time remaining based on stored countdown or count
        timeRemaining = (currentCount - limitThreshold + 1) * 60; // Calculate total seconds remaining
        showRateLimitModal(currentCount);
        return; // Prevent API call if limit exceeded
    }

    try {
        const response = await fetch(`https://api.hypixel.net/v2/housing/active?key=${API_KEY}`);
        const data = await response.json(); // Parse JSON
        houses = data; // Store house data
        displayResults(); // Display results

        // Increment the API call counter and set it in localStorage
        setApiCallCounter(currentCount + 1);
    } catch (error) {
        console.error('Error fetching house data:', error);
    }
}

// Function to show the rate limit modal
function showRateLimitModal(currentCount) {
    updateRateLimitModal(currentCount);
    modal.classList.add('is-active'); // Show the modal
    startCountdown(); // Start countdown for time remaining
}

// Function to update the rate limit modal
function updateRateLimitModal(currentCount) {
    const waitTime = (60 * (currentCount - limitThreshold + 1)); // Time remaining in seconds
    modalMessage.textContent = `You have exceeded the API call limit. Please wait ${waitTime} seconds before trying again.`;
}

// Function to start countdown timer
function startCountdown() {
    clearInterval(countdownInterval); // Clear any existing interval

    // If there is a time remaining in localStorage, use it; otherwise, calculate it
    timeRemaining = (getApiCallCounter() - limitThreshold + 1) * 60;

    // Load existing countdown from localStorage if available
    const savedCountdown = parseInt(localStorage.getItem(countdownKey)) || timeRemaining;

    timeRemaining = savedCountdown;

    countdownInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            localStorage.setItem(countdownKey, timeRemaining); // Update countdown in localStorage
            modalMessage.textContent = `You have exceeded the API call limit. Please wait ${timeRemaining} seconds before trying again.`;
        } else {
            clearInterval(countdownInterval); // Stop the countdown
            setApiCallCounter(0); // Reset counter after reload
            localStorage.removeItem(countdownKey); // Remove countdown from localStorage
            location.reload(); // Reload the page when the time reaches 0
        }
    }, 1000); // Decrease every second
}

// Function to display results
async function displayResults() {
    const resultsBody = document.getElementById('resultsBody');
    resultsBody.innerHTML = ''; // Clear previous results

    // Paginate results
    const start = currentPage * resultsPerPage;
    const end = start + resultsPerPage;
    const paginatedHouses = houses.slice(start, end);

    paginatedHouses.forEach(house => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>🏠 ${house.name.replace(/§.|\u00A7./g, '')}</td> <!-- House name -->
            <td>🍪 ${house.cookies.current}</td> <!-- Cookies -->
            <td>👥 ${house.players}</td> <!-- Players -->
        `;
        resultsBody.appendChild(row);
    });

    updatePaginationControls(); // Update pagination controls
}

// Function to update pagination controls
function updatePaginationControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const totalPages = Math.ceil(houses.length / resultsPerPage);

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;

    const pageIndicator = document.getElementById('pageIndicator');
    pageIndicator.textContent = `Page ${currentPage + 1} of ${totalPages}`;
}

// Function to initialize event listeners
function initializeEventListeners() {
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            displayResults();
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        const totalPages = Math.ceil(houses.length / resultsPerPage);
        if (currentPage < totalPages - 1) {
            currentPage++;
            displayResults();
        }
    });

    // Event listener for filter functionality
    document.getElementById('filterSelect').addEventListener('change', () => {
        const selectedFilter = document.getElementById('filterSelect').value;
        if (selectedFilter === 'cookies') {
            // Sort by cookies
            houses.sort((a, b) => b.cookies.current - a.cookies.current);
        } else if (selectedFilter === 'players') {
            // Sort by number of players
            houses.sort((a, b) => b.players - a.players);
        }
        currentPage = 0; // Reset to the first page
        displayResults();
    });

    // Event listener for search functionality
    document.getElementById('searchButton').addEventListener('click', () => {
        const keyword = document.getElementById('keywordInput').value.toLowerCase();
        const filteredHouses = houses.filter(house => {
            const houseName = house.name.replace(/§.|\u00A7./g, '').toLowerCase();
            return houseName.includes(keyword);
        });
        currentPage = 0;
        houses = filteredHouses;
        displayResults();
    });
}

// Fetch house data when the page loads
window.onload = () => {
    // If the page was just loaded, check if the modal should be shown
    const currentCount = getApiCallCounter();
    if (currentCount >= limitThreshold) {
        showRateLimitModal(currentCount);
    } else {
        fetchHouseData(); // Fetch house data
    }

    startCounterDecrement(); // Start the counter decrement
    initializeEventListeners(); // Initialize event listeners
};
