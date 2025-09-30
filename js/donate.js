document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://172.20.135.3:3000/api'; // <-- IMPORTANT: SET YOUR IP HERE
    let currentUser = null;

    // --- PAGE PROTECTION ---
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
        window.location.href = 'login.html';
        return;
    } else {
        currentUser = JSON.parse(userString);
    }
    
    // --- DOM REFERENCES ---
    const donationForm = document.getElementById('donation-form');
    const conditionSelect = document.getElementById('donation-condition');
    const conditionFeedback = document.getElementById('condition-feedback');
    const pickupDateInput = document.getElementById('pickup-date');

    // --- Mobile Menu & Logout Logic ---
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mainNav = document.querySelector('.main-nav');
     if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // --- DYNAMIC FEEDBACK LOGIC ---
    const feedbackMessages = {
        'new': 'Thank you! New items are greatly appreciated and go to those with immediate needs.',
        'good': 'Great! Gently used clothes are perfect for giving someone a fresh start.',
        'fair': 'Thank you for your honesty. Usable items in any condition can still make a difference.'
    };

    if (conditionSelect) {
        conditionSelect.addEventListener('change', () => {
            const selectedValue = conditionSelect.value;
            if (feedbackMessages[selectedValue]) {
                conditionFeedback.textContent = feedbackMessages[selectedValue];
                conditionFeedback.classList.add('visible');
            } else {
                conditionFeedback.classList.remove('visible');
            }
        });
    }
    
    // --- Prevent picking dates in the past ---
    if (pickupDateInput) {
        const today = new Date().toISOString().split('T')[0];
        pickupDateInput.setAttribute('min', today);
    }

    // --- Donation Form Submission ---
    if (donationForm) {
        donationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const items = document.getElementById('donation-items').value.trim();
            const condition = document.getElementById('donation-condition').value;
            const pickupDate = document.getElementById('pickup-date').value;
            const pickupSlot = document.getElementById('pickup-slot').value;

            if (!items || !condition || !pickupDate || !pickupSlot) {
                alert('Please fill out all fields.');
                return;
            }

            const result = await apiRequest('/donations', 'POST', {
                phone: currentUser.phone,
                items,
                condition,
                pickupDate,
                pickupSlot
            });

            if (result && result.success) {
                // Redirect to the thank you page with the new donation ID
                window.location.href = `thankyou.html?id=${result.donationId}`;
            }
        });
    }

    // --- API Request Helper ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        try {
            const options = { method, headers: { 'Content-Type': 'application/json' } };
            if (body) options.body = JSON.stringify(body);
            const response = await fetch(`${API_URL}${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            alert(`Error: ${error.message}`);
            return null;
        }
    }
});