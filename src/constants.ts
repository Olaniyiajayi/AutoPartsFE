export const CAR_BRANDS = [
  'Toyota',
  'Honda',
  'Lexus',
  'Mercedes-Benz',
  'Hyundai',
  'Kia',
  'Nissan',
  'Ford',
  'Mitsubishi',
  'Mazda',
  'Volkswagen',
  'Land Rover',
  'BMW'
];

export const COMMON_MODELS: Record<string, string[]> = {
  'Toyota': ['Camry', 'Corolla', 'Rav4', 'Highlander', 'Hilux', 'Sienna', 'Matrix', 'Venza', 'Prado', 'Avenza'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'Crosstour'],
  'Lexus': ['ES350', 'RX350', 'RX330', 'GX460', 'LX570', 'IS250'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLK', 'ML-Class', 'GLE', 'S-Class'],
  'Hyundai': ['Elantra', 'Accent', 'Santa Fe', 'Tucson', 'Sonata'],
  'Kia': ['Rio', 'Cerato', 'Sportage', 'Sorento', 'Picanto'],
  'Nissan': ['Almera', 'Altima', 'Pathfinder', 'X-Terra', 'Hulux'],
  'Ford': ['Explorer', 'Edge', 'Focus', 'Ranger'],
  'Mitsubishi': ['Pajero', 'L200', 'Outlander'],
  'Mazda': ['Mazda 3', 'Mazda 6', 'CX-5', 'CX-9'],
  'Volkswagen': ['Golf', 'Passat', 'Jetta', 'Tiguan'],
  'Land Rover': ['Range Rover Sport', 'Range Rover Vogue', 'Discovery'],
  'BMW': ['3 Series', '5 Series', 'X5', 'X6']
};

export const LOCAL_PART_TYPES = [
  { id: 'engine', name: 'Engine / Half Engine' },
  { id: 'gearbox', name: 'Gearbox / Transmission' },
  { id: 'brakes', name: 'Brake System (Pads, Discs)' },
  { id: 'suspension', name: 'Suspension (Shock Absorber, Leg)' },
  { id: 'lighting', name: 'Lighting (Headlight, Tail Light)' },
  { id: 'body', name: 'Body Parts (Bumper, Fender)' },
  { id: 'cooling', name: 'Cooling (Radiator, Fan)' },
  { id: 'electrical', name: 'Electrical (Alternator, Starter)' },
  { id: 'interior', name: 'Interior Accessories' },
];

export const VEHICLE_SERIES: Record<string, Record<string, string[]>> = {
  'Toyota': {
    'Camry': ['XV10', 'XV20', 'XV30', 'XV40 (Muscle)', 'XV50', 'XV70'],
    'Corolla': ['E110', 'E120', 'E140', 'E150', 'E170'],
    'Highlander': ['XU20', 'XU40', 'XU50'],
    'Rav4': ['XA10', 'XA20', 'XA30', 'XA40'],
    'Sienna': ['XL10', 'XL20', 'XL30'],
  },
  'Honda': {
    'Accord': ['Seventh Gen (End of Discussion)', 'Eighth Gen (Evil Spirit)', 'Ninth Gen'],
    'Civic': ['Rebirth', 'Civic X'],
  },
  'Lexus': {
    'ES350': ['2007-2012', '2013-2018'],
    'RX350': ['2004-2009', '2010-2015', '2016-Present'],
  }
};
