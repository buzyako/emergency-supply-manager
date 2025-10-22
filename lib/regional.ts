export interface RegionalHazard {
  id: string;
  name: string;
  description: string;
  season?: string;
  preparationTips: string[];
  emergencySupplies: string[];
  evacuationGuidelines: string[];
}

export interface RegionalSettings {
  region: 'philippines' | 'other';
  hazards: RegionalHazard[];
  specificRecommendations: string[];
  localEmergencyNumbers: string[];
  regionalFoodStorage: string[];
}

export const philippinesHazards: RegionalHazard[] = [
  {
    id: 'typhoon',
    name: 'Typhoon',
    description: 'Tropical cyclones that bring strong winds, heavy rain, and storm surges',
    season: 'June to November',
    preparationTips: [
      'Secure loose objects and outdoor furniture',
      'Stock up on non-perishable food and water',
      'Prepare emergency communication plan',
      'Know your evacuation routes',
      'Keep important documents in waterproof containers'
    ],
    emergencySupplies: [
      'Flashlight and extra batteries',
      'Emergency radio',
      'First aid kit',
      'Water purification tablets',
      'Non-perishable food',
      'Emergency cash'
    ],
    evacuationGuidelines: [
      'Follow local government evacuation orders',
      'Bring emergency supplies and important documents',
      'Inform family of your evacuation location',
      'Stay tuned to official weather updates'
    ]
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    description: 'Sudden shaking of the ground caused by tectonic plate movements',
    season: 'Year-round',
    preparationTips: [
      'Secure heavy furniture and appliances',
      'Practice earthquake drills with family',
      'Identify safe spots in each room',
      'Prepare emergency communication plan',
      'Keep emergency supplies easily accessible'
    ],
    emergencySupplies: [
      'Emergency whistle',
      'Dust masks',
      'Work gloves',
      'Crowbar or pry bar',
      'Emergency food and water',
      'First aid kit'
    ],
    evacuationGuidelines: [
      'Drop, cover, and hold on during shaking',
      'Evacuate if building is damaged',
      'Stay away from windows and heavy objects',
      'Use stairs, not elevators'
    ]
  },
  {
    id: 'flood',
    name: 'Flood',
    description: 'Overflow of water that submerges normally dry land',
    season: 'June to November (typhoon season)',
    preparationTips: [
      'Know your flood risk level',
      'Prepare sandbags for protection',
      'Move valuables to higher ground',
      'Keep emergency supplies on upper floors',
      'Plan evacuation routes to higher ground'
    ],
    emergencySupplies: [
      'Waterproof containers',
      'Emergency food and water',
      'First aid kit',
      'Emergency radio',
      'Flashlight and batteries',
      'Important documents in waterproof bags'
    ],
    evacuationGuidelines: [
      'Evacuate immediately if ordered',
      'Do not walk or drive through floodwaters',
      'Move to higher ground',
      'Stay tuned to official updates'
    ]
  },
  {
    id: 'volcanic-eruption',
    name: 'Volcanic Eruption',
    description: 'Eruption of volcanoes causing ash fall, lava flows, and pyroclastic flows',
    season: 'Year-round',
    preparationTips: [
      'Know your volcano hazard zone',
      'Prepare for ash fall protection',
      'Stock up on N95 masks',
      'Prepare emergency communication plan',
      'Keep emergency supplies ready'
    ],
    emergencySupplies: [
      'N95 masks for ash protection',
      'Goggles for eye protection',
      'Emergency food and water',
      'First aid kit',
      'Emergency radio',
      'Important documents'
    ],
    evacuationGuidelines: [
      'Follow official evacuation orders',
      'Wear protective gear during evacuation',
      'Stay away from low-lying areas',
      'Monitor official updates'
    ]
  }
];

export const philippinesSettings: RegionalSettings = {
  region: 'philippines',
  hazards: philippinesHazards,
  specificRecommendations: [
    'Store food that can be prepared without electricity',
    'Keep emergency supplies in waterproof containers',
    'Prepare for extended power outages',
    'Have multiple communication methods ready',
    'Know your local evacuation centers'
  ],
  localEmergencyNumbers: [
    '911 - Emergency Services',
    '117 - Philippine National Police',
    '143 - Bureau of Fire Protection',
    '136 - Philippine Red Cross'
  ],
  regionalFoodStorage: [
    'Rice (white and brown)',
    'Canned goods (fish, meat, vegetables)',
    'Dried beans and legumes',
    'Coconut oil and cooking oil',
    'Salt and basic seasonings',
    'Dried fruits and nuts',
    'Instant noodles and pasta',
    'Powdered milk and coffee',
    'Sugar and honey',
    'Water purification tablets'
  ]
};

export function getHazardBySeason(season: string): RegionalHazard[] {
  return philippinesHazards.filter(hazard => 
    !hazard.season || hazard.season.includes(season) || hazard.season === 'Year-round'
  );
}

export function getCurrentSeasonHazards(): RegionalHazard[] {
  const currentMonth = new Date().getMonth() + 1;
  
  if (currentMonth >= 6 && currentMonth <= 11) {
    return getHazardBySeason('June to November');
  }
  
  return philippinesHazards.filter(hazard => hazard.season === 'Year-round');
}
