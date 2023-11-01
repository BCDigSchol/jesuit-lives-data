# JesuitLives Mapping Examples
This repo contains live maps for the Jesuit Necrology (aka Jesuit Lives) project with varying functionality: https://jesuitonlinenecrology.bc.edu/pages/mapping. Notes on map creation and information on python json management can be found here: https://docs.google.com/document/d/1ADzFNghQrEQoKZCjeQnZjkkQYdx8_UC5RRld85_Kx8U/edit. Pan and Zoom controls are available on all maps.

<h2> Main Map Examples </h2>
 <h3> Advanced filtering map https://mnaglak.github.io/JesuitLives/examples/filteredLives.html </h3>
 This map demonstrates filtering mechanisms for Jesuit Lives data based on user input, in this case focused on entrance province and entrance year. Filters can be added together or singularly. Birth information and death information can are styled separately and can be turned on or off. Data based on the filters can be download as a .json file to the user's computer (both birth and death spatial data is exported). Popup information is included for each Life. Autocomplete is available for user queries and filters automatically when performing dual searches. Pop ups also link out to database entries of the individual Jesuits <br>
 
 Sample Question: "I want to see the distribution of where Jesuits who joined in the California province in 1902 were born"
 
 <h3> Life Movement Map  https://mnaglak.github.io/JesuitLives/examples/birthDeathMovementProvincesExpanded.html </h3>
 This map allows user input based on the life of a single Jesuit, searchable by last name with Autocomplete. The line representing that life appears. A timeline at the bottom allows you to see where a Jesuit is at a certain moment, with the marker appearing when they are born (green), moving to their place of entrance (blue) and moving to their place of death (red) at the appropriate moment. Life data is exportable as a json. Popups on life track and marker are avaiable. 
 
 This map also includes filtering by province like the above, though this is not interoperable with the timeline so will eventually be removed. Also present are examples of georeferenced Jesuit Atlas maps, which can be turned on and off with the control box. <br>
 
 Sample Question: "I want to see where Jesuit XXX was on date YYY."
 
 <h3> Filtering Birth/Death Dates  https://mnaglak.github.io/JesuitLives/examples/dateFilter.html </h3>
 This map allows the user to view the locations where Jesuits were born and died using a range from a slider. This example uses dates, but years are also possible (see below). Markers each represent a different Jesuit Life and contain individaul popups with information.
 
 Sample Question: "I want to see where the majority of Jesuits were born between roughly Jan 1875 and June 1890"
 
 <h2> Other maps </h2>
 These maps contain much similar functaionality to the above but with different user interfaces
 
 <h3> Filter Birth/Death Years </h3> https://mnaglak.github.io/JesuitLives/examples/yearFilter.html
 Similar to dates filtering above but with years
 
 <h3> Filter births and deaths on separate sliders </h3> https://mnaglak.github.io/JesuitLives/examples/birthdeathFilter.html
 Similar to above, but with separate sliders for births and deaths (e.g. can see all births and deaths as of 1925 on one map)
 
 <h3> Places Map </h3> https://mnaglak.github.io/JesuitLives/examples/placesSearch.html
 Can see all the birth/death places mentioned in Jesuit lives and search by an individual place. Currently contains only birth and death places, could add provincial? Can see who was born there or died there in a popup.
 
 Note: Spelling changes in places spreadsheet (Roma vs Rome vs Rome (Italy)) are all different points...This could possible be cleaned up with some work in Python. 
 
 <h3> Preliminary Movement Maps Old Versions </h3>
Earlier versions of main movement map with less functionality
 
Marker Movement between birth and death places by timeline, last name search filter
https://mnaglak.github.io/JesuitLives/examples/birthDeathMovement.html

Marker movement between birth, death, and entrance places by timeline, last name search filter
https://mnaglak.github.io/JesuitLives/examples/birthDeathMovementProvinces.html


