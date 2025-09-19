# Updating Climatology Years

Climatology years are the baseline periods used to calculate **norms** (average and standard deviation values for temperature and precipitation).  
When the climatology window changes (e.g., from 1991–2020 to 2001–2030, once 2030 has completed), all norms must be recalculated to keep the database consistent.

---

## What This Means

- All `*_norms` tables depend on the climatology years:
  - `monthly_precipitation_norms`
  - `monthly_temperature_norms`
  - `seasonal_precipitation_norms`
  - `seasonal_temperature_norms`
  - `yearly_precipitation_norms`
  - `yearly_temperature_norms`

- Updating the climatology period requires **rerunning the code that calculates norms**.  
- Once norms are updated, all **distance calculations** (monthly, seasonal, yearly, combined) must be recomputed, since they are based on normalized values.

## Steps to Update

1. **Update Constants**
   - Open `src/config/constants.js`.
   - Update the climatology year range (e.g., climateNormalYears) to the new baseline.

   Example:
   ```js
   const climateNormalYears = [1991, 2020];
    ```

    - Update the feature flag NEW_CLIMATE_NORMALS to be True
    - This allows for all years to be reprocessed instead of only new years.

    Example:
   ```js
   const NEW_CLIMATE_NORMALS = true;
    ```

2. Clear Existing Norms

Run SQL commands to truncate the norms tables if you want a fresh rebuild:

```sql
TRUNCATE TABLE monthly_precipitation_norms;
TRUNCATE TABLE monthly_temperature_norms;
TRUNCATE TABLE seasonal_precipitation_norms;
TRUNCATE TABLE seasonal_temperature_norms;
TRUNCATE TABLE yearly_precipitation_norms;
TRUNCATE TABLE yearly_temperature_norms;
```

3. Re-Run Norm Calculation

Next, trigger the ingestion pipeline (/addallcountydata) or directly call the stored procedures that compute norms.

This will recalculate monthly, seasonal, and yearly averages/std dev for the new climatology period.

4. Recalculate Distances

Since norms have changed, all distance tables must be recomputed:

- monthly_*_distances

- seasonal_*_distances

- yearly_*_distances

- *_combined_distances

This can be done by rerunning the pipeline or calling the distance stored procedures manually.

## Example: Full Refresh

# 1. Update constants.js with new years
# 2. Truncate norms tables in MySQL
# 3. Comment out year filter code block in parse.service.js
# 4. Restart the server
```bash
npm start
```

# 5. Trigger full ingestion (rebuilds norms + distances)
```bash
curl \"http://localhost:3000/addallcountydata\"
```

This will rebuild:

- Norms for the new climatology baseline

- All distance calculations

- Updated outputs available through /getData

## Notes

- Always document which climatology years are active in your setup (e.g., in README or database metadata).

- If you want to support multiple climatology periods (e.g., 1981–2010 and 1991–2020), consider adding an extra column to your norms and distances tables instead of overwriting. Please note this will drastically increase database resources required.

- Depending on database size, a full rebuild may take several hours to a few days.
