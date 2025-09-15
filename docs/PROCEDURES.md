# Stored Procedures & Functions

## `CalculateAllMonthlyCombinedDistances`

**Signature**

```sql
PROCEDURE CalculateAllMonthlyCombinedDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_wiCountyID INT;

    
    DECLARE v_wiCountyCursor CURSOR FOR 
        SELECT DISTINCT TargetCountyID FROM monthly_precipitation_distances_TEMP;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_wiCountyCursor;
    
    county_loop: LOOP
        FETCH v_wiCountyCursor INTO v_wiCountyID;
        
        IF v_done THEN
            LEAVE county_loop;
        END
```
</details>

## `CalculateAllMonthlyDistancesForCounty`

**Signature**

```sql
PROCEDURE CalculateAllMonthlyDistancesForCounty(IN p_targetCountyID INT)
```

<details>
<summary>Body</summary>

```sql
BEGIN
    
    REPLACE INTO monthly_precipitation_distances (TargetCountyID, AnalogCountyID, Year, Month, Distance, AnalogRank)
    SELECT
        p_targetCountyID AS TargetCountyID,
        dc.AnalogCountyID AS AnalogCountyID,
        dc.Year,
        dc.Month,
        dc.Distance,
        RANK() OVER (
            PARTITION BY p_targetCountyID, dc.Year, dc.Month
            ORDER BY dc.Distance ASC, pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM (
        SELECT
            a.CountyID AS AnalogCountyID,
            t.Year,
            t.Month,
            ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2) AS Distance
        FROM
            monthly_precipitation_data_wi t
        CROSS JOIN
            monthly_precipitation_norms a
        WHERE
            t.Month = a.Month
            AND t.CountyID = p_targetCountyID
    ) AS dc
    JOIN PhysicalDistances pd
        ON dc.AnalogCountyID = pd.AnalogCountyId
        AND pd.TargetCountyId = p_targetCountyID;

    
    REPLACE INTO monthly_temperature_distances (TargetCountyID, AnalogCountyID, Year, Month, Distance, AnalogRank)
    SELECT
        p_targetCountyID AS TargetCountyID,
        dc.AnalogCountyID AS AnalogCountyID,
        dc.Year,
        dc.Month,
        dc.Distance,
        RANK() OVER (
            PARTITION BY p_targetCountyID, dc.Year, dc.Month
            ORDER BY dc.Distance ASC, pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM (
        SELECT
            a.CountyID AS AnalogCountyID,
            t.Year,
            t.Month,
            ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2) AS Distance
        FROM
            monthly_temperature_data_wi t
        CROSS JOIN
            monthly_temperature_norms a
        WHERE
            t.Month = a.Month
            AND t.CountyID = p_targetCountyID
    ) AS dc
    JOIN PhysicalDistances pd
        ON dc.AnalogCountyID = pd.AnalogCountyId
        AND pd.TargetCountyId = p_targetCountyID;

    
    CREATE TEMPORARY TABLE TempMonthlyCombinedDistances AS
    SELECT
        p.TargetCountyID,
        p.AnalogCountyID,
        p.Year,
        p.Month,
        ROUND(SQRT(POW(p.Distance, 2) + POW(t.Distance, 2)), 2) AS CombinedDistance
    FROM
        monthly_precipitation_distances p
    JOIN monthly_temperature_distances t
        ON p.TargetCountyID = t.TargetCountyID
        AND p.AnalogCountyID = t.AnalogCountyID
        AND p.Year = t.Year
        AND p.Month = t.Month
    WHERE
        p.TargetCountyID = p_targetCountyID;

    CREATE TEMPORARY TABLE TempMonthlyRankedDistances AS
    SELECT
        cd.TargetCountyID,
        cd.AnalogCountyID,
        cd.Year,
        cd.Month,
        cd.CombinedDistance,
        RANK() OVER (
            PARTITION BY cd.TargetCountyID, cd.Year, cd.Month
            ORDER BY cd.CombinedDistance ASC, pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM
        TempMonthlyCombinedDistances cd
    JOIN PhysicalDistances pd
        ON cd.AnalogCountyID = pd.AnalogCountyId
        AND pd.TargetCountyId = cd.TargetCountyID;

    REPLACE INTO monthly_combined_distances (TargetCountyID, AnalogCountyID, Year, Month, Distance, AnalogRank)
    SELECT
        TargetCountyID,
        AnalogCountyID,
        Year,
        Month,
        CombinedDistance,
        AnalogRank
    FROM
        TempMonthlyRankedDistances
    WHERE
        AnalogRank <= 50;

    
    DROP TEMPORARY TABLE IF EXISTS TempMonthlyCombinedDistances;
    DROP TEMPORARY TABLE IF EXISTS TempMonthlyRankedDistances;

    
    DELETE FROM monthly_precipitation_distances 
    WHERE TargetCountyID = p_targetCountyID AND AnalogRank > 150;

    
    DELETE FROM monthly_temperature_distances 
    WHERE TargetCountyID = p_targetCountyID AND AnalogRank > 150;

END
```
</details>

## `CalculateAllMonthlyDistancesForWI`

**Signature**

```sql
PROCEDURE CalculateAllMonthlyDistancesForWI()
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_targetCountyID INT;
    DECLARE v_countyCursor CURSOR FOR 
        SELECT CountyID FROM Counties WHERE StateCode = '47';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_countyCursor;

    
    county_loop: LOOP
        FETCH v_countyCursor INTO v_targetCountyID;

        IF v_done THEN
            LEAVE county_loop;
        END
```
</details>

## `CalculateAllSeasonalCombinedDistances`

**Signature**

```sql
PROCEDURE CalculateAllSeasonalCombinedDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_wiCountyID INT;
    DECLARE v_wiCountyCursor CURSOR FOR 
        SELECT DISTINCT TargetCountyID FROM seasonal_precipitation_distances_TEMP;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_wiCountyCursor;
    
    county_loop: LOOP
        FETCH v_wiCountyCursor INTO v_wiCountyID;
        
        IF v_done THEN
            LEAVE county_loop;
        END
```
</details>

## `CalculateAllSeasonalDistancesForCounty`

**Signature**

