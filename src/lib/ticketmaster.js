const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json'

function normalizeEvent(event) {
  return {
    name: event.name ?? 'Unknown Event',
    venue: event._embedded?.venues?.[0]?.name ?? 'Unknown Venue',
    date: event.dates?.start?.localDate ?? '',
    time: event.dates?.start?.localTime ?? '',
    category: event.classifications?.[0]?.segment?.name ?? 'Event',
    url: event.url ?? '',
  }
}

/**
 * Fetch local events from the Ticketmaster Discovery API.
 * Returns an empty array on ANY failure (missing key, network error, no results).
 *
 * @param {Object} profileA - Profile used for geo query (zip_code preferred, falls back to city)
 * @param {{ date: string }} timing
 * @returns {Promise<Array<{ name, venue, date, time, category, url }>>}
 */
export async function fetchLocalEvents(profileA, timing) {
  const apiKey = import.meta.env.VITE_TICKETMASTER_API_KEY

  if (!apiKey) {
    if (import.meta.env.DEV) {
      console.warn('[ticketmaster] VITE_TICKETMASTER_API_KEY not set — skipping event fetch')
    }
    return []
  }

  if (!timing?.date) return []

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      startDateTime: `${timing.date}T00:00:00Z`,
      endDateTime: `${timing.date}T23:59:59Z`,
      size: '10',
      sort: 'relevance,desc',
    })

    if (profileA?.zip_code) {
      params.set('postalCode', String(profileA.zip_code))
    } else if (profileA?.city) {
      params.set('city', profileA.city)
    } else {
      return []
    }

    const response = await fetch(`${BASE_URL}?${params.toString()}`)
    if (!response.ok) return []

    const data = await response.json()
    const events = data?._embedded?.events
    if (!Array.isArray(events) || events.length === 0) return []

    return events.map(normalizeEvent)
  } catch {
    return []
  }
}
