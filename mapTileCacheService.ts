import L from 'leaflet';

// Name of Cache Storage and IndexedDB DB
const TILE_CACHE_NAME = 'nirbhaya_map_tiles_v1';
const DB_NAME = 'NirbhayaMapTilesDB';
const STORE_NAME = 'tiles';
const DB_VERSION = 1;

// Maximum cached tiles in IndexedDB (~30-50MB safety limit for mobile browsers)
const MAX_CACHED_TILES = 1200;

/**
 * Open IndexedDB for offline tile storage (stores blob / data URL)
 */
function openTileDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db: IDBDatabase = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve cached tile data URL or blob from IndexedDB or CacheStorage
 */
export async function getCachedTile(key: string): Promise<string | null> {
  // Try CacheStorage first (fastest if supported)
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(TILE_CACHE_NAME);
      const response = await cache.match(key);
      if (response && response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      // Fallback to IndexedDB
    }
  }

  // Fallback to IndexedDB
  try {
    const db = await openTileDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result?.data) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

/**
 * Save tile to CacheStorage and IndexedDB
 */
export async function saveTileToCache(key: string, dataUrl: string, blob?: Blob): Promise<void> {
  // 1. Save to CacheStorage if available
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(TILE_CACHE_NAME);
      if (blob) {
        await cache.put(key, new Response(blob, {
          headers: { 'Content-Type': blob.type || 'image/png', 'Cache-Control': 'max-age=31536000' }
        }));
      } else if (dataUrl.startsWith('data:')) {
        const res = await fetch(dataUrl);
        const b = await res.blob();
        await cache.put(key, new Response(b, {
          headers: { 'Content-Type': 'image/png', 'Cache-Control': 'max-age=31536000' }
        }));
      }
    } catch (e) {
      // Silent catch
    }
  }

  // 2. Save to IndexedDB
  try {
    const db = await openTileDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    store.put({
      key,
      data: dataUrl,
      timestamp: Date.now()
    });

    // Cleanup oldest if limit exceeded
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      if (countRequest.result > MAX_CACHED_TILES) {
        const index = store.index('timestamp');
        const openCursor = index.openCursor();
        let deleted = 0;
        openCursor.onsuccess = (e: any) => {
          const cursor = e.target.result;
          if (cursor && deleted < 50) {
            store.delete(cursor.primaryKey);
            deleted++;
            cursor.continue();
          }
        };
      }
    };
  } catch (err) {
    // Non-fatal if quota exceeded
  }
}

/**
 * Get count of cached map tiles for emergency readiness indicator
 */