```sql
PROCEDURE CalculateAllSeasonalDistancesForCounty(IN p_targetCountyID INT)
```

<details>
<summary>Body</summary>

```sql
BEGIN
    
    REPLACE INTO seasonal_precipitation_distances (TargetCountyID, AnalogCountyID, Year, Season, Distance, AnalogRank)
    SELECT
        p_targetCountyID AS TargetCountyID,
        dc.AnalogCountyID AS AnalogCountyID,
        dc.Year,
        dc.Season,
        dc.Distance,
        RANK() OVER (
            PARTITION BY p_targetCountyID, dc.Year, dc.Season
            ORDER BY dc.Distance ASC, pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM (
        SELECT
            a.CountyID AS AnalogCountyID,
            t.Year,
            t.Season,
            ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2) AS Distance
        FROM
            seasonal_precipitation_data_wi t
        CROSS JOIN
            seasonal_precipitation_norms a
        WHERE
            t.Season = a.Season
            AND t.CountyID = p_targetCountyID
    ) AS dc
    JOIN PhysicalDistances pd
    ON p_targetCountyID = pd.TargetCountyId
    AND dc.AnalogCountyID = pd.AnalogCountyId;

    
    REPLACE INTO seasonal_temperature_distances (TargetCountyID, AnalogCountyID, Year, Season, Distance, AnalogRank)
    SELECT
        p_targetCountyID AS TargetCountyID,
        dc.AnalogCountyID AS AnalogCountyID,
        dc.Year,
        dc.Season,
        dc.Distance,
        RANK() OVER (
            PARTITION BY p_targetCountyID, dc.Year, dc.Season
            ORDER BY dc.Distance ASC, pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM (
        SELECT
            a.CountyID AS AnalogCountyID,
            t.Year,
            t.Season,
            ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2) AS Distance
        FROM
            seasonal_temperature_data_wi t
        CROSS JOIN
            seasonal_temperature_norms a
        WHERE
            t.Season = a.Season
            AND t.CountyID = p_targetCountyID
    ) AS dc
    JOIN PhysicalDistances pd
    ON p_targetCountyID = pd.TargetCountyId
    AND dc.AnalogCountyID = pd.AnalogCountyId;

    
    CREATE TEMPORARY TABLE TempSeasonalCombinedDistances AS
    SELECT
        p.TargetCountyID,
        p.AnalogCountyID,
        p.Year,
        p.Season,
        ROUND(SQRT(POW(p.Distance, 2) + POW(t.Distance, 2)), 2) AS CombinedDistance
    FROM
        seasonal_precipitation_distances p
    JOIN seasonal_temperature_distances t
        ON p.TargetCountyID = t.TargetCountyID
        AND p.AnalogCountyID = t.AnalogCountyID
        AND p.Year = t.Year
        AND p.Season = t.Season
    WHERE
        p.TargetCountyID = p_targetCountyID;

    CREATE TEMPORARY TABLE TempSeasonalRankedDistances AS
    SELECT
        cd.TargetCountyID,
        cd.AnalogCountyID,
        cd.Year,
        cd.Season,
        cd.CombinedDistance,
        pd.PhysicalDistance,
        RANK() OVER (
            PARTITION BY cd.TargetCountyID, cd.Year, cd.Season
            ORDER BY cd.CombinedDistance ASC, 
                     pd.PhysicalDistance ASC
        ) AS AnalogRank
    FROM
        TempSeasonalCombinedDistances cd
    JOIN PhysicalDistances pd
        ON cd.TargetCountyID = pd.TargetCountyId
        AND cd.AnalogCountyID = pd.AnalogCountyId;

    REPLACE INTO seasonal_combined_distances (TargetCountyID, AnalogCountyID, Year, Season, Distance, AnalogRank)
    SELECT
        TargetCountyID,
        AnalogCountyID,
        Year,
        Season,
        CombinedDistance,
        AnalogRank
    FROM
        TempSeasonalRankedDistances
    WHERE
        AnalogRank <= 50;

    
    DROP TEMPORARY TABLE IF EXISTS TempSeasonalCombinedDistances;
    DROP TEMPORARY TABLE IF EXISTS TempSeasonalRankedDistances;

    
    DELETE FROM seasonal_precipitation_distances 
    WHERE TargetCountyID = p_targetCountyID AND AnalogRank > 150;

    
    DELETE FROM seasonal_temperature_distances 
    WHERE TargetCountyID = p_targetCountyID AND AnalogRank > 150;

END
```
</details>

## `CalculateAllSeasonalDistancesForWI`

**Signature**

```sql
PROCEDURE CalculateAllSeasonalDistancesForWI()
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_targetCountyID INT;
    DECLARE v_countyCursor CURSOR FOR 
        SELECT CountyID FROM Counties WHERE StateCode = '47';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_countyCursor;

    
    county_loop: LOOP
        FETCH v_countyCursor INTO v_targetCountyID;

        IF v_done THEN
            LEAVE county_loop;
        END
```
</details>

## `CalculateMonthlyCombinedDistances`

**Signature**

```sql
PROCEDURE CalculateMonthlyCombinedDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
  
  REPLACE INTO monthly_combined_distances
    (TargetCountyID, AnalogCountyID, Year, Month, Distance)
  SELECT
    p.TargetCountyID,
    p.AnalogCountyID,
    p.Year,
    p.Month,
    ROUND(SQRT(POW(p.Distance, 2) + POW(t.Distance, 2)), 2) AS Distance
  FROM monthly_precipitation_distances_TEMP p
  JOIN monthly_temperature_distances_TEMP   t
    ON t.TargetCountyID = p.TargetCountyID
   AND t.AnalogCountyID = p.AnalogCountyID
   AND t.Year           = p.Year
   AND t.Month          = p.Month;

  TRUNCATE TABLE monthly_precipitation_distances_TEMP;
  TRUNCATE TABLE monthly_temperature_distances_TEMP;


  
  

END
```
</details>

## `CalculateMonthlyCombinedDistancesForCounty`

**Signature**

