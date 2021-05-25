
//Define map start up options, here defined to center on Gabii
	var mapOptions = {
		center: [ 41.887856934, 12.719429433], //set center
		zoom: 2 , //set initial zoom
		maxZoom : 17,  //set max zoom
		minZoom : 1,
		zoomControl: false,
		maxBounds: [ [-90, -180] , [90,180] ]
	}

//Creates Map according to map options
	var map = new L.map('map', mapOptions);
	var zoomHome = L.Control.zoomHome({position: 'topleft'}).addTo(map);

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

		var birthStyle = {
		    "color": "#1184e8",
		    "weight": 3,
		    "opacity": 0.65
		};

		var deathStyle = {
				"color": "#000000",
				"weight": 3,
				"opacity": 0.65
		};

		//import external geojson and call function to run on each feature to create popups and define timestamps
			var birthLife = L.geoJson(birthToProvinces, {
				onEachFeature: forEachFeature,
				style: birthStyle

			});

			var deathLife = L.geoJson(deathToProvinces, {
				onEachFeature: forEachFeature,
				style: deathStyle
				});


  var baseLayers = {
			"Satellite Imagery" : Esri_WorldImagery,
			};

	var overlayMaps = {
			"Birth to Province" : birthLife,
			"Province to Death" : deathLife,
			};

	var controls =	L.control.layers(baseLayers, overlayMaps);



//put the geojson into a layerGroup in order to be filtered
	var jesuitLivesGroup = L.layerGroup([birthLife, deathLife]);

//create global variables for timestamps and markers. There is probably a better way to do this
	var personBirthStamp = null; //birthstamp data for individual searched for
	var personDeathStamp = null; //deathstamp data for individual searched for
	var personProvinceStamp = null; //entranceDate data for individaul search for
	var searchActive = false; //boolean for if a search is currently taking place
	var personStringYear= '';
	var url = 'https://jesuit-lives.lontracanadensis.net/catalog/';
//create popup boxes for polylines as well as the timestamps for each moment of importance; timestamps are needed for current date filter system
//runs only when search is performed
	function forEachFeature(f, layer) {
		f.properties.birthStamp = timestamp(f.properties.Birth_Date);
		f.properties.deathStamp = timestamp(f.properties.Death_Date);
		f.properties.provinceStamp = timestamp(f.properties.Entrance_Date_1);
		personStringYear = f.properties.yearOfEntry.toString();


		var out = [];
		if (f.properties) {
			out.push('ID: ' + f.properties.Id);
			out.push('First Name: ' + f.properties.First_Name);
			out.push('Last Name: ' + f.properties.Last_Name);
			out.push('Date of Birth: ' + f.properties.Birth_Date);
			out.push('Place of Birth: ' + f.properties.Place_of_Birth);
			out.push('Date of Entry: ' + f.properties.Entrance_Date_1);
			out.push('Entrance Province: ' + f.properties.provinceCity + ', ' + f.properties.provinceFull + ', ' + f.properties.provinceCountry);
			out.push('Date of Death: ' + f.properties.Death_Date);
			out.push('Place of Death: ' + f.properties.Place_of_Death);
			out.push('Entry Year: ' + personStringYear);
			out.push('<a href="'+ url + f.properties.UniqueHiddenID + '" target="_blank">Database Entry</a>');  //allows for link to external URL via attribute in .geoJson table
		layer.bindPopup(out.join("<br />"));
		}

	//record birth and deathstamps for marker movement later
	personBirthStamp = f.properties.birthStamp;
	personDeathStamp = f.properties.deathStamp;
	personProvinceStamp = f.properties.provinceStamp;
	}



//create search control for provinces
var searchControlProvinces = new L.Control.Search({
  layer: L.featureGroup([jesuitLivesGroup]),
  propertyName: 'provinceFull',
  textPlaceholder: 'Filter by Province',
  marker: false,
  collapsed: false

  });
map.addControl( searchControlProvinces );


