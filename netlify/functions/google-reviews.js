// Auto-sync Google review count (requires env vars on Netlify)
// GOOGLE_PLACE_ID = your Google Business Place ID
// GOOGLE_PLACES_API_KEY = API key with Places API (New) enabled

exports.handler = async function () {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!placeId || !apiKey) {
    return {
      statusCode: 503,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing Google API configuration' }),
    };
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'userRatingCount',
      },
    });

    if (!res.ok) throw new Error(`Places API ${res.status}`);

    const data = await res.json();
    const count = data.userRatingCount ?? 0;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
      body: JSON.stringify({ count }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