```sql
PROCEDURE CalculateMonthlyCombinedDistancesForCounty(p_WICountyID INT)
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_month VARCHAR(2);
    DECLARE v_precipDistance DECIMAL(6, 2);
    DECLARE v_tempDistance DECIMAL(6, 2);
    DECLARE v_combinedDistance DECIMAL(6, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT AnalogCountyID, Year, Month, Distance 
        FROM monthly_precipitation_distances_TEMP
        WHERE TargetCountyID = p_WICountyID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;

    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_month, v_precipDistance;
        
        IF v_done THEN
            LEAVE analog_loop;
        END
```
</details>

## `CalculateMonthlyPrecipitationDistances`

**Signature**

```sql
PROCEDURE CalculateMonthlyPrecipitationDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
  TRUNCATE TABLE monthly_precipitation_distances_TEMP;

  INSERT INTO monthly_precipitation_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Month, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    t.Month,
    ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2)
  FROM WICountyMonthlyPrecip_TEMP t
  JOIN monthly_precipitation_norms a
    ON a.Month = t.Month;

  REPLACE INTO monthly_precipitation_distances
    (TargetCountyID, AnalogCountyID, Year, Month, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Month, Distance
  FROM monthly_precipitation_distances_TEMP;
END
```
</details>

## `CalculateMonthlyPrecipitationDistancesForCounty`

**Signature**

```sql
PROCEDURE CalculateMonthlyPrecipitationDistancesForCounty(p_WICountyID INT)
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_month VARCHAR(2);
    DECLARE v_precipDistance DECIMAL(6, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT 
            a.CountyID AS AnalogCountyID, 
            t.Year, 
            t.Month, 
            ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2) AS Distance
        FROM WICountyMonthlyPrecip_TEMP t
        CROSS JOIN monthly_precipitation_norms a
        WHERE t.CountyID = p_WICountyID
          AND t.Month = a.Month;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;
    
    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_month, v_precipDistance;
        
        IF v_done THEN
            LEAVE analog_loop;
        END
```
</details>

## `CalculateMonthlyTemperatureDistances`

**Signature**

```sql
PROCEDURE CalculateMonthlyTemperatureDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
  TRUNCATE TABLE monthly_temperature_distances_TEMP;

  INSERT INTO monthly_temperature_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Month, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    t.Month,
    ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2)
  FROM WICountyMonthlyTemp_TEMP t
  JOIN monthly_temperature_norms a
    ON a.Month = t.Month;

  REPLACE INTO monthly_temperature_distances
    (TargetCountyID, AnalogCountyID, Year, Month, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Month, Distance
  FROM monthly_temperature_distances_TEMP;
END
```
</details>

## `CalculateMonthlyTemperatureDistancesForCounty`

**Signature**

```sql
PROCEDURE CalculateMonthlyTemperatureDistancesForCounty(p_WICountyID INT)
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_month VARCHAR(2);
    DECLARE v_tempDistance DECIMAL(6, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT 
            a.CountyID AS AnalogCountyID, 
            t.Year, 
            t.Month, 
            ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2) AS Distance
        FROM WICountyMonthlyTemp_TEMP t
        CROSS JOIN monthly_temperature_norms a
        WHERE t.CountyID = p_WICountyID AND t.Month = a.Month;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;
    
    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_month, v_tempDistance;
        
        IF v_done THEN
            LEAVE analog_loop;
        END
```
</details>

## `CalculateSeasonalCombinedDistances`

**Signature**

```sql
PROCEDURE CalculateSeasonalCombinedDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
  
  REPLACE INTO seasonal_combined_distances
    (TargetCountyID, AnalogCountyID, Year, Season, Distance)
  SELECT
    p.TargetCountyID,
    p.AnalogCountyID,
    p.Year,
    p.Season,
    ROUND(SQRT(POW(p.Distance, 2) + POW(t.Distance, 2)), 2) AS Distance
  FROM seasonal_precipitation_distances_TEMP p
  JOIN seasonal_temperature_distances_TEMP   t
    ON t.TargetCountyID = p.TargetCountyID
   AND t.AnalogCountyID = p.AnalogCountyID
   AND t.Year           = p.Year
   AND t.Season         = p.Season;

  TRUNCATE TABLE seasonal_precipitation_distances_TEMP;
  TRUNCATE TABLE seasonal_temperature_distances_TEMP;

  
  
  
END
```
</details>

## `CalculateSeasonalCombinedDistancesForCounty`

**Signature**

```sql
PROCEDURE CalculateSeasonalCombinedDistancesForCounty(p_WICountyID INT)
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_season VARCHAR(6);
    DECLARE v_precipDistance DECIMAL(5, 2);
    DECLARE v_tempDistance DECIMAL(5, 2);
    DECLARE v_combinedDistance DECIMAL(5, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT AnalogCountyID, Year, Season, Distance 
        FROM seasonal_precipitation_distances_TEMP 
        WHERE TargetCountyID = p_WICountyID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;
    
    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_season, v_precipDistance;
        
        IF v_done THEN
            LEAVE analog_loop;
        END
```
</details>

## `CalculateSeasonalPrecipitationDistances`

**Signature**

```sql
PROCEDURE CalculateSeasonalPrecipitationDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
  TRUNCATE TABLE seasonal_precipitation_distances_TEMP;

  INSERT INTO seasonal_precipitation_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Season, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    t.Season,
    ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2)
  FROM WICountySeasonalPrecip_TEMP t
  JOIN seasonal_precipitation_norms a
    ON a.Season = t.Season;

  REPLACE INTO seasonal_precipitation_distances
    (TargetCountyID, AnalogCountyID, Year, Season, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Season, Distance
  FROM seasonal_precipitation_distances_TEMP;
END
```
</details>

## `CalculateSeasonalPrecipitationDistancesForCounty`

**Signature**

```sql
PROCEDURE CalculateSeasonalPrecipitationDistancesForCounty(p_WICountyID INT)
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_season VARCHAR(6);
    DECLARE v_precipDistance DECIMAL(5, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT a.CountyID AS AnalogCountyID, t.Year, t.Season, 
               ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2) AS Distance
        FROM WICountySeasonalPrecip_TEMP t
        CROSS JOIN seasonal_precipitation_norms a
        WHERE t.CountyID = p_WICountyID AND t.Season = a.Season;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;

    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_season, v_precipDistance;

        IF v_done THEN
            LEAVE analog_loop;
        END
```
</details>

## `CalculateSeasonalTemperatureDistances`

