import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  findNearestPoliceStationWithDetails, 
  WEST_BENGAL_POLICE 
} from '../services/policeDatabase';
import { 
  findNearestHospital, 
  calculateDistanceKm, 
  calculateBearing, 
  VERIFIED_HOSPITALS, 
  VerifiedHospital 
} from '../services/hospitalDatabase';
import { PoliceStation } from '../types';
import { 
  createCachedTileLayer, 
  preCacheAreaTiles, 
  getCachedTileCount 
} from '../services/mapTileCacheService';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  RotateCw, 
  Building2, 
  Hospital, 
  Compass, 
  ShieldCheck, 
  Footprints, 
  Car, 
  AlertCircle,
  ExternalLink,
  Layers,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';

interface EmergencyRouteMapProps {
  initialLocation?: { lat: number; lng: number } | null;
  onTargetChange?: (target: { name: string; contact: string; distanceKm: number }) => void;
}

type RouteTargetType = 'POLICE' | 'HOSPITAL' | 'BOTH';

export default function EmergencyRouteMap({ 
  initialLocation, 
  onTargetChange 
}: EmergencyRouteMapProps) {
  // Fallback coords: Arambagh, Hooghly
  const DEFAULT_LAT = 22.8824;
  const DEFAULT_LNG = 87.7842;

  const [targetType, setTargetType] = useState<RouteTargetType>('POLICE');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: initialLocation?.lat || DEFAULT_LAT,
    lng: initialLocation?.lng || DEFAULT_LNG,
  });
  const [geoStatus, setGeoStatus] = useState<'locating' | 'live' | 'fallback' | 'denied'>('locating');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [cachedTileCount, setCachedTileCount] = useState<number>(0);
  const [cacheProgress, setCacheProgress] = useState<string | null>(null);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of cached tiles count
    getCachedTileCount().then(count => setCachedTileCount(count));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Computed nearest destinations
  const nearestPolice = findNearestPoliceStationWithDetails(userLocation.lat, userLocation.lng);
  const nearestHosp = findNearestHospital(userLocation.lat, userLocation.lng);

  // Active destination based on selected tab
  const activeDestination = targetType === 'HOSPITAL'
    ? {
        type: 'HOSPITAL' as const,
        name: nearestHosp.hospital.name,
        bengaliName: nearestHosp.hospital.bengaliName,
        contact: nearestHosp.hospital.contact,
        ambulanceContact: nearestHosp.hospital.ambulanceContact,
        address: nearestHosp.hospital.address,
        location: nearestHosp.hospital.location,
        distanceKm: nearestHosp.distanceKm,
        bearing: nearestHosp.bearing,
      }
    : {
        type: 'POLICE' as const,
        name: nearestPolice.station.name,
        bengaliName: nearestPolice.station.name,
        contact: nearestPolice.station.contact,
        ambulanceContact: '112',
        address: `${nearestPolice.station.district} District • PIN: ${nearestPolice.station.pinCode || 'Verified'}`,
        location: nearestPolice.station.location,
        distanceKm: nearestPolice.distanceKm,
        bearing: nearestPolice.bearing,
      };

  // Inform parent if needed
  useEffect(() => {
    onTargetChange?.({
      name: activeDestination.name,
      contact: activeDestination.contact,
      distanceKm: activeDestination.distanceKm,
    });
  }, [activeDestination.name, activeDestination.contact, activeDestination.distanceKm, onTargetChange]);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // 1. Browser Geolocation API Watcher & Locator
  const locateUser = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoStatus('fallback');
      return;
    }

    setIsRefreshing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setAccuracy(Math.round(acc));
        setGeoStatus('live');
        setIsRefreshing(false);

        // Pre-cache surrounding map tiles for newly located coordinates
        if (navigator.onLine) {
          preCacheAreaTiles(latitude, longitude, [13, 14, 15]).then(() => {
            getCachedTileCount().then(c => setCachedTileCount(c));
          }).catch(() => {});
        }
      },
      (error) => {
        console.warn('Geolocation failed or denied, using emergency coordinates:', error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoStatus('denied');
        } else {
          setGeoStatus('fallback');
        }
        setIsRefreshing(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    locateUser();

    // Continuous watch
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setAccuracy(Math.round(position.coords.accuracy));
          setGeoStatus('live');
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Add cached tile layer (serves from IndexedDB / CacheStorage when offline)
      const cachedLayer = createCachedTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      });
      cachedLayer.addTo(map);

      // Pre-cache surrounding map tiles for offline resilience during emergencies
      if (typeof window !== 'undefined' && navigator.onLine) {
        preCacheAreaTiles(userLocation.lat, userLocation.lng, [13, 14, 15]).then(() => {
          getCachedTileCount().then(c => setCachedTileCount(c));
        }).catch(() => {});
      }

      // Add custom zoom controls at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // 3. Update Markers & Path when userLocation, targetType, or destination changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const userLatLng: L.LatLngExpression = [userLocation.lat, userLocation.lng];

    // Marker 1: User Location Marker (Pulsing Radar Beacon)
    const userHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping"></div>
        <div class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-xl">
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
        <div class="absolute -bottom-5 bg-slate-900/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
          YOU (GPS)
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'custom-user-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const userMarker = L.marker(userLatLng, { icon: userIcon }).addTo(layerGroup);
    userMarker.bindPopup(`
      <div class="text-xs p-1">
        <b class="text-blue-600">Your Live Position</b><br/>
        Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}<br/>
        <span class="text-slate-400">Accuracy: ±${accuracy || 20}m</span>
      </div>
    `);

    const boundsPoints: L.LatLngExpression[] = [userLatLng];

    // Helper to draw Police Marker
    const renderPoliceMarker = (isTargetActive: boolean) => {
      const psLatLng: L.LatLngExpression = [
        nearestPolice.station.location.lat,
        nearestPolice.station.location.lng,
      ];
      boundsPoints.push(psLatLng);

      const psHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-2xl ${
            isTargetActive ? 'bg-indigo-600 ring-4 ring-indigo-400/50 animate-pulse' : 'bg-indigo-700'
          } text-white border-2 border-white flex items-center justify-center shadow-2xl">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div class="absolute -bottom-6 bg-indigo-950 text-indigo-100 text-[9px] font-black px-2 py-0.5 rounded shadow whitespace-nowrap border border-indigo-700">
            POLICE (${nearestPolice.distanceKm} km)
          </div>
        </div>
      `;

      const psIcon = L.divIcon({
        html: psHtml,
        className: 'custom-police-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(psLatLng, { icon: psIcon }).addTo(layerGroup);
      marker.bindPopup(`
        <div class="text-xs p-1 space-y-1">
          <b class="text-indigo-600 font-bold">${nearestPolice.station.name}</b><br/>
          <span>District: ${nearestPolice.station.district}</span><br/>
          <span>Distance: <b>${nearestPolice.distanceKm} km</b></span><br/>
          <a href="tel:${nearestPolice.station.contact}" class="inline-block mt-1 bg-indigo-600 text-white font-bold px-2 py-1 rounded text-[11px]">
            📞 Call ${nearestPolice.station.contact}
          </a>
        </div>
      `);
    };

    // Helper to draw Hospital Marker
    const renderHospitalMarker = (isTargetActive: boolean) => {
      const hospLatLng: L.LatLngExpression = [
        nearestHosp.hospital.location.lat,
        nearestHosp.hospital.location.lng,
      ];
      boundsPoints.push(hospLatLng);

      const hospHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-2xl ${
            isTargetActive ? 'bg-emerald-600 ring-4 ring-emerald-400/50 animate-pulse' : 'bg-emerald-700'
          } text-white border-2 border-white flex items-center justify-center shadow-2xl">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="absolute -bottom-6 bg-emerald-950 text-emerald-100 text-[9px] font-black px-2 py-0.5 rounded shadow whitespace-nowrap border border-emerald-700">
            HOSPITAL (${nearestHosp.distanceKm} km)
          </div>
        </div>
      `;

      const hospIcon = L.divIcon({
        html: hospHtml,
        className: 'custom-hosp-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(hospLatLng, { icon: hospIcon }).addTo(layerGroup);
      marker.bindPopup(`
        <div class="text-xs p-1 space-y-1">
          <b class="text-emerald-700 font-bold">${nearestHosp.hospital.name}</b><br/>
          <span class="text-slate-500">${nearestHosp.hospital.bengaliName || ''}</span><br/>
          <span>Distance: <b>${nearestHosp.distanceKm} km</b></span><br/>
          <a href="tel:${nearestHosp.hospital.contact}" class="inline-block mt-1 bg-emerald-600 text-white font-bold px-2 py-1 rounded text-[11px]">
            📞 Call ${nearestHosp.hospital.contact}
          </a>
        </div>
      `);
    };

    // Decide which markers & path to render
    if (targetType === 'POLICE') {
      renderPoliceMarker(true);
      // Draw emergency path to Police Station
      const pathLine = L.polyline(
        [userLatLng, [nearestPolice.station.location.lat, nearestPolice.station.location.lng]],
        {
          color: '#4f46e5',
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 8',
        }
      ).addTo(layerGroup);

      // Midpoint badge
      const midLat = (userLocation.lat + nearestPolice.station.location.lat) / 2;
      const midLng = (userLocation.lng + nearestPolice.station.location.lng) / 2;
      const midHtml = `
        <div class="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white whitespace-nowrap">
          ${nearestPolice.distanceKm} km
        </div>
      `;
      L.marker([midLat, midLng], {
        icon: L.divIcon({ html: midHtml, className: 'mid-dist-label', iconAnchor: [20, 10] }),
      }).addTo(layerGroup);
    } else if (targetType === 'HOSPITAL') {
      renderHospitalMarker(true);
      // Draw emergency path to Hospital
      L.polyline(
        [userLatLng, [nearestHosp.hospital.location.lat, nearestHosp.hospital.location.lng]],
        {
          color: '#059669',
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 8',
        }
      ).addTo(layerGroup);

      // Midpoint badge
      const midLat = (userLocation.lat + nearestHosp.hospital.location.lat) / 2;
      const midLng = (userLocation.lng + nearestHosp.hospital.location.lng) / 2;
      const midHtml = `
        <div class="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white whitespace-nowrap">
          ${nearestHosp.distanceKm} km
        </div>
      `;
      L.marker([midLat, midLng], {
        icon: L.divIcon({ html: midHtml, className: 'mid-dist-label', iconAnchor: [20, 10] }),
      }).addTo(layerGroup);
    } else {
      // BOTH
      renderPoliceMarker(false);
      renderHospitalMarker(false);

      // Draw dashed paths to both
      L.polyline(
        [userLatLng, [nearestPolice.station.location.lat, nearestPolice.station.location.lng]],
        { color: '#4f46e5', weight: 3, opacity: 0.75, dashArray: '6, 6' }
      ).addTo(layerGroup);

      L.polyline(
        [userLatLng, [nearestHosp.hospital.location.lat, nearestHosp.hospital.location.lng]],
        { color: '#059669', weight: 3, opacity: 0.75, dashArray: '6, 6' }
      ).addTo(layerGroup);
    }

    // Auto-fit bounds with padding
    if (boundsPoints.length >= 2) {
      map.fitBounds(L.latLngBounds(boundsPoints), {
        padding: [35, 35],
        maxZoom: 16,
      });
    }
  }, [userLocation, targetType, accuracy, nearestPolice, nearestHosp]);

  // Sprint and drive time estimates
  const sprintMinutes = Math.max(1, Math.round((activeDestination.distanceKm / 7) * 60));
  const driveMinutes = Math.max(1, Math.round((activeDestination.distanceKm / 35) * 60));

  // Turn-by-turn navigation URL
  const googleMapsRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${activeDestination.location.lat},${activeDestination.location.lng}&travelmode=walking`;

  return (
    <div className="bg-black/35 backdrop-blur-md rounded-3xl border border-white/20 p-5 space-y-4 text-white">
      {/* Top Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-black text-sm tracking-tight flex items-center gap-2">
              <span>Emergency Route & Nearest Safe Haven Map</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-red-200">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${geoStatus === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {geoStatus === 'live' 
                  ? `Live GPS (±${accuracy || 15}m)` 
                  : geoStatus === 'denied' 
                  ? 'Browser GPS Denied (Fallback Active)' 
                  : 'Emergency GPS Coords'}
              </span>

              <span className="text-white/40">•</span>

              {/* Offline Map Cache Status */}
              <span className="flex items-center gap-1 font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                {isOnline ? (
                  <Wifi className="w-3 h-3 text-emerald-300" />
                ) : (
                  <WifiOff className="w-3 h-3 text-amber-300 animate-pulse" />
                )}
                <span className={isOnline ? 'text-emerald-200' : 'text-amber-200 font-bold'}>
                  {isOnline ? 'Online' : 'Offline Mode'}
                </span>
                <span className="text-white/60">({cachedTileCount} tiles cached)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Target Switcher Tabs */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/15 text-xs font-bold w-fit">
          <button
            onClick={() => setTargetType('POLICE')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              targetType === 'POLICE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Police ({nearestPolice.distanceKm}km)</span>
          </button>

          <button
            onClick={() => setTargetType('HOSPITAL')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              targetType === 'HOSPITAL'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>Hospital ({nearestHosp.distanceKm}km)</span>
          </button>

          <button
            onClick={() => setTargetType('BOTH')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              targetType === 'BOTH'
                ? 'bg-white/20 text-white font-black'
                : 'text-slate-400 hover:text-white'
            }`}
            title="View both police stations and hospitals on map"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Both</span>
          </button>
        </div>
      </div>

      {/* The Leaflet Map View Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/20 shadow-inner bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Recenter & Offline Pre-cache Button Overlay */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col sm:flex-row gap-1.5">
          {isOnline && (
            <button
              onClick={async () => {
                setCacheProgress('Caching...');
                try {
                  const res = await preCacheAreaTiles(
                    userLocation.lat, 
                    userLocation.lng, 
                    [12, 13, 14, 15], 
                    (done, total) => setCacheProgress(`${done}/${total}`)
                  );
                  const count = await getCachedTileCount();
                  setCachedTileCount(count);
                  setCacheProgress(`Cached ${res.successful} tiles`);
                  setTimeout(() => setCacheProgress(null), 2500);
                } catch (e) {
                  setCacheProgress('Cache failed');
                  setTimeout(() => setCacheProgress(null), 2000);
                }
              }}
              disabled={!!cacheProgress}
              className="bg-slate-900/90 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-xl border border-white/20 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm cursor-pointer transition-all active:scale-95"
              title="Pre-cache high-resolution emergency map tiles for 100% offline usage"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{cacheProgress || 'Save Offline Tiles'}</span>
            </button>
          )}

          <button
            onClick={locateUser}
            disabled={isRefreshing}
            className="bg-slate-900/90 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm cursor-pointer transition-all active:scale-95"
            title="Re-query Browser Geolocation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isRefreshing ? 'Locating...' : 'Recenter GPS'}</span>
          </button>
        </div>

        {/* Top-Left Mode Watermark */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[11px] font-bold text-white shadow-md flex items-center gap-1.5">
            {targetType === 'HOSPITAL' ? (
              <>
                <Hospital className="w-3.5 h-3.5 text-emerald-400" />
                <span>Navigating to Hospital</span>
              </>
            ) : targetType === 'POLICE' ? (
              <>
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Navigating to Police Station</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Safe Haven Overview</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Path Telemetry Card with ETA & Direct Directions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Destination Information */}
        <div className="md:col-span-2 bg-white/10 rounded-2xl p-3.5 border border-white/15 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-red-200 flex items-center gap-1">
                {activeDestination.type === 'HOSPITAL' ? (
                  <Hospital className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                )}
                Nearest Verified {activeDestination.type === 'HOSPITAL' ? 'Hospital' : 'Police Station'}
              </span>

              <span className="text-xs font-mono font-black bg-white/20 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-300" />
                {activeDestination.bearing.cardinal} ({activeDestination.bearing.degrees}°)
              </span>
            </div>

            <h5 className="text-base font-black text-white mt-1 leading-snug">
              {activeDestination.name}
            </h5>
            {activeDestination.bengaliName && (
              <p className="text-xs text-red-200">{activeDestination.bengaliName}</p>
            )}
            <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-300 shrink-0" />
              <span>{activeDestination.address}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-white bg-black/30 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-amber-300" />
              <span>~{sprintMinutes} min sprint ({activeDestination.distanceKm} km)</span>
            </span>

            <span className="text-xs font-bold text-white bg-black/30 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-blue-300" />
              <span>~{driveMinutes} min vehicle</span>
            </span>
          </div>
        </div>

        {/* Quick Action Buttons for the active target */}
        <div className="flex flex-col gap-2 justify-center">
          <a
            href={googleMapsRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white text-red-700 hover:bg-red-50 font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-lg transition-all cursor-pointer text-center"
          >
            <Navigation className="w-4 h-4" />
            <span>START NAVIGATION</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          <a
            href={`tel:${activeDestination.contact}`}
            className="w-full bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer text-center"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>CALL {activeDestination.contact}</span>
          </a>

          {activeDestination.type === 'HOSPITAL' && (
            <a
              href="tel:102"
              className="w-full bg-rose-600/80 hover:bg-rose-600 text-white font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer text-center"
            >
              <span>🚨 CALL AMBULANCE (102)</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
