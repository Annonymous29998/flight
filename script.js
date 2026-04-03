// =====================================================
// American Airlines Flight Tracker - JavaScript
// =====================================================

// Flight Database with sample flights
const flightDatabase = {
    'AA2156': {
        flightNumber: 'AA 2156',
        passenger: {
            name: 'Donna Carver',
            avatar: '👤'
        },
        departure: {
            airport: 'BOS',
            city: 'Boston, MA, USA',
            fullName: 'Boston',
            date: 'Apr 3, 2026',
            time: '10:00 AM',
            gate: 'A15'
        },
        arrival: {
            airport: 'CHS',
            city: 'Charleston, SC, USA',
            fullName: 'Charleston',
            date: 'Apr 3, 2026',
            time: '12:18 PM'
        },
        connections: [],
        connectionDetails: {},
        seat: '12C',
        class: 'Economy',
        airline: 'AA'
    },
    'AA1234': {
        flightNumber: 'AA 1234',
        passenger: {
            name: 'John Smith',
            avatar: '👤'
        },
        departure: {
            airport: 'LAX',
            city: 'California, USA',
            fullName: 'Los Angeles',
            date: 'Jan 16, 2025',
            time: '8:30 AM',
            gate: 'A12'
        },
        arrival: {
            airport: 'JFK',
            city: 'New York, USA',
            fullName: 'New York',
            date: 'Jan 16, 2025',
            time: '4:45 PM'
        },
        connections: ['ORD'],
        connectionDetails: {
            'ORD': 'Chicago, IL'
        },
        seat: '15F',
        class: 'Business',
        airline: 'AA'
    },
    'AA5678': {
        flightNumber: 'AA 5678',
        passenger: {
            name: 'Emily Johnson',
            avatar: '👤'
        },
        departure: {
            airport: 'DFW',
            city: 'Texas, USA',
            fullName: 'Dallas',
            date: 'Jan 17, 2025',
            time: '11:15 AM',
            gate: 'C22'
        },
        arrival: {
            airport: 'MIA',
            city: 'Florida, USA',
            fullName: 'Miami',
            date: 'Jan 17, 2025',
            time: '3:30 PM'
        },
        connections: [],
        connectionDetails: {},
        seat: '8A',
        class: 'First',
        airline: 'AA'
    },
    // Additional test flights
    'AA100': {
        flightNumber: 'AA 100',
        passenger: {
            name: 'Michael Brown',
            avatar: '👤'
        },
        departure: {
            airport: 'JFK',
            city: 'New York, USA',
            fullName: 'New York',
            date: 'Jan 18, 2025',
            time: '7:00 AM',
            gate: 'T4-A5'
        },
        arrival: {
            airport: 'LHR',
            city: 'London, UK',
            fullName: 'London Heathrow',
            date: 'Jan 18, 2025',
            time: '7:30 PM'
        },
        connections: [],
        connectionDetails: {},
        seat: '1A',
        class: 'First',
        airline: 'AA'
    },
    'AA2456': {
        flightNumber: 'AA 2456',
        passenger: {
            name: 'Sarah Davis',
            avatar: '👤'
        },
        departure: {
            airport: 'ORD',
            city: 'Illinois, USA',
            fullName: 'Chicago O\'Hare',
            date: 'Jan 19, 2025',
            time: '2:45 PM',
            gate: 'H12'
        },
        arrival: {
            airport: 'SFO',
            city: 'California, USA',
            fullName: 'San Francisco',
            date: 'Jan 19, 2025',
            time: '5:20 PM'
        },
        connections: ['DEN'],
        connectionDetails: {
            'DEN': 'Denver, CO'
        },
        seat: '12C',
        class: 'Economy',
        airline: 'AA'
    }
};

// =====================================================
// DOM Elements
// =====================================================
const lookupState = document.getElementById('lookupState');
const detailsState = document.getElementById('detailsState');
const flightInput = document.getElementById('flightInput');
const searchBtn = document.getElementById('searchBtn');
const backBtn = document.getElementById('backBtn');
const errorMessage = document.getElementById('errorMessage');

// Flight Detail Elements
const departureAirportCode = document.getElementById('departureAirportCode');
const departureAirportCity = document.getElementById('departureAirportCity');
const arrivalAirportCode = document.getElementById('arrivalAirportCode');
const arrivalAirportCity = document.getElementById('arrivalAirportCity');
const passengerName = document.getElementById('passengerName');
const flightNumberDisplay = document.getElementById('flightNumber');
const departureDate = document.getElementById('departureDate');
const departureTime = document.getElementById('departureTime');
const arrivalDate = document.getElementById('arrivalDate');
const arrivalTime = document.getElementById('arrivalTime');
const gateInfo = document.getElementById('gateInfo');
const seatInfo = document.getElementById('seatInfo');
const classInfo = document.getElementById('classInfo');
const journeyRoute = document.getElementById('journeyRoute');