**Signature**

```sql
PROCEDURE CalculateSeasonalTemperatureDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
  TRUNCATE TABLE seasonal_temperature_distances_TEMP;

  INSERT INTO seasonal_temperature_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Season, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    t.Season,
    ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2)
  FROM WICountySeasonalTemp_TEMP t
  JOIN seasonal_temperature_norms a
    ON a.Season = t.Season;

  REPLACE INTO seasonal_temperature_distances
    (TargetCountyID, AnalogCountyID, Year, Season, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Season, Distance
  FROM seasonal_temperature_distances_TEMP;
END
```
</details>

## `CalculateSeasonalTemperatureDistancesForCounty`

**Signature**

```sql
PROCEDURE CalculateSeasonalTemperatureDistancesForCounty(p_WICountyID INT)
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_season VARCHAR(6);
    DECLARE v_tempDistance DECIMAL(5, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT a.CountyID AS AnalogCountyID, t.Year, t.Season, 
               ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2) AS Distance
        FROM WICountySeasonalTemp_TEMP t
        CROSS JOIN seasonal_temperature_norms a
        WHERE t.CountyID = p_WICountyID AND t.Season = a.Season;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;

    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_season, v_tempDistance;

        IF v_done THEN
            LEAVE analog_loop;
        END
```
</details>

## `CalculateYearlyCombinedDistances`

**Signature**

```sql
PROCEDURE CalculateYearlyCombinedDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
  REPLACE INTO yearly_combined_distances
    (TargetCountyID, AnalogCountyID, Year, Distance)
  SELECT
    p.TargetCountyID,
    p.AnalogCountyID,
    p.Year,
    ROUND(SQRT(POW(p.Distance, 2) + POW(t.Distance, 2)), 2) AS Distance
  FROM yearly_precipitation_distances_TEMP p
  JOIN yearly_temperature_distances_TEMP   t
    ON t.TargetCountyID = p.TargetCountyID
   AND t.AnalogCountyID = p.AnalogCountyID
   AND t.Year           = p.Year;

  TRUNCATE TABLE yearly_precipitation_distances_TEMP;
  TRUNCATE TABLE yearly_temperature_distances_TEMP;

  
  

END
```
</details>

## `CalculateYearlyCombinedDistancesForCounty`

**Signature**

```sql
PROCEDURE CalculateYearlyCombinedDistancesForCounty(p_WICountyID INT)
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_precipDistance DECIMAL(5, 2);
    DECLARE v_tempDistance DECIMAL(5, 2);
    DECLARE v_combinedDistance DECIMAL(5, 2);

    DECLARE v_analogCursor CURSOR FOR 
        SELECT AnalogCountyID, Year, Distance 
        FROM yearly_precipitation_distances_TEMP
        WHERE TargetCountyID = p_WICountyID;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    OPEN v_analogCursor;
    
    analog_loop: LOOP
        FETCH v_analogCursor INTO v_analogCountyID, v_year, v_precipDistance;
        
        IF v_done THEN
            LEAVE analog_loop;
        END
```
</details>

## `CalculateYearlyPrecipitationDistances`

**Signature**

```sql
PROCEDURE CalculateYearlyPrecipitationDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
  
  TRUNCATE TABLE yearly_precipitation_distances_TEMP;

  INSERT INTO yearly_precipitation_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2)
  FROM WICountyYearlyPrecip_TEMP t
  CROSS JOIN yearly_precipitation_norms a;

  
  REPLACE INTO yearly_precipitation_distances
    (TargetCountyID, AnalogCountyID, Year, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Distance
  FROM yearly_precipitation_distances_TEMP;
END
```
</details>

## `CalculateYearlyPrecipitationDistancesForCounty`

**Signature**

```sql
PROCEDURE CalculateYearlyPrecipitationDistancesForCounty(p_WICountyID INT)
```

<details>
<summary>Body</summary>

```sql
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_analogCountyID INT;
    DECLARE v_year INT;
    DECLARE v_precipDistance DECIMAL(6, 2);
    DECLARE v_rank INT;

    
    CREATE TEMPORARY TABLE TempYearlyPrecipitationDistances (
        TargetCountyID INT,
        AnalogCountyID INT,
        Year INT,
        Distance DECIMAL(6, 2),
        PhysicalDistance DECIMAL(8, 6)
    );
    
    
    INSERT INTO TempYearlyPrecipitationDistances (TargetCountyID, AnalogCountyID, Year, Distance, PhysicalDistance)
    SELECT 
        p_WICountyID AS TargetCountyID, 
        a.CountyID AS AnalogCountyID, 
        t.Year, 
        ROUND(SQRT(POW((a.NormPrecipitation - t.Precipitation), 2) / POW(a.StdDevPrecipitation, 2)), 2) AS Distance,
        pd.PhysicalDistance
    FROM 
        yearly_precipitation_data_wi t
    JOIN 
        yearly_precipitation_norms a ON t.CountyID = p_WICountyID
    JOIN 
        PhysicalDistances pd ON pd.TargetCountyId = p_WICountyID AND pd.AnalogCountyId = a.CountyID;

    
    SET v_rank = 0;
    REPLACE INTO yearly_precipitation_distances (TargetCountyID, AnalogCountyID, Year, Distance, AnalogRank)
    SELECT 
        TargetCountyID, 
        AnalogCountyID, 
        Year, 
        Distance, 
        @v_rank := @v_rank + 1 AS AnalogRank
    FROM 
        TempYearlyPrecipitationDistances
    ORDER BY 
        Distance ASC, 
        PhysicalDistance ASC
    LIMIT 150;

    
    DROP TEMPORARY TABLE IF EXISTS TempYearlyPrecipitationDistances;

END
```
</details>

## `CalculateYearlyTemperatureDistances`

**Signature**

```sql
PROCEDURE CalculateYearlyTemperatureDistances()
```

<details>
<summary>Body</summary>

