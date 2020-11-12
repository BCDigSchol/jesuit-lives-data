
//Define map start up options
		var mapOptions = {
			center: [ 41.887856934, 12.719429433], //set center
			zoom: 2 , //set initial zoom
			maxZoom : 17,  //set max zoom
			minZoom : 1,
			loadingControl: true
			}
		
//Creates Map according to map options 
		var map = new L.map('map', mapOptions); 
		
//Examples of an externally called tiled basemap
		var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
			}).addTo(map);

var loaded = 0; //ensures it is loaded before firing events happen

console.log(loaded);
Esri_WorldImagery.on('load', function (event) {
    loaded = 1;
	console.log(loaded);
});
//add geojson exported from python to map with popup		

// replace Leaflet's default blue marker with a custom icon for birthplaces
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

// replace Leaflet's default blue marker with a custom icon for deathplaces
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


	var birthplacesImported = L.geoJson(birthplaces, {
		onEachFeature: popUp,
		pointToLayer: createCustomIconBirth
		});

	var deathplacesImported = L.geoJson(deathplaces, {
		onEachFeature: popUp,
		pointToLayer: createCustomIconDeath
		});
	
	
//popUp box function
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
//chunked loading also helps speed this process
/*
	var birthCluster= new L.MarkerClusterGroup({chunkedLoading: true, showCoverageOnHover: false});
    birthCluster.addLayer(birthplacesImported);

	
	var deathCluster= new L.MarkerClusterGroup({chunkedLoading: true, showCoverageOnHover: false});
    deathCluster.addLayer(deathplacesImported);
*/

var birthCluster= new L.MarkerClusterGroup({chunkedLoading: true, showCoverageOnHover: false,
		iconCreateFunction: function(cluster) {
        var icon = birthCluster._defaultIconCreateFunction(cluster);
        icon.options.className += ' birthgroup';
        return icon;
    
	 }});
    birthCluster.addLayer(birthplacesImported);
	birthCluster.addTo(map);
 
	
	var deathCluster= new L.MarkerClusterGroup({chunkedLoading: true, showCoverageOnHover: false,
			 iconCreateFunction: function(cluster) {
        var icon = deathCluster._defaultIconCreateFunction(cluster);
        icon.options.className += ' deathgroup';
        return icon;
    } });
    deathCluster.addLayer(deathplacesImported)


	
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
	var slidervar = document.getElementById('slider');
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

	//min and max slider input fields (also must be set in html)
	//access turned off due to loading time issues
	//document.getElementById('input-number-min').setAttribute("value", 1725);
	//document.getElementById('input-number-max').setAttribute("value", 1975);
/*
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
var dateValues = [
    document.getElementById('event-start-2'),
    document.getElementById('event-end-2')
];
dateValues[0].innerHTML=1725;
dateValues[1].innerHTML=1975;
	slidervar.noUiSlider.on('change', function( values, handle ) {
		if (loaded == 1) { //keeps from firing on initial load, which causes it to be very slow


		dateValues[handle].innerHTML = values[handle];

		rangeMin = dateValues[0].innerHTML;
		rangeMax = dateValues[1].innerHTML;
		/*
		//handle = 0 if min-slider is moved and handle = 1 if max slider is moved
		if (handle==0){
			document.getElementById('input-number-min').value = values[0];
		} else {
			document.getElementById('input-number-max').value =  values[1];
		}
		rangeMin = document.getElementById('input-number-min').value;
		rangeMax = document.getElementById('input-number-max').value;
		*/
		//first let's clear the layers	
		console.log('im clearing layers');
		birthCluster.clearLayers();
		deathCluster.clearLayers();
		
		//and repopulate it after filtering
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
	 var now2 = new Date().getTime();
	}});

	

/*

var dateSlider = document.getElementById('slider-date');

noUiSlider.create(dateSlider, {
// Create two timestamps to define a range.
    range: {
        min: timestamp('01/01/1860'),
        max: timestamp('12/31/1871')
    },
	connect: true,
	tooltips: true,
	// Steps of one week
    step: 7*60*60*24 *1000 ,
	
	// Two more timestamps indicate the handle starting positions.
    start: [timestamp('01/01/1861'), timestamp('12/31/1870')],

// No decimals
    format: wNumb({
        decimals: 0
    })
});

var dateValues = [
    document.getElementById('event-start'),
    document.getElementById('event-end')
];

var dateValuesNice = [
    document.getElementById('event-start-2'),
    document.getElementById('event-end-2')
];

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

dateSlider.noUiSlider.on('update', function (values, handle) {
    dateValues[handle].innerHTML = values[handle];
    dateValuesNice[handle].innerHTML = formatDate(new Date(+values[handle]));
	/*
	//handle = 0 if min-slider is moved and handle = 1 if max slider is moved
    if (handle==0){
        document.getElementById('event-start').value = dateValuesNice[0];
    } else {
        document.getElementById('event-end').value =  dateValuesNice[1];
    }
	rangeMin = document.getElementById('event-start').value;
	rangeMax = document.getElementById('event-end').value;



	rangeMinNumber = dateValues[0].innerHTML;
	rangeMaxNumber = dateValues[1].innerHTML;
	
	console.log("Min: " + rangeMinNumber);
	console.log("Max: " + rangeMaxNumber);
    
	//first let's clear the layer	
	cluster_birth.clearLayers();

	//and repopulate it after filtering
	birthplacesImported = new L.geoJson(birthplaces,{
    onEachFeature: popUp,
        filter:
            function(feature, layer) {
                 return (feature.properties.birthStamp <= rangeMaxNumber) && (feature.properties.birthStamp >= rangeMinNumber);
            }
    
	})
//and back again into the cluster group
	cluster_birth.addLayer(birthplacesImported);
	
});




// Append a suffix to dates.
// Example: 23 => 23rd, 1 => 1st.
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

// Create a string representation of the date.
function formatDate(date) {
    return weekdays[date.getDay()] + ", " +
        date.getDate() + nth(date.getDate()) + " " +
        months[date.getMonth()] + " " +
        date.getFullYear();
} 
/*
dateSlider.noUiSlider.on('update', function( values, handle ) {
    //handle = 0 if min-slider is moved and handle = 1 if max slider is moved
    if (handle==0){
        document.getElementById('event-start').value = dateValues[0];
    } else {
        document.getElementById('event-end').value =  dateValues[1];
    }
	rangeMin = document.getElementById('event-start').value;
	rangeMax = document.getElementById('event-end').value;
	
	
	//first let's clear the layer	
	cluster_birth.clearLayers();
/*
	//and repopulate it after filtering
	birthplacesImported = new L.geoJson(birthplaces,{
    onEachFeature: popUp,
        filter:
            function(feature, layer) {
                 return (feature.properties.birthStamp <= rangeMax) && (feature.properties.birthStamp >= rangeMin);
            }
    
	})
//and back again into the cluster group


}); */