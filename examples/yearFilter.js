
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
	
	
//Creating the slider
	var slidervar = document.getElementById('slider'); //call the html div
	noUiSlider.create(slidervar, {
		connect: true,
		start: [1725, 1975],
		step: 5,
		decimals: 0,
		tooltips: true,
    range: {
        min: 1725,
        max: 1975
    },
	pips: {
        mode: 'count',
        values: 6,
        density: 4,
        stepped: false
    },
	format: wNumb({
        decimals: 0
		}),
	});



/* This portion original controlled input boxes; turned off due to loading issues with .on(update) (would fire multiple times)
	//min and max slider input fields (also must be set in html)
	//document.getElementById('input-number-min').setAttribute("value", 1725);
	//document.getElementById('input-number-max').setAttribute("value", 1975);

	var inputNumberMin = document.getElementById('input-number-min');
	var inputNumberMax = document.getElementById('input-number-max');

	
	inputNumberMin.addEventListener('change', function(){
		slidervar.noUiSlider.set([this.value, null]);
	});

	inputNumberMax.addEventListener('change', function(){
		slidervar.noUiSlider.set([null, this.value]);
	});
	
//update handles if min or max is used
*/

//Create array holding values from the html display classes 
	var dateValues = [
		document.getElementById('event-start-2'),
		document.getElementById('event-end-2')
	];

//set the initial loading values for the html classes, should be the same as the "start" attribute in slider creation
//otherwise the html starts as empty
	dateValues[0].innerHTML=1725;
	dateValues[1].innerHTML=1975;
	
//function that controls filtering when slider changes
//Note that .on('update') was originally used but would sometimes fire multiple times on a single change	
	slidervar.noUiSlider.on('change', function( values, handle ) {
		dateValues[handle].innerHTML = values[handle]; //set HTML values equal to slider values

		rangeMin = dateValues[0].innerHTML; //set min value equal to left slider for filtering
		rangeMax = dateValues[1].innerHTML; //set max value equal to right slider for filtering
		
		
		/*Removed as direct input function was removed 
		//handle = 0 if min-slider is moved and handle = 1 if max slider is moved
		if (handle==0){
			document.getElementById('input-number-min').value = values[0];
		} else {
			document.getElementById('input-number-max').value =  values[1];
		}
		rangeMin = document.getElementById('input-number-min').value;
		rangeMax = document.getElementById('input-number-max').value;
		*/
		
		
		//first clear the layers	
		birthCluster.clearLayers();
		deathCluster.clearLayers();
		
		//and repopulate it after filtering for both geojson layers
		birthplacesImported = new L.geoJson(birthplaces,{
			onEachFeature: popUp,
			pointToLayer: createCustomIconBirth,
			filter:
				function(feature, layer) {
					console.log('im filtering births');
					return (feature.properties.yearOfBirth <= rangeMax) && (feature.properties.yearOfBirth >= rangeMin);
				}
		})
		
		deathplacesImported = new L.geoJson(deathplaces,{
			onEachFeature: popUp,
			pointToLayer: createCustomIconDeath,
			filter:
				function(feature, layer) {
					console.log('im filtering deaths');
					return (feature.properties.yearOfDeath <= rangeMax) && (feature.properties.yearOfDeath >= rangeMin);
				}
		})

//and back again into the cluster group
		birthCluster.addLayer(birthplacesImported);
		deathCluster.addLayer(deathplacesImported);
	});