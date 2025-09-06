let map;
let directionsService;
let directionsRenderer;

function initMap() {
    // Initialize the map centered on a default location (e.g., Jakarta)
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -6.2088, lng: 106.8456 },
        zoom: 12,
        mapTypeControl: false, // Hide map type control
    });

    // Initialize Directions Service and Renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById("results")); // Display text directions

    // Setup Autocomplete for origin and destination fields
    const originInput = document.getElementById("origin");
    const destinationInput = document.getElementById("destination");

    const originAutocomplete = new google.maps.places.Autocomplete(originInput);
    const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);

    // Add event listener for the find route button
    document.getElementById("find-route").addEventListener("click", findRoute);
}

function findRoute() {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const selectedMode = document.querySelector('input[name="mode"]:checked').value;

    if (!origin || !destination) {
        alert("Harap masukkan lokasi awal dan destinasi.");
        return;
    }

    // Show loading state (optional)
    document.getElementById("results").innerHTML = "<p>Menghitung rute...</p>";

    // Call the backend API to get the route
    fetch(`/api/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${selectedMode}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || 'Gagal mengambil data rute.') });
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'OK') {
                displayRoute(data);
            } else {
                document.getElementById("results").innerHTML = `<p>Tidak dapat menemukan rute: ${data.status}</p>`;
            }
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("results").innerHTML = `<p>Terjadi kesalahan: ${error.message}</p>`;
        });
}

function displayRoute(response) {
    // The backend will return a response compatible with DirectionsResult
    // So we can pass it directly to the renderer.
    directionsRenderer.setDirections(response);

    // You can also extract and display summary information if needed
    const route = response.routes[0].legs[0];
    const summaryPanel = document.createElement('div');
    summaryPanel.innerHTML = `
        <h3>Ringkasan Rute</h3>
        <p><strong>Jarak:</strong> ${route.distance.text}</p>
        <p><strong>Durasi:</strong> ${route.duration.text}</p>
        <a href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(route.start_address)}&destination=${encodeURIComponent(route.end_address)}" target="_blank">Buka di Google Maps</a>
    `;
    // Prepend the summary to the results panel
    const resultsPanel = document.getElementById("results");
    resultsPanel.insertBefore(summaryPanel, resultsPanel.firstChild);
}

// Make initMap globally available
window.initMap = initMap;
