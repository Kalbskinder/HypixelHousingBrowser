const API_KEY = '2345f3d0-fe14-426a-b9cf-63b48348b5ed'; // Hypixel API key

// Function to fetch player rank from Hypixel API
async function getPlayerRank(playerName) {
    const url = `https://api.hypixel.net/player?key=${API_KEY}&name=${playerName}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.player) {
            const playerData = data.player;
            let rank = 'NONE';

            if (playerData.rank && playerData.rank !== 'NORMAL') {
                rank = playerData.rank;
            } else if (playerData.monthlyPackageRank === 'SUPERSTAR') {
                rank = 'MVP++';
            } else if (playerData.newPackageRank) {
                rank = playerData.newPackageRank;
            } else if (playerData.packageRank) {
                rank = playerData.packageRank;
            }

            // Convert rank codes to readable format
            switch (rank) {
                case 'VIP':
                case 'VIP_PLUS':
                case 'MVP':
                case 'MVP_PLUS':
                    rank = rank.replace('_PLUS', '+');
                    break;
                case 'MVP++':
                    break;
                default:
                    rank = rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();
                    break;
            }

            return rank;
        } else {
            return 'Rank not found';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return 'Error fetching rank';
    }
}

// Function to handle displaying the rank and corresponding image
async function displayRank() {
    const playerName = document.getElementById('playerNameInput').value;

    if (!playerName) {
        alert('Please enter a Minecraft username');
        return;
    }

    const rank = await getPlayerRank(playerName);

    const rankResult = document.getElementById('rankResult');
    const rankImage = document.getElementById('rankImage');
    const resultBox = document.getElementById('resultBox');

    rankResult.textContent = `${playerName}'s Rank: ${rank}`;

    // Update rank image based on the player's rank
    let imageUrl = '';

    switch (rank) {
        case 'VIP':
            imageUrl = '../images/vip.png';
            break;
        case 'VIP+':
            imageUrl = '../images/vip_plus.webp';
            break;
        case 'MVP':
            imageUrl = '../images/mvp.webp';
            break;
        case 'MVP+':
            imageUrl = '../images/mvp_plus.webp';
            break;
        case 'MVP++':
            imageUrl = '../images/mvp_plus_plus.png';
            break;
        default:
            imageUrl = '../images/none.webp';
    }

    rankImage.src = imageUrl;

    // Show the result box
    resultBox.style.display = 'block';
}

// Event listener for search button
document.getElementById('searchButton').addEventListener('click', displayRank);
