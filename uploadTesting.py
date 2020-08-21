# -*- coding: utf-8 -*-
"""
Created on Mon Aug 10 09:18:20 2020

@author: Kels-gabii1
"""

import json
import pandas as pd

#loading the two jsons 
with open("csvjsontest.json") as f2:
    people = json.load(f2)

with open("placescsvtojson.json") as f:
    places = json.load(f)




#combining the two files to copy over the places coordinates and then export
#loop through people and places and compare
#also change key heading for date of birth
for i in range (0, len(people)):
    for j in range (0, len(places)):
        if people[i]['Place of Birth'] == places[j]['Places']:
            people[i]['latitude'] = places[j]['Latitude']
            people[i]['longitude'] = places[j]['Longitude']           
            people[i]['dateOfBirth'] = people[i]['Birth date (n)\ndd-mm-yyyy']
            people[i]['dateOfBirth'] = people[i]['dateOfBirth'].replace('-', '/')
            people[i]['yearOfBirth'] = people[i]['dateOfBirth'][-4:]
            people[i]['showOnMap'] = False
        if people[i]['Place of Death'] == places[j]['Places']:
            people[i]['Death_latitude'] = places[j]['Latitude']
            people[i]['Death_Long'] = places[j]['Longitude']

    

##Process for converting json to geojson, checking for coordinates, and exporting
df = pd.DataFrame(people)
print('We have {} rows'.format(len(df)))
str(df.columns.tolist())


df['latitude'] =  pd.to_numeric(df['latitude'],errors='coerce')
df['longitude'] =  pd.to_numeric(df['longitude'],errors='coerce')
df['yearOfBirth'] =  pd.to_numeric(df['yearOfBirth'],errors='coerce')

useful_cols = ['Id', 'yearOfBirth', 'showOnMap', 'Place of Birth', 'dateOfBirth', 'Last Name', 'latitude', 'longitude']
df_subset = df[useful_cols]
df_geo = df_subset.dropna(subset=['latitude', 'longitude'], axis=0, inplace=False)

print('We have {} geotagged rows'.format(len(df_geo)))

print(df_geo.tail())

def df_to_geojson(df, properties, lat='latitude', lon='longitude'):
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
                   'geometry':{'type':'Point',
                               'coordinates':[]}}

        # fill in the coordinates
        feature['geometry']['coordinates'] = [row[lon],row[lat]]

        # for each column, get the value and add it as a new feature property
        for prop in properties:
            feature['properties'][prop] = row[prop]
        
        # add this feature (aka, converted dataframe row) to the list of features inside our dict
        geojson['features'].append(feature)
    
    return geojson

useful_columns = ['Id', 'yearOfBirth', 'Place of Birth', 'Last Name', 'dateOfBirth', 'showOnMap']

geojson_dict = df_to_geojson(df_geo, properties=useful_columns)
geojson_str = json.dumps(geojson_dict, indent=2)

# save the geojson result to a file
output_filename = 'birthplaces.js'
with open(output_filename, 'w') as output_file:
    output_file.write('var birthplaces = {};'.format(geojson_str))
    
# how many features did we save to the geojson file?
print('{} geotagged features saved to file'.format(len(geojson_dict['features'])))