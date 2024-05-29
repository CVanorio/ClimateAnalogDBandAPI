-- Create table to store information about counties
CREATE TABLE Counties (
    CountyID INT PRIMARY KEY,       -- Unique identifier for each county
    CountyName VARCHAR(100),        -- Name of the county
    StateCode CHAR(2),      -- State code of the county
    Latitude DECIMAL(8, 6),         -- Latitude coordinate of the county's centroid
    Longitude DECIMAL(9, 6),        -- Longitude coordinate of the county's centroid
    IsWICounty BOOLEAN      -- Flag indicating if the county is located in Wisconsin
);

-- Create table to store daily precipitation and temperature data for counties
CREATE TABLE CountyData (
    CountyID INT,       -- Foreign key referencing the Counties table
    Date DATE,      -- Date of the data entry (YEAR-MONTH-DAY)
    Precipitation DECIMAL(5, 2),        -- Daily precipitation value
    Temperature DECIMAL(5, 2),      -- Daily temperature value
    PRIMARY KEY (CountyID, Date),       -- Composite primary key
    FOREIGN KEY (CountyID) REFERENCES Counties(CountyID)        -- Foreign key constraint
);

-- Create table to store 30-year average precipitation and temperature data for counties
CREATE TABLE AnalogData (
    CountyID INT PRIMARY KEY,       -- Foreign key referencing the Counties table
    AvgPrecipitation DECIMAL(5, 2),         -- Average precipitation value over 30 years
    AvgTemperature DECIMAL(5, 2),       -- Average temperature value over 30 years
    FOREIGN KEY (CountyID) REFERENCES Counties(CountyID)        -- Foreign key constraint
);

-- Create table to store matches between target and analog counties based on Euclidean distance
CREATE TABLE CountyMatches (
    TargetCountyID INT,         -- Foreign key referencing the Counties table for the target county
    Date DATE,      -- Date of the data entry
    AnalogCountyID INT,         -- Foreign key referencing the Counties table for the analog county
    EuclideanDist DECIMAL(5, 2),        -- Euclidean distance between target and analog counties
    EuclideanDistPrecip DECIMAL(5, 2),      -- Euclidean distance between target and analog counties, precipitation only
    EuclideanDistTemp DECIMAL(5, 2),        -- Euclidean distance between target and analog counties, temperature only
    IsMedianAnalog BOOLEAN      -- Flag indicating if the analog is the median analog for this date
    PRIMARY KEY (TargetCountyID, Date, AnalogCountyID),     -- Composite primary key
    FOREIGN KEY (TargetCountyID) REFERENCES Counties(CountyID),     -- Foreign key constraint
    FOREIGN KEY (AnalogCountyID) REFERENCES Counties(CountyID)      -- Foreign key constraint
);

-- Insert sample data into the Counties table
INSERT INTO Counties (CountyID, CountyName, StateCode, Latitude, Longitude, IsWICounty)
VALUES 
(1, 'County A', 'WI', 43.7844, -88.7879, TRUE),
(2, 'County B', 'CA', 36.7783, -119.4179, FALSE),
(3, 'County C', 'TX', 31.9686, -99.9018, FALSE);

-- Insert sample data into the CountyData table
INSERT INTO CountyData (CountyID, Date, Precipitation, Temperature)
VALUES 
(1, '2024-05-01', 5.2, 15.3),
(1, '2024-05-02', 4.1, 16.4),
(2, '2024-05-01', 2.0, 18.0),
(2, '2024-05-02', 2.1, 18.5);

-- Insert average precipitation and temperature values into AnalogData table based on the average values for years 1990 - 2020 from the CountyData table
INSERT INTO AnalogData (CountyID, AvgPrecipitation, AvgTemperature)
SELECT 
    CountyID, -- Selecting the CountyID column
    AVG(Precipitation) AS AvgPrecipitation, -- Calculating the average precipitation
    AVG(Temperature) AS AvgTemperature -- Calculating the average temperature
FROM 
    CountyData -- Selecting data from the CountyData table
WHERE 
    YEAR(Date) BETWEEN 1990 AND 2020 -- Filtering records between 1990 and 2020
GROUP BY 
    CountyID; -- Grouping the results by CountyID


-- Create a view to retrieve data for target counties (WI counties)
CREATE VIEW TargetCountyData AS
SELECT 
    c.CountyID, 
    c.CountyName, 
    t.Date, 
    t.Precipitation, 
    t.Temperature
FROM 
    Counties c
JOIN 
    CountyData t ON c.CountyID = t.CountyID
WHERE 
    c.IsWICounty = TRUE;

-- Insert matches between target and analog counties based on Euclidean distance
INSERT INTO CountyMatches (TargetCountyID, Date, AnalogCountyID, EuclideanDist)
SELECT 
    t.CountyID AS TargetCountyID,
    t.Date,
    a.CountyID AS AnalogCountyID,
    SQRT(
        (POWER(t.Precipitation - a.AvgPrecipitation, 2)/POWER(a.StdDevPrecip, 2)) + 
        (POWER(t.Temperature - a.AvgTemperature, 2)/POWER(a.StdDevPrecip, 2))
    ) AS EuclideanDist
FROM 
    TargetCountyData t
JOIN 
    Counties AS target ON t.CountyID = target.CountyID AND target.IsWICounty = TRUE -- Ensure target is WI county
JOIN 
    AnalogData a -- All counties are potential analogs
ORDER BY 
    EuclideanDist ASC;
