  
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

	var southItaly = L.tileLayer('./tiledMaps/Italy/{z}/{x}/{y}.png', {tms: true, opacity: 1, attribution: "", minZoom: 4, maxZoom: 9}).addTo(map);
	var mexico = L.tileLayer('./tiledMaps/Mexico/{z}/{x}/{y}.png', {tms: true, opacity: 1, attribution: "", minZoom: 3, maxZoom: 7}).addTo(map);

var baseLayers = {
			"Satellite Imagery" : Esri_WorldImagery,
			};
			
		var overlayMaps = {
			"Italy" : southItaly,
			"Mexico" : mexico
			};
			L.control.layers(baseLayers, overlayMaps).addTo(map);

//import external geojson and call function to run on each feature to create popups and define timestamps
var lineStringImported = L.geoJson(toLineString, {
	onEachFeature: forEachFeature
	});

//put the geojson into a layerGroup in order to be filtered
var lineGroup = L.layerGroup([lineStringImported]); 

//create global variables for timestamps and markers
var personBirthStamp = null;
var personDeathStamp = null;
var dateNumber = null;
var myMovingMarker;
var myReverseMovingMarker;
var myStaticEndMarker;
var myStaticStartMarker;
var searchActive = false;
var isAlive = true;
var isBorn = false;

//create popup boxes for polylines as well as the timestamps for each moment of importance; timestamps are needed for current date filter system
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
		out.push('Birth latitude: ' + f.properties.birthlatitude);
		layer.bindPopup(out.join("<br />"));
	}	
	
	personBirthStamp = f.properties.birthStamp;
	personDeathStamp = f.properties.deathStamp;
}

//timestamp conversion function
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
	
//Runs when search control finds a result	
	searchControl.on('search:locationfound', function(e) {	
		searchActive = true;
		lineGroup.clearLayers(); //clear group layer
		//note this html id seems to change every once in a while...need to check
		var choice = document.getElementById("searchtext16").value; //record user input 
		console.log(choice);
		var bLat = null; //create variables to record start and stop positions of moving marker
		var bLong = null;
		var dLat = null;
		var dLong = null;
		var lineStringImported = L.geoJson(toLineString, { //filter geojson based on user input and record start and stop data
			filter:
				function (feature, layer) {
					if (feature.properties.lastName == choice) {
						bLat = feature.properties.birthlatitude;
						bLong = feature.properties.birthlongitude;
						dLat = feature.properties.deathlatitude;
						dLong = feature.properties.deathlongitude;
						return (feature.properties.lastName == choice);}
				},
			onEachFeature: forEachFeature
			
		});
		lineGroup.addLayer(lineStringImported).addTo(map); //add layer back to group 
		
		myStaticEndMarker = new L.Marker([dLat, dLong]);
		myStaticStartMarker = new L.Marker([bLat, bLong]);
	
		myMovingMarker = new L.Marker.movingMarker([[bLat, bLong],[dLat, dLong]],[5000]);
		myReverseMovingMarker = new L.Marker.movingMarker([[dLat, dLong],[bLat, bLong]],[5000]);

		
		
		if (dateNumber > personBirthStamp && dateNumber < personDeathStamp) {
				//myMovingMarker.addTo(map);
				myStaticStartMarker.addTo(map);
				isAlive = true;
		}
		
		if (dateNumber>personDeathStamp){
			myStaticEndMarker.addTo(map);
			isAlive = false;
		}
	
		 
	
						
	}).on('search:cancel', function(e) {
		isAlive = false;
		searchActive = false;
		lineGroup.clearLayers();
		var lineStringImported = L.geoJson(toLineString, {
		onEachFeature: forEachFeature
	})
	map.removeLayer(myMovingMarker);
	map.removeLayer(myStaticEndMarker);
	map.removeLayer(myStaticStartMarker);
	map.removeLayer(lineGroup);
	lineGroup.addLayer(lineStringImported);
	personBirthStamp = null;
	personDeathStamp = null;
	
	});	

function movingTheMarker(date) {
	
	/*if (date > personBirthStamp && date < personDeathStamp && !isAlive) {
		myReverseMovingMarker.addTo(map);
		myReverseMovingMarker.start();
		map.removeLayer(myStaticEndMarker);
		isAlive=true;
		console.log("reverse reverse");
	}*/
	
		
	 if (date > personBirthStamp && date < personDeathStamp) {
		
		if (!isAlive) {
			map.removeLayer(myMovingMarker);
			map.removeLayer(myStaticEndMarker);
			map.removeLayer(myStaticStartMarker);
			console.log('resurrection');
			isAlive=true;
			console.log(isAlive);
			
			}
		else {
		myStaticStartMarker.addTo(map);
		map.removeLayer(myStaticEndMarker);
		map.removeLayer(myMovingMarker);
		isAlive=true;
		console.log("normal birth");
		console.log(isAlive);
		}
	}
	
	if (date > personDeathStamp && isAlive) {
		
		map.removeLayer(myStaticStartMarker);
		myMovingMarker.addTo(map);
		myMovingMarker.start(() => 
			myStaticEndMarker.addTo(map));
		isAlive = false;
		console.log('death');
		console.log(isAlive);
		
	}

	
	if (date < personBirthStamp ) {
		map.removeLayer(myStaticStartMarker);
		map.removeLayer(myReverseMovingMarker);
	}
	
} 

	
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

//updating the slider
dateSlider.noUiSlider.on('update', function (values, handle) {
    dateValues[handle].innerHTML = values[handle];
    dateValuesNice[handle].innerHTML = "Location on Date: " + formatDate(new Date(+values[handle]));
	dateNumber = dateValues[0].innerHTML;
	dateNumberhidden = dateValuesNice[0].innerHTML;
	
	//console.log(dateNumber);
	//console.log(dateNumberhidden);
	
	//if a search has taken place, run the movemarker function; otherwise it throws errors because certain variables are empty
	if (searchActive) {
		movingTheMarker(dateNumber);}
    
});