```sql
BEGIN
  TRUNCATE TABLE yearly_temperature_distances_TEMP;

  INSERT INTO yearly_temperature_distances_TEMP
    (TargetCountyID, AnalogCountyID, Year, Distance)
  SELECT
    t.CountyID,
    a.CountyID,
    t.Year,
    ROUND(SQRT(POW((a.NormTemperature - t.Temperature), 2) / POW(a.StdDevTemperature, 2)), 2)
  FROM WICountyYearlyTemp_TEMP t
  CROSS JOIN yearly_temperature_norms a;

  REPLACE INTO yearly_temperature_distances
    (TargetCountyID, AnalogCountyID, Year, Distance)
  SELECT TargetCountyID, AnalogCountyID, Year, Distance
  FROM yearly_temperature_distances_TEMP;
END
```
</details>

## `GetAllTopCombinedAnalogsForCountyByMonth`

**Signature**

```sql
PROCEDURE GetAllTopCombinedAnalogsForCountyByMonth(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Month,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.StateAbbr AS AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.Precipitation AS TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.Temperature AS TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.AnalogCountyLatitude,
            subquery.Longitude AS AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr,
                d.Distance,
                pd.Precipitation,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                td.Temperature,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year
                    ORDER BY d.Distance, 
                    SQRT(POW(tc.Latitude - ac.Latitude, 2) + POW(tc.Longitude - ac.Longitude, 2))
                ) AS rn
            FROM monthly_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year AND d.Month = pd.Month
            JOIN monthly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID AND d.Month = pn.Month
            JOIN monthly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Month = td.Month
            JOIN monthly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Month = tn.Month
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Month = p_Month
        ) AS subquery
        WHERE subquery.rn = 1;
    END
```
</details>

## `GetAllTopCombinedAnalogsForCountyBySeason`

**Signature**

```sql
PROCEDURE GetAllTopCombinedAnalogsForCountyBySeason(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Season,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude,
            subquery.rn AS RowNumber
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                tn.NormTemperature AS AnalogTempNormal,
                pd.Precipitation AS TargetPrecipValue,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year, d.Season
                    ORDER BY d.Distance, 
                             pdist.PhysicalDistance
                ) AS rn
            FROM seasonal_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Season = td.Season
            JOIN seasonal_temperature_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Season = tn.Season
            JOIN seasonal_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year AND d.Season = pd.Season
            JOIN seasonal_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID AND d.Season = pn.Season
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Season = p_Season
        ) AS subquery
        WHERE subquery.rn = 1;
    END
```
</details>

## `GetAllTopCombinedAnalogsForCountyByYear`

**Signature**

```sql
PROCEDURE GetAllTopCombinedAnalogsForCountyByYear(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetTempValue,
            subquery.TargetPrecipValue,
            subquery.AnalogTempNormal,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                pd.Precipitation AS TargetPrecipValue,
                tn.NormTemperature AS AnalogTempNormal,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    pdist.PhysicalDistance
                ) AS rn
            FROM yearly_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year
            JOIN yearly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year
            JOIN yearly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID
            JOIN yearly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
        ) AS subquery
        WHERE subquery.rn = 1;
    END
```
</details>

## `GetAllTopPrecipAnalogsForCountyByMonth`

**Signature**

```sql
PROCEDURE GetAllTopPrecipAnalogsForCountyByMonth(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Month,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.StateAbbr AS AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr,
                d.Distance,
                pd.Precipitation AS TargetPrecipValue,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    SQRT(POW(tc.Latitude - ac.Latitude, 2) + POW(tc.Longitude - ac.Longitude, 2))
                ) AS rn
            FROM monthly_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year AND d.Month = pd.Month
            JOIN monthly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID AND d.Month = pn.Month
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Month = p_Month
        ) AS subquery
        WHERE subquery.rn = 1;
    END
```
</details>

## `GetAllTopPrecipAnalogsForCountyBySeason`

**Signature**

```sql
PROCEDURE GetAllTopPrecipAnalogsForCountyBySeason(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Season,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.StateAbbr AS AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.Precipitation AS TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr,
                d.Distance,
                pd.Precipitation,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year, d.Season
                    ORDER BY d.Distance, 
                    SQRT(POW(tc.Latitude - ac.Latitude, 2) + POW(tc.Longitude - ac.Longitude, 2))
                ) AS rn
            FROM seasonal_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year AND d.Season = pd.Season
            JOIN seasonal_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID AND d.Season = pn.Season
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Season = p_Season
        ) AS subquery
        WHERE subquery.rn = 1;
    END
```
</details>

## `GetAllTopPrecipAnalogsForCountyByYear`

**Signature**

```sql
PROCEDURE GetAllTopPrecipAnalogsForCountyByYear(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.Precipitation AS TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pd.Precipitation,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    pdist.PhysicalDistance
                ) AS rn
            FROM yearly_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year
            JOIN yearly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
        ) AS subquery
        WHERE subquery.rn = 1;
    END
```
</details>

## `GetAllTopTempAnalogsForCountyByMonth`

**Signature**

```sql
PROCEDURE GetAllTopTempAnalogsForCountyByMonth(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Month,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.StateAbbr AS AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.Temperature AS TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr,
                d.Distance,
                td.Temperature,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year
                    ORDER BY d.Distance, 
                    SQRT(POW(tc.Latitude - ac.Latitude, 2) + POW(tc.Longitude - ac.Longitude, 2))
                ) AS rn
            FROM monthly_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Month = td.Month
            JOIN monthly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Month = tn.Month
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Month = p_Month
        ) AS subquery
        WHERE subquery.rn = 1;
    END
```
</details>

## `GetAllTopTempAnalogsForCountyBySeason`

**Signature**

```sql
PROCEDURE GetAllTopTempAnalogsForCountyBySeason(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.Season,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.Temperature AS TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year, d.Season
                    ORDER BY d.Distance, 
                    SQRT(POW(tc.Latitude - ac.Latitude, 2) + POW(tc.Longitude - ac.Longitude, 2))
                ) AS rn
            FROM seasonal_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Season = td.Season
            JOIN seasonal_temperature_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Season = tn.Season
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Season = p_Season
        ) AS subquery
        WHERE subquery.rn = 1;
    END
```
</details>

## `GetAllTopTempAnalogsForCountyByYear`

**Signature**

```sql
PROCEDURE GetAllTopTempAnalogsForCountyByYear(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    pdist.PhysicalDistance
                ) AS rn
            FROM yearly_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year
            JOIN yearly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
        ) AS subquery
        WHERE subquery.rn = 1;
    END
```
</details>

