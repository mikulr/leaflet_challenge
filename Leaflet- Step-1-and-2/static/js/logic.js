// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
let platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Perform a GET request to the query URL fgor earthquakes
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features)
});

// Perform a GET request to the local file for plates
// d3.json("data/plates.json").then(function (data) {
//     // Once we get a response, send the data.features object to the createPlates function.
//     createPlates(data.features)
// });

   // Create our map, giving it the streetmap and earthquakes layers to display on load.
   var myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 4,
   
});



function createFeatures(earthquakeData) {
    console.log("data:", earthquakeData);
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
        return d > 500 ? '#800026' :
            d > 400 ? '#BD0026' :
                d > 300 ? '#E31A1C' :
                    d > 200 ? '#FC4E2A' :
                        d > 150 ? '#FD8D3C' :
                            d > 100 ? '#FEB24C' :
                                d > 50? '#FED976' :
                                    '#FFEDA0';
    }
    // set the style of each feature using values reurned from the geoJson
    function styleFeature(feature, latlng) {
        return L.circleMarker(latlng, {
            fillOpacity: feature.geometry.coordinates[2] / 50,
            color: getColor(feature.properties.sig),
            fillColor: getColor(feature.properties.sig),
            radius: Math.sqrt(feature.properties.sig)
        });
    }
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: styleFeature
    });
    
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}          



// function createPlates(platesData) {
//     console.log("platesData:", platesData);

//     // var plates = L.geoJSON(platesData, {
//     //     onEachFeature: 
// };




function createMap(earthquakes) {

    //     // Create the base layers.
    var topo = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/satellite-streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY,
    }).addTo(myMap)

    var USGS_USImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20,
        attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    }).addTo(myMap)

    var streets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY,
    }).addTo(myMap)

    // Create a baseMaps object.
    var baseMaps = {
        "Street Map": streets,
        "Satellite": topo,
        "USGS": USGS_USImagery
    };

    // Create an overlay object to hold our overlay.
    var overlayMaps = {
        "Earthquakes": earthquakes
    };

     // Create a layer control.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap)

}