
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

//add geojson exported from python to map with popup		



var placesImported = L.geoJson(jesuitWorld, {
   onEachFeature: popUp
	}
);



//cluster birthplaces, need to cluster or create a group to make refiltering easier
var cluster_places= new L.MarkerClusterGroup({showCoverageOnHover: false});
    cluster_places.addLayer(placesImported);
    cluster_places.addTo(map);

//popUp box function
function popUp(f,l) {
	
	var out = [];
	if (f.properties) {
		out.push('Location.: ' + f.properties.Places);
		out.push('Latitude: ' + f.properties.Latitude);
		out.push('Longitude: ' + f.properties.Longitude);
		l.bindPopup(out.join("<br />"));
	}
	
	
}

/*var myMovingMarker = L.Marker.movingMarker([[48.8567, 2.3508],[50.45, 30.523333]],
						[20000]).addTo(map);
	myMovingMarker.start();*/			

//Creation of pan/scale function like Fulcrum images have. Uses PanControl plugin  
		L.control.pan().addTo(map);
		L.control.scale().addTo(map); 

//create the search control, set up currently for searching places, note that the text within the search box can be edited directly in the .js for the plugin
//soom set in plugin .js
	var searchControl = new L.Control.Search({
		layer: L.featureGroup([cluster_places]),
		propertyName: 'Places',
		marker: false,
	}); 
		map.addControl( searchControl );
//pop up when found		
	searchControl.on('search:locationfound', function(e) {	
		if(e.layer._popup)
			e.layer.openPopup();
	}).on('search:collapsed', function(e) {
		});	
		
		


	