export async function getCachedTileCount(): Promise<number> {
  try {
    const db = await openTileDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch (e) {
    return 0;
  }
}

/**
 * Clear all cached tiles
 */
export async function clearTileCache(): Promise<void> {
  if (typeof caches !== 'undefined') {
    try {
      await caches.delete(TILE_CACHE_NAME);
    } catch (e) {}
  }
  try {
    const db = await openTileDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch (e) {}
}

/**
 * Generates an SVG grid data URL fallback tile with coordinates and orientation when offline and uncached.
 */
function createOfflineFallbackTile(x: number, y: number, z: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#1e293b"/>
    <defs>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#334155" stroke-width="0.8"/>
      </pattern>
    </defs>
    <rect width="256" height="256" fill="url(#grid)"/>
    <path d="M 0 0 L 256 256 M 256 0 L 0 256" stroke="#0f172a" stroke-width="0.5" opacity="0.4"/>
    <rect x="8" y="8" width="240" height="240" fill="none" stroke="#475569" stroke-width="1" stroke-dasharray="4,4" rx="4"/>
    <text x="128" y="118" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">
      OFFLINE EMERGENCY MAP
    </text>
    <text x="128" y="138" font-family="monospace" font-size="10" fill="#64748b" text-anchor="middle">
      Z:${z} • X:${x} • Y:${y}
    </text>
    <text x="128" y="156" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" fill="#f43f5e" text-anchor="middle">
      GPS & Safe Haven Overlay Active
    </text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Custom Leaflet TileLayer subclass that intercepts tile requests,
 * retrieves from IndexedDB / CacheStorage if offline,
 * and caches newly fetched online tiles into IndexedDB & CacheStorage.
 */
export const CachedTileLayer = (L.TileLayer as any).extend({
  createTile(coords: { x: number; y: number; z: number }, done: (err: any, tile: HTMLElement) => void): HTMLElement {
    const tile = document.createElement('img');

    L.DomEvent.on(tile, 'load', L.Util.bind((this as any)._tileOnLoad, this, done, tile));
    L.DomEvent.on(tile, 'error', L.Util.bind((this as any)._tileOnError, this, done, tile));

    if ((this as any).options.crossOrigin || (this as any).options.crossOrigin === '') {
      tile.crossOrigin = (this as any).options.crossOrigin === true ? '' : (this as any).options.crossOrigin;
    }

    tile.alt = '';
    tile.setAttribute('role', 'presentation');

    const url = (this as any).getTileUrl(coords);
    const tileKey = `tile_${coords.z}_${coords.x}_${coords.y}`;

    // Attempt to load from cache or network
    (async () => {
      // 1. Check offline cache
      const cached = await getCachedTile(tileKey);
      if (cached) {
        tile.src = cached;
        return;
      }

      // 2. If online, fetch from network and store to cache
      if (navigator.onLine !== false) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000); // 6s network timeout

          const response = await fetch(url, {
            mode: 'cors',
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (response.ok) {
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            // Convert to dataURL for durable IndexedDB storage
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              if (base64data) {
                saveTileToCache(tileKey, base64data, blob);
              }
            };
            reader.readAsDataURL(blob);

            tile.src = objectUrl;
            return;
          }
        } catch (fetchErr) {
          // Network failed or offline - fall through to fallback
        }
      }

      // 3. Fallback: Offline vector tactical tile
      tile.src = createOfflineFallbackTile(coords.x, coords.y, coords.z);
    })();

    return tile;
  },
});

/**
 * Factory helper function to instantiate a CachedTileLayer
 */
export function createCachedTileLayer(
  urlTemplate: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  options: L.TileLayerOptions = {}
): L.TileLayer {
  return new (CachedTileLayer as any)(urlTemplate, {
    maxZoom: 19,
    crossOrigin: true,
    ...options,
  });
}

/**
 * Helper to pre-cache map tiles around a given latitude & longitude
 * so that the user has guaranteed offline coverage around their location
 * (e.g. current location, nearest police station, nearest hospital).
 */
export async function preCacheAreaTiles(
  centerLat: number,
  centerLng: number,
  zoomLevels: number[] = [12, 13, 14, 15],
  onProgress?: (cached: number, total: number) => void
): Promise<{ total: number; successful: number }> {
  const coordsList: { z: number; x: number; y: number }[] = [];

  for (const z of zoomLevels) {
    const latRad = (centerLat * Math.PI) / 180;
    const n = Math.pow(2, z);
    const centerX = Math.floor(((centerLng + 180) / 360) * n);
    const centerY = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
    );

    // Cache a 3x3 grid around center tile
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = centerX + dx;
        const y = centerY + dy;
        coordsList.push({ z, x, y });
      }
    }
  }

  let successCount = 0;
  let processed = 0;
  const subdomains = ['a', 'b', 'c'];

  for (const { z, x, y } of coordsList) {
    const tileKey = `tile_${z}_${x}_${y}`;
    
    // Check if already cached
    const existing = await getCachedTile(tileKey);
    if (existing) {
      successCount++;
      processed++;
      onProgress?.(processed, coordsList.length);
      continue;
    }

    if (!navigator.onLine) {
      processed++;
      onProgress?.(processed, coordsList.length);
      continue;
    }

    const s = subdomains[(x + y) % subdomains.length];
    const url = `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`;

    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            saveTileToCache(tileKey, reader.result as string, blob);
          }
        };
        reader.readAsDataURL(blob);
        successCount++;
      }
    } catch (e) {
      // Skip on error
    }

    processed++;
    onProgress?.(processed, coordsList.length);
  }

  return { total: coordsList.length, successful: successCount };
}
