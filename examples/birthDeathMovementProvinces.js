  
//Define map start up options, here defined to center on Gabii
	var mapOptions = {
		center: [ 41.887856934, 12.719429433], //set center
		zoom: 2 , //set initial zoom
		maxZoom : 17,  //set max zoom
		minZoom : 1,
	}
		
//Creates Map according to map options 
	var map = new L.map('map', mapOptions); 

//timestamp conversion function
function timestamp(str) {
    return new Date(str).getTime();
}
	

//Creation of pan/scale function like Fulcrum images have. Uses PanControl plugin  
	L.control.pan().addTo(map);
	L.control.scale().addTo(map); 
	
//Examples of an externally called tiled basemap
	var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
		}).addTo(map);

//Example tiled maps
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
	var jesuitLives = L.geoJson(movementMapProvinces, {
		onEachFeature: forEachFeature
		});

//put the geojson into a layerGroup in order to be filtered
	var jesuitLivesGroup = L.layerGroup([jesuitLives]); 

//create global variables for timestamps and markers. There is probably a better way to do this
	var personBirthStamp = null; //birthstamp data for individual searched for
	var personDeathStamp = null; //deathstamp data for individual searched for
	var personProvinceStamp = null; //entranceDate data for individaul search for
	var dateNumber = null; //holds the current value of the slider
	var myMovingMarker; //marker moving from birth to province
	var myMovingMarker2; //marker moving from province to death 
	//var myReverseMovingMarker; //marker moving from death to birth 
	var myStaticEndMarker; //marker created at death location once the movement is completed 
	var myStaticStartMarker; //marker created at birth location before movement takes place 
	var searchActive = false; //boolean for if a search is currently taking place 
	var isAlive = true; //variable to control marker appearance when someone moves the slider back and forth across the death moment 
	var isJesuit = false; 
	var popupText = null; //holder for marker popup text

//create popup boxes for polylines as well as the timestamps for each moment of importance; timestamps are needed for current date filter system
//runs only when search is performed
	function forEachFeature(f, layer) {	
		f.properties.birthStamp = timestamp(f.properties.Birth_Date);
		f.properties.deathStamp = timestamp(f.properties.Death_Date);
		f.properties.provinceStamp = timestamp(f.properties.Entrance_Date_1);
		var out = [];	
		if (f.properties) {
			out.push('Entry Number.: ' + f.properties.Id);
			out.push('First Name: ' + f.properties.First_Name);
			out.push('Last Name: ' + f.properties.Last_Name);
			out.push('Date of Birth: ' + f.properties.Birth_Date);
			out.push('Place of Birth: ' + f.properties.Place_of_Birth);
			out.push('Date of Entrance: ' + f.properties.Entrance_Date_1);
			out.push('Date of Death: ' + f.properties.Death_Date);
			out.push('Place of Death: ' + f.properties.Place_of_Death);
		layer.bindPopup(out.join("<br />"));
		}	
	
	//creates popup text for markers (forEachFeature doesn't work for individual marker creation, only for lines)
	popupText =  'Entry Number.: ' + f.properties.Id + '<br>' + 'First Name: ' + f.properties.First_Name + '<br>' + 'Last Name: ' + f.properties.Last_Name + '<br>' +
				'Date of Birth: ' + f.properties.Birth_Date + '<br>' + 'Place of Birth: ' + f.properties.Place_of_Birth + '<br>' + 'Date of Entrance: ' + f.properties.Entrance_Date_1 + '<br>' 
				+ 'Date of Death: ' + f.properties.Death_Date + '<br>' + 'Place of Death: ' + f.properties.Place_of_Death;
	
	//record birth and deathstamps for marker movement later
	personBirthStamp = f.properties.birthStamp;
	personDeathStamp = f.properties.deathStamp;
	personProvinceStamp = f.properties.provinceStamp;
	}	


//create the search control, set up currently for searching places, note that the text within the search box can be edited directly in the .js for the plugin
//zoom functions set in the plugin's .js as well
	var searchControl = new L.Control.Search({
		layer: L.featureGroup([jesuitLivesGroup]),
		propertyName: 'fullName',
		marker: false,
		}); 
	map.addControl( searchControl ); 

	