## `GetCombinedAnalogsForCountyByYearAndMonth`

**Signature**

```sql
PROCEDURE GetCombinedAnalogsForCountyByYearAndMonth(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Year INT,
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pdist.PhysicalDistance,
                spd.Precipitation AS TargetPrecipValue,
                spn.NormPrecipitation AS AnalogPrecipNormal,
                std.Temperature AS TargetTempValue,
                stn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Month, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM monthly_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_precipitation_data_wi spd ON d.TargetCountyID = spd.CountyID AND d.Year = spd.Year AND d.Month = spd.Month
            JOIN monthly_precipitation_norms spn ON d.AnalogCountyID = spn.CountyID AND d.Month = spn.Month
            JOIN monthly_temperature_data_wi std ON d.TargetCountyID = std.CountyID AND d.Year = std.Year AND d.Month = std.Month
            JOIN monthly_temperature_norms stn ON d.AnalogCountyID = stn.CountyID AND d.Month = stn.Month
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Month = p_Month
             
        )
        SELECT * FROM RankedAnalogs
        WHERE RowNumber <= 50;  
    END
```
</details>

## `GetCombinedAnalogsForCountyByYearAndSeason`

**Signature**

```sql
PROCEDURE GetCombinedAnalogsForCountyByYearAndSeason(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Year INT,
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pdist.PhysicalDistance,
                spd.Precipitation AS TargetPrecipValue,
                spn.NormPrecipitation AS AnalogPrecipNormal,
                std.Temperature AS TargetTempValue,
                stn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Season, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM seasonal_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_precipitation_data_wi spd ON d.TargetCountyID = spd.CountyID AND d.Year = spd.Year AND d.Season = spd.Season
            JOIN seasonal_precipitation_norms spn ON d.AnalogCountyID = spn.CountyID AND d.Season = spn.Season
            JOIN seasonal_temperature_data_wi std ON d.TargetCountyID = std.CountyID AND d.Year = std.Year AND d.Season = std.Season
            JOIN seasonal_temperature_norms stn ON d.AnalogCountyID = stn.CountyID AND d.Season = stn.Season
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Season = p_Season
              
        )
        SELECT * FROM RankedAnalogs
        WHERE RowNumber <= 50;  
    END
```
</details>

## `GetCountyIDByCodeAndState`

**Signature**

```sql
PROCEDURE GetCountyIDByCodeAndState(IN p_CountyCode VARCHAR(3)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_StateCode VARCHAR(2)
)
BEGIN
    SELECT CountyID 
    FROM Counties 
    WHERE CountyCode = p_CountyCode AND StateCode = p_StateCode;
END
```
</details>

## `GetPrecipAnalogsForCountyByYearAndMonth`

**Signature**

```sql
PROCEDURE GetPrecipAnalogsForCountyByYearAndMonth(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Year INT,
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedPrecipAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pdist.PhysicalDistance,
                spd.Precipitation AS TargetPrecipValue,
                spn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Month, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM monthly_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_precipitation_data_wi spd ON d.TargetCountyID = spd.CountyID AND d.Year = spd.Year AND d.Month = spd.Month
            JOIN monthly_precipitation_norms spn ON d.AnalogCountyID = spn.CountyID AND d.Month = spn.Month
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Month = p_Month
        )
        SELECT * FROM RankedPrecipAnalogs
        WHERE RowNumber <= 150;  
    END
```
</details>

## `GetPrecipAnalogsForCountyByYearAndSeason`

**Signature**

```sql
PROCEDURE GetPrecipAnalogsForCountyByYearAndSeason(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Year INT,
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedPrecipAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Precipitation AS TargetPrecipValue,
                tn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Season, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM seasonal_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_precipitation_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Season = td.Season
            JOIN seasonal_precipitation_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Season = tn.Season
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Season = p_Season
        
        )
        SELECT * FROM RankedPrecipAnalogs
        WHERE RowNumber <= 150;  
    END
```
</details>

## `GetTempAnalogsForCountyByYearAndMonth`

**Signature**

```sql
PROCEDURE GetTempAnalogsForCountyByYearAndMonth(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Year INT,
    IN p_Month VARCHAR(2)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedTempAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Month,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pdist.PhysicalDistance,
                std.Temperature AS TargetTempValue,
                stn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Month, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM monthly_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN monthly_temperature_data_wi std ON d.TargetCountyID = std.CountyID AND d.Year = std.Year AND d.Month = std.Month
            JOIN monthly_temperature_norms stn ON d.AnalogCountyID = stn.CountyID AND d.Month = stn.Month
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Month = p_Month
        )
        SELECT * FROM RankedTempAnalogs
        WHERE RowNumber <= 150;  
    END
```
</details>

## `GetTempAnalogsForCountyByYearAndSeason`

**Signature**

```sql
PROCEDURE GetTempAnalogsForCountyByYearAndSeason(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Year INT,
    IN p_Season VARCHAR(6)
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        WITH RankedTempAnalogs AS (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.Season,
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (PARTITION BY d.Season, d.Year ORDER BY d.Distance, pdist.PhysicalDistance) AS RowNumber
            FROM seasonal_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN seasonal_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year AND d.Season = td.Season
            JOIN seasonal_temperature_norms tn ON d.AnalogCountyID = tn.CountyID AND d.Season = tn.Season
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyId AND d.AnalogCountyID = pdist.AnalogCountyId
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              AND d.Season = p_Season
        )
        SELECT * FROM RankedTempAnalogs
        WHERE RowNumber <= 150;  
    END
```
</details>

## `GetTopCombinedAnalogsForCountyByYear`

**Signature**

```sql
PROCEDURE GetTopCombinedAnalogsForCountyByYear(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Year INT
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetTempValue,
            subquery.TargetPrecipValue,
            subquery.AnalogTempNormal,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude,
            subquery.rn AS RowNumber
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                pd.Precipitation AS TargetPrecipValue,
                tn.NormTemperature AS AnalogTempNormal,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                             pdist.PhysicalDistance
                ) AS rn
            FROM yearly_combined_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year
            JOIN yearly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year
            JOIN yearly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID
            JOIN yearly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
          
        ) AS subquery
        WHERE subquery.rn <= 50 
        ORDER BY subquery.rn;
    END
```
</details>

