const API_KEY = 'HYPXIEL_API_KEY'; // Hypixel API key
const mojangAPIBaseUrl = "https://api.mojang.com/users/profiles/minecraft/";

let houses = []; // Array for house data
let currentPage = 0; // Current page
const resultsPerPage = 10; // Results per page
const playerNameCache = {}; // Cache for player names

// Function to fetch house data
async function fetchHouseData() {
    try {
        const response = await fetch(`https://api.hypixel.net/v2/housing/active?key=${API_KEY}`);
        const data = await response.json(); // Parse JSON
        houses = data; // Save house data
        displayResults(); // Display results
    } catch (error) {
        console.error('Error fetching house data:', error);
    }
}

// Function to fetch player name
async function getPlayerNameFromUUID(uuid) {
    // Check cache
    if (playerNameCache[uuid]) {
        return playerNameCache[uuid];
    }

    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/${mojangAPIBaseUrl}${uuid}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Parse JSON response
        const name = data.name;

        // Cache the name
        playerNameCache[uuid] = name;
        return name;
    } catch (error) {
        console.error(`Error fetching player name for UUID ${uuid}:`, error);
        return 'Unknown';
    }
}

// Function to display results
async function displayResults() {
    const resultsBody = document.getElementById('resultsBody');
    resultsBody.innerHTML = ''; // Clear previous results

    // Paginate results
    const start = currentPage * resultsPerPage;
    const end = start + resultsPerPage;
    const paginatedHouses = houses.slice(start, end);

    const promises = paginatedHouses.map(async house => {
        const playerName = await getPlayerNameFromUUID(house.owner);
        return {
            playerName,
            houseName: house.name.replace(/§.|\u00A7./g, ''),
            cookies: house.cookies.current,
            players: house.players
        };
    });

    const results = await Promise.all(promises);

    // Display results in the table
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="https://en.namemc.com/profile/${result.playerName}.1" target="_blank">${result.playerName}</a></td>
            <td>${result.houseName}</td>
            <td>${result.cookies}</td>
            <td>${result.players}</td>
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

// Event listener for pagination
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

// Event listener for filtering
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

// Fetch house data when the page loads
window.onload = fetchHouseData;