//Runs when search control finds a result
	searchControlProvinces.on('search:locationfound', function(e) {
		searchActive = true; //sets search boolean to active
		controls.remove();

		jesuitLivesGroup.clearLayers(); //clear group layer

		//note this html id seems to change every once in a while, I think it has to do with the text label?
		var choiceProvince = document.getElementById("searchtext18").value; //record user input from search box
		var choiceYear = document.getElementById("searchtext21").value;
		console.log(choiceYear);


		birthLife = L.geoJson(birthToProvinces, { //filter geojson based on user input and record start and stop data and province data
			filter:
				function (feature, layer) {

					if(choiceYear=='') {
						if (feature.properties.provinceFull == choiceProvince) {
							return (feature.properties.provinceFull == choiceProvince);
						}
					}
					else {
						if (feature.properties.provinceFull == choiceProvince && feature.properties.yearOfEntry == choiceYear) {
							return (feature.properties.provinceFull == choiceProvince && feature.properties.yearOfEntry == choiceYear)
					}
				}
			},
			onEachFeature: forEachFeature, //creates popup for line
			style: birthStyle
		});

		deathLife = L.geoJson(deathToProvinces, { //filter geojson based on user input and record start and stop data and province data
			filter:
				function (feature, layer) {
					if(choiceYear=='') {
						if (feature.properties.provinceFull == choiceProvince) {
							return (feature.properties.provinceFull == choiceProvince);
						}
					}
					else {
						if (feature.properties.provinceFull == choiceProvince && feature.properties.yearOfEntry == choiceYear) {
							return (feature.properties.provinceFull == choiceProvince && feature.properties.yearOfEntry == choiceYear)
					}
				}
			},
			onEachFeature: forEachFeature, //creates popup for line
			style: deathStyle
		});


		var overlayMaps = {
			"Birth to Province" : birthLife,
			"Province to Death" : deathLife,
			};

		controls =	L.control.layers(baseLayers, overlayMaps).addTo(map);

		jesuitLivesGroup.addLayer(birthLife).addTo(map); //add layer back to group
		jesuitLivesGroup.addLayer(deathLife).addTo(map); //add layer back to group

//on cancel search, reset all data and clear map for next filtering search
	}).on('search:cancel', function(e) {
		var choiceYear = document.getElementById("searchtext21").value;

		searchActive = false;
		jesuitLivesGroup.clearLayers();
		var birthLife = L.geoJson(birthToProvinces, {
			onEachFeature: forEachFeature,
			style: birthStyle
    });
		var deathLife = L.geoJson(deathToProvinces, {
			onEachFeature: forEachFeature,
			style: deathStyle
		})
		map.removeLayer(jesuitLivesGroup);
		jesuitLivesGroup.addLayer(birthLife);
		jesuitLivesGroup.addLayer(deathLife);

		//controls.removeFrom(map);
		var overlayMaps = {
			"Birth to Province" : birthLife,
			"Province to Death" : deathLife,
			};

		controls.remove();

		if(choiceYear=='') {
			console.log('Choice Year is null');
		}
		else {
			console.log('Choice Year is ' + choiceYear);
			jesuitLivesGroup.clearLayers();

			birthLife = L.geoJson(birthToProvinces, { //filter geojson based on user input and record start and stop data and province data
				filter:
					function (feature, layer) {

							if (feature.properties.yearOfEntry == choiceYear) {
								return (feature.properties.yearOfEntry == choiceYear);
							}
						},
				onEachFeature: forEachFeature, //creates popup for line
				style: birthStyle
			});


			deathLife = L.geoJson(deathToProvinces, { //filter geojson based on user input and record start and stop data and province data
				filter:
					function (feature, layer) {

						if (feature.properties.yearOfEntry == choiceYear) {
							return (feature.properties.yearOfEntry == choiceYear);
						}
				},
				onEachFeature: forEachFeature, //creates popup for line
				style: deathStyle
			});

			var overlayMaps = {
				"Birth to Province" : birthLife,
				"Province to Death" : deathLife,
				};

			controls =	L.control.layers(baseLayers, overlayMaps).addTo(map);

			jesuitLivesGroup.addLayer(birthLife).addTo(map); //add layer back to group
			jesuitLivesGroup.addLayer(deathLife).addTo(map); //add layer back to group
		}

	});
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////year filter
var searchControlYear = new L.Control.Search({
  layer: L.featureGroup([jesuitLivesGroup]),
  propertyName: 'yearOfEntry',
  textPlaceholder: 'Filter by Year Joined',
  marker: false,
  collapsed: false

  });
map.addControl( searchControlYear );


