  
//Define map start up options, here defined to center on Gabii
		var mapOptions = {
			center: [ 41.887856934, 12.719429433], //set center
			zoom: 2 , //set initial zoom
			maxZoom : 17,  //set max zoom
			minZoom : 1,
			}
		
//Creates Map according to map options 
		var map = new L.map('map', mapOptions); 
		
//Examples of an externally called tiled basemap
		var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
			}).addTo(map);

var lineStringImported = L.geoJson(toLineString, {
	onEachFeature: forEachFeature
	}
);
			
var baseLayers = {
			"Satellite Imagery" : Esri_WorldImagery,
			};
var overlayMaps = {
			"Jesuit Lives" : lineStringImported
			};
//L.control.layers(baseLayers, overlayMaps).addTo(map);

//add geojson exported from python to map with popup		




var lineGroup = L.layerGroup([lineStringImported]); 

function forEachFeature(f, layer) {
     
		
	f.properties.birthStamp = timestamp(f.properties.dateOfBirth);
	f.properties.deathStamp = timestamp(f.properties.dateOfDeath);

	var out = [];
	if (f.properties) {
		out.push('Birthplace no.: ' + f.properties.Id);
		out.push('Date of Birth: ' + f.properties.dateOfBirth);
		out.push('Date of Death: ' + f.properties.dateOfDeath);
		out.push('Year: ' + f.properties.yearOfBirth);
		out.push('BirthTimestamp: ' + f.properties.birthStamp);
		out.push('DeathTimestam: ' + f.properties.deathStamp);
		out.push('Last Name: ' + f.properties.lastName);
		layer.bindPopup(out.join("<br />"));
	}	
}



function timestamp(str) {
    return new Date(str).getTime();
}


//Creation of pan/scale function like Fulcrum images have. Uses PanControl plugin  
		L.control.pan().addTo(map);
		L.control.scale().addTo(map); 	

//create the search control, set up currently for searching places, note that the text within the search box can be edited directly in the .js for the plugin
//soom set in plugin .js
	var searchControl = new L.Control.Search({
		layer: L.featureGroup([lineGroup]),
		propertyName: 'lastName',
		marker: false,
	}); 
		map.addControl( searchControl ); 
//pop up when found		
	searchControl.on('search:locationfound', function(e) {	
		if(e.layer._popup)
			e.layer.openPopup();
		lineGroup.clearLayers();
		//note this html id seems to change every once in a while...need to check
		var choice = document.getElementById("searchtext16").value;
		console.log(choice);
		var lineStringImported = L.geoJson(toLineString, {
			onEachFeature: forEachFeature,
			filter:
				function (feature, layer) {
					return (feature.properties.lastName == choice);
				}
		});
		lineGroup.addLayer(lineStringImported).addTo(map);
	}).on('search:cancel', function(e) {
		lineGroup.clearLayers();
		var lineStringImported = L.geoJson(toLineString, {
		onEachFeature: forEachFeature
	})
	map.removeLayer(lineGroup);
	lineGroup.addLayer(lineStringImported);
	
	});	
		
