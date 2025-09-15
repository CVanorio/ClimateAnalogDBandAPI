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

// Function to calculate the bounding box and its centroid
function calculateBoundingBoxCentroidPolygons(coordinates) {
    let [minX, minY] = coordinates[0][0];
    let [maxX, maxY] = coordinates[0][0];

    coordinates[0].forEach(coord => {
        if (coord[0] < minX) minX = coord[0];
        if (coord[0] > maxX) maxX = coord[0];
        if (coord[1] < minY) minY = coord[1];
        if (coord[1] > maxY) maxY = coord[1];
    });

    const centroidX = (minX + maxX) / 2;
    const centroidY = (minY + maxY) / 2;
    return { lat: centroidY.toFixed(6), long: centroidX.toFixed(6) };
}

// Function to calculate the bounding box and its centroid for multipolygons
function calculateBoundingBoxCentroidMultiPolygon(coordinates) {
    let allCoordinates = [];
    coordinates.forEach(polygon => {
        polygon.forEach(innerPolygon => {
            allCoordinates.push(...innerPolygon);
        });
    });

    let [minX, minY] = allCoordinates[0];
    let [maxX, maxY] = allCoordinates[0];

    allCoordinates.forEach(coord => {
        if (coord[0] < minX) minX = coord[0];
        if (coord[0] > maxX) maxX = coord[0];
        if (coord[1] < minY) minY = coord[1];
        if (coord[1] > maxY) maxY = coord[1];
    });

    const centroidX = (minX + maxX) / 2;
    const centroidY = (minY + maxY) / 2;
    return { lat: centroidY.toFixed(6), long: centroidX.toFixed(6) };
}


// Read the JSON file
fs.readFile('counties.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        // Parse JSON data
        const jsonData = JSON.parse(data);

        // Remove features with STATEFP '11', '15', '72', or '78' (No NOAA data for D.C., Hawaii, Puerto Rico, Virgin Islands)
        //jsonData.features = jsonData.features.filter(feature => !['11', '15', '72', '78'].includes(feature.properties.STATEFP));

        // Process each feature
        jsonData.features.forEach(feature => {
            // Add state name based on STATEFP
            feature.properties.STATENAME = stateNamesByCode[feature.properties.STATEFP];

            // Add state abbreviation on STATENAME
            feature.properties.STATEABBR = stateAbbreviations[feature.properties.STATENAME];

            // Convert STATEFP to match your data
            feature.properties.STATEFP = stateFPMapping[feature.properties.STATEFP];

            // Convert GEOID to match new STATEFP
            feature.properties.GEOID = feature.properties.STATEFP.concat(feature.properties.COUNTYFP);

            // Rename NAME property to COUNTYNAME
            feature.properties.COUNTYNAME = feature.properties.NAME;
            delete feature.properties.NAME;

            // Remove unneeded properties
            delete feature.properties.COUNTYNS;
            delete feature.properties.AFFGEOID;
            delete feature.properties.LSAD;
            delete feature.properties.ALAND;
            delete feature.properties.AWATER;


            // Add the centroid of the bounding box of the polygon
            if (feature.geometry && feature.geometry.type === 'Polygon') {
                var centroid = calculateBoundingBoxCentroidPolygons(feature.geometry.coordinates);
                feature.properties.LAT = centroid.lat;
                feature.properties.LONG = centroid.long;
            }
            else {
                var centroid = calculateBoundingBoxCentroidMultiPolygon(feature.geometry.coordinates);
                feature.properties.LAT = centroid.lat;
                feature.properties.LONG = centroid.long;
            }

            
        });

        // Write modified JSON back to file
        fs.writeFile('modified_data.json', JSON.stringify(jsonData, null, 2), err => {
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
