# -*- coding: utf-8 -*-
"""
Created on Mon Aug 10 09:18:20 2020

@author: Kels-gabii1
"""

import json
import pandas as pd

with open("places.json", encoding="utf8") as f:
    places = json.load(f)

##Process for converting json to geojson, checking for coordinates, and exporting, for births
df = pd.DataFrame(places)
print('We have {} rows'.format(len(df)))
str(df.columns.tolist())

#convert all dates and numbers from strings to numbers so they can be filtered
df['Longitude'] =  pd.to_numeric(df['Longitude'],errors='coerce')
df['Latitude'] =  pd.to_numeric(df['Latitude'],errors='coerce')

#choose which column headings to include in geojson
useful_cols = ['Places', 'Latitude', 'Longitude', 'City', 'Country', 'Region', 'Department','Department number']
df_subset = df[useful_cols]

#drop places that do not have spatial data
df_geo = df_subset.dropna(subset=['Latitude', 'Longitude'], axis=0, inplace=False)
print('We have {} geotagged rows with spatial data'.format(len(df_geo)))

#make sure to set lat and long equal to the proper fields
def df_to_geojson(df, properties, lat='Latitude', lon='Longitude'):
   
   
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

#set columns to be exported as properties
useful_columns = ['Places', 'Latitude', 'Longitude', 'City', 'Country', 'Region', 'Department','Department number']

geojson_dict = df_to_geojson(df_geo, properties=useful_columns)

geojson_str = json.dumps(geojson_dict, indent=2, ensure_ascii=False)
# save the geojson result to a file
output_filename = 'allPlaces.js'
with open(output_filename, 'w', encoding='utf8') as output_file:
    output_file.write('var allPlaces = {};'.format(geojson_str))

   
# how many features did we save to the geojson file?
print('{} geotagged features saved to file'.format(len(geojson_dict['features'])))
