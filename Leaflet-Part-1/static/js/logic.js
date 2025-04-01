// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    accessToken: "pk.eyJ1IjoicnV0Z2Vyc3ZpeiIsImEiOiJjbTh5eDUxYTkwNmMxMmxwdmRpbm50ZW15In0.mqX-tpo7i2Zo2dq1ax1-vw"
  });
  
  // Optional: another tile layer
  let street = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    accessToken: "pk.eyJ1IjoicnV0Z2Vyc3ZpeiIsImEiOiJjbTh5eDUxYTkwNmMxMmxwdmRpbm50ZW15In0.mqX-tpo7i2Zo2dq1ax1-vw"
  });
  
  // Create the map object with center and zoom level
  let map = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 5,
    layers: [basemap]
  });
  
  // Add base layers
  let baseMaps = {
    "Basemap": basemap,
    "Street": street
  };
  
  // Load the earthquake GeoJSON data
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
  
    function styleInfo(feature) {
      let magnitude = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
  
      return {
        fillColor: getColor(depth),
        radius: getRadius(magnitude),
        fillOpacity: 0.7,
        stroke: false
      };
    }
  
    function getColor(depth) {
      if (depth < 10) return "#98ee00";
      else if (depth < 30) return "#d4ee00";
      else if (depth < 50) return "#eecc00";
      else if (depth < 70) return "#ee9c00";
      else if (depth < 90) return "#ee0000";
      else return "#000000";
    }
  
    function getRadius(magnitude) {
      return magnitude === 0 ? 1 : magnitude * 4;
    }
  
    // Add the earthquakes layer
    L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
      },
      style: styleInfo,
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}`);
      }
    }).addTo(map);
  
    // Add a legend to the map
    let legend = L.control({ position: "bottomright" });
  
    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");
      let depthIntervals = [0, 10, 30, 50, 70, 90];
      let depthColors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ee0000",
        "#000000"
      ];
  
      for (let i = 0; i < depthIntervals.length; i++) {
        let label = (i === depthIntervals.length - 1) ? "90+" : `${depthIntervals[i]}-${depthIntervals[i + 1]}`;
        div.innerHTML += `<i style="background: ${depthColors[i]}"></i> ${label}<br>`;
      }
  
      return div;
    };
  
    legend.addTo(map);
  
    // Optional: Add tectonic plates
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
      let tectonicPlates = L.geoJson(plate_data, {
        style: {
          color: "#FFA500",
          weight: 2
        }
      }).addTo(map);
    });
  });