// =====================================================
// State Management
// =====================================================
let currentFlight = null;
let isTransitioning = false;

// =====================================================
// Utility Functions
// =====================================================

/**
 * Format flight input - uppercase and remove extra spaces
 */
function formatFlightInput(input) {
    return input.toUpperCase().replace(/\s+/g, '');
}

/**
 * Normalize flight code - remove AA prefix for lookup
 */
function normalizeFlightCode(code) {
    return code.replace(/^AA/, '').replace(/^AAL/, '');
}

/**
 * Format flight number for display (add space after AA)
 */
function formatFlightNumber(code) {
    const normalized = formatFlightInput(code);
    const match = normalized.match(/^AA(\d+)$/);
    if (match) {
        return `AA ${match[1]}`;
    }
    return normalized;
}

/**
 * Show error message with animation
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    errorMessage.style.animation = 'none';
    // Trigger reflow to restart animation
    errorMessage.offsetHeight;
    errorMessage.style.animation = 'shake 0.3s ease';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.hidden = true;
    errorMessage.style.animation = 'none';
}

/**
 * Add loading state to search button
 */
function setLoadingState(isLoading) {
    if (isLoading) {
        searchBtn.classList.add('loading');
        searchBtn.disabled = true;
    } else {
        searchBtn.classList.remove('loading');
        searchBtn.disabled = false;
    }
}

// =====================================================
// State Transitions
// =====================================================

/**
 * Transition from lookup to flight details
 */
function showFlightDetails() {
    if (isTransitioning) return;
    isTransitioning = true;
    
    hideError();
    lookupState.classList.add('hidden');
    
    setTimeout(() => {
        detailsState.hidden = false;
        // Focus on the flight card for accessibility
        detailsState.focus();
        isTransitioning = false;
    }, 400);
}

/**
 * Transition from flight details back to lookup
 */
function showLookupState() {
    if (isTransitioning) return;
    isTransitioning = true;
    
    detailsState.hidden = true;
    
    setTimeout(() => {
        lookupState.classList.remove('hidden');
        flightInput.value = '';
        flightInput.focus();
        isTransitioning = false;
    }, 50);
}

// =====================================================
// UI Update Functions
// =====================================================

/**
 * Update all flight details in the UI
 */
function updateFlightDetails(flightData) {
    // Update header airports
    departureAirportCode.textContent = flightData.departure.airport;
    departureAirportCity.textContent = flightData.departure.city;
    arrivalAirportCode.textContent = flightData.arrival.airport;
    arrivalAirportCity.textContent = flightData.arrival.city;
    
    // Update passenger info
    passengerName.textContent = flightData.passenger.name;
    
    // Update flight number
    flightNumberDisplay.textContent = flightData.flightNumber;
    
    // Update times
    departureDate.textContent = flightData.departure.date;
    departureTime.textContent = flightData.departure.time;
    arrivalDate.textContent = flightData.arrival.date;
    arrivalTime.textContent = flightData.arrival.time;
    
    // Update footer info
    gateInfo.textContent = flightData.departure.gate;
    seatInfo.textContent = flightData.seat;
    classInfo.textContent = flightData.class;
    
    // Update journey route with connections
    updateJourneyRoute(flightData);
}

/**
 * Update the journey route visualization
 */
function updateJourneyRoute(flightData) {
    // Clear existing route
    journeyRoute.innerHTML = '';
    
    // Build route points array
    const routePoints = [
        {
            code: flightData.departure.airport,
            name: flightData.departure.fullName
        }
    ];
    
    // Add connections
    flightData.connections.forEach(connection => {
        routePoints.push({
            code: connection,
            name: flightData.connectionDetails[connection] || connection
        });
    });
    
    // Add arrival
    routePoints.push({
        code: flightData.arrival.airport,
        name: flightData.arrival.fullName
    });
    
    // Build route HTML
    routePoints.forEach((point, index) => {
        // Create route point
        const pointDiv = document.createElement('div');
        pointDiv.className = 'route-point';
        pointDiv.innerHTML = `
            <div class="point-code">${point.code}</div>
            <div class="point-name">${point.name}</div>
        `;
        journeyRoute.appendChild(pointDiv);
        
        // Add connection line and plane (except for last point)
        if (index < routePoints.length - 1) {
            const connectionDiv = document.createElement('div');
            connectionDiv.className = 'route-connection';
            connectionDiv.innerHTML = `
                <div class="route-line"></div>
                <div class="route-plane" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                </div>
            `;
            journeyRoute.appendChild(connectionDiv);
        }
    });
}

