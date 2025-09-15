# Changing States in the Climate Analog Database & API

This project now uses **state-agnostic table names**, meaning all NOAA data for any state can be ingested into the same schema.  
Which states are processed is controlled entirely by the `TARGET_STATE_CODE` constant.

---

## Location of the Setting

`src/config/constants.js`

```js
module.exports = {
  // Control which states are ingested
  TARGET_STATE_CODE: null,
};
```

## Options

`TARGET_STATE_CODE` can be configured in **three ways**:

### 1. All States
```js
TARGET_STATE_CODE = null;
```

All states in the NOAA dataset will be ingested.

Useful for full-database builds.

### 2. Single State

TARGET_STATE_CODE = '47'; // Wisconsin 
OR
TARGET_STATE_CODE = ['47']; 

Only rows matching the given StateCode will be ingested.

Replace '47' with the code for your target state.

### 3. Multiple States

```js
TARGET_STATE_CODE = ['47', '11']; // Wisconsin + Illinois
```
Any row where yearData.StateCode is '47' or '41' will be processed.
Add as many state codes as you like, and have the database resources to support.

## How It Works in Code

In the ingestion loop:

```js
const isTargetState =
  TARGET_STATE_CODE == null ||
  (Array.isArray(TARGET_STATE_CODE)
    ? TARGET_STATE_CODE.includes(yearData.StateCode)
    : yearData.StateCode === TARGET_STATE_CODE);

if (isTargetState && yearData.Year === latestYearMonth.year) {
  // Insert monthly, seasonal, and yearly data
}
```
If TARGET_STATE_CODE is null → all states pass.

If it’s a string → only that state passes.

If it’s an array → any state in the list passes.

## Finding State Codes

The codes used here are whatever values your States and Counties tables expect.
Examples (based on your current mapping):

'47' = Wisconsin

'41' = Texas

'04' = California

Check your States table, the JSON files (modified_states.json, modified_counties.json), or in ClimateAnalogDBandAPI\InitialSetup\StoreStatesAndCounties.js for the full list.

## Notes

- Since tables are state-agnostic, you do not need to rename or duplicate tables for new states.  
- Distances and norms will calculate across all available counties in the dataset.  
- Changing states does not affect API endpoints — they continue to query by `CountyID` and `StateCode`.