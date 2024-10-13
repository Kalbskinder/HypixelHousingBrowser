const API_KEY = ''; // Hypixel API key
const mojangAPIBaseUrl = "https://api.mojang.com/users/profiles/minecraft/";

let houses = []; // Array für Hausdaten
let currentPage = 0; // Aktuelle Seite
const resultsPerPage = 10; // Ergebnisse pro Seite
const playerNameCache = {}; // Cache für Spielernamen

// Funktion zum Abrufen von Hausdaten
async function fetchHouseData() {
    try {
        const response = await fetch(`https://api.hypixel.net/v2/housing/active?key=${API_KEY}`);
        const data = await response.json(); // JSON parsen
        houses = data; // Hausdaten speichern
        displayResults(); // Ergebnisse anzeigen
    } catch (error) {
        console.error('Error fetching house data:', error);
    }
}

// Funktion zum Abrufen des Spielernamens
async function getPlayerNameFromUUID(uuid) {
    // Cache prüfen
    if (playerNameCache[uuid]) {
        return playerNameCache[uuid];
    }

    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/${mojangAPIBaseUrl}${uuid}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // JSON-Antwort parsen
        const name = data.name;

        // Namen cachen
        playerNameCache[uuid] = name;
        return name;
    } catch (error) {
        console.error(`Error fetching player name for UUID ${uuid}:`, error);
        return 'Unknown';
    }
}

// Funktion zum Anzeigen der Ergebnisse
async function displayResults() {
    const resultsBody = document.getElementById('resultsBody');
    resultsBody.innerHTML = ''; // Vorherige Ergebnisse löschen

    // Ergebnisse paginieren
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

    // Ergebnisse in der Tabelle anzeigen
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

    updatePaginationControls(); // Paginierungssteuerungen aktualisieren
}

// Funktion zur Aktualisierung der Paginierungssteuerungen
function updatePaginationControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const totalPages = Math.ceil(houses.length / resultsPerPage);

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;

    const pageIndicator = document.getElementById('pageIndicator');
    pageIndicator.textContent = `Page ${currentPage + 1} of ${totalPages}`;
}

// Event-Listener für die Paginierung
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

// Event-Listener für die Filterfunktion
document.getElementById('filterSelect').addEventListener('change', () => {
    const selectedFilter = document.getElementById('filterSelect').value;
    if (selectedFilter === 'cookies') {
        // Nach Cookies sortieren
        houses.sort((a, b) => b.cookies.current - a.cookies.current);
    } else if (selectedFilter === 'players') {
        // Nach Spieleranzahl sortieren
        houses.sort((a, b) => b.players - a.players);
    }
    currentPage = 0; // Zurück zur ersten Seite
    displayResults();
});

// Event-Listener für die Suchfunktion
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

// Hausdaten beim Laden der Seite abrufen
window.onload = fetchHouseData;
