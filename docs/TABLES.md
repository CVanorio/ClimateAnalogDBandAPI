# Tables

## `Counties`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  | AUTO_INCREMENT |
| `CountyCode` | `varchar(3)` | NO |  |  |
| `CountyName` | `varchar(100)` | NO |  |  |
| `StateCode` | `varchar(2)` | NO |  |  |

**Primary Key**

`CountyID`

**Foreign Keys**
- `StateCode` → `States`(`StateCode`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `Counties` (
  `CountyID` int NOT NULL AUTO_INCREMENT,
  `CountyCode` varchar(3) NOT NULL,
  `CountyName` varchar(100) NOT NULL,
  `StateCode` varchar(2) NOT NULL,
  `Latitude` decimal(8,6) NOT NULL,
  `Longitude` decimal(9,6) NOT NULL,
  PRIMARY KEY (`CountyID`),
  KEY `StateCode` (`StateCode`),
  CONSTRAINT `Counties_ibfk_1` FOREIGN KEY (`StateCode`) REFERENCES `States` (`StateCode`)
);
```
</details>

## `monthly_combined_distances`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Month` | `varchar(2)` | NO |  |  |
| `AnalogRank` | `int` | YES | `NULL` |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`, `Month`

**Foreign Keys**
- `TargetCountyID` → `Counties`(`CountyID`)
- `AnalogCountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `monthly_combined_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Distance` decimal(6,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Month`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `monthly_combined_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `monthly_combined_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `monthly_precipitation_data_TargetState`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Month` | `varchar(2)` | NO |  |  |

**Primary Key**

`CountyID`, `Year`, `Month`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `monthly_precipitation_data_TargetState` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Precipitation` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`,`Month`),
  CONSTRAINT `monthly_precipitation_data_TargetState_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `monthly_precipitation_distances`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Month` | `varchar(2)` | NO |  |  |
| `AnalogRank` | `int` | YES | `NULL` |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`, `Month`

**Foreign Keys**
- `TargetCountyID` → `Counties`(`CountyID`)
- `AnalogCountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `monthly_precipitation_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Distance` decimal(6,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Month`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `monthly_precipitation_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `monthly_precipitation_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `monthly_precipitation_distances_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Month` | `varchar(2)` | NO |  |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`, `Month`

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `monthly_precipitation_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Month`)
);
```
</details>

## `monthly_precipitation_norms`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |
| `Month` | `varchar(2)` | NO |  |  |

**Primary Key**

`CountyID`, `Month`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `monthly_precipitation_norms` (
  `CountyID` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `NormPrecipitation` decimal(5,2) NOT NULL,
  `StdDevPrecipitation` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`,`Month`),
  CONSTRAINT `monthly_precipitation_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_monthly_precip_stddev_pos` CHECK ((`StdDevPrecipitation` > 0))
);
```
</details>

## `monthly_temperature_data_TargetState`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Month` | `varchar(2)` | NO |  |  |

**Primary Key**

`CountyID`, `Year`, `Month`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `monthly_temperature_data_TargetState` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Temperature` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`,`Month`),
  CONSTRAINT `monthly_temperature_data_TargetState_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `monthly_temperature_distances`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Month` | `varchar(2)` | NO |  |  |
| `AnalogRank` | `int` | YES | `NULL` |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`, `Month`

**Foreign Keys**
- `TargetCountyID` → `Counties`(`CountyID`)
- `AnalogCountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `monthly_temperature_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Distance` decimal(6,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Month`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `monthly_temperature_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `monthly_temperature_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `monthly_temperature_distances_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Month` | `varchar(2)` | NO |  |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`, `Month`

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `monthly_temperature_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Month`)
);
```
</details>

## `monthly_temperature_norms`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |
| `Month` | `varchar(2)` | NO |  |  |

**Primary Key**

`CountyID`, `Month`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `monthly_temperature_norms` (
  `CountyID` int NOT NULL,
  `Month` varchar(2) NOT NULL,
  `NormTemperature` decimal(5,2) NOT NULL,
  `StdDevTemperature` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`,`Month`),
  CONSTRAINT `monthly_temperature_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_monthly_temp_stddev_pos` CHECK ((`StdDevTemperature` > 0))
);
```
</details>

## `PhysicalDistances`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyId` | `int` | NO |  |  |
| `AnalogCountyId` | `int` | NO |  |  |

**Primary Key**

`TargetCountyId`, `AnalogCountyId`

