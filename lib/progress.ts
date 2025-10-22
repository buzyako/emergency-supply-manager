export interface PreparednessLevel {
  food: number; // 0-100%
  water: number;
  financial: number;
  communication: number;
  spiritual: number;
  emergencyKit: number;
  goBags: number;
}

export interface PreparednessMilestone {
  id: string;
  title: string;
  description: string;
  category: keyof PreparednessLevel;
  targetValue: number;
  achieved: boolean;
  achievedDate?: string;
}

export const preparednessMilestones: PreparednessMilestone[] = [
  {
    id: 'food-3-days',
    title: '3-Day Food Supply',
    description: 'Store enough food for 3 days',
    category: 'food',
    targetValue: 30,
    achieved: false
  },
  {
    id: 'food-1-week',
    title: '1-Week Food Supply',
    description: 'Store enough food for 1 week',
    category: 'food',
    targetValue: 60,
    achieved: false
  },
  {
    id: 'food-1-month',
    title: '1-Month Food Supply',
    description: 'Store enough food for 1 month',
    category: 'food',
    targetValue: 100,
    achieved: false
  },
  {
    id: 'water-3-days',
    title: '3-Day Water Supply',
    description: 'Store 1 gallon per person per day for 3 days',
    category: 'water',
    targetValue: 100,
    achieved: false
  },
  {
    id: 'emergency-fund-1-month',
    title: '1-Month Emergency Fund',
    description: 'Save 1 month of expenses',
    category: 'financial',
    targetValue: 50,
    achieved: false
  },
  {
    id: 'emergency-fund-3-months',
    title: '3-Month Emergency Fund',
    description: 'Save 3 months of expenses',
    category: 'financial',
    targetValue: 100,
    achieved: false
  },
  {
    id: 'communication-plan',
    title: 'Family Communication Plan',
    description: 'Develop family emergency communication plan',
    category: 'communication',
    targetValue: 100,
    achieved: false
  },
  {
    id: 'emergency-kit-basic',
    title: 'Basic Emergency Kit',
    description: 'Assemble basic emergency supplies',
    category: 'emergencyKit',
    targetValue: 70,
    achieved: false
  },
  {
    id: 'go-bags-ready',
    title: 'Go Bags Ready',
    description: 'Prepare go bags for each family member',
    category: 'goBags',
    targetValue: 100,
    achieved: false
  }
];

export function calculateOverallProgress(levels: PreparednessLevel): number {
  const categories = Object.keys(levels) as (keyof PreparednessLevel)[];
  const total = categories.reduce((sum, category) => sum + levels[category], 0);
  return Math.round(total / categories.length);
}

export function getAchievedMilestones(levels: PreparednessLevel): PreparednessMilestone[] {
  return preparednessMilestones.map(milestone => ({
    ...milestone,
    achieved: levels[milestone.category] >= milestone.targetValue,
    achievedDate: levels[milestone.category] >= milestone.targetValue ? new Date().toISOString() : undefined
  }));
}

export function getNextMilestone(levels: PreparednessLevel): PreparednessMilestone | null {
  const unachieved = preparednessMilestones.filter(milestone => 
    levels[milestone.category] < milestone.targetValue
  );
  
  if (unachieved.length === 0) return null;
  
  // Return the milestone with the lowest target value for the category with the lowest current level
  const categoryLevels = Object.entries(levels) as [keyof PreparednessLevel, number][];
  const lowestCategory = categoryLevels.reduce((min, [category, level]) => 
    level < min.level ? { category, level } : min, 
    { category: 'food' as keyof PreparednessLevel, level: 100 }
  );
  
  return unachieved
    .filter(milestone => milestone.category === lowestCategory.category)
    .sort((a, b) => a.targetValue - b.targetValue)[0] || null;
}
