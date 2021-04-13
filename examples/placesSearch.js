
//Define map start up options
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
	var placesImported = L.geoJson(allPlaces, {
		onEachFeature: popUp
	}
	);

	var provincesImported=L.geoJson(allProvinces, {
		onEachFeature: popUpProvince
	}
	);

//cluster birthplaces, need to cluster or create a group to make filtering easier
	var cluster_places= new L.MarkerClusterGroup({showCoverageOnHover: false});
	cluster_places.addLayer(placesImported);
	cluster_places.addTo(map);

	var cluster_provinces = new L.MarkerClusterGroup({showCoverageOnHover: false});
	cluster_provinces.addLayer(provincesImported);


	var baseLayers = {
			"Satellite Imagery" : Esri_WorldImagery,
			};

	var overlayMaps = {
			"Birth and Death Locations" : cluster_places,
			"Vow Locations" : cluster_provinces
			};

	var controls =	L.control.layers(baseLayers, overlayMaps).addTo(map);
//popup box functionality

	function popUp(f,l) {
		var out = [];

		//adds spaces in between entries
		var bornHereString = f.properties.bornHere;
		var bornHereSpaces = bornHereString.join(', ');
		var diedHereString = f.properties.diedHere;
		var diedHereSpaces = diedHereString.join(', ');
		if (f.properties) {
			out.push('<b>Place: </b>' + f.properties.Places);
			out.push('<b>Latitude: </b>' + f.properties.Latitude);
			out.push('<b>Longitude: </b>' + f.properties.Longitude);
			out.push('<b>City: </b>' + f.properties.City);
			out.push('<b>Region: </b>' + f.properties.Region);
			out.push('<b>Department: </b>' + f.properties.Department);
			out.push('<b>Jesuits who were born here: </b>' + bornHereSpaces);
			out.push('<b>Jesuits who died here: </b>' + diedHereSpaces);
			l.bindPopup(out.join("<br />"));
		}
	}

	function popUpProvince(f,l) {
		var out=[];
		var vowedHereString = f.properties.vowedHere;
		var vowedHereSpaces = vowedHereString.join(', ');
		if (f.properties) {
			out.push('<b>Province Name: </b>' + f.properties.JesuitPlaceFull);
			out.push('<b>Latitude: </b>' + f.properties.provLat);
			out.push('<b>Longitude: </b>' + f.properties.provLong);
			out.push('<b>Jesuits who took their vows here: </b>' + vowedHereSpaces);
			l.bindPopup(out.join("<br />"));
		}
	}


//Creation of pan/scale function for accessibility
	L.control.pan().addTo(map);
	L.control.scale().addTo(map);

//create the search control, set up currently for searching places, note that the text within the search box can be edited directly in the .js for the plugin
//zoom set in plugin .js
	var searchControl = new L.Control.Search({
		layer: L.featureGroup([cluster_places]),
		propertyName: 'Places',
		textPlaceholder: 'Search by Location of Birth/Death',
		marker: false,
	});
	map.addControl( searchControl );

//open pop up when location is found
	searchControl.on('search:locationfound', function(e) {
		if(e.layer._popup)
			e.layer.openPopup();
	}).on('search:collapsed', function(e) {
	});
