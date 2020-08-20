
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
var birthplacesImported = L.geoJson(birthplaces, {
   onEachFeature: popUp
	}
);

//cluster birthplaces, need to cluster or create a group to make refiltering easier
var cluster_birth= new L.MarkerClusterGroup({showCoverageOnHover: false});
    cluster_birth.addLayer(birthplacesImported);
    cluster_birth.addTo(map);

//popUp box function
function popUp(f,l) {
	var out = [];
	if (f.properties) {
		out.push('Birthplace no.: ' + f.properties.Id);
		out.push('Date of Birth: ' + f.properties.dateOfBirth);
		out.push('Year: ' + f.properties.yearOfBirth);
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
/*	var searchControl = new L.Control.Search({
		layer: L.featureGroup([placeMarkers]),
		propertyName: 'Places',
		marker: false,
	}); 
		map.addControl( searchControl );
//pop up when found		
	searchControl.on('search:locationfound', function(e) {	
		if(e.layer._popup)
			e.layer.openPopup();
	}).on('search:collapsed', function(e) {
		});	*/
		


/*	
//Creating the slider
var slidervar = document.getElementById('slider');
noUiSlider.create(slidervar, {
    connect: true,
    start: [ 1700, 1901 ],
	step: 1,
	decimals: 0,
	tooltips: true,
    range: {
        min: 1700,
        max: 1901
    },
	format: wNumb({
        decimals: 0
    }),
});

//min and max slider (also must be set in html
document.getElementById('input-number-min').setAttribute("value", 1500);
document.getElementById('input-number-max').setAttribute("value", 1901);

var inputNumberMin = document.getElementById('input-number-min');
var inputNumberMax = document.getElementById('input-number-max');

inputNumberMin.addEventListener('change', function(){
    slidervar.noUiSlider.set([this.value, null]);
});

inputNumberMax.addEventListener('change', function(){
    slidervar.noUiSlider.set([null, this.value]);
});

//update handles if min or max is used
slidervar.noUiSlider.on('update', function( values, handle ) {
    //handle = 0 if min-slider is moved and handle = 1 if max slider is moved
    if (handle==0){
        document.getElementById('input-number-min').value = values[0];
    } else {
        document.getElementById('input-number-max').value =  values[1];
    }
	rangeMin = document.getElementById('input-number-min').value;
	rangeMax = document.getElementById('input-number-max').value;
	
	//first let's clear the layer	
	cluster_birth.clearLayers();

	//and repopulate it after filtering
	birthplacesImported = new L.geoJson(birthplaces,{
    onEachFeature: popUp,
        filter:
            function(feature, layer) {
                 return (feature.properties.yearOfBirth <= rangeMax) && (feature.properties.yearOfBirth >= rangeMin);
            }
    
	})
//and back again into the cluster group
	cluster_birth.addLayer(birthplacesImported);
});
*/


//now working on filtering by date rather than by year
function timestamp(str) {
    return new Date(str).getTime();
}


var dateSlider = document.getElementById('slider-date');

noUiSlider.create(dateSlider, {
// Create two timestamps to define a range.
    range: {
        min: timestamp('01/01/1860') + 24 * 60 * 60 * 1000,
        max: timestamp('12/31/1871') + 24 * 60 * 60 * 1000
    },
	connect: true,
	tooltips: [true, true],
	// Steps of one week
    step: 1 * 24 * 60 * 60 * 1000,
	
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
    dateValues[handle].innerHTML = formatDate(new Date(+values[handle]));
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