# -*- coding: utf-8 -*-
"""
Created on Mon Aug 24 09:38:37 2020

@author: Kels-gabii1
"""

import json
import pandas as pd

#loading the two converted .json files
with open("people.json", encoding="utf8") as f2:
    people = json.load(f2)

with open("places.json", encoding="utf8") as f:
    places = json.load(f)
    
with open("provinces.json", encoding="utf8") as f3:
    provinces=json.load(f3)
    
#reformatting the date attribute to match the format needed for timestamps in Leaflet
#Pulling out the year in case it is wanted for filtering
for i in range (0, len(people)):
    people[i]['Birth_Date'] = people[i]['Birth_Date'][3:5] + "/" + people[i]['Birth_Date'][0:2] + "/" + people[i]['Birth_Date'][-4:]
    people[i]['yearOfBirth'] = people[i]['Birth_Date'][-4:]
    people[i]['Death_Date'] = people[i]['Death_Date'][3:5] + "/" + people[i]['Death_Date'][0:2] + "/" + people[i]['Death_Date'][-4:]
    people[i]['yearOfDeath'] = people[i]['Death_Date'][-4:]
    people[i]['fullName']=people[i]['Last_Name'] + ", " + people[i]['First_Name'] +  ' (' + str(people[i]['Id']) + ')'
    people[i]['Entrance_Date_1'] = people[i]['Entrance_Date_1'][3:5] + "/" + people[i]['Entrance_Date_1'][0:2] + "/" + people[i]['Entrance_Date_1'][-4:]



#combining the two files to copy over the place coordinates for each persons birth and death locations

for i in range (0, len(people)):
    for j in range (0, len(places)):
        if people[i]['Place_of_Birth'] == places[j]['Places']:
            people[i]['birthlatitude'] = places[j]['Latitude']
            people[i]['birthlongitude'] = places[j]['Longitude']
            people[i]['showOnMap'] = False
        if people[i]['Place_of_Death'] == places[j]['Places']:
            people[i]['deathlatitude'] = places[j]['Latitude']
            people[i]['deathlongitude'] = places[j]['Longitude']


for i in range (0, len(people)):
    for j in range (0, len(provinces)):
        if people[i]['Entrance_Province'] == provinces[j]['JesuitPlaceAbbreviation']:
            people[i]['provinceLatitude'] = provinces[j]['Latitude']
            people[i]['provinceLongitude'] = provinces[j]['Longitude']
            people[i]['provinceFull'] = provinces[j]['Places']
            people[i]['provinceCity'] = provinces[j]['Placeholder City']
            people[i]['provinceCountry'] = provinces[j]['Placeholder Country']

##Process for converting json to geojson, checking for coordinates, and exporting, for births
df = pd.DataFrame(people)
print('We have {} rows'.format(len(df)))

#convert all dates and numbers from strings to numbers so they can be filtered
df['birthlatitude'] =  pd.to_numeric(df['birthlatitude'],errors='coerce')
df['birthlongitude'] =  pd.to_numeric(df['birthlongitude'],errors='coerce')
df['yearOfBirth'] =  pd.to_numeric(df['yearOfBirth'],errors='coerce')
df['yearOfDeath'] =  pd.to_numeric(df['yearOfDeath'],errors='coerce')
df['deathlatitude'] =  pd.to_numeric(df['deathlatitude'],errors='coerce')
df['deathlongitude'] =  pd.to_numeric(df['deathlongitude'],errors='coerce')
df['provinceLatitude'] =  pd.to_numeric(df['provinceLatitude'],errors='coerce')
df['provinceLongitude'] =  pd.to_numeric(df['provinceLongitude'],errors='coerce')


#choose which column headings to include in geojson
useful_cols = ['UniqueHiddenID','Id', 'fullName', 'Title', 'First_Name', 'Last_Name', 'Place_of_Birth', 'yearOfBirth', 
               'yearOfDeath','Birth_Date', 'Death_Date', 'Place_of_Death', 'showOnMap', 'birthlatitude', 
               'birthlongitude', 'deathlatitude', 'deathlongitude', 'Entrance_Province', 'provinceLatitude', 'provinceLongitude',
               'provinceFull', 'provinceCity', 'provinceCountry', 'Entrance_Date_1']
df_subset = df[useful_cols]


df_geo = df_subset.dropna(subset=['birthlatitude', 'birthlongitude'], axis=0, inplace=False)
print('We have {} geotagged rows with birth data'.format(len(df_geo)))

df_geo2 = df_geo.dropna(subset=['deathlatitude', 'deathlongitude'], axis=0, inplace=False)
print('We have {} geotagged rows with birth and death data'.format(len(df_geo2)))

df_geo3 = df_geo2.dropna(subset=['provinceLatitude', 'provinceLongitude'], axis=0, inplace=False)
print('We have {} geotagged rows with birth and death and province data'.format(len(df_geo3)))

def df_to_geojson(df, properties, provlon='provinceLongitude', provlat='provinceLatitude', deathlon = 'deathlongitude', deathlat = 'deathlatitude', birthlat='birthlatitude', birthlon='birthlongitude'):
    """
    Turn a dataframe containing point data into a geojson formatted python dictionary
    
    df : the dataframe to convert to geojson
    properties : a list of columns in the dataframe to turn into geojson feature properties
    lat : the name of the column in the dataframe that contains latitude data
    lon : the name of the column in the dataframe that contains longitude data
    """
    
    # create a new python dict to contain our geojson data, using geojson format
    geojson = {'type':'FeatureCollection', 'features':[]}

    # loop through each row in the dataframe and convert each row to geojson format
    for _, row in df.iterrows():
        # create a feature template to fill in
        feature = {'type':'Feature',
                   'properties':{},
                   'geometry':{'type':'LineString',
                               'coordinates':[]}}

        # fill in the coordinates, makes an array with birth and death data 
        feature['geometry']['coordinates'] = [[row[birthlon],row[birthlat]],[row[provlon],row[provlat]],[row[deathlon],row[deathlat]]]

        # for each column, get the value and add it as a new feature property
        for prop in properties:
            feature['properties'][prop] = row[prop]
        
        # add this feature (aka, converted dataframe row) to the list of features inside our dict
        geojson['features'].append(feature)
    
    return geojson

useful_columns = ['UniqueHiddenID','Id', 'fullName', 'Title', 'First_Name', 'Last_Name', 'Place_of_Birth', 'Birth_Date', 
                  'Death_Date', 'Place_of_Death', 'showOnMap', 'birthlatitude', 'birthlongitude', 'deathlatitude', 
                  'deathlongitude', 'Entrance_Province', 'yearOfBirth', 'yearOfDeath', 'Entrance_Province', 'provinceLatitude', 'provinceLongitude',
                  'provinceFull', 'provinceCity', 'provinceCountry', 'Entrance_Date_1']

geojson_dict = df_to_geojson(df_geo3, properties=useful_columns)
geojson_str = json.dumps(geojson_dict, indent=2, ensure_ascii=False)

# save the geojson result to a file
output_filename = 'movementMapProvinces.js'
with open(output_filename, 'w', encoding='utf8') as output_file:
    output_file.write('var movementMapProvinces = {};'.format(geojson_str))
    
# how many features did we save to the geojson file?
print('{} geotagged features saved to file'.format(len(geojson_dict['features'])))
