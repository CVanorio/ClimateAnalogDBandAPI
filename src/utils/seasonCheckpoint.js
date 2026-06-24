// Utility to get the latest inserted season and year from combined_seasonal_distances
async function getLatestInsertedSeason(connection) {
  const [rows] = await connection.execute(`
    SELECT Year, Season FROM seasonal_combined_distances
    ORDER BY Year DESC,
      FIELD(Season, 'winter', 'spring', 'summer', 'fall') DESC
    LIMIT 1;
  `);
  if (!rows || rows.length === 0) return null;
  return { year: Number(rows[0].Year), season: rows[0].Season };
}

module.exports = { getLatestInsertedSeason };
