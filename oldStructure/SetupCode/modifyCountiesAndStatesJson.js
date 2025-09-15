const fs = require('fs');

// Mapping of FIPS state codes to state names
const stateNamesByCode = {
    '01': 'Alabama',
    '02': 'Alaska',
    '04': 'Arizona',
    '05': 'Arkansas',
    '06': 'California',
    '08': 'Colorado',
    '09': 'Connecticut',
    '10': 'Delaware',
    '11': 'District of Columbia',
    '12': 'Florida',
    '13': 'Georgia',
    '15': 'Hawaii',
    '16': 'Idaho',
    '17': 'Illinois',
    '18': 'Indiana',
    '19': 'Iowa',
    '20': 'Kansas',
    '21': 'Kentucky',
    '22': 'Louisiana',
    '23': 'Maine',
    '24': 'Maryland',
    '25': 'Massachusetts',
    '26': 'Michigan',
    '27': 'Minnesota',
    '28': 'Mississippi',
    '29': 'Missouri',
    '30': 'Montana',
    '31': 'Nebraska',
    '32': 'Nevada',
    '33': 'New Hampshire',
    '34': 'New Jersey',
    '35': 'New Mexico',
    '36': 'New York',
    '37': 'North Carolina',
    '38': 'North Dakota',
    '39': 'Ohio',
    '40': 'Oklahoma',
    '41': 'Oregon',
    '42': 'Pennsylvania',
    '44': 'Rhode Island',
    '45': 'South Carolina',
    '46': 'South Dakota',
    '47': 'Tennessee',
    '48': 'Texas',
    '49': 'Utah',
    '50': 'Vermont',
    '51': 'Virginia',
    '53': 'Washington',
    '54': 'West Virginia',
    '55': 'Wisconsin',
    '56': 'Wyoming',
    '72': 'Puerto Rico',
    '78': 'Virgin Islands'
};

// Mapping of original STATEFP to new codes
const stateFPMapping = {
    '01': '01', // Alabama
    '04': '02', // Arizona
    '05': '03', // Arkansas
    '06': '04', // California
    '08': '05', // Colorado
    '09': '06', // Connecticut
    '10': '07', // Delaware
    '12': '08', // Florida
    '13': '09', // Georgia
    '16': '10', // Idaho
    '17': '11', // Illinois
    '18': '12', // Indiana
    '19': '13', // Iowa
    '20': '14', // Kansas
    '21': '15', // Kentucky
    '22': '16', // Louisiana
    '23': '17', // Maine
    '24': '18', // Maryland
    '25': '19', // Massachusetts
    '26': '20', // Michigan
    '27': '21', // Minnesota
    '28': '22', // Mississippi
    '29': '23', // Missouri
    '30': '24', // Montana
    '31': '25', // Nebraska
    '32': '26', // Nevada
    '33': '27', // New Hampshire
    '34': '28', // New Jersey
    '35': '29', // New Mexico
    '36': '30', // New York
    '37': '31', // North Carolina
    '38': '32', // North Dakota
    '39': '33', // Ohio
    '40': '34', // Oklahoma
    '41': '35', // Oregon
    '42': '36', // Pennsylvania
    '44': '37', // Rhode Island
    '45': '38', // South Carolina
    '46': '39', // South Dakota
    '47': '40', // Tennessee
    '48': '41', // Texas
    '49': '42', // Utah
    '50': '43', // Vermont
    '51': '44', // Virginia
    '53': '45', // Washington
    '54': '46', // West Virginia
    '55': '47', // Wisconsin
    '56': '48', // Wyoming
    '02': '50', // Alaska
    '11': '', // District of Columbia
    '15': '', // Hawaii
    '72': '', // Puerto Rico
    '78': ''  // Virgin Islands
};

const stateAbbreviations = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY',
};