// =====================================================
// Flight Search Logic
// =====================================================

/**
 * Search for a flight in the database
 */
function searchFlight() {
    const inputValue = flightInput.value.trim();
    
    if (!inputValue) {
        showError('Please enter a flight number');
        return;
    }
    
    const formattedInput = formatFlightInput(inputValue);
    const normalizedCode = normalizeFlightCode(formattedInput);
    
    // Set loading state
    setLoadingState(true);
    
    // Simulate API call delay for better UX
    setTimeout(() => {
        // Try to find flight with different formats
        let flightData = flightDatabase[formattedInput] || 
                        flightDatabase[`AA${normalizedCode}`] ||
                        flightDatabase[normalizedCode];
        
        setLoadingState(false);
        
        if (flightData) {
            currentFlight = flightData;
            updateFlightDetails(flightData);
            showFlightDetails();
        } else {
            showError('Flight not found. Please check your flight number. Try AA 5079, AA 1234, or AA 5678.');
            flightInput.focus();
        }
    }, 500);
}

// =====================================================
// Event Listeners
// =====================================================

// Search button click
searchBtn.addEventListener('click', searchFlight);

// Enter key to search
flightInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchFlight();
    }
});

// Hide error when user starts typing
flightInput.addEventListener('input', () => {
    hideError();
});

// Back button click
backBtn.addEventListener('click', () => {
    showLookupState();
});

// Auto-capitalize and format input
flightInput.addEventListener('input', (e) => {
    const cursorPosition = e.target.selectionStart;
    const originalValue = e.target.value;
    const capitalizedValue = formatFlightInput(originalValue);
    
    // Add space after airline code if it matches pattern
    let formattedValue = capitalizedValue;
    if (capitalizedValue.match(/^AA\d+$/)) {
        formattedValue = capitalizedValue.replace(/^AA/, 'AA ');
    }
    
    e.target.value = formattedValue;
    
    // Restore cursor position (adjusted for formatting)
    const newCursorPosition = Math.max(0, cursorPosition + (formattedValue.length - originalValue.length));
    e.target.setSelectionRange(newCursorPosition, newCursorPosition);
});

// =====================================================
// Keyboard Navigation
// =====================================================

document.addEventListener('keydown', (e) => {
    // Escape key goes back to search from details
    if (e.key === 'Escape' && !detailsState.hidden) {
        showLookupState();
    }
});

// =====================================================
// Touch/Swipe Support (for mobile)
// =====================================================

let touchStartX = 0;
let touchEndX = 0;

detailsState.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

detailsState.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    // Swipe right to go back (swiping from left to right)
    if (diff < -swipeThreshold && !detailsState.hidden) {
        showLookupState();
    }
}

// =====================================================
// Initialization
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    // Focus on input field
    flightInput.focus();
    
    // Log available test flights
    console.log('%c✈️ American Airlines Flight Tracker', 'color: #003366; font-size: 16px; font-weight: bold;');
    console.log('%cSample flight numbers for testing:', 'color: #666; font-weight: bold;');
    console.log('  • AA 5079 - Atlanta → Charlotte → Toronto (Donna Carver)');
    console.log('  • AA 1234 - Los Angeles → Chicago → New York (John Smith)');
    console.log('  • AA 5678 - Dallas → Miami (Emily Johnson)');
    console.log('  • AA 100 - New York → London (Michael Brown)');
    console.log('  • AA 2456 - Chicago → Denver → San Francisco (Sarah Davis)');
});

// =====================================================
// Accessibility Enhancements
// =====================================================

// Add visually hidden class for screen reader only content
const style = document.createElement('style');
style.textContent = `
    .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
`;
document.head.appendChild(style);

// Announce state changes for screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Update showFlightDetails to announce change
const originalShowFlightDetails = showFlightDetails;
showFlightDetails = function() {
    if (currentFlight) {
        announceToScreenReader(`Flight ${currentFlight.flightNumber} details loaded`);
    }
    originalShowFlightDetails();
};

// Update showLookupState to announce change
const originalShowLookupState = showLookupState;
showLookupState = function() {
    announceToScreenReader('Back to flight search');
    originalShowLookupState();
};