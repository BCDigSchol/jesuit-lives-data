
//Define map start up options, here defined to center on Gabii
		var mapOptions = {
			center: [ 41.887856934, 12.719429433], //set center
			zoom: 2 , //set initial zoom
			maxZoom : 27,  //set max zoom
			minZoom : 1,
			}
		
//Creates Map according to map options 
		var map = new L.map('map', mapOptions); 
		
		
//Examples of an externally called tiled basemap
		var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
			}).addTo(map);
			

	
var allPlaces = L.geoJson(jesuitAll, {
	
	onEachFeature: function (feature, layer) {
		var popupText = 'Location: ' + feature.properties.Places;
		layer.bindPopup(popupText);
	}
});
	

	
		var markers = L.markerClusterGroup();
		markers.addLayer(allPlaces);
		
		
		
		
		
		map.addLayer(markers);




	
			
			// generalized function popup box for any .geojson
		/*			function popUp(f,l){
						var out = [];
				if (f.properties){
					for(key in f.properties){
						if (key == "Database_Link") {
						out.push('<a href="'+ f.properties[key] + '" target="_blank">Link to Database</a>'); } //allows for link to external URL via attribute in .geoJson table
						else {
						out.push(key+": "+f.properties[key]);
						}
					}
					l.bindPopup(out.join("<br />"));
					}
				}*/
		
				

//Creation of pan/scale function like Fulcrum images have. Uses PanControl plugin  
		L.control.pan().addTo(map);
		L.control.scale().addTo(map); 

//create the search control, note that the text within the search box can be edited directly in the .js for the plugin
/*	var searchControl = new L.Control.Search({
		layer: allPlaces,
		propertyName: 'Places',
		marker: false,
		moveToLocation: function(latlng, title, map) {
			//map.fitBounds( latlng.layer.getBounds() );
			var zoom = map.getBoundsZoom(latlng.layer.getBounds());
  			map.setView(latlng, zoom); // access the zoom
		}
	}); 
		map.addControl( searchControl );
		
/*	searchControl.on('search:locationfound', function(e) {
		
		//console.log('search:locationfound', );

		//map.removeLayer(this._markerSearch)

	//	e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
		if(e.layer._popup)
			e.layer.openPopup();

	}).on('search:collapsed', function(e) {

//allPhases.eachLayer(function(layer) {	//restore feature color
		//	allPhases.resetStyle(layer);
		});	*/

	
  //inizialize search control  