
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

// replace Leaflet's default blue marker with a custom green icon for birthplaces
	function createCustomIconBirth (feature, latlng) {
		let myIcon = L.icon({
			iconUrl: './img/marker-icon-green.png',
			shadowUrl: './img/marker-shadow.png',
			iconSize:     [18, 25], // width and height of the image in pixels
			shadowSize:   [35, 20], // width, height of optional shadow image
			iconAnchor:   [12, 12], // point of the icon which will correspond to marker's location
			shadowAnchor: [12, 6],  // anchor point of the shadow. should be offset
			popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
		})
		return L.marker(latlng, { icon: myIcon })
	}

// replace Leaflet's default blue marker with a custom red icon for deathplaces
	function createCustomIconDeath (feature, latlng) {
		let myIcon = L.icon({
			iconUrl: './img/marker-icon-red.png',
			shadowUrl: './img/marker-shadow.png',
			iconSize:     [18, 25], // width and height of the image in pixels
			shadowSize:   [35, 20], // width, height of optional shadow image
			iconAnchor:   [12, 12], // point of the icon which will correspond to marker's location
			shadowAnchor: [12, 6],  // anchor point of the shadow. should be offset
			popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
		})
		return L.marker(latlng, { icon: myIcon })
	}

//import geojson files for birthplaces and deathplaces and apply popup boxes and custom icons
	var birthplacesImported = L.geoJson(birthplaces, {
		onEachFeature: popUp,
		pointToLayer: createCustomIconBirth
	});

	var deathplacesImported = L.geoJson(deathplaces, {
		onEachFeature: popUp,
		pointToLayer: createCustomIconDeath
	});


//Create popUp box function
	function popUp(f,l) {
		var out = [];
		f.properties.birthStamp = timestamp(f.properties.Birth_Date);
		f.properties.deathStamp = timestamp(f.properties.Death_Date);
		if (f.properties) {
			out.push('Entry Number.: ' + f.properties.d);
			out.push('First Name: ' + f.properties.First_Name);
			out.push('Last Name: ' + f.properties.Last_Name);
			out.push('Date of Birth: ' + f.properties.Birth_Date);
			out.push('Place of Birth: ' + f.properties.Place_of_Birth);
			out.push('Date of Death: ' + f.properties.Death_Date);
			out.push('Place of Death: ' + f.properties.Place_of_Death);
			l.bindPopup(out.join("<br />"));
		}
	}

//cluster birthplaces, need to cluster or create a group to make refiltering easier
//chunked loading also helps speed this process slightly

	var birthCluster= new L.MarkerClusterGroup({chunkedLoading: true, showCoverageOnHover: false,
		iconCreateFunction: function(cluster) {
			var icon = birthCluster._defaultIconCreateFunction(cluster); //apply specialized css for clustergroups
			icon.options.className += ' birthgroup';
			return icon;
		}
	});
    birthCluster.addLayer(birthplacesImported);
	birthCluster.addTo(map); //load birthcluster on startup 
 
	
	var deathCluster= new L.MarkerClusterGroup({chunkedLoading: true, showCoverageOnHover: false,
		iconCreateFunction: function(cluster) {
			var icon = deathCluster._defaultIconCreateFunction(cluster);
			icon.options.className += ' deathgroup';
			return icon;
		}
	});
    deathCluster.addLayer(deathplacesImported)

//Create Control Box for turning on and off layers	
	var baseLayers = {
		"Satellite Imagery" : Esri_WorldImagery,
	};
			
	var clusterLayers = {
		"Birthplaces" : birthCluster,
		"Deathplaces" : deathCluster
	};
	L.control.layers(baseLayers, clusterLayers, {collapsed:false}).addTo(map);
	

//Creation of pan/scale function like Fulcrum images have. Uses PanControl plugin  
	L.control.pan().addTo(map);
	L.control.scale().addTo(map); 
	

//Timestamp is required to filter by date; string needs the form of mm/dd/yyyy to function
	function timestamp(str) {
		return new Date(str).getTime();
	}

//Create slider using html div name
	var dateSlider = document.getElementById('slider-date');

	noUiSlider.create(dateSlider, {
		range: {
			min: timestamp('01/01/1725'),
			max: timestamp('12/31/1975')
		},
		connect: true,
		tooltips: true,
		// Steps of one week
		step: 7*60*60*24 *1000 ,
	
		// Two more timestamps indicate the handle starting positions.
		start: [timestamp('01/01/1725'), timestamp('12/31/1975')],

		// No decimals
		format: wNumb({
			decimals: 0
		})
	});
	
	//create array to hold hidden timestamp values for filtering
	var dateValues = [
		document.getElementById('event-start'),
		document.getElementById('event-end')
	];
	//set initial values for filtering
	dateValues[0].innerHTML=timestamp('01/01/1725');
	dateValues[1].innerHTML=timestamp('12/31/1975');
	
//used for public display dates; needs to be above the formatDate function call
	var weekdays = [
		"Sunday", "Monday", "Tuesday",
		"Wednesday", "Thursday", "Friday",
		"Saturday"
	];

	var months = [
		"January", "February", "March",
		"April", "May", "June", "July",
		"August", "September", "October",
		"November", "December"
	];
	
//create array to hold nice looking time values for user display
	var dateValuesNice = [
		document.getElementById('event-start-2'),
		document.getElementById('event-end-2')
	];
	
	dateValuesNice[0].innerHTML=formatDate(new Date(+timestamp('01/01/1725')))
	dateValuesNice[1].innerHTML=formatDate(new Date(+timestamp('12/31/1975')))


	

//function for updating slider; will need to see if update works
	dateSlider.noUiSlider.on('change', function (values, handle) {
		dateValues[handle].innerHTML = values[handle]; //set slider timestamp values in array 
		dateValuesNice[handle].innerHTML = formatDate(new Date(+values[handle])); //set slider nice looking values in array
	

	rangeMin= dateValues[0].innerHTML; //set min for filtering
	rangeMax= dateValues[1].innerHTML; //set max for filtering
	
	console.log("Min: " + rangeMin);
	console.log("Max: " + rangeMax);
    
	//first let's clear the layer	
	birthCluster.clearLayers();
	deathCluster.clearLayers();
		
	//and repopulate it after filtering for both geojson layers
	birthplacesImported = new L.geoJson(birthplaces,{
		onEachFeature: popUp,
		pointToLayer: createCustomIconBirth,
		filter:
			function(feature, layer) {
				console.log('im filtering births');
				return (feature.properties.birthStamp <= rangeMax) && (feature.properties.birthStamp >= rangeMin);
			}
	})
		
	deathplacesImported = new L.geoJson(deathplaces,{
		onEachFeature: popUp,
		pointToLayer: createCustomIconDeath,
		filter:
			function(feature, layer) {
				console.log('im filtering deaths');
				return (feature.properties.deathStamp <= rangeMax) && (feature.properties.deathStamp >= rangeMin);
			}
	})

//and back again into the cluster group
		birthCluster.addLayer(birthplacesImported);
		deathCluster.addLayer(deathplacesImported);
	});


// Append a suffix to output dates.
	function nth(d) {
		if (d > 3 && d < 21) return 'th';
		switch (d % 10) {
			case 1:
				return "st";
			case 2:
				return "nd";
			case 3:
				return "rd";
			default:
				return "th";
		}
	}

// Create a string representation of the date for output
	function formatDate(date) {
		return weekdays[date.getDay()] + ", " +
			date.getDate() + nth(date.getDate()) + " " +
			months[date.getMonth()] + " " +
			date.getFullYear();
	}