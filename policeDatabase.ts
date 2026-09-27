import { PoliceStation } from '../types';
import westBengalPoliceData from './west_bengal_police.json';
import { calculateDistanceKm, calculateBearing } from './hospitalDatabase';

export const WEST_BENGAL_POLICE: PoliceStation[] = westBengalPoliceData as PoliceStation[];

export function findNearestPoliceStation(lat: number, lng: number): PoliceStation {
  return WEST_BENGAL_POLICE.reduce((prev, curr) => {
    const distPrev = Math.sqrt(Math.pow(prev.location.lat - lat, 2) + Math.pow(prev.location.lng - lng, 2));
    const distCurr = Math.sqrt(Math.pow(curr.location.lat - lat, 2) + Math.pow(curr.location.lng - lng, 2));
    return distCurr < distPrev ? curr : prev;
  });
}

export function findNearestPoliceStationWithDetails(lat: number, lng: number): {
  station: PoliceStation;
  distanceKm: number;
  bearing: { degrees: number; cardinal: string };
} {
  const station = findNearestPoliceStation(lat, lng);
  const distanceKm = calculateDistanceKm(lat, lng, station.location.lat, station.location.lng);
  const bearing = calculateBearing(lat, lng, station.location.lat, station.location.lng);
  return { station, distanceKm, bearing };
}
