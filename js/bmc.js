document.addEventListener('DOMContentLoaded', function() {
    initializeBMC();
});

function initializeBMC() {
    // Create the BMC button HTML
    const bmcButtonHTML = `
        <a href="https://buymeacoffee.com/simwik91" target="_blank" class="super-bmc-btn">
            <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Coffee cup">
            Buy me a coffee
        </a>
    `;

    // Show popup immediately
    if (!sessionStorage.getItem('bmcPopupShown')) {
        const popup = document.getElementById('bmc-popup');
        const popupButtonContainer = document.getElementById('bmc-popup-button-container');
        
        if (popup && popupButtonContainer) {
            // Add button to popup
            popupButtonContainer.innerHTML = bmcButtonHTML;
            
            setTimeout(() => {
                popup.style.display = 'flex';
                sessionStorage.setItem('bmcPopupShown', 'true');
            }, 1500);
        }
    } else {
        // If popup was already shown, initialize floating button immediately
        initializeFloatingButton();
    }

    // Close button functionality
    const closeButton = document.getElementById('bmc-popup-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            const popup = document.getElementById('bmc-popup');
            if (popup) {
                popup.style.display = 'none';
                initializeFloatingButton();
            }
        });
    }

    // Close popup when clicking outside
    const popup = document.getElementById('bmc-popup');
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                popup.style.display = 'none';
                initializeFloatingButton();
            }
        });
    }
}

function initializeFloatingButton() {
    const floatingContainer = document.getElementById('bmc-floating');
    
    // Clear any existing content
    floatingContainer.innerHTML = '';
    
    // Create centered floating button
    const floatingBtn = document.createElement('a');
    floatingBtn.href = 'https://buymeacoffee.com/simwik91';
    floatingBtn.target = '_blank';
    floatingBtn.className = 'centered-floating-bmc-btn';
    floatingBtn.innerHTML = `
        <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Coffee cup">
        Buy me a coffee
    `;
    floatingBtn.title = 'Support my work';
    
    floatingContainer.appendChild(floatingBtn);
    
    // Show the floating container
    floatingContainer.style.display = 'block';
    
    console.log('Centered Buy Me a Coffee button initialized successfully');
}