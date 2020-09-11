// Create marker size
function Markersize(magnitude){
    if(magnitude > 0) {
        return magnitude * 15000;
    } else {return 0}
}

//Create marker color
function Markercolor(magnitude) {
    return magnitude > 5  ? '#f4005c' :
           magnitude > 4  ? '#e0005c' :
           magnitude > 3  ? '#c8005c' :
           magnitude > 2  ? '#ac005c' :
           magnitude > 1  ? '#91005c' :
                            '#78005c';
}

function createFeatures(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(earthquakeData, latlng) {
        // Add circles to map
            return L.circle(latlng, {
                fillOpacity: 1,
                color: "white",
                fillColor: Markercolor(earthquakeData.properties.mag),
                // Adjust radius
                radius: Markersize(earthquakeData.properties.mag)
            });
        },   
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create the tile layer that will be the background of our map
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3Bhcnp5Y2siLCJhIjoiY2tlYWxiNnI4MDFveTJzcXliczMzYmxpZCJ9.bbmbV29NnHcng_ss1QRsgQ", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        maxZoom: 18,
        id: "mapbox/streets-v11",
        
    });   

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
            "Street Map": streetmap
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
            Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [streetmap, earthquakes]
    });

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Create a magnitude legend
    var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function (myMap) {

        var div = L.DomUtil.create('div', 'info legend');
            labels = ['<strong>Magnitude</strong>'],
            magnitude = ['0-1','1-2','2-3','3-4','4-5','5+'];
            color_values = ['0.5', '1.5', '2.5', '3.5', '4.5', '5.5']

        for (var i = 0; i < color_values.length; i++) {
            div.innerHTML += 
            labels.push(
                '<i style="background:' + Markercolor(color_values[i]) + '"></i> ' +
                (magnitude[i] ? magnitude[i] : '+'));
        }

        div.innerHTML = labels.join('<br>');
    return div;
    };

    legend.addTo(myMap);
}


// Perform an API call to the Earthquake API to get earthquake information. Call createFeatures when complete
(async function(){
    const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const data = await d3.json(queryUrl);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
})()