"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { storage, StorageObject } from "@/lib/storage"

interface FinancialData extends StorageObject {
  monthlyExpenses: number
  currentEmergencyFund: number
  target3Month: number
  target6Month: number
  target12Month: number
  financialGoals: {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    targetDate: string
    priority: 'high' | 'medium' | 'low'
  }[]
  notes: string
}

export function FinancialPreparedness() {
  const [data, setData] = useState<FinancialData>({
    monthlyExpenses: 0,
    currentEmergencyFund: 0,
    target3Month: 0,
    target6Month: 0,
    target12Month: 0,
    lastUpdated: new Date().toISOString(),
    financialGoals: [],
    notes: ""
  })
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    monthlyExpenses: "0",
    currentEmergencyFund: "0",
    goalName: "",
    goalAmount: "0",
    goalDate: "",
    priority: "high" as 'high' | 'medium' | 'low',
    notes: ""
  })

  useEffect(() => {
    const saved = storage.load<FinancialData>("financialData")
    if (saved) {
      setData(saved)
    } else {
      const defaultData: FinancialData = {
        monthlyExpenses: 0,
        currentEmergencyFund: 0,
        target3Month: 0,
        target6Month: 0,
        target12Month: 0,
        lastUpdated: new Date().toISOString(),
        financialGoals: [],
        notes: ""
      }
      setData(defaultData)
    }
  }, [])

  useEffect(() => {
    if (data.monthlyExpenses > 0) {
      const updatedData = {
        ...data,
        target3Month: data.monthlyExpenses * 3,
        target6Month: data.monthlyExpenses * 6,
        target12Month: data.monthlyExpenses * 12
      }
      setData(updatedData)
    }
  }, [data.monthlyExpenses])

  const saveData = (newData: FinancialData) => {
    setData(newData)
    const success = storage.save("financialData", newData)
    if (success) {
      console.log("[Financial] Successfully saved data")
    } else {
      console.error("[Financial] Failed to save data")
      alert("Failed to save data. Please try again.")
    }
  }

  const handleUpdateExpenses = () => {
    const monthlyExpenses = parseFloat(formData.monthlyExpenses) || 0
    const currentEmergencyFund = parseFloat(formData.currentEmergencyFund) || 0
    
    const updatedData = {
      ...data,
      monthlyExpenses,
      currentEmergencyFund,
      target3Month: monthlyExpenses * 3,
      target6Month: monthlyExpenses * 6,
      target12Month: monthlyExpenses * 12,
      lastUpdated: new Date().toISOString()
    }
    
    if (formData.notes.trim()) {
      updatedData.notes = formData.notes
    }
    
    saveData(updatedData)
    setFormData(prev => ({ ...prev, monthlyExpenses: "0", currentEmergencyFund: "0", notes: "" }))
  }

  const handleAddGoal = () => {
    if (!formData.goalName.trim() || !formData.goalAmount) return

    const newGoal = {
      id: Date.now().toString(),
      name: formData.goalName,
      targetAmount: parseFloat(formData.goalAmount) || 0,
      currentAmount: 0,
      targetDate: formData.goalDate,
      priority: formData.priority
    }

    const updatedData = {
      ...data,
      financialGoals: [...data.financialGoals, newGoal],
      lastUpdated: new Date().toISOString()
    }

    saveData(updatedData)
    setFormData(prev => ({ ...prev, goalName: "", goalAmount: "0", goalDate: "", priority: "high" }))
  }

  const handleUpdateGoalProgress = (goalId: string, amount: number) => {
    const updatedGoals = data.financialGoals.map(goal =>
      goal.id === goalId ? { ...goal, currentAmount: amount } : goal
    )

    const updatedData = {
      ...data,
      financialGoals: updatedGoals,
      lastUpdated: new Date().toISOString()
    }

    saveData(updatedData)
  }

  const getEmergencyFundProgress = (target: number) => {
    if (target === 0) return 0
    return Math.min((data.currentEmergencyFund / target) * 100, 100)
  }

  const getGoalProgress = (goal: FinancialData['financialGoals'][0]) => {
    if (goal.targetAmount === 0) return 0
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">💰 Financial Preparedness</h2>
        <p className="text-slate-600">Track your emergency fund and financial goals</p>
      </div>

      {/* Emergency Fund Status */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💰 Emergency Fund Status
            <Badge variant={data.currentEmergencyFund >= data.target3Month ? "default" : "destructive"}>
              {formatCurrency(data.currentEmergencyFund)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(data.currentEmergencyFund)}</div>
              <div className="text-sm text-slate-600">Current Fund</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(data.target3Month)}</div>
              <div className="text-sm text-slate-600">3-Month Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(data.target6Month)}</div>
              <div className="text-sm text-slate-600">6-Month Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(data.target12Month)}</div>
              <div className="text-sm text-slate-600">12-Month Target</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>3-Month Emergency Fund</span>
                <span>{Math.round(getEmergencyFundProgress(data.target3Month))}%</span>
              </div>
              <Progress value={getEmergencyFundProgress(data.target3Month)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>6-Month Emergency Fund</span>
                <span>{Math.round(getEmergencyFundProgress(data.target6Month))}%</span>
              </div>
              <Progress value={getEmergencyFundProgress(data.target6Month)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>12-Month Emergency Fund</span>
                <span>{Math.round(getEmergencyFundProgress(data.target12Month))}%</span>
              </div>
              <Progress value={getEmergencyFundProgress(data.target12Month)} className="h-2" />
            </div>
          </div>

          <Alert className={data.currentEmergencyFund >= data.target3Month ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription>
              {data.currentEmergencyFund >= data.target3Month 
                ? "✅ Excellent! You have a solid emergency fund."
                : "🚨 Critical: Build your emergency fund to cover at least 3 months of expenses."
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Financial Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>📊 Financial Information</CardTitle>
            <CardDescription>Set up your monthly expenses and current emergency fund</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthlyExpenses}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyExpenses: e.target.value }))}
                placeholder="Enter monthly expenses"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentEmergencyFund">Current Emergency Fund</Label>
              <Input
                id="currentEmergencyFund"
                type="number"
                min="0"
                step="0.01"
                value={formData.currentEmergencyFund}
                onChange={(e) => setFormData(prev => ({ ...prev, currentEmergencyFund: e.target.value }))}
                placeholder="Enter current emergency fund"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about your financial situation"
                rows={3}
              />
            </div>
            <Button onClick={handleUpdateExpenses} className="w-full">
              Update Financial Information
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Financial Goals</CardTitle>
            <CardDescription>Set and track your financial goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                value={formData.goalName}
                onChange={(e) => setFormData(prev => ({ ...prev, goalName: e.target.value }))}
                placeholder="e.g., Car Emergency Fund"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalAmount">Target Amount</Label>
              <Input
                id="goalAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.goalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, goalAmount: e.target.value }))}
                placeholder="Enter target amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalDate">Target Date</Label>
              <Input
                id="goalDate"
                type="date"
                value={formData.goalDate}
                onChange={(e) => setFormData(prev => ({ ...prev, goalDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                className="w-full p-2 border border-slate-300 rounded-md"
                aria-label="Priority level"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <Button onClick={handleAddGoal} className="w-full">
              Add Financial Goal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Financial Goals List */}
      {data.financialGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Your Financial Goals</CardTitle>
            <CardDescription>Track progress on your financial goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.financialGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{goal.name}</h4>
                      <p className="text-sm text-slate-600">
                        Target: {formatCurrency(goal.targetAmount)} by {goal.targetDate}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(goal.priority)}>
                      {goal.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(getGoalProgress(goal))}%</span>
                    </div>
                    <Progress value={getGoalProgress(goal)} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Update current amount"
                      onChange={(e) => handleUpdateGoalProgress(goal.id, parseFloat(e.target.value) || 0)}
                    />
                    <Button size="sm" variant="outline">
                      Update
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-slate-50 to-green-50">
        <CardHeader>
          <CardTitle>💡 Financial Preparedness Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Emergency Fund Guidelines:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Start with 3 months of expenses as minimum</li>
              <li>Build up to 6-12 months for maximum security</li>
              <li>Keep emergency fund in easily accessible account</li>
              <li>Separate from other savings and investments</li>
            </ul>
            
            <p className="mt-4"><strong>Building Your Fund:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Set up automatic transfers to emergency fund</li>
              <li>Use windfalls (tax refunds, bonuses) to boost fund</li>
              <li>Cut unnecessary expenses to free up money</li>
              <li>Consider high-yield savings account for better returns</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