## `GetTopPrecipAnalogsForCountyByYear`

**Signature**

```sql
PROCEDURE GetTopPrecipAnalogsForCountyByYear(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Year INT
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetPrecipValue,
            subquery.AnalogPrecipNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude,
            subquery.rn AS RowNumber
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                pd.Precipitation AS TargetPrecipValue,
                pn.NormPrecipitation AS AnalogPrecipNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    pdist.PhysicalDistance
                ) AS rn
            FROM yearly_precipitation_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_precipitation_data_wi pd ON d.TargetCountyID = pd.CountyID AND d.Year = pd.Year
            JOIN yearly_precipitation_norms pn ON d.AnalogCountyID = pn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
        
        ) AS subquery
        WHERE subquery.rn <= 150 
        ORDER BY subquery.rn;
    END
```
</details>

## `GetTopTempAnalogsForCountyByYear`

**Signature**

```sql
PROCEDURE GetTopTempAnalogsForCountyByYear(IN p_TargetCountyName VARCHAR(100)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Year INT
)
BEGIN
    DECLARE v_TargetCountyID INT;

    
    SELECT CountyID INTO v_TargetCountyID
    FROM Counties
    WHERE CountyName = p_TargetCountyName
    LIMIT 1;

    
    IF v_TargetCountyID IS NULL THEN
        SELECT 'Target county not found' AS Error;
    ELSE
        
        SELECT 
            subquery.TargetCountyID,
            subquery.TargetCountyName,
            subquery.Year,
            subquery.AnalogCountyID,
            subquery.AnalogCountyName,
            subquery.AnalogCountyStateAbbr,
            subquery.Distance,
            subquery.TargetTempValue,
            subquery.AnalogTempNormal,
            subquery.AnalogCountyLatitude,
            subquery.AnalogCountyLongitude,
            subquery.rn AS RowNumber
        FROM (
            SELECT 
                d.TargetCountyID, 
                tc.CountyName AS TargetCountyName,
                d.Year, 
                d.AnalogCountyID, 
                ac.CountyName AS AnalogCountyName, 
                st.StateAbbr AS AnalogCountyStateAbbr,
                d.Distance,
                td.Temperature AS TargetTempValue,
                tn.NormTemperature AS AnalogTempNormal,
                ac.Latitude AS AnalogCountyLatitude,
                ac.Longitude AS AnalogCountyLongitude,
                ROW_NUMBER() OVER (
                    PARTITION BY d.Year 
                    ORDER BY d.Distance, 
                    pdist.PhysicalDistance
                ) AS rn
            FROM yearly_temperature_distances d
            JOIN Counties tc ON d.TargetCountyID = tc.CountyID
            JOIN Counties ac ON d.AnalogCountyID = ac.CountyID
            JOIN States st ON ac.StateCode = st.StateCode
            JOIN yearly_temperature_data_wi td ON d.TargetCountyID = td.CountyID AND d.Year = td.Year
            JOIN yearly_temperature_norms tn ON d.AnalogCountyID = tn.CountyID
            JOIN PhysicalDistances pdist ON d.TargetCountyID = pdist.TargetCountyID AND d.AnalogCountyID = pdist.AnalogCountyID
            WHERE d.TargetCountyID = v_TargetCountyID 
              AND d.Year = p_Year
              
        ) AS subquery
        WHERE subquery.rn <= 150 
        ORDER BY subquery.rn;
    END
```
</details>

## `InsertCounty`

**Signature**

```sql
PROCEDURE InsertCounty(IN p_CountyCode VARCHAR(3)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_CountyName VARCHAR(100),
    IN p_StateCode VARCHAR(2),
    IN p_Latitude DECIMAL(8, 6),
    IN p_Longitude DECIMAL(9, 6)
)
BEGIN

    
    REPLACE INTO Counties (CountyCode, CountyName, StateCode, Latitude, Longitude)
    VALUES (p_CountyCode, p_CountyName, p_StateCode, p_Latitude, p_Longitude);

END
```
</details>

## `InsertMonthlyPrecipitationNorms`

**Signature**

```sql
PROCEDURE InsertMonthlyPrecipitationNorms(IN p_CountyID INT, IN p_Month VARCHAR(2)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_NormPrecipitation DECIMAL(5, 2),
    IN p_StdDevPrecipitation DECIMAL(5, 2)
)
BEGIN
    
    INSERT INTO monthly_precipitation_norms (CountyID, Month, NormPrecipitation, StdDevPrecipitation)
    VALUES (p_CountyID, p_Month, p_NormPrecipitation, p_StdDevPrecipitation)
    ON DUPLICATE KEY UPDATE
        NormPrecipitation = VALUES(NormPrecipitation),
        StdDevPrecipitation = VALUES(StdDevPrecipitation);
END
```
</details>

## `InsertMonthlyPrecipitationWI`

**Signature**

```sql
PROCEDURE InsertMonthlyPrecipitationWI(IN p_CountyID INT, IN p_Year INT, IN p_Month VARCHAR(2)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Precipitation DECIMAL(5, 2)
)
BEGIN
    
    INSERT INTO monthly_precipitation_data_wi (CountyID, Year, Month, Precipitation)
    VALUES (p_CountyID, p_Year, p_Month, p_Precipitation)
    ON DUPLICATE KEY UPDATE
        Precipitation = VALUES(Precipitation);
END
```
</details>

## `InsertMonthlyTemperatureNorms`

**Signature**

```sql
PROCEDURE InsertMonthlyTemperatureNorms(IN p_CountyID INT, IN p_Month VARCHAR(2)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_NormTemperature DECIMAL(5, 2),
    IN p_StdDevTemperature DECIMAL(5, 2)
)
BEGIN
    
    INSERT INTO monthly_temperature_norms (CountyID, Month, NormTemperature, StdDevTemperature)
    VALUES (p_CountyID, p_Month, p_NormTemperature, p_StdDevTemperature)
    ON DUPLICATE KEY UPDATE
        NormTemperature = VALUES(NormTemperature),
        StdDevTemperature = VALUES(StdDevTemperature);
END
```
</details>