//Runs when search control finds a result
	searchControlYear.on('search:locationfound', function(e) {
		searchActive = true; //sets search boolean to active
		controls.remove();

		jesuitLivesGroup.clearLayers(); //clear group layer

		//note this html id seems to change every once in a while, I think it has to do with the text label?
		var choiceYear = document.getElementById("searchtext21").value; //record user input from search box
		var choiceProvince = document.getElementById("searchtext18").value; //record user input from search box

		var birthLife = L.geoJson(birthToProvinces, { //filter geojson based on user input and record start and stop data and province data
			filter:
				function (feature, layer) {
						if(choiceProvince=='') {
							if (feature.properties.yearOfEntry == choiceYear) {
								return (feature.properties.yearOfEntry == choiceYear);
							}
						}
						else {
							if (feature.properties.provinceFull == choiceProvince && feature.properties.yearOfEntry == choiceYear) {
								return (feature.properties.provinceFull == choiceProvince && feature.properties.yearOfEntry == choiceYear)
						}
					}
				},
			onEachFeature: forEachFeature, //creates popup for line
			style: birthStyle
		});

		var deathLife = L.geoJson(deathToProvinces, { //filter geojson based on user input and record start and stop data and province data
			filter:
				function (feature, layer) {
					if(choiceProvince=='') {
						if (feature.properties.yearOfEntry == choiceYear) {
							return (feature.properties.yearOfEntry == choiceYear);
						}
					}
					else {
						if (feature.properties.provinceFull == choiceProvince && feature.properties.yearOfEntry == choiceYear) {
							return (feature.properties.provinceFull == choiceProvince && feature.properties.yearOfEntry == choiceYear)
					}
				}
			},
			onEachFeature: forEachFeature, //creates popup for line
			style: deathStyle
		});


		var overlayMaps = {
			"Birth to Province" : birthLife,
			"Province to Death" : deathLife,
			};

		controls =	L.control.layers(baseLayers, overlayMaps).addTo(map);

		jesuitLivesGroup.addLayer(birthLife).addTo(map); //add layer back to group
		jesuitLivesGroup.addLayer(deathLife).addTo(map); //add layer back to group

//on cancel search, reset all data and clear map for next filtering search
	}).on('search:cancel', function(e) {
		searchActive = false;
		var choiceProvince = document.getElementById("searchtext18").value; //record user input from search box

		jesuitLivesGroup.clearLayers();
		var birthLife = L.geoJson(birthToProvinces, {
			onEachFeature: forEachFeature,
			style: birthStyle
    });
		var deathLife = L.geoJson(deathToProvinces, {
			onEachFeature: forEachFeature,
			style: deathStyle
		})
		map.removeLayer(jesuitLivesGroup);
		jesuitLivesGroup.addLayer(birthLife);
		jesuitLivesGroup.addLayer(deathLife);

		//controls.removeFrom(map);
		var overlayMaps = {
			"Birth to Province" : birthLife,
			"Province to Death" : deathLife,
			};

		controls.remove();

		if(choiceProvince=='') {
			console.log('Choice Province is null');
		}
		else {
			console.log('Choice province is ' + choiceProvince);
			jesuitLivesGroup.clearLayers();

			var birthLife = L.geoJson(birthToProvinces, { //filter geojson based on user input and record start and stop data and province data
				filter:
					function (feature, layer) {

							if (feature.properties.provinceFull == choiceProvince) {
								return (feature.properties.provinceFull == choiceProvince);
							}
						},
				onEachFeature: forEachFeature, //creates popup for line
				style: birthStyle
			});


			var deathLife = L.geoJson(deathToProvinces, { //filter geojson based on user input and record start and stop data and province data
				filter:
					function (feature, layer) {

						if (feature.properties.provinceFull == choiceProvince) {
							return (feature.properties.provinceFull == choiceProvince);
						}
				},
				onEachFeature: forEachFeature, //creates popup for line
				style: deathStyle
			});

			var overlayMaps = {
				"Birth to Province" : birthLife,
				"Province to Death" : deathLife,
				};

			controls =	L.control.layers(baseLayers, overlayMaps).addTo(map);

			jesuitLivesGroup.addLayer(birthLife).addTo(map); //add layer back to group
			jesuitLivesGroup.addLayer(deathLife).addTo(map); //add layer back to group
		}

	});


		//export current viewport dataset to json, which could then be converted to a csv

		var button =L.easyButton('<strong>Export Data</strong>', function(){

			console.log('easy button pressed')

			var exportGroup = jesuitLivesGroup; //exports both birth to province and province to death in one file;

/*
			var exportGroup = jesuitLivesGroup.getLayers(); //creates an array of the two layers in jesuitLivesGroup (duplicate information)
			var exportLayer = exportGroup[0]; //we only want to export
			var geojsonExport = exportLayer.toGeoJSON();
*/
			var geojsonExport = exportGroup.toGeoJSON();
	    var stringExport = JSON.stringify(geojsonExport);

	    function download(content, fileName, contentType) {

					var a = document.createElement("a");
	        var file = new Blob([content], {type: contentType});
	        a.href = URL.createObjectURL(file);
	        a.download = fileName;
	        a.click();
	    }
	    download(stringExport, 'exportjson.txt', 'text/plain');

	    }).addTo(map);
