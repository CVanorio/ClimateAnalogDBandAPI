# Database Overview

This document describes the MySQL schema used by the Climate Analog Database & API.  
It covers the **purpose of each table group**, the **data flow** (ingest → temp → final → distances), and how to **recreate** the schema locally.

---

## Contents
- [High-Level Architecture](#high-level-architecture)
- [Data Flow (Ingest → Norms → Distances → Queries)](#data-flow-ingest--norms--distances--queries)
- [Table Groups](#table-groups)
  - [Reference Tables](#reference-tables)
  - [TEMP Staging Tables (Write-Once Per Run)](#temp-staging-tables-write-once-per-run)
  - [Final Fact Tables (WI data)](#final-fact-tables-wi-data)
  - [Norms Tables (1991–2020)](#norms-tables-19912020)
  - [Distance Tables (Euclidean)](#distance-tables-euclidean)
- [Stored Procedures](#stored-procedures)
- [Conventions](#conventions)
- [Recreating Schema Locally](#recreating-schema-locally)
- [Operational Notes](#operational-notes)

---

## High-Level Architecture

- **DB Engine:** MySQL
- **Primary Entities:** Counties (with lat/long), States
- **Facts:** Precipitation & Temperature for **Monthly**, **Seasonal**, and **Yearly** time scales (Wisconsin-focused final tables).
- **Norms:** Means & std dev computed over **1991–2020** for monthly/seasonal/yearly, per county.
- **Distances:** Euclidean distances computed for **precip**, **temp**, and **combined** across monthly/seasonal/yearly.
- **TEMP Tables:** Used to ingest and transform before copying into final fact tables (keeps ingestion idempotent).

---

## Data Flow (Ingest → Norms → Distances → Queries)

1. **Ingest NOAA files** via `/addallcountydata`:
   - Parse fixed-width lines.
   - Look up `CountyID` from `States`/`Counties`.
   - Write to `WICounty*_*_TEMP` tables (monthly/seasonal/yearly + precip/temp).

2. **Compute Norms (1991–2020)**:
   - Accumulate totals & std dev for monthly, seasonal, yearly windows.
   - Insert into `*_norms` tables.

3. **Copy TEMP → Final**:
   - `WICountyMonthlyPrecip_TEMP` → `monthly_precipitation_data_wi`
   - `WICountyMonthlyTemp_TEMP` → `monthly_temperature_data_wi`
   - (same for seasonal/yearly)

4. **Compute Distances**:
   - Fill `*_distances_TEMP` then write/merge into `*_distances` (and `*_combined_distances`).

5. **Query Layer**:
   - Stored procedures fetch **top analogs** by time-scale and year/season/month.

---

## Table Groups

### Reference Tables

- **`States`**  
  Canonical list of states.  
  _Used to resolve state codes during ingest._

- **`Counties`**  
  Canonical list of counties (`CountyID`, `CountyName`, `StateCode`, `Latitude`, `Longitude`).  
  _Used to resolve `CountyID` and provide spatial context._

- **`PhysicalDistances`** (optional / auxiliary)  
  If present, stores geodesic/physical distances between counties.

---

### TEMP Staging Tables (Write-Once Per Run)

Used during ingestion to stage values that are eventually copied into final fact tables. These are **dropped & recreated** each run.

- `WICountyMonthlyPrecip_TEMP`
- `WICountyMonthlyTemp_TEMP`
- `WICountySeasonalPrecip_TEMP`
- `WICountySeasonalTemp_TEMP`
- `WICountyYearlyPrecip_TEMP`
- `WICountyYearlyTemp_TEMP`

> **Why TEMP?**  
> - Keeps partial runs isolated  
> - Allows “insert ignore / replace” semantics safely  
> - Enables efficient bulk copy into final fact tables

---

### Final Fact Tables (WI data)

Hold the canonical time-series after TEMP copy:

- **Monthly**
  - `monthly_precipitation_data_wi`  
    - `(CountyID, Year, Month, Precipitation)`
  - `monthly_temperature_data_wi`  
    - `(CountyID, Year, Month, Temperature)`

- **Seasonal** (meteorological: DJF=**winter**, MAM, JJA, SON)
  - `seasonal_precipitation_data_wi`  
    - `(CountyID, Year, Season, Precipitation)`
  - `seasonal_temperature_data_wi`  
    - `(CountyID, Year, Season, Temperature)`

- **Yearly**
  - `yearly_precipitation_data_wi`  
    - `(CountyID, Year, Precipitation)`
  - `yearly_temperature_data_wi`  
    - `(CountyID, Year, Temperature)`

> **Season boundaries (meteorological):**
> - **winter**: Dec (prev yr) + Jan + Feb  
> - **spring**: Mar + Apr + May  
> - **summer**: Jun + Jul + Aug  
> - **fall**: Sep + Oct + Nov

---

### Norms Tables (1991–2020)

Per-county mean/stddev for each time-scale (used to contextualize anomalies):

- `monthly_precipitation_norms`  
- `monthly_temperature_norms`  
- `seasonal_precipitation_norms`  
- `seasonal_temperature_norms`  
- `yearly_precipitation_norms`  
- `yearly_temperature_norms`

> **Window:** 1991–2020 inclusive, matching NOAA climate normals in code.  
> **Values:** mean and standard deviation by month/season/year.

---

### Distance Tables (Euclidean)

Distances computed between a **target county** and **analog counties** for each time-scale.

- **Monthly**
  - `monthly_precipitation_distances`
  - `monthly_temperature_distances`
  - `monthly_combined_distances`
  - TEMP variants during compute:
    - `monthly_precipitation_distances_TEMP`
    - `monthly_temperature_distances_TEMP`

- **Seasonal**
  - `seasonal_precipitation_distances`
  - `seasonal_temperature_distances`
  - `seasonal_combined_distances`
  - TEMP variants:
    - `seasonal_precipitation_distances_TEMP`
    - `seasonal_temperature_distances_TEMP`

- **Yearly**
  - `yearly_precipitation_distances`
  - `yearly_temperature_distances`
  - `yearly_combined_distances`
  - TEMP variants:
    - `yearly_precipitation_distances_TEMP`
    - `yearly_temperature_distances_TEMP`

> **Combined distances** use both precip and temp (the exact formula is encapsulated in stored procedures used by the backend).

---

## Stored Procedures

> See full signatures and bodies in [`docs/PROCEDURES.md`](./PROCEDURES.md).  
> Below is a functional grouping that matches the code:

- **Inserts / Norms**
  - `InsertMonthlyPrecipitationWI`, `InsertMonthlyTemperatureWI`
  - `InsertSeasonalPrecipitationWI`, `InsertSeasonalTemperatureWI`
  - `InsertYearlyPrecipitationWI`, `InsertYearlyTemperatureWI`
  - `InsertMonthlyPrecipitationNorms`, `InsertMonthlyTemperatureNorms`
  - `InsertSeasonalPrecipitationNorms`, `InsertSeasonalTemperatureNorms`
  - `InsertYearlyPrecipitationNorms`, `InsertYearlyTemperatureNorms`

- **Distance Calculations**
  - `CalculateMonthlyPrecipitationDistances`
  - `CalculateMonthlyTemperatureDistances`
  - `CalculateAllMonthlyCombinedDistances`
  - `CalculateSeasonalPrecipitationDistances`
  - `CalculateSeasonalTemperatureDistances`
  - `CalculateAllSeasonalCombinedDistances`
  - `CalculateYearlyPrecipitationDistances`
  - `CalculateYearlyTemperatureDistances`
  - `CalculateYearlyCombinedDistances`

- **Lookup / Helpers**
  - `GetCountyIDByCodeAndState`
  - `InsertCounty`, `InsertState`

- **Top Analogs (Query API)**
  - **By Year (all years / specific year)**
    - `GetAllTopPrecipAnalogsForCountyByYear`
    - `GetAllTopTempAnalogsForCountyByYear`
    - `GetAllTopCombinedAnalogsForCountyByYear`
    - `GetTopPrecipAnalogsForCountyByYear`
    - `GetTopTempAnalogsForCountyByYear`
    - `GetTopCombinedAnalogsForCountyByYear`
  - **By Season**
    - `GetAllTopPrecipAnalogsForCountyBySeason`
    - `GetAllTopTempAnalogsForCountyBySeason`
    - `GetAllTopCombinedAnalogsForCountyBySeason`
    - `GetPrecipAnalogsForCountyByYearAndSeason`
    - `GetTempAnalogsForCountyByYearAndSeason`
    - `GetCombinedAnalogsForCountyByYearAndSeason`
  - **By Month**
    - `GetAllTopPrecipAnalogsForCountyByMonth`
    - `GetAllTopTempAnalogsForCountyByMonth`
    - `GetAllTopCombinedAnalogsForCountyByMonth`
    - `GetPrecipAnalogsForCountyByYearAndMonth`
    - `GetTempAnalogsForCountyByYearAndMonth`
    - `GetCombinedAnalogsForCountyByYearAndMonth`

---

## Conventions

- **Months** stored as zero-padded strings: `'01'`–`'12'`.
- **Seasons** stored as lowercase strings: `'winter' | 'spring' | 'summer' | 'fall'`.
- **Invalid NOAA values**: `-9.99` / `-99.90` are **ignored** in aggregates.
- **TEMP tables** are **dropped and recreated** during each ingest run.
- **Wisconsin focus**: Final fact tables are suffixed with `_wi` and store WI county time series.

---

## Recreating Schema Locally

Use the dump (schema-only + routines) and restore:

**Create dump (from remote):**
```bash
mysqldump -u <user> -h <host> -P <port> -p \
  --no-data --routines --no-tablespaces \
  climate-change-app > docs/db-dump.sql
```

Restore into local DB (example):
```bash
# Create (if needed)
mysql -u root -p -e "CREATE DATABASE climate_change_app_local;"
# Import
mysql -u root -p climate_change_app_local < docs/db-dump.sql
```