## `InsertMonthlyTemperatureWI`

**Signature**

```sql
PROCEDURE InsertMonthlyTemperatureWI(IN p_CountyID INT, IN p_Year INT, IN p_Month VARCHAR(2)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Temperature DECIMAL(5, 2)
)
BEGIN
    
    INSERT INTO monthly_temperature_data_wi (CountyID, Year, Month, Temperature)
    VALUES (p_CountyID, p_Year, p_Month, p_Temperature)
    ON DUPLICATE KEY UPDATE
        Temperature = VALUES(Temperature);
END
```
</details>

## `InsertSeasonalPrecipitationNorms`

**Signature**

```sql
PROCEDURE InsertSeasonalPrecipitationNorms(IN p_CountyID INT, IN p_Season VARCHAR(6)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_NormPrecipitation DECIMAL(5, 2),
    IN p_StdDevPrecipitation DECIMAL(5, 2)
)
BEGIN
    INSERT INTO seasonal_precipitation_norms (CountyID, Season, NormPrecipitation, StdDevPrecipitation)
    VALUES (p_CountyID, p_Season, p_NormPrecipitation, p_StdDevPrecipitation)
    ON DUPLICATE KEY UPDATE
        NormPrecipitation = p_NormPrecipitation,
        StdDevPrecipitation = p_StdDevPrecipitation;
END
```
</details>

## `InsertSeasonalPrecipitationWI`

**Signature**

```sql
PROCEDURE InsertSeasonalPrecipitationWI(IN p_CountyID INT, IN p_Year INT, IN p_Season VARCHAR(6)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Precipitation DECIMAL(5, 2)
)
BEGIN
    INSERT INTO seasonal_precipitation_data_wi (CountyID, Year, Season, Precipitation)
    VALUES (p_CountyID, p_Year, p_Season, p_Precipitation)
    ON DUPLICATE KEY UPDATE
        Precipitation = p_Precipitation;
END
```
</details>

## `InsertSeasonalTemperatureNorms`

**Signature**

```sql
PROCEDURE InsertSeasonalTemperatureNorms(IN p_CountyID INT, IN p_Season VARCHAR(6)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_NormTemperature DECIMAL(5, 2),
    IN p_StdDevTemperature DECIMAL(5, 2)
)
BEGIN
    INSERT INTO seasonal_temperature_norms (CountyID, Season, NormTemperature, StdDevTemperature)
    VALUES (p_CountyID, p_Season, p_NormTemperature, p_StdDevTemperature)
    ON DUPLICATE KEY UPDATE
        NormTemperature = p_NormTemperature,
        StdDevTemperature = p_StdDevTemperature;
END
```
</details>

## `InsertSeasonalTemperatureWI`

**Signature**

```sql
PROCEDURE InsertSeasonalTemperatureWI(IN p_CountyID INT, IN p_Year INT, IN p_Season VARCHAR(6)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_Temperature DECIMAL(5, 2)
)
BEGIN
    INSERT INTO seasonal_temperature_data_wi (CountyID, Year, Season, Temperature)
    VALUES (p_CountyID, p_Year, p_Season, p_Temperature)
    ON DUPLICATE KEY UPDATE
        Temperature = p_Temperature;
END
```
</details>

## `InsertState`

**Signature**

```sql
PROCEDURE InsertState(IN stateCode VARCHAR(2)
```

<details>
<summary>Body</summary>

```sql
,
    IN stateAbbr VARCHAR(2),
    IN stateName VARCHAR(100)
)
BEGIN
    
    REPLACE INTO States (StateCode, StateAbbr, StateName)
    VALUES (stateCode, stateAbbr, stateName);
END
```
</details>

## `InsertYearlyPrecipitationNorms`

**Signature**

```sql
PROCEDURE InsertYearlyPrecipitationNorms(IN p_CountyID INT, IN p_NormPrecipitation DECIMAL(5, 2)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_StdDevPrecipitation DECIMAL(5, 2)
)
BEGIN
    INSERT INTO yearly_precipitation_norms (CountyID, NormPrecipitation, StdDevPrecipitation)
    VALUES (p_CountyID, p_NormPrecipitation, p_StdDevPrecipitation)
    ON DUPLICATE KEY UPDATE
        NormPrecipitation = p_NormPrecipitation,
        StdDevPrecipitation = p_StdDevPrecipitation;
END
```
</details>

## `InsertYearlyPrecipitationWI`

**Signature**

```sql
PROCEDURE InsertYearlyPrecipitationWI(IN p_CountyID INT, IN p_Year INT, IN p_Precipitation DECIMAL(5, 2)
```

<details>
<summary>Body</summary>

```sql
)
BEGIN
    INSERT INTO yearly_precipitation_data_wi (CountyID, Year, Precipitation)
    VALUES (p_CountyID, p_Year, p_Precipitation)
    ON DUPLICATE KEY UPDATE
        Precipitation = p_Precipitation;
END
```
</details>

## `InsertYearlyTemperatureNorms`

**Signature**

```sql
PROCEDURE InsertYearlyTemperatureNorms(IN p_CountyID INT, IN p_NormTemperature DECIMAL(5, 2)
```

<details>
<summary>Body</summary>

```sql
,
    IN p_StdDevTemperature DECIMAL(5, 2)
)
BEGIN
    INSERT INTO yearly_temperature_norms (CountyID, NormTemperature, StdDevTemperature)
    VALUES (p_CountyID, p_NormTemperature, p_StdDevTemperature)
    ON DUPLICATE KEY UPDATE
        NormTemperature = p_NormTemperature,
        StdDevTemperature = p_StdDevTemperature;
END
```
</details>

## `InsertYearlyTemperatureWI`

**Signature**

```sql
PROCEDURE InsertYearlyTemperatureWI(IN p_CountyID INT, IN p_Year INT, IN p_Temperature DECIMAL(5, 2)
```

<details>
<summary>Body</summary>

```sql
)
BEGIN
    INSERT INTO yearly_temperature_data_wi (CountyID, Year, Temperature)
    VALUES (p_CountyID, p_Year, p_Temperature)
    ON DUPLICATE KEY UPDATE
        Temperature = p_Temperature;
END
```
</details>
