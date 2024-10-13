// Function to copy color code to clipboard
const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
        .then(() => {
            showModal(`Copied: ${text}`);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
};

// Show the modal with a message
const showModal = (message) => {
    const modal = document.getElementById('popupModal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = message;
    modal.classList.add('is-active'); // Activate the modal
};

// Add click event listeners to table cells
const rows = document.querySelectorAll('tbody tr');
rows.forEach(row => {
    const colorCodeCell = row.querySelector('td:first-child');

    // Change text on mouse enter
    colorCodeCell.addEventListener('mouseenter', () => {
        colorCodeCell.textContent = 'Click to copy!'; // Change text on hover
    });

    // Restore original text on mouse leave
    colorCodeCell.addEventListener('mouseleave', () => {
        colorCodeCell.textContent = colorCodeCell.dataset.originalText; // Restore original text
    });

    // Store original text in a data attribute
    colorCodeCell.dataset.originalText = colorCodeCell.textContent;

    // Click event to copy color code
    row.addEventListener('click', () => {
        const colorCode = colorCodeCell.textContent === 'Click to copy!' ? colorCodeCell.dataset.originalText : colorCodeCell.textContent;
        copyToClipboard(colorCode);
    });
});

// Close modal when the close button is clicked
document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('popupModal');
    modal.classList.remove('is-active'); // Deactivate the modal
});

// Close modal when the background is clicked
document.querySelector('.modal-background').addEventListener('click', () => {
    const modal = document.getElementById('popupModal');
    modal.classList.remove('is-active'); // Deactivate the modal
});

// Close modal when the close button is clicked
document.querySelector('.modal-close').addEventListener('click', () => {
    const modal = document.getElementById('popupModal');
    modal.classList.remove('is-active'); // Deactivate the modal
});