// Function to adjust longitudes if they exceed 160 degrees within a geometry object
function adjustGeometryLongitudes(geometry) {
    const { type, coordinates } = geometry;

    // Helper function to adjust a single coordinate's longitude
    const adjustCoordinate = ([lon, lat]) => {
        if (lon > 160) {
            lon -= 360;
        }
        return [lon, lat];
    };

    // Recursive function to adjust coordinates in nested structures
    const adjustCoordinates = coords => {
        if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
            // Array of coordinates
            return coords.map(adjustCoordinate);
        } else if (Array.isArray(coords[0])) {
            // Array of arrays (nested structure)
            return coords.map(adjustCoordinates);
        } else {
            // Single coordinate pair
            return adjustCoordinate(coords);
        }
    };

    // Adjust coordinates based on geometry type
    if (type === 'Polygon') {
        // Adjust outer ring coordinates of a Polygon
        coordinates[0] = adjustCoordinates(coordinates[0]);
    } else if (type === 'MultiPolygon') {
        // Adjust outer ring coordinates of each Polygon in a MultiPolygon
        coordinates.forEach(polygon => {
            polygon[0] = adjustCoordinates(polygon[0]);
        });
    }

    // Update the original geometry with adjusted coordinates
    return geometry;
}

function calculateCentroidPolygon(coordinates) {
    let area = 0.0;
    let centroidX = 0.0;
    let centroidY = 0.0;

    const points = coordinates[0]; // assuming the first item contains the outer ring of the polygon

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[j];
        const a = x0 * y1 - x1 * y0;
        area += a;
        centroidX += (x0 + x1) * a;
        centroidY += (y0 + y1) * a;
    }

    area *= 0.5;
    centroidX /= (6.0 * area);
    centroidY /= (6.0 * area);

    return { lat: centroidY.toFixed(6), long: centroidX.toFixed(6) };
}


// Function to calculate the bounding box and its centroid for multipolygons
function calculateCentroidMultiPolygon(coordinates) {
    let totalArea = 0.0;
    let centroidX = 0.0;
    let centroidY = 0.0;

    coordinates.forEach(polygon => {
        let area = 0.0;
        let tempCentroidX = 0.0;
        let tempCentroidY = 0.0;

        polygon.forEach(ring => {
            const points = ring;

            for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
                const [x0, y0] = points[i];
                const [x1, y1] = points[j];
                const a = x0 * y1 - x1 * y0;
                area += a;
                tempCentroidX += (x0 + x1) * a;
                tempCentroidY += (y0 + y1) * a;
            }
        });

        area *= 0.5;
        tempCentroidX /= (6.0 * area);
        tempCentroidY /= (6.0 * area);

        totalArea += area;
        centroidX += tempCentroidX * area;
        centroidY += tempCentroidY * area;
    });

    centroidX /= totalArea;
    centroidY /= totalArea;

    return { lat: centroidY.toFixed(6), long: centroidX.toFixed(6) };
}


// Function to filter the properties
const filterCountyProperties = (feature) => {
    return {
        "type": feature.type,
        "geometry": feature.geometry,
        "properties": {
            "OBJECTID": feature.properties.OBJECTID,
            "STATEFP": feature.properties.statecode,
            "COUNTYFP": feature.properties.countycode,
            "FIPSCODE": feature.properties.fipscode,
            "COUNTYNAME": feature.properties.county,
            "STATEABBR": feature.properties.state
        }
    };
};