**Foreign Keys**
- `TargetCountyId` → `Counties`(`CountyID`)
- `AnalogCountyId` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `PhysicalDistances` (
  `TargetCountyId` int NOT NULL,
  `AnalogCountyId` int NOT NULL,
  `PhysicalDistance` decimal(8,6) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyId`,`AnalogCountyId`),
  KEY `AnalogCountyId` (`AnalogCountyId`),
  CONSTRAINT `PhysicalDistances_ibfk_1` FOREIGN KEY (`TargetCountyId`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `PhysicalDistances_ibfk_2` FOREIGN KEY (`AnalogCountyId`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `seasonal_combined_distances`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Season` | `varchar(6)` | NO |  |  |
| `AnalogRank` | `int` | YES | `NULL` |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`, `Season`

**Foreign Keys**
- `TargetCountyID` → `Counties`(`CountyID`)
- `AnalogCountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `seasonal_combined_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Season`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `seasonal_combined_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `seasonal_combined_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `seasonal_precipitation_data_TargetState`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Season` | `varchar(6)` | NO |  |  |

**Primary Key**

`CountyID`, `Year`, `Season`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `seasonal_precipitation_data_TargetState` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Precipitation` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`,`Season`),
  CONSTRAINT `seasonal_precipitation_data_TargetState_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `seasonal_precipitation_distances`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Season` | `varchar(6)` | NO |  |  |
| `AnalogRank` | `int` | YES | `NULL` |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`, `Season`

**Foreign Keys**
- `TargetCountyID` → `Counties`(`CountyID`)
- `AnalogCountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `seasonal_precipitation_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Season`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `seasonal_precipitation_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `seasonal_precipitation_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `seasonal_precipitation_distances_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Season` | `varchar(6)` | NO |  |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`, `Season`

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `seasonal_precipitation_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Season`)
);
```
</details>

## `seasonal_precipitation_norms`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |
| `Season` | `varchar(6)` | NO |  |  |

**Primary Key**

`CountyID`, `Season`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `seasonal_precipitation_norms` (
  `CountyID` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `NormPrecipitation` decimal(5,2) NOT NULL,
  `StdDevPrecipitation` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`,`Season`),
  CONSTRAINT `seasonal_precipitation_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_seasonal_precip_stddev_pos` CHECK ((`StdDevPrecipitation` > 0))
);
```
</details>

## `seasonal_temperature_data_TargetState`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Season` | `varchar(6)` | NO |  |  |

**Primary Key**

`CountyID`, `Year`, `Season`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `seasonal_temperature_data_TargetState` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Temperature` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`,`Season`),
  CONSTRAINT `seasonal_temperature_data_TargetState_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `seasonal_temperature_distances`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Season` | `varchar(6)` | NO |  |  |
| `AnalogRank` | `int` | YES | `NULL` |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`, `Season`

**Foreign Keys**
- `TargetCountyID` → `Counties`(`CountyID`)
- `AnalogCountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `seasonal_temperature_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Season`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `seasonal_temperature_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `seasonal_temperature_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `seasonal_temperature_distances_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `Season` | `varchar(6)` | NO |  |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`, `Season`

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `seasonal_temperature_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`,`Season`)
);
```
</details>

## `seasonal_temperature_norms`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |
| `Season` | `varchar(6)` | NO |  |  |

**Primary Key**

`CountyID`, `Season`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `seasonal_temperature_norms` (
  `CountyID` int NOT NULL,
  `Season` varchar(6) NOT NULL,
  `NormTemperature` decimal(5,2) NOT NULL,
  `StdDevTemperature` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`,`Season`),
  CONSTRAINT `seasonal_temperature_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_seasonal_temp_stddev_pos` CHECK ((`StdDevTemperature` > 0))
);
```
</details>

## `States`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `StateCode` | `varchar(2)` | NO |  |  |
| `StateAbbr` | `varchar(2)` | NO |  |  |
| `StateName` | `varchar(100)` | NO |  |  |

**Primary Key**

`StateCode`

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `States` (
  `StateCode` varchar(2) NOT NULL,
  `StateAbbr` varchar(2) NOT NULL,
  `StateName` varchar(100) NOT NULL,
  PRIMARY KEY (`StateCode`)
);
```
</details>

