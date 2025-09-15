const fs = require('fs').promises; // Use promises for async/await
const jsonfile = require('jsonfile');
const path = require('path');
const mysql = require('mysql2/promise'); 
const axios = require('axios');


// Mapping of original STATEFP to new codes
const stateFPMapping = {
    '01': 'Alabama', // Alabama
    '02': 'Arizona', // Arizona
    '03': 'Arkansas', // Arkansas
    '04': 'California', // California
    '05': 'Colorado', // Colorado
    '06': 'Connecticut', // Connecticut
    '07': 'Delaware', // Delaware
    '08': 'Florida', // Florida
    '09': 'Georgia', // Georgia
    '10': 'Idaho', // Idaho
    '11': 'Illinois', // Illinois
    '12': 'Indiana', // Indiana
    '13': 'Iowa', // Iowa
    '14': 'Kansas', // Kansas
    '15': 'Kentucky', // Kentucky
    '16': 'Louisiana', // Louisiana
    '17': 'Maine', // Maine
    '18': 'Maryland', // Maryland
    '19': 'Massachusetts', // Massachusetts
    '20': 'Michigan', // Michigan
    '21': 'Minnesota', // Minnesota
    '22': 'Mississippi', // Mississippi
    '23': 'Missouri', // Missouri
    '24': 'Montana', // Montana
    '25': 'Nebraska', // Nebraska
    '26': 'Nevada', // Nevada
    '27': 'New Hampshire', // New Hampshire
    '28': 'New Jersey', // New Jersey
    '29': 'New Mexico', // New Mexico
    '30': 'New York', // New York
    '31': 'North Carolina', // North Carolina
    '32': 'South Dakota', // North Dakota
    '33': 'Ohio', // Ohio
    '34': 'Oklahoma', // Oklahoma
    '35': 'Oregon', // Oregon
    '36': 'Pennsylvania', // Pennsylvania
    '37': 'Rhode Island', // Rhode Island
    '38': 'South Carolina', // South Carolina
    '39': 'South Dakota', // South Dakota
    '40': 'Tennessee', // Tennessee
    '41': 'Texas', // Texas
    '42': 'Utah', // Utah
    '43': 'Vermont', // Vermont
    '44': 'Virginia', // Virginia
    '45': 'Washington', // Washington
    '46': 'West Virginia', // West Virginia
    '47': 'Wisconsin', // Wisconsin
    '48': 'Wyoming', // Wyoming
    '50': 'Alaska' // Alaska
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


// // Function to insert state into the database
// async function insertState(stateCode, stateAbbr, stateName) {
//     var url = `http://localhost:3000/addstate/${stateCode}/${stateAbbr}/${stateName}`;
//     var config = {
//         timeout: 5000  // Timeout after 5000ms (5 seconds)
//     };

//     try {
//         const response = await axios.post(url, {}, config);
//         return response;
//     } catch (error) {
//         if (error.response) {
//             console.error('Error response from server:', error.response.status, error.response.data);
//         } else if (error.request) {
//             console.error('No response received:', error.request);
//         } else {
//             console.error('Error setting up the request:', error.message);
//         }
//         console.error('Error details:', error.config);
//     }
// }

// // Path to the JSON file
// const jsonFilePathStates = 'modified_states.json'; 

// // Function to add all states
// async function addAllStates() {
//     try {
//         const data = await fs.readFile(jsonFilePathStates, 'utf8');
//         const jsonData = JSON.parse(data);

//         for (const feature of jsonData.features) {
//             const stateCode = feature.properties.STATECODE;
//             const stateAbbr = feature.properties.STATEABBR;
//             const stateName = feature.properties.STATENAME;

//             await insertState(stateCode, stateAbbr, stateName);
//         }

//         console.log("All states inserted");

//     } catch (err) {
//         console.error('Error processing states:', err);
//     }
// }

// // Call the function to add all states
// addAllStates();


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to insert county into the database
async function insertCounty(countyID, countyName, stateCode, lat, long) {
    var url = `http://localhost:3000/addcounty/${countyID}/${countyName}/${stateCode}/${lat}/${long}`
    var config = {
        timeout: 5000  // Timeout after 5000ms (5 seconds)
    };

    try {
        const response = await axios.post(url, {}, config);
        //console.log('County inserted successfully:', response.data);
        return response;
    } catch (error) {
        if (error.response) {
            console.error('Error response from server:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up the request:', error.message);
        }
        console.error('Error details:', error.config);
    }
}

 // Path to the JSON file
const jsonFilePathCounties = 'modified_counties.json'; 

// Add all counties
async function addAllCounties() {
    try {
        const data = await fs.readFile(jsonFilePathCounties, 'utf8');
        const jsonData = JSON.parse(data);

        //console.log(jsonData.features);

        for (const feature of jsonData.features) {
            const countyID = feature.properties.COUNTYFP;
            const countyName = feature.properties.COUNTYNAME;
            const stateCode = feature.properties.STATECODE;
            const latitude = feature.properties.LAT;
            const longitude = feature.properties.LONG;

            await insertCounty(countyID, countyName, stateCode, latitude, longitude);
        }

        console.log("All counties inserted");

    } catch (err) {
        console.error('Error processing counties:', err);
    }
}

addAllCounties();

 