// Read the JSON file
fs.readFile('County_FeaturesToJSON.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        // Parse JSON data
        const jsonData = JSON.parse(data);

        const newJson = {
            "type": jsonData.type,
            "features": jsonData.features.map(filterCountyProperties)
        };

        // Remove features with STATEFP '11', '15', '72', or '78' (No NOAA data for D.C., Hawaii, Puerto Rico, Virgin Islands)
        newJson.features = newJson.features.filter(feature => !['11', '15', '72', '78'].includes(feature.properties.STATEFP));

        // Process each feature
        newJson.features.forEach(feature => {

            const stateFP = feature.properties.STATEFP;
            feature.properties.STATECODE = stateFPMapping[stateFP] || '';
            feature.properties.STATENAME = stateNamesByCode[stateFP] || '';

            feature.geometry = adjustGeometryLongitudes(feature.geometry)

            // Add the centroid of the bounding box of the polygon
            if (feature.geometry && feature.geometry.type === 'Polygon') {
                var centroid = calculateCentroidPolygon(feature.geometry.coordinates);
                feature.properties.LAT = centroid.lat;
                feature.properties.LONG = centroid.long;
            }
            else {
                var centroid = calculateCentroidMultiPolygon(feature.geometry.coordinates);
                feature.properties.LAT = centroid.lat;
                feature.properties.LONG = centroid.long;
            }

        });

        // Write modified JSON back to file
        fs.writeFile('modified_counties.json', JSON.stringify(newJson, null, 2), err => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('Modified JSON file created successfully.');
        });
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
});

// // Function to filter the properties
// const filterStateProperties = (feature) => {
//     return {
//         "type": "Feature",
//         "properties": {
//             "OBJECTID": feature.attributes.OBJECTID,
//             "STATEFP": feature.attributes.statecode,
//             "COUNTYFP": feature.attributes.countycode,
//             "FIPSCODE": feature.attributes.fipscode,
//             "STATENAME": feature.attributes.state_name,
//             "STATEABBR": feature.attributes.state_abbr
//         },
//         "geometry": feature.geometry
//     };
// };

// function transformGeometry(geoJson) {
//     // Check if geoJson contains a geometry property
//     if (!geoJson.geometry) {
//         throw new Error("Invalid GeoJSON: missing geometry property");
//     }

//     // Check if the geometry contains the 'rings' property
//     if (!geoJson.geometry.rings) {
//         throw new Error("Invalid geometry: missing rings property");
//     }

//     // Get the rings from the geometry
//     const { rings } = geoJson.geometry;

//     // Determine if the rings form a polygon or multipolygon
//     var type, coordinates;

//     if (Array.isArray(rings[0][0])) {
//         // If the first element of rings is an array, we have a MultiPolygon
//         type = "MultiPolygon";
//         coordinates = rings.map(ring => [ring]);
//     } else {
//         // Otherwise, we have a Polygon
//         type = "Polygon";
//         coordinates = rings;
//     }

//     // Update the geometry object
//     geoJson.geometry = {
//         type: type,
//         coordinates: coordinates
//     };

//     return geoJson;
// }


// // Read the JSON file
// fs.readFile('State_Features.json', 'utf8', (err, data) => {
//     if (err) {
//         console.error('Error reading file:', err);
//         return;
//     }

//     try {
//         // Parse JSON data
//         const jsonData = JSON.parse(data);

//         const newJson = {
//             "type": jsonData.type,
//             "features": jsonData.features.map(filterStateProperties)
//         };

//         // Remove features with STATEFP '11', '15', '72', or '78' (No NOAA data for D.C., Hawaii, Puerto Rico, Virgin Islands)
//         newJson.features = newJson.features.filter(feature => !['11', '15', '72', '78'].includes(feature.properties.STATEFP));


//         // Process each feature
//         newJson.features.forEach(feature => {

//             const stateFP = feature.properties.STATEFP;
//             feature.properties.STATECODE = stateFPMapping[stateFP] || '';

//         });

//         newJson.features = newJson.features.map(feature => {
//             if (feature.geometry && feature.geometry.rings) {
//                 return transformGeometry(feature);
//             }
//             return feature;
//         });

//         // Write modified JSON back to file
//         fs.writeFile('modified_states.json', JSON.stringify(newJson, null, 2), err => {
//             if (err) {
//                 console.error('Error writing file:', err);
//                 return;
//             }
//             console.log('Modified JSON file created successfully.');
//         });
//     } catch (error) {
//         console.error('Error parsing JSON:', error);
//     }
// });