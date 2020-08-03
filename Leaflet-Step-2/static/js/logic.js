// Define API_KEY
var API_KEY = "pk.eyJ1IjoiZGVudmVydW5pdmVyc2l0eXNrIiwiYSI6ImNrY2h1bHY3eDBicXUycnU5OTd5YmU3d28ifQ.Ge8p-gzKGJFB04mZLF_VYw";

// Create tile layer for map background
var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v9",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v9",
  accessToken: API_KEY
});

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
});

// Create map object with options
var map = L.map("map", {
  center: [
    39.5501, -105.7821
  ],
  zoom: 2.5
});

// Call and retrieve earthquake geoJSON data
var earthquakesURL = d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  // Return style data for each earthquake plotted
  // Create functions to pass magnitude of earthquake and calculate color and radius
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Create function to determine color of marker based on magnitude of earthquake
  function getColor(magnitude) {
    switch (true) {
    case magnitude > 5:
      return "#ea2c2c";
    case magnitude > 4:
      return "#ea822c";
    case magnitude > 3:
      return "#ee9c00";
    case magnitude > 2:
      return "#eecc00";
    case magnitude > 1:
      return "#d4ee00";
    default:
      return "#98ee00";
    }
  }

  // Create function to determine radius of earthquake marker based on magnitude
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // Add GeoJSON layer to map once file is loaded
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(earthquakes);

  // Create legend control object
  var legend = L.control({
    position: "bottomright"
  });

  // Add details for legend
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // Loop through intervals to generate label with colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to map
  legend.addTo(map);
});

// Add 'graymap' tile layer to map
graymap.addTo(map);

// Define fault lines as new L.layerGroup
var faultLines = new L.layerGroup();

// Plot second data on map to illustrate relationship between tectonic plates and seismic activity
faultLinesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(faultLinesURL, function(response) {
  function faultStyle(feature) {
    return {
      weight: 2,
      color: "orange"
    };
  }

  L.geoJSON(response, {
    style: faultStyle
  }).addTo(faultLines);
  faultLines.addTo(map)
})

// Define earthquakes as new L.layerGroup
var earthquakes = new L.layerGroup();

d3.json(earthquakesURL, function(response) {
    function earthquakesStyle(feature) {
      return {
        weight: 2,
      };
    }
  
    L.geoJSON(response, {
      style: earthquakesStyle
    }).addTo(earthquakes);
    earthquakes.addTo(map)
  })

// Separate data sets into overlays
var overlayMaps = {
    "Fault Lines": faultLines,
    "Earthquakes": earthquakes
};

// Add baseMap options
var baseMap = {
    "Satellite": satellite,
    "Grayscale": graymap,
    "Outdoors": outdoors  
};

// Add control layers to map
L.control.layers(baseMap, overlayMaps, {
    collapsed: false
}).addTo(map);