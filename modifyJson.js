// const fs = require('fs');

// // Read the JSON file
// fs.readFile('countyInfo.json', 'utf8', (err, data) => {
//     if (err) {
//         console.error('Error reading file:', err);
//         return;
//     }

//     try {
//         // Parse the JSON data
//         const jsonData = JSON.parse(data);

//         // Check if jsonData is a FeatureCollection
//         if (jsonData.type === 'FeatureCollection' && Array.isArray(jsonData.features)) {
//             // Iterate over each feature and remove properties
//             jsonData.features.forEach(feature => {
//                 if (feature.properties) {
//                     delete feature.properties.LSAD;
//                     delete feature.properties.CENSUSAREA;
//                 }
//             });

//             // Convert the modified data back to JSON
//             const modifiedJson = JSON.stringify(jsonData, null, 2);

//             // Write the modified JSON back to the file
//             fs.writeFile('modified_data.json', modifiedJson, 'utf8', err => {
//                 if (err) {
//                     console.error('Error writing file:', err);
//                     return;
//                 }
//                 console.log('Modified data written to modified_data.json');
//             });
//         } else {
//             console.error('Error: JSON data is not in the expected format');
//         }
//     } catch (error) {
//         console.error('Error parsing JSON:', error);
//     }
// });

const fs = require('fs');

// Read the JSON file
fs.readFile('modified_data.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // Check if jsonData is a FeatureCollection
        if (jsonData.type === 'FeatureCollection' && Array.isArray(jsonData.features)) {
            // Iterate over each feature
            jsonData.features.forEach(feature => {
                // Check if the feature has a geometry type of "Polygon"
                if (feature.geometry && feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
                    // Calculate the centroid of the polygon
                    const centroid = calculateCentroid(feature.geometry.coordinates[0]);

                    // Add the centroid coordinates as a new property
                    feature.properties.centroid = centroid;
                }
            });

            // Convert the modified data back to JSON
            const modifiedJson = JSON.stringify(jsonData, null, 2);

            // Write the modified JSON back to the file
            fs.writeFile('modified_data.json', modifiedJson, 'utf8', err => {
                if (err) {
                    console.error('Error writing file:', err);
                    return;
                }
                console.log('Modified data written to modified_data.json');
            });
        } else {
            console.error('Error: JSON data is not in the expected format');
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
});

// Function to calculate the centroid of a polygon
function calculateCentroid(coordinates) {
    let xSum = 0;
    let ySum = 0;
    let numPoints = coordinates.length;

    // Iterate over each coordinate pair
    for (let i = 0; i < numPoints; i++) {
        let currentPoint = coordinates[i];
        let nextPoint = coordinates[(i + 1) % numPoints]; // Wrap around to the first point if it's the last one

        // Calculate the cross product of the current and next points
        let crossProduct = (currentPoint[0] * nextPoint[1]) - (nextPoint[0] * currentPoint[1]);

        // Update the sums
        xSum += (currentPoint[0] + nextPoint[0]) * crossProduct;
        ySum += (currentPoint[1] + nextPoint[1]) * crossProduct;
    }

    // Calculate the centroid coordinates
    let area = calculateArea(coordinates);
    let centroidX = xSum / (6 * area);
    let centroidY = ySum / (6 * area);

    return [centroidX, centroidY];
}

// Function to calculate the area of a polygon (for use in centroid calculation)
function calculateArea(coordinates) {
    let numPoints = coordinates.length;
    let area = 0;

    // Iterate over each coordinate pair
    for (let i = 0; i < numPoints; i++) {
        let currentPoint = coordinates[i];
        let nextPoint = coordinates[(i + 1) % numPoints]; // Wrap around to the first point if it's the last one

        // Calculate the cross product of the current and next points
        let crossProduct = (currentPoint[0] * nextPoint[1]) - (nextPoint[0] * currentPoint[1]);

        // Update the area sum
        area += crossProduct;
    }

    // Divide by 2 and return the absolute value
    return Math.abs(area / 2);
}