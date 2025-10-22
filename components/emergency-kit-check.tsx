"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { philippinesSettings } from "@/lib/regional"

interface EmergencyKitItem {
  id: string;
  name: string;
  category: 'food' | 'water' | 'shelter' | 'communication' | 'medical' | 'tools';
  essential: boolean;
  checked: boolean;
  notes?: string;
}

const emergencyKitItems: EmergencyKitItem[] = [
  // Food & Water
  { id: 'water-3-days', name: '3 days water (1 gallon per person per day)', category: 'water', essential: true, checked: false },
  { id: 'non-perishable-food', name: 'Non-perishable food (3 days)', category: 'food', essential: true, checked: false },
  { id: 'water-purification', name: 'Water purification tablets', category: 'water', essential: false, checked: false },
  { id: 'manual-can-opener', name: 'Manual can opener', category: 'food', essential: true, checked: false },
  
  // Shelter & Warmth
  { id: 'emergency-blanket', name: 'Emergency blanket', category: 'shelter', essential: true, checked: false },
  { id: 'tarp', name: 'Tarp or plastic sheeting', category: 'shelter', essential: false, checked: false },
  { id: 'rope', name: 'Rope or cord', category: 'shelter', essential: false, checked: false },
  
  // Communication
  { id: 'emergency-radio', name: 'Battery-powered or hand-crank radio', category: 'communication', essential: true, checked: false },
  { id: 'whistle', name: 'Emergency whistle', category: 'communication', essential: true, checked: false },
  { id: 'cell-phone-charger', name: 'Cell phone charger (solar or battery)', category: 'communication', essential: false, checked: false },
  
  // Medical
  { id: 'first-aid-kit', name: 'First aid kit', category: 'medical', essential: true, checked: false },
  { id: 'prescription-meds', name: 'Prescription medications (7 days)', category: 'medical', essential: true, checked: false },
  { id: 'glasses', name: 'Extra eyeglasses or contact lenses', category: 'medical', essential: false, checked: false },
  
  // Tools
  { id: 'flashlight', name: 'Flashlight with extra batteries', category: 'tools', essential: true, checked: false },
  { id: 'multi-tool', name: 'Multi-tool or Swiss Army knife', category: 'tools', essential: false, checked: false },
  { id: 'duct-tape', name: 'Duct tape', category: 'tools', essential: false, checked: false },
  { id: 'cash', name: 'Emergency cash (small bills)', category: 'tools', essential: true, checked: false },
  
  // Philippines-specific
  { id: 'n95-masks', name: 'N95 masks (for ash fall protection)', category: 'medical', essential: false, checked: false },
  { id: 'goggles', name: 'Safety goggles', category: 'medical', essential: false, checked: false },
  { id: 'work-gloves', name: 'Work gloves', category: 'tools', essential: false, checked: false },
];

export function EmergencyKitCheck() {
  const [items, setItems] = useState<EmergencyKitItem[]>(emergencyKitItems);
  const [showOnlyEssential, setShowOnlyEssential] = useState(false);

  useEffect(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem('emergencyKitCheck');
    if (saved) {
      const savedItems = JSON.parse(saved);
      setItems(savedItems);
    }
  }, []);

  useEffect(() => {
    // Save state to localStorage
    localStorage.setItem('emergencyKitCheck', JSON.stringify(items));
  }, [items]);

  const handleItemCheck = (id: string, checked: boolean) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked } : item
    ));
  };

  const filteredItems = showOnlyEssential 
    ? items.filter(item => item.essential)
    : items;

  const checkedCount = items.filter(item => item.checked).length;
  const essentialCheckedCount = items.filter(item => item.essential && item.checked).length;
  const essentialTotalCount = items.filter(item => item.essential).length;
  const overallProgress = Math.round((checkedCount / items.length) * 100);
  const essentialProgress = Math.round((essentialCheckedCount / essentialTotalCount) * 100);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍽️';
      case 'water': return '💧';
      case 'shelter': return '🏠';
      case 'communication': return '📻';
      case 'medical': return '🏥';
      case 'tools': return '🔧';
      default: return '📦';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'from-orange-500 to-red-500';
      case 'water': return 'from-blue-500 to-cyan-500';
      case 'shelter': return 'from-green-500 to-emerald-500';
      case 'communication': return 'from-purple-500 to-violet-500';
      case 'medical': return 'from-pink-500 to-rose-500';
      case 'tools': return 'from-gray-500 to-slate-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🧰</span>
          </div>
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Emergency Kit Check</h2>
            <p className="text-sm text-slate-600">Comprehensive emergency preparedness checklist</p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5"></div>
          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">📊</span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-800">Overall Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800 mb-2">{overallProgress}%</div>
              <Progress value={overallProgress} className="h-3 mb-2" />
              <p className="text-sm text-slate-600">{checkedCount} of {items.length} items checked</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">⭐</span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-800">Essential Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800 mb-2">{essentialProgress}%</div>
              <Progress value={essentialProgress} className="h-3 mb-2" />
              <p className="text-sm text-slate-600">{essentialCheckedCount} of {essentialTotalCount} essential items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-center">
        <Button
          variant={showOnlyEssential ? "default" : "outline"}
          onClick={() => setShowOnlyEssential(!showOnlyEssential)}
          className="rounded-xl"
        >
          {showOnlyEssential ? "Show All Items" : "Show Essential Only"}
        </Button>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {Object.entries(
          filteredItems.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {} as Record<string, EmergencyKitItem[]>)
        ).map(([category, categoryItems]) => (
          <Card key={category} className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5"></div>
            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(category)} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 capitalize">{category}</CardTitle>
                  <CardDescription className="text-slate-600">
                    {categoryItems.filter(item => item.checked).length} of {categoryItems.length} items checked
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{item.name}</span>
                        {item.essential && (
                          <Badge variant="destructive" className="text-xs">
                            Essential
                          </Badge>
                        )}
                      </div>
                    </div>
                    {item.checked && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Philippines-Specific Recommendations */}
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🇵🇭</span>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Philippines-Specific Recommendations</CardTitle>
              <CardDescription className="text-slate-600">Additional items for Philippine hazards</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-3">
            {philippinesSettings.specificRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">{index + 1}</span>
                </div>
                <p className="text-sm text-slate-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
      </Card>
    </div>
  );
}
