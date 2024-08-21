// Initialize the map and set its view to the specified coordinates and zoom level
var map = L.map('map').setView([23.5, 90.3], 13);

// Load and display tile layers on the map (e.g., from OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a feature group to hold drawn items and add it to the map
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Add drawing controls to the map, allowing only rectangle drawing
var drawControl = new L.Control.Draw({
  draw: {
    polygon: false,
    polyline: false,
    circle: false,
    marker: false,
    circlemarker: false,
    rectangle: true // Enable only rectangle drawing
  },
  edit: {
    featureGroup: drawnItems
  }
});
map.addControl(drawControl);

// Event handler for when a new rectangle is created
map.on(L.Draw.Event.CREATED, function(event) {
  var layer = event.layer;
  drawnItems.addLayer(layer);

  // Get the center of the drawn rectangle and update the sidebar with location info
  var center = layer.getBounds().getCenter();
  updateSidebar(center);
});

// Function to update the sidebar with information about the selected area
function updateSidebar(center) {
  var lat = center.lat;
  var lng = center.lng;

  // OpenCage Geocoding API URL
  
  var api_key = 'f31163ad48644b83805e8acc1bf1c392';
  var query = lat + ',' + lng;
  var api_url = 'https://api.opencagedata.com/geocode/v1/json';
  var request_url = api_url
    + '?'
    + 'key=' + api_key
    + '&q=' + encodeURIComponent(query)
    + '&pretty=1'
    + '&no_annotations=1';

  var request = new XMLHttpRequest();
  request.open('GET', request_url, true);

  request.onload = function() {
    if (request.status === 200){
      // Success!
      var data = JSON.parse(request.responseText);

      if (data.results && data.results.length > 0) {
        var formattedAddress = data.results[0].formatted;

        // Update the sidebar with the formatted address and coordinates
        document.getElementById('selected-area').innerHTML = `
          <p>Latitude: ${lat}</p>
          <p>Longitude: ${lng}</p>
          <p>Formatted Address: ${formattedAddress}</p>
        `;
      } else {
        document.getElementById('selected-area').innerHTML = '<p>No address found for this location.</p>';
      }

    } else if (request.status <= 500){
      // We reached our target server, but it returned an error
      console.log("unable to geocode! Response code: " + request.status);
      var data = JSON.parse(request.responseText);
      console.log('error msg: ' + data.status.message);
      document.getElementById('selected-area').innerHTML = `<p>Error: ${data.status.message}</p>`;
    } else {
      console.log("server error");
      document.getElementById('selected-area').innerHTML = '<p>Server error occurred while retrieving data.</p>';
    }
  };

  request.onerror = function() {
    console.log("unable to connect to server");
    document.getElementById('selected-area').innerHTML = '<p>Error connecting to the server.</p>';
  };

  request.send();  // make the request
}