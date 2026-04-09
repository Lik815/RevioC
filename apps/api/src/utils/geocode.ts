/**
 * Geocoding via Nominatim (OpenStreetMap) — no API key required.
 *
 * Rate limit: max 1 req/second per Nominatim usage policy.
 * For production with high volume, replace with Google Geocoding API:
 *   POST https://maps.googleapis.com/maps/api/geocode/json?address=...&key=GOOGLE_API_KEY
 */

import type { LocationPrecision } from '@revio/shared';

interface GeoResult {
  lat: number;
  lng: number;
}

type TherapistLocationInput = {
  city?: string | null;
  postalCode?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  locationPrecision?: LocationPrecision | null;
};

function cleanPart(value?: string | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildStreetLine(street?: string | null, houseNumber?: string | null) {
  return [cleanPart(street), cleanPart(houseNumber)].filter(Boolean).join(' ');
}

function buildCityLine(postalCode?: string | null, city?: string | null) {
  return [cleanPart(postalCode), cleanPart(city)].filter(Boolean).join(' ');
}

async function geocodeQuery(query: string): Promise<GeoResult | null> {
  if (!query.trim()) return null;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=de,at,ch`;

  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent identifying your app
        'User-Agent': 'Revio/1.0 (contact@revio.de)',
        'Accept-Language': 'de',
      },
    });
    if (!res.ok) return null;

    const data = await res.json() as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    // Geocoding is best-effort — don't fail the whole request if it errors
    return null;
  }
}

export async function geocodeAddress(address: string, city: string, postalCode?: string): Promise<GeoResult | null> {
  const query = [cleanPart(address), buildCityLine(postalCode, city)].filter(Boolean).join(', ');
  return geocodeQuery(query);
}

export function normalizeLocationPrecision(value?: string | null): LocationPrecision {
  return value === 'exact' ? 'exact' : 'approximate';
}

export async function geocodeTherapistLocation(input: TherapistLocationInput) {
  const precision = normalizeLocationPrecision(input.locationPrecision);
  const streetLine = buildStreetLine(input.street, input.houseNumber);
  const cityLine = buildCityLine(input.postalCode, input.city);
  const exactQuery = [streetLine, cityLine].filter(Boolean).join(', ');

  const exactCoords = await geocodeQuery(exactQuery || cleanPart(input.city));
  if (!exactCoords) {
    return {
      locationPrecision: precision,
      exactCoords: null,
      publicCoords: null,
    };
  }

  if (precision === 'exact') {
    return {
      locationPrecision: precision,
      exactCoords,
      publicCoords: exactCoords,
    };
  }

  const approximateQueries = [
    cityLine,
    cleanPart(input.city),
  ].filter((value, index, values) => value && values.indexOf(value) === index);

  for (const query of approximateQueries) {
    const publicCoords = await geocodeQuery(query);
    if (publicCoords) {
      return {
        locationPrecision: precision,
        exactCoords,
        publicCoords,
      };
    }
  }

  return {
    locationPrecision: precision,
    exactCoords,
    publicCoords: null,
  };
}
