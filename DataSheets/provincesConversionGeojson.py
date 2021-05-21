# -*- coding: utf-8 -*-
"""
Created on Mon Aug 10 09:18:20 2020

@author: Kels-gabii1
"""

import json
import pandas as pd

with open("places.json", encoding="utf8") as f:
    places = json.load(f)
    
with open("people.json", encoding="utf8") as f2:
    people = json.load(f2)

with open("provinces.json", encoding="utf8") as f3:
    provinces=json.load(f3)


for i in range(0, len(provinces)):
    provinces[i]['vowedHere']=[]
    provinces[i]['provLat']=provinces[i]['Latitude']
    provinces[i]['provLong']=provinces[i]['Longitude']
    for j in range(0, len(people)):
        people[j]['fullName']=people[j]['Last_Name'] + ", " + people[j]['First_Name'] +  ' (' + str(people[j]['Id']) + ')'
        if provinces[i]['JesuitPlaceAbbreviation']==people[j]['Entrance_Province']:
            provinces[i]['vowedHere'].append(people[j]['fullName'])


###########################################################################
##Process for converting json to geojson, checking for coordinates, and exporting, for "birth/death" places information
df = pd.DataFrame(provinces)
print('We have {} rows'.format(len(df)))
str(df.columns.tolist())

#convert all dates and numbers from strings to numbers so they can be filtered
df['provLong'] =  pd.to_numeric(df['provLong'],errors='coerce')
df['provLat'] =  pd.to_numeric(df['provLat'],errors='coerce')

#choose which column headings to include in geojson
useful_cols = ['Places', 'provLat', 'provLong', 'Placeholder City', 'Placeholder Country', 'vowedHere', 'MissionDate(s)', 'ViceProvinceDate(s)', 'ProvinceDate(s)']
df_subset = df[useful_cols]

#drop places that do not have spatial data
df_geo = df_subset.dropna(subset=['provLat', 'provLong'], axis=0, inplace=False)
print('We have {} geotagged rows with spatial data'.format(len(df_geo)))

#make sure to set lat and long equal to the proper fields
def df_to_geojson(df, properties, lat='provLat', lon='provLong'):
   
   
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
useful_cols = ['Places', 'provLat', 'provLong', 'Placeholder City', 'Placeholder Country', 'vowedHere', 'MissionDate(s)', 'ViceProvinceDate(s)', 'ProvinceDate(s)']

geojson_dict = df_to_geojson(df_geo, properties=useful_cols)

geojson_str = json.dumps(geojson_dict, indent=2, ensure_ascii=False)
# save the geojson result to a file
output_filename = 'allProvinces.js'
with open(output_filename, 'w', encoding='utf8') as output_file:
    output_file.write('var allProvinces= {};'.format(geojson_str))

   
# how many features did we save to the geojson file?
print('{} geotagged features saved to file'.format(len(geojson_dict['features'])))


