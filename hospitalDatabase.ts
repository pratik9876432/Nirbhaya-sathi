export interface VerifiedHospital {
  id: string;
  name: string;
  bengaliName?: string;
  district: string;
  type: 'Sub-Divisional Hospital' | 'District Hospital' | 'Medical College & Hospital' | 'Super Speciality Hospital';
  contact: string;
  ambulanceContact: string;
  address: string;
  location: { lat: number; lng: number };
  emergencyServices: string[];
}

export const VERIFIED_HOSPITALS: VerifiedHospital[] = [
  {
    id: 'hosp-arambagh',
    name: 'Arambagh Sub-Divisional Hospital',
    bengaliName: 'আরামবাগ মহকুমা হাসপাতাল',
    district: 'Hooghly',
    type: 'Sub-Divisional Hospital',
    contact: '03211-255013',
    ambulanceContact: '102',
    address: 'Hospital Road, Arambagh, Hooghly - 712601',
    location: { lat: 22.8870, lng: 87.7885 },
    emergencyServices: ['24x7 Emergency Trauma Unit', 'Blood Bank', 'Dedicated Ambulance Bay', 'Women & Child Wing']
  },
  {
    id: 'hosp-chinsurah',
    name: 'Hooghly District Hospital (Imambara Hospital)',
    bengaliName: 'হুগলি জেলা ইমামবাড়া হাসপাতাল',
    district: 'Hooghly',
    type: 'District Hospital',
    contact: '033-26802341',
    ambulanceContact: '102',
    address: 'Hospital Road, Chinsurah, Hooghly - 712101',
    location: { lat: 22.9056, lng: 88.3967 },
    emergencyServices: ['24x7 Critical Care Unit (CCU)', 'Emergency OT', 'Trauma Service', 'Blood Storage']
  },
  {
    id: 'hosp-tarakeswar',
    name: 'Tarakeswar Rural & Emergency Hospital',
    bengaliName: 'তারকেশ্বর গ্রামীণ হাসপাতাল',
    district: 'Hooghly',
    type: 'Sub-Divisional Hospital',
    contact: '03212-276228',
    ambulanceContact: '102',
    address: 'Near Tarakeswar Bus Stand, Hooghly - 712410',
    location: { lat: 22.8890, lng: 88.0210 },
    emergencyServices: ['24 Hours Casualty', 'Ambulance Stand', 'First-Response Emergency']
  },
  {
    id: 'hosp-burdwan-med',
    name: 'Burdwan Medical College & Hospital',
    bengaliName: 'বর্ধমান মেডিকেল কলেজ ও হাসপাতাল',
    district: 'Purba Bardhaman',
    type: 'Medical College & Hospital',
    contact: '0342-2558641',
    ambulanceContact: '108',
    address: 'Baburbag, Purba Bardhaman - 713104',
    location: { lat: 23.2384, lng: 87.8542 },
    emergencyServices: ['Apex Level-1 Trauma Centre', '24x7 Blood Bank', 'Specialist Emergency Care']
  },
  {
    id: 'hosp-sskm-kolkata',
    name: 'SSKM Hospital / IPGMER Emergency & Trauma Centre',
    bengaliName: 'এসএসকেএম হাসপাতাল (পিজি হাসপাতাল)',
    district: 'Kolkata',
    type: 'Super Speciality Hospital',
    contact: '033-22231589',
    ambulanceContact: '108',
    address: '244 AJC Bose Road, Bhowanipore, Kolkata - 700020',
    location: { lat: 22.5392, lng: 88.3444 },
    emergencyServices: ['State Level 24x7 Emergency Trauma Centre', 'Disaster Response', 'Air Ambulance Coordination']
  },
  {
    id: 'hosp-calcutta-med',
    name: 'Calcutta Medical College & Hospital',
    bengaliName: 'কলকাতা মেডিকেল কলেজ ও হাসপাতাল',
    district: 'Kolkata',
    type: 'Medical College & Hospital',
    contact: '033-22551000',
    ambulanceContact: '102',
    address: '88 College Street, Bowbazar, Kolkata - 700073',
    location: { lat: 22.5739, lng: 88.3629 },
    emergencyServices: ['24x7 Emergency Ward', 'Crisis Response Cell', 'Ambulance Unit']
  },
  {
    id: 'hosp-howrah-dist',
    name: 'Howrah District Hospital',
    bengaliName: 'হাওড়া জেলা হাসপাতাল',
    district: 'Howrah',
    type: 'District Hospital',
    contact: '033-26412431',
    ambulanceContact: '102',
    address: 'Biplabi Haren Ghosh Sarani, Howrah - 711101',
    location: { lat: 22.5847, lng: 88.3298 },
    emergencyServices: ['24x7 Trauma Casualty', 'Blood Bank', 'Dedicated Women Health Cell']
  },
  {
    id: 'hosp-midnapore-med',
    name: 'Midnapore Medical College & Hospital',
    bengaliName: 'মেদিনীপুর মেডিকেল কলেজ ও হাসপাতাল',
    district: 'Paschim Medinipur',
    type: 'Medical College & Hospital',
    contact: '03222-275239',
    ambulanceContact: '108',
    address: 'Vidyasagar Road, Paschim Medinipur - 721101',
    location: { lat: 22.4208, lng: 87.3228 },
    emergencyServices: ['Level-2 Trauma Center', 'Emergency ICU', '24x7 Rapid Ambulance Response']
  },
  {
    id: 'hosp-bankura-med',
    name: 'Bankura Sammilani Medical College & Hospital',
    bengaliName: 'বাঁকুড়া সম্মিলনী মেডিকেল কলেজ ও হাসপাতাল',
    district: 'Bankura',
    type: 'Medical College & Hospital',
    contact: '03242-243405',
    ambulanceContact: '108',
    address: 'Lokepur, Kenduadihi, Bankura - 722102',
    location: { lat: 23.2311, lng: 87.0673 },
    emergencyServices: ['24x7 Trauma & Casualty', 'Blood Center', 'Round-the-clock Specialists']
  },
  {
    id: 'hosp-siliguri-dist',
    name: 'Siliguri District Hospital',
    bengaliName: 'শিলিগুড়ি জেলা হাসপাতাল',
    district: 'Darjeeling',
    type: 'District Hospital',
    contact: '0353-2432881',
    ambulanceContact: '102',
    address: 'Hospital More, Siliguri, Darjeeling - 734001',
    location: { lat: 26.7162, lng: 88.4312 },
    emergencyServices: ['24x7 Emergency Casualty', 'CCU', 'Women Emergency Desk']
  }
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): { degrees: number; cardinal: string } {
  const y = Math.sin((lon2 - lon1) * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos((lon2 - lon1) * (Math.PI / 180));
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(brng / 45) % 8;
  return { degrees: Math.round(brng), cardinal: cardinals[index] };
}

export function findNearestHospital(lat: number, lng: number): { hospital: VerifiedHospital; distanceKm: number; bearing: { degrees: number; cardinal: string } } {
  let nearest = VERIFIED_HOSPITALS[0];
  let minDistance = calculateDistanceKm(lat, lng, nearest.location.lat, nearest.location.lng);

  for (let i = 1; i < VERIFIED_HOSPITALS.length; i++) {
    const dist = calculateDistanceKm(lat, lng, VERIFIED_HOSPITALS[i].location.lat, VERIFIED_HOSPITALS[i].location.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = VERIFIED_HOSPITALS[i];
    }
  }

  const bearing = calculateBearing(lat, lng, nearest.location.lat, nearest.location.lng);
  return { hospital: nearest, distanceKm: minDistance, bearing };
}