//Runs when search control finds a result	
	searchControl.on('search:locationfound', function(e) {	
		searchActive = true; //sets search boolean to active 
		jesuitLivesGroup.clearLayers(); //clear group layer
		//note this html id seems to change every once in a while, I think it has to do with the text label?
		var choice = document.getElementById("searchtext19").value; //record user input from search box 
		var bLat = null; //create variables to record start and stop positions for moving marker; probably a better way to do this with an array
		var bLong = null;
		var dLat = null;
		var dLong = null;
		var pLat = null;
		var pLong = null;
		
		var jesuitLives = L.geoJson(movementMapProvinces, { //filter geojson based on user input and record start and stop data and province data
			filter:
				function (feature, layer) {
					if (feature.properties.fullName == choice) {
						bLat = feature.properties.birthlatitude;
						bLong = feature.properties.birthlongitude;
						dLat = feature.properties.deathlatitude;
						dLong = feature.properties.deathlongitude;
						pLat = feature.properties.provinceLatitude;
						pLong = feature.properties.provinceLongitude;
						return (feature.properties.fullName == choice);
						}
				},
			onEachFeature: forEachFeature //creates popup for line
			
		});
		
		jesuitLivesGroup.addLayer(jesuitLives).addTo(map); //add layer back to group 
		
		//create static markers based on person data 
		myStaticEndMarker = new L.Marker([dLat, dLong]);
		myStaticEndMarker.bindPopup(popupText);
		myStaticStartMarker = new L.Marker([bLat, bLong]);
		myStaticStartMarker.bindPopup(popupText);
		myStaticProvinceMarker = new L.Marker([pLat, pLong]);
		myStaticProvinceMarker.bindPopup(popupText);

		//create moving markers
		myMovingMarker = new L.Marker.movingMarker([[bLat, bLong],[pLat, pLong]],[5000]);
		myMovingMarker2 = new L.Marker.movingMarker([[pLat, pLong],[dLat, dLong]],[5000]);
		myMovingMarker.bindPopup(popupText);
		myMovingMarker2.bindPopup(popupText);

		
		//these 3 if statements control if a marker initially pops up upon filtering, depending on where the slider is at a moment in time
		if (dateNumber > personBirthStamp && dateNumber < personProvinceStamp) {
				//myMovingMarker.addTo(map);
				myStaticStartMarker.addTo(map);
				isAlive = true;
				isJesuit = false;
		}
		if (dateNumber> personProvinceStamp && dateNumber<personDeathStamp) {
			myStaticProvinceMarker.addTo(map);
			isJesuit = true;
			isAlive = true;
		}
		if (dateNumber>personDeathStamp){
			myStaticEndMarker.addTo(map);
			isAlive = false;
			isJesuit = true; 
		}
	
//on cancel search, reset all data and clear map for next filtering search 					
	}).on('search:cancel', function(e) {
		isAlive = false;
		isJesuit = false;
		searchActive = false;
		jesuitLivesGroup.clearLayers();
		var jesuitLives = L.geoJson(movementMapProvinces, {
			onEachFeature: forEachFeature
			})
		map.removeLayer(myMovingMarker);
		map.removeLayer(myMovingMarker2);
		map.removeLayer(myStaticEndMarker);
		map.removeLayer(myStaticStartMarker);
		map.removeLayer(myStaticProvinceMarker);
		map.removeLayer(jesuitLivesGroup);
	
		jesuitLivesGroup.addLayer(jesuitLives);
		personBirthStamp = null;
		personDeathStamp = null;
		personProvinceStamp = null;
	});	


//function for moving the slider across a date of importance (birth, joining, death)
function movingTheMarker(date) {

	//when moving slider backwards, if you cross the day of birth , remove marker 
	//works
	if (date < personBirthStamp ) {
		map.removeLayer(myStaticStartMarker);
		map.removeLayer(myStaticProvinceMarker);
		isAlive=false;
	}

	//if person is born (moving forward in time) or if they become pre-Jesuit from Jesuit (moving backwards in time)
	//works  
	 if (date > personBirthStamp && date < personProvinceStamp) {
		
		map.addLayer(myStaticStartMarker);
		map.removeLayer(myStaticProvinceMarker);
		map.removeLayer(myMovingMarker);
		console.log('born but not jesuit');
		isJesuit=false;
		isAlive=true;		
	 }

	//if person becomes a Jesuit (moving forward in time) or is resurrected (moving backwards in time)
	//works
	if (date > personProvinceStamp && date < personDeathStamp) {
		if (!isJesuit) {
		map.removeLayer(myStaticStartMarker);
		myMovingMarker.addTo(map);
		myMovingMarker.start(() => 
			myStaticProvinceMarker.addTo(map));
		isJesuit = true;
		console.log('is Jesuit');
		}
		if (!isAlive) {
			map.removeLayer(myStaticEndMarker);
			map.removeLayer(myMovingMarker2);
			myStaticProvinceMarker.addTo(map);
			isAlive=true;
	}}
	
	//if person dies (moving forward in time)
	if (date > personDeathStamp && isAlive) {
		map.removeLayer(myStaticProvinceMarker);
		map.removeLayer(myMovingMarker);
		myMovingMarker2.addTo(map);
		myMovingMarker2.start(() => 
			myStaticEndMarker.addTo(map));
		isAlive=false; 
		console.log('dead');
	}
	
	
	
	
	//when moving slider across death date 
	//if moving from alive to dead, remove province marker, run myMovingMarker2, then add end marker to map
/*	if (date > personDeathStamp && isAlive) {
		map.removeLayer(myStaticProvinceMarker);
		myMovingMarker2.addTo(map);
		myMovingMarker2.start(() => 
			myStaticEndMarker.addTo(map));
		map.removeLayer(myMovingMarker2);
		isAlive = false;
		console.log('death');
		console.log(isAlive);
	} */
	
	//if moving from dead to alive, just add the marker to the province location 
	/*if (date > personDeathStamp && !isAlive) {
		myStaticProvinceMarker.addTo(map);
		map.removeLayer(myStaticEndMarker);
	}*/

	
} 

	
var dateSlider = document.getElementById('slider-date');

noUiSlider.create(dateSlider, {
// Create two timestamps to define a range.
    range: {
        min: timestamp('01/01/1725'),
        max: timestamp('12/31/1970')
    },
	tooltips: false,
	// Steps of one week
    step: 7*60*60*24 *2000 ,
	
	// timestamp indicates the handle starting positions.
    start: [timestamp('01/01/1725')],

// No decimals
    format: wNumb({
        decimals: 0
    })
});


//need to set initial values still?
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
    dateValuesNice[handle].innerHTML = formatDate(new Date(+values[handle]));
	dateNumber = dateValues[0].innerHTML;
	dateNumberhidden = dateValuesNice[0].innerHTML;
	
	//console.log(dateNumber);
	//console.log(dateNumberhidden);
	
	//if a search has taken place, run the movemarker function; otherwise it throws errors because certain variables are empty
	if (searchActive) {
		movingTheMarker(dateNumber);}
    
});
