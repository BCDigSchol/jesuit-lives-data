
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
   onEachFeature: popUpLife
	}
);

var deathplacesImported = L.geoJson(deathplaces, {
	onEachFeature: popUpDeath,
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
}});

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff00ee",
    color: "#ff00ee",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

		

console.log(deathplaces.features[0].properties.dateOfDeath);
console.log(typeof deathplaces.features[0].properties.dateOfDeath);

console.log(birthplaces.features[0].properties.dateOfBirth);
console.log(typeof birthplaces.features[0].properties.dateOfBirth);

console.log(deathplaces.features[0].properties.deathStamp)

//cluster birthplaces, need to cluster or create a group to make refiltering easier
var cluster_lives= new L.MarkerClusterGroup({showCoverageOnHover: false});
    cluster_lives.addLayer(birthplacesImported);
	cluster_lives.addTo(map);

var cluster_deaths = new L.MarkerClusterGroup({showCoverageOnHover: false});
    cluster_deaths.addLayer(deathplacesImported);
	cluster_deaths.addTo(map);

//popUp box function
function popUpLife(f,l) {
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
		out.push('Lastname: ' + f.properties.lastName);
		l.bindPopup(out.join("<br />"));
	}	
}

function popUpDeath(f,l) {
	f.properties.deathStamp = timestamp(f.properties.dateOfDeath);
	
	var out = [];
	if (f.properties) {
		out.push('Deathplace no.: ' + f.properties.Id);
		out.push('Date of Death: ' + f.properties.dateOfDeath);
		out.push('Timestamp: ' + f.properties.deathStamp);
		out.push('Lastname: ' + f.properties.lastName);
		l.bindPopup(out.join("<br />"));
	}	
}

function timestamp(str) {
    return new Date(str).getTime();
}


/*var myMovingMarker = L.Marker.movingMarker([[48.8567, 2.3508],[50.45, 30.523333]],
						[20000]).addTo(map);
	myMovingMarker.start();*/			

//Creation of pan/scale function like Fulcrum images have. Uses PanControl plugin  
		L.control.pan().addTo(map);
		L.control.scale().addTo(map); 


var dateSlider = document.getElementById('slider-date');

noUiSlider.create(dateSlider, {
// Create two timestamps to define a range.
    range: {
        min: timestamp('01/01/1775'),
        max: timestamp('12/31/1910')
    },
	tooltips: true,
	// Steps of one week
    step: 7*60*60*24 *1000 ,
	
	// timestamp indicates the handle starting positions.
    start: [timestamp('01/01/1775')],

// No decimals
    format: wNumb({
        decimals: 0
    })
});
var dateValues = [
    document.getElementById('date_hidden')
];

var dateValuesNice = [
    document.getElementById('date') 
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
    dateValuesNice[handle].innerHTML = "Birthplaces of Living People: " + formatDate(new Date(+values[handle]));
	



	dateNumber = dateValues[0].innerHTML;
	dateNumberhidden = dateValuesNice[0].innerHTML;
	
	console.log("Date: " + dateNumber);
	console.log("Date: " + dateNumber);

    
	//first let's clear the layer	
	cluster_lives.clearLayers();
	
	//and repopulate it after filtering
	birthplacesImported = new L.geoJson(birthplaces,{
    onEachFeature: popUpLife,
        filter:
            function(feature, layer) {
                 return (feature.properties.birthStamp <= dateNumber) && feature.properties.deathStamp >= dateNumber;
            }
    
	});
	
//and back again into the cluster group
	cluster_lives.addLayer(birthplacesImported);
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



var dateSlider2 = document.getElementById('slider-date-death');

noUiSlider.create(dateSlider2, {
// Create two timestamps to define a range.
    range: {
        min: timestamp('01/01/1775'),
        max: timestamp('12/31/1910')
    },
	tooltips: true,
	// Steps of one week
    step: 7*60*60*24 *1000 ,
	
	// timestamp indicates the handle starting positions.
    start: [timestamp('01/01/1775')],

// No decimals
    format: wNumb({
        decimals: 0
    })
});

var dateValues2 = [
    document.getElementById('date_hidden2')
];

var dateValuesNice2 = [
    document.getElementById('date2') 
];

dateSlider2.noUiSlider.on('update', function (values, handle) {
    dateValues2[handle].innerHTML = values[handle];
    dateValuesNice2[handle].innerHTML = "Death locations as of: " + formatDate(new Date(+values[handle]));
	



	dateNumber2 = dateValues2[0].innerHTML;
	dateNumberhidden2 = dateValuesNice2[0].innerHTML;
	
	console.log("Date: " + dateNumber);
	console.log("Date: " + dateNumber);

    
	//first let's clear the layer	
	cluster_deaths.clearLayers();
	
	//and repopulate it after filtering
	
	deathplacesImported = new L.geoJson(deathplaces, 
	{
	onEachFeature: popUpDeath,
    pointToLayer: 
		function (feature, latlng) {
			return L.circleMarker(latlng, geojsonMarkerOptions); 
			},
	filter: 
		function(feature, layer) {
			return feature.properties.deathStamp<=dateNumber2;
		}
	}
	);
	
//and back again into the cluster group
	cluster_deaths.addLayer(deathplacesImported);
});