## `TargetStateCountyMonthlyPrecip_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | YES | `NULL` |  |
| `Year` | `int` | YES | `NULL` |  |
| `Month` | `char(2)` | YES | `NULL` |  |
| `Precipitation` | `float` | YES | `NULL` |  |

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `TargetStateCountyMonthlyPrecip_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Month` char(2) DEFAULT NULL,
  `Precipitation` float DEFAULT NULL
);
```
</details>

## `TargetStateCountyMonthlyTemp_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | YES | `NULL` |  |
| `Year` | `int` | YES | `NULL` |  |
| `Month` | `char(2)` | YES | `NULL` |  |
| `Temperature` | `float` | YES | `NULL` |  |

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `TargetStateCountyMonthlyTemp_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Month` char(2) DEFAULT NULL,
  `Temperature` float DEFAULT NULL
);
```
</details>

## `TargetStateCountySeasonalPrecip_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | YES | `NULL` |  |
| `Year` | `int` | YES | `NULL` |  |
| `Season` | `varchar(10)` | YES | `NULL` |  |
| `Precipitation` | `float` | YES | `NULL` |  |

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `TargetStateCountySeasonalPrecip_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Season` varchar(10) DEFAULT NULL,
  `Precipitation` float DEFAULT NULL
);
```
</details>

## `TargetStateCountySeasonalTemp_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | YES | `NULL` |  |
| `Year` | `int` | YES | `NULL` |  |
| `Season` | `varchar(10)` | YES | `NULL` |  |
| `Temperature` | `float` | YES | `NULL` |  |

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `TargetStateCountySeasonalTemp_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Season` varchar(10) DEFAULT NULL,
  `Temperature` float DEFAULT NULL
);
```
</details>

## `TargetStateCountyYearlyPrecip_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | YES | `NULL` |  |
| `Year` | `int` | YES | `NULL` |  |
| `Precipitation` | `float` | YES | `NULL` |  |

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `TargetStateCountyYearlyPrecip_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Precipitation` float DEFAULT NULL
);
```
</details>

## `TargetStateCountyYearlyTemp_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | YES | `NULL` |  |
| `Year` | `int` | YES | `NULL` |  |
| `Temperature` | `float` | YES | `NULL` |  |

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `TargetStateCountyYearlyTemp_TEMP` (
  `CountyID` int DEFAULT NULL,
  `Year` int DEFAULT NULL,
  `Temperature` float DEFAULT NULL
);
```
</details>

## `yearly_combined_distances`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `AnalogRank` | `int` | YES | `NULL` |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`

**Foreign Keys**
- `TargetCountyID` → `Counties`(`CountyID`)
- `AnalogCountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `yearly_combined_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `yearly_combined_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `yearly_combined_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `yearly_precipitation_data_TargetState`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |

**Primary Key**

`CountyID`, `Year`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `yearly_precipitation_data_TargetState` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Precipitation` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`),
  CONSTRAINT `yearly_precipitation_data_TargetState_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `yearly_precipitation_distances`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `AnalogRank` | `int` | YES | `NULL` |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`

**Foreign Keys**
- `TargetCountyID` → `Counties`(`CountyID`)
- `AnalogCountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `yearly_precipitation_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `yearly_precipitation_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `yearly_precipitation_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `yearly_precipitation_distances_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `yearly_precipitation_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`)
);
```
</details>

## `yearly_precipitation_norms`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |

**Primary Key**

`CountyID`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `yearly_precipitation_norms` (
  `CountyID` int NOT NULL,
  `NormPrecipitation` decimal(5,2) NOT NULL,
  `StdDevPrecipitation` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`),
  CONSTRAINT `yearly_precipitation_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_yearly_precip_stddev_pos` CHECK ((`StdDevPrecipitation` > 0))
);
```
</details>

## `yearly_temperature_data_TargetState`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |

**Primary Key**

`CountyID`, `Year`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `yearly_temperature_data_TargetState` (
  `CountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Temperature` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`CountyID`,`Year`),
  CONSTRAINT `yearly_temperature_data_TargetState_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `yearly_temperature_distances`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |
| `AnalogRank` | `int` | YES | `NULL` |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`

**Foreign Keys**
- `TargetCountyID` → `Counties`(`CountyID`)
- `AnalogCountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `yearly_temperature_distances` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  `AnalogRank` int DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`),
  KEY `AnalogCountyID` (`AnalogCountyID`),
  CONSTRAINT `yearly_temperature_distances_ibfk_1` FOREIGN KEY (`TargetCountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `yearly_temperature_distances_ibfk_2` FOREIGN KEY (`AnalogCountyID`) REFERENCES `Counties` (`CountyID`)
);
```
</details>

## `yearly_temperature_distances_TEMP`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `TargetCountyID` | `int` | NO |  |  |
| `AnalogCountyID` | `int` | NO |  |  |
| `Year` | `int` | NO |  |  |

**Primary Key**

`TargetCountyID`, `AnalogCountyID`, `Year`

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `yearly_temperature_distances_TEMP` (
  `TargetCountyID` int NOT NULL,
  `AnalogCountyID` int NOT NULL,
  `Year` int NOT NULL,
  `Distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`TargetCountyID`,`AnalogCountyID`,`Year`)
);
```
</details>

## `yearly_temperature_norms`

**Columns**

| Name | Type | Null | Default | Extra |
|------|------|------|---------|-------|
| `CountyID` | `int` | NO |  |  |

**Primary Key**

`CountyID`

**Foreign Keys**
- `CountyID` → `Counties`(`CountyID`)

<details>
<summary>Full DDL</summary>

```sql
CREATE TABLE `yearly_temperature_norms` (
  `CountyID` int NOT NULL,
  `NormTemperature` decimal(5,2) NOT NULL,
  `StdDevTemperature` decimal(5,2) NOT NULL,
  PRIMARY KEY (`CountyID`),
  CONSTRAINT `yearly_temperature_norms_ibfk_1` FOREIGN KEY (`CountyID`) REFERENCES `Counties` (`CountyID`),
  CONSTRAINT `chk_yearly_temp_stddev_pos` CHECK ((`StdDevTemperature` > 0))
);
```
</details>
