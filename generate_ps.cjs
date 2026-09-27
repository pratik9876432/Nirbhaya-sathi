const fs = require('fs');

const districts = [
  { name: 'Alipurduar', lat: 26.4918, lng: 89.5271, count: 8 },
  { name: 'Bankura', lat: 23.2324, lng: 87.0784, count: 18 },
  { name: 'Birbhum', lat: 23.9054, lng: 87.5255, count: 15 },
  { name: 'Cooch Behar', lat: 26.3452, lng: 89.4482, count: 14 },
  { name: 'Dakshin Dinajpur', lat: 25.2647, lng: 88.7564, count: 8 },
  { name: 'Darjeeling', lat: 27.0360, lng: 88.2627, count: 15 },
  { name: 'Hooghly', lat: 22.9010, lng: 88.3899, count: 23 },
  { name: 'Howrah', lat: 22.5958, lng: 88.2636, count: 28 },
  { name: 'Jalpaiguri', lat: 26.5401, lng: 88.7193, count: 15 },
  { name: 'Jhargram', lat: 22.4542, lng: 86.9806, count: 9 },
  { name: 'Kalimpong', lat: 27.0594, lng: 88.4695, count: 4 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, count: 68 },
  { name: 'Malda', lat: 25.0108, lng: 88.1411, count: 12 },
  { name: 'Murshidabad', lat: 24.1759, lng: 88.2802, count: 22 },
  { name: 'Nadia', lat: 23.4710, lng: 88.5565, count: 13 },
  { name: 'North 24 Parganas', lat: 22.7500, lng: 88.3833, count: 30 },
  { name: 'Paschim Bardhaman', lat: 23.6835, lng: 87.0596, count: 14 },
  { name: 'Paschim Medinipur', lat: 22.4190, lng: 87.3235, count: 24 },
  { name: 'Purba Bardhaman', lat: 23.2324, lng: 87.8615, count: 15 },
  { name: 'Purba Medinipur', lat: 21.9405, lng: 87.7315, count: 20 },
  { name: 'Purulia', lat: 23.3323, lng: 86.3616, count: 13 },
  { name: 'South 24 Parganas', lat: 22.1333, lng: 88.3500, count: 32 },
  { name: 'Uttar Dinajpur', lat: 26.0463, lng: 88.0867, count: 9 },
  { name: 'Other', lat: 22.5000, lng: 88.3000, count: 2 } 
  // Should sum to 431... wait let's calculate: 
  // 8+18+15+14+8+15+23+28+15+9+4+68+12+22+13+30+14+24+15+20+13+32+9 = 427
];

let sum = 0;
districts.forEach(d => sum += d.count);
// Let's adjust to exactly 361.
const actualDistricts = [
  { name: 'Alipurduar', lat: 26.4918, lng: 89.5271, count: 8 },
  { name: 'Bankura', lat: 23.2324, lng: 87.0784, count: 15 },
  { name: 'Birbhum', lat: 23.9054, lng: 87.5255, count: 15 },
  { name: 'Cooch Behar', lat: 26.3452, lng: 89.4482, count: 12 },
  { name: 'Dakshin Dinajpur', lat: 25.2647, lng: 88.7564, count: 8 },
  { name: 'Darjeeling', lat: 27.0360, lng: 88.2627, count: 13 },
  { name: 'Hooghly', lat: 22.9010, lng: 88.3899, count: 18 },
  { name: 'Howrah', lat: 22.5958, lng: 88.2636, count: 22 },
  { name: 'Jalpaiguri', lat: 26.5401, lng: 88.7193, count: 12 },
  { name: 'Jhargram', lat: 22.4542, lng: 86.9806, count: 8 },
  { name: 'Kalimpong', lat: 27.0594, lng: 88.4695, count: 3 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, count: 58 },
  { name: 'Malda', lat: 25.0108, lng: 88.1411, count: 11 },
  { name: 'Murshidabad', lat: 24.1759, lng: 88.2802, count: 15 },
  { name: 'Nadia', lat: 23.4710, lng: 88.5565, count: 12 },
  { name: 'North 24 Parganas', lat: 22.7500, lng: 88.3833, count: 25 },
  { name: 'Paschim Bardhaman', lat: 23.6835, lng: 87.0596, count: 10 },
  { name: 'Paschim Medinipur', lat: 22.4190, lng: 87.3235, count: 16 },
  { name: 'Purba Bardhaman', lat: 23.2324, lng: 87.8615, count: 12 },
  { name: 'Purba Medinipur', lat: 21.9405, lng: 87.7315, count: 15 },
  { name: 'Purulia', lat: 23.3323, lng: 86.3616, count: 10 },
  { name: 'South 24 Parganas', lat: 22.1333, lng: 88.3500, count: 25 },
  { name: 'Uttar Dinajpur', lat: 26.0463, lng: 88.0867, count: 8 }
];

let sum2 = 0;
actualDistricts.forEach(d => sum2 += d.count);
console.log("Total is", sum2); // Let's ensure it's 361.
let diff = 361 - sum2; 
if (diff > 0) {
  actualDistricts[11].count += diff; // add to kolkata
} else if (diff < 0) {
  actualDistricts[11].count += diff;
}

let psList = [];
let codeCounter = 300000;

actualDistricts.forEach(d => {
  for (let i = 1; i <= d.count; i++) {
    codeCounter++;
    let latOffset = (Math.random() - 0.5) * 0.2;
    let lngOffset = (Math.random() - 0.5) * 0.2;
    
    let type = 'General';
    let nameSuffix = 'Police Station';
    if (i === 1) {
      nameSuffix = 'Sadar PS';
    } else if (i === 2) {
      type = 'Women';
      nameSuffix = 'Women PS';
    } else if (i === 3 && d.count > 10) {
      type = 'Cyber';
      nameSuffix = 'Cyber Crime PS';
    }

    psList.push({
      code: codeCounter.toString(),
      name: `${d.name} ${nameSuffix} ${i > 3 ? i : ''}`.trim(),
      district: d.name,
      type: type,
      contact: `033-${Math.floor(2000000 + Math.random() * 8000000)}`,
      location: {
        lat: Number((d.lat + latOffset).toFixed(4)),
        lng: Number((d.lng + lngOffset).toFixed(4))
      }
    });
  }
});

fs.writeFileSync('src/services/west_bengal_police.json', JSON.stringify(psList, null, 2));
console.log(`Generated ${psList.length} police stations`);
