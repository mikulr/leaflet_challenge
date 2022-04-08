// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
let platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Create our map, giving it the streetmap and earthquakes layers to display on load.
let myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 3,
    layers: []
});

// Define a function that we want to run once for each feature in the features array.
// Give each feature a popup that describes the place and time of the earthquake.
function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3>
    <p>${new Date(feature.properties.time)}</p>
    <p>Magnitude: ${(feature.properties.mag)}</p>
    <p>Signifigance: ${(feature.properties.sig)}</p>
    <p>Depth: ${(feature.geometry.coordinates[2])}</p>
    `)
};

// Assign color ranges that will be based on the signifigance scale below
function getColor(d) {
    return d > 90 ? '#1b9e77' :
        d > 70 ? '#d95f02' :
            d > 50 ? '#7570b3' :
                d > 40 ? '#e7298a' :
                    d > 30 ? '#66a61e' :
                        d > 20 ? '#e6ab02' :
                            d > 10 ? '#a6761d' :
                                '#666666';
}

// set the style of each feature using values reurned from the geoJson
function styleFeature(feature, latlng) {
    return L.circleMarker(latlng, {
        fillOpacity: feature.geometry.coordinates[2] /30,
        color: getColor(feature.geometry.coordinates[2]),
        fillColor: getColor(feature.geometry.coordinates[2]),
        radius: Math.sqrt(feature.properties.mag)*5
    });
}



let earthquakes = new L.LayerGroup()
let plates = new L.LayerGroup()

d3.json(queryUrl).then(function (data) {
    console.log("earthquakedata:", data);
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    var quakes = L.geoJSON(data, {
        // Run the onEachFeature function once for each piece of data in the array.
        onEachFeature: onEachFeature,
        // pointToLayer will style as defined in styleFeature
        pointToLayer: styleFeature
        // first add it to var created above- if you dont then you cant access the data to reference below
    }).addTo(earthquakes)
});
// add layer from above (that you put the data in) to the map
earthquakes.addTo(myMap);

// Perform a GET request to the local file for plates
d3.json(platesUrl).then(function (data) {
    console.log("platesData:", data);
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    var plat = L.geoJSON(data, {
        // Lines dont need much styling at least!
        color: "yellow"
        // first add it to var created above- if you dont then you cant access the data to reference below
    }).addTo(plates)
});
// add layer from above (that you put the data in) to the map
plates.addTo(myMap);



// Create the base layers.
// var topo = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
//     id: 'mapbox/satellite-streets-v11',
//     tileSize: 512,
//     zoomOffset: -1,
//     accessToken: API_KEY,
// }).addTo(myMap)

var USGS_USImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
}).addTo(myMap)

var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// var streets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
//     id: 'mapbox/streets-v11',
//     tileSize: 512,
//     zoomOffset: -1,
//     accessToken: API_KEY,
// }).addTo(myMap)

// Create a baseMaps object.
var baseMaps = {
    "Street Map": street,
    "Topographical": topo,
    "USGS": USGS_USImagery
};

// Create an overlay object to hold our overlay.
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": plates
};

// Create a layer control.
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap)

// Add Legend
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        labels = ['<h4>Earthquake <br> Depth</h4>'],
        grades = [0, 10, 20, 30, 40, 50, 70, 90];


    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            labels.push(
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'));
    };
    div.innerHTML = labels.join('<br>');

    return div;
};

legend.addTo(myMap);



