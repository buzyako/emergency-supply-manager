"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { storage, StorageObject } from "@/lib/storage"

interface Contact {
  id: string
  name: string
  relationship: string
  phone: string
  email: string
  address: string
  isEmergency: boolean
  notes: string
}

interface MeetingPoint {
  id: string
  name: string
  address: string
  description: string
  isPrimary: boolean
}

interface CommunicationPlan extends StorageObject {
  familyName: string
  primaryContact: string
  outOfAreaContact: string
  emergencyNumbers: string[]
  contacts: Contact[]
  meetingPoints: MeetingPoint[]
  communicationMethods: string[]
  notes: string
}

export function CommunicationPlan() {
  const [data, setData] = useState<CommunicationPlan>({
    familyName: "",
    primaryContact: "",
    outOfAreaContact: "",
    emergencyNumbers: [],
    contacts: [],
    meetingPoints: [],
    communicationMethods: [],
    lastUpdated: new Date().toISOString(),
    notes: ""
  })
  const [showContactForm, setShowContactForm] = useState(false)
  const [showMeetingPointForm, setShowMeetingPointForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
    isEmergency: false,
    notes: ""
  })
  const [meetingPointForm, setMeetingPointForm] = useState({
    name: "",
    address: "",
    description: "",
    isPrimary: false
  })

  useEffect(() => {
    const saved = storage.loadObject<CommunicationPlan>("communicationPlan")
    if (saved) {
      setData(saved)
    } else {
      const defaultData: CommunicationPlan = {
        familyName: "",
        primaryContact: "",
        outOfAreaContact: "",
        emergencyNumbers: [
          "911 - Emergency Services",
          "117 - Philippine National Police",
          "143 - Bureau of Fire Protection",
          "136 - Philippine Red Cross"
        ],
        contacts: [],
        meetingPoints: [],
        communicationMethods: [
          "Cell Phone",
          "Text Message",
          "Social Media",
          "Landline Phone",
          "Radio",
          "Email"
        ],
        lastUpdated: new Date().toISOString(),
        notes: ""
      }
      setData(defaultData)
    }
  }, [])

  const saveData = (newData: CommunicationPlan) => {
    setData(newData)
    const success = storage.save("communicationPlan", newData)
    if (success) {
      console.log("[CommunicationPlan] Successfully saved data")
    } else {
      console.error("[CommunicationPlan] Failed to save data")
      alert("Failed to save data. Please try again.")
    }
  }

  const handleUpdateBasicInfo = (field: keyof CommunicationPlan, value: string) => {
    const updatedData = {
      ...data,
      [field]: value,
      lastUpdated: new Date().toISOString()
    }
    saveData(updatedData)
  }

  const handleAddContact = () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return

    const newContact: Contact = {
      id: Date.now().toString(),
      ...contactForm
    }

    const updatedData = {
      ...data,
      contacts: [...data.contacts, newContact],
      lastUpdated: new Date().toISOString()
    }

    saveData(updatedData)
    setContactForm({
      name: "",
      relationship: "",
      phone: "",
      email: "",
      address: "",
      isEmergency: false,
      notes: ""
    })
    setShowContactForm(false)
  }

  const handleAddMeetingPoint = () => {
    if (!meetingPointForm.name.trim() || !meetingPointForm.address.trim()) return

    const newMeetingPoint: MeetingPoint = {
      id: Date.now().toString(),
      ...meetingPointForm
    }

    const updatedData = {
      ...data,
      meetingPoints: [...data.meetingPoints, newMeetingPoint],
      lastUpdated: new Date().toISOString()
    }

    saveData(updatedData)
    setMeetingPointForm({
      name: "",
      address: "",
      description: "",
      isPrimary: false
    })
    setShowMeetingPointForm(false)
  }

  const handleDeleteContact = (id: string) => {
    const updatedData = {
      ...data,
      contacts: data.contacts.filter(contact => contact.id !== id),
      lastUpdated: new Date().toISOString()
    }
    saveData(updatedData)
  }

  const handleDeleteMeetingPoint = (id: string) => {
    const updatedData = {
      ...data,
      meetingPoints: data.meetingPoints.filter(point => point.id !== id),
      lastUpdated: new Date().toISOString()
    }
    saveData(updatedData)
  }

  const getCompletenessScore = () => {
    let score = 0
    let total = 0

    // Basic info
    total += 3
    if (data.familyName) score += 1
    if (data.primaryContact) score += 1
    if (data.outOfAreaContact) score += 1

    // Contacts
    total += 2
    if (data.contacts.length > 0) score += 1
    if (data.contacts.some(c => c.isEmergency)) score += 1

    // Meeting points
    total += 2
    if (data.meetingPoints.length > 0) score += 1
    if (data.meetingPoints.some(m => m.isPrimary)) score += 1

    return Math.round((score / total) * 100)
  }

  const completenessScore = getCompletenessScore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">📞 Family Communication Plan</h2>
        <p className="text-slate-600">Create a comprehensive family communication plan for emergencies</p>
      </div>

      {/* Completeness Status */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Plan Completeness
            <Badge variant={completenessScore >= 80 ? "default" : completenessScore >= 60 ? "secondary" : "destructive"}>
              {completenessScore}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className={completenessScore >= 80 ? "border-green-200 bg-green-50" : completenessScore >= 60 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"}>
            <AlertDescription>
              {completenessScore >= 80 
                ? "✅ Excellent! Your communication plan is comprehensive."
                : completenessScore >= 60 
                ? "⚠️ Good progress, but consider adding more details."
                : "🚨 Critical: Complete your communication plan for emergency preparedness."
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>👨‍👩‍👧‍👦 Basic Family Information</CardTitle>
          <CardDescription>Set up your family's basic communication information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                value={data.familyName}
                onChange={(e) => handleUpdateBasicInfo("familyName", e.target.value)}
                placeholder="Enter family name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryContact">Primary Contact Person</Label>
              <Input
                id="primaryContact"
                value={data.primaryContact}
                onChange={(e) => handleUpdateBasicInfo("primaryContact", e.target.value)}
                placeholder="Name of primary contact"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outOfAreaContact">Out-of-Area Contact</Label>
              <Input
                id="outOfAreaContact"
                value={data.outOfAreaContact}
                onChange={(e) => handleUpdateBasicInfo("outOfAreaContact", e.target.value)}
                placeholder="Name of out-of-area contact"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={data.notes}
                onChange={(e) => handleUpdateBasicInfo("notes", e.target.value)}
                placeholder="Add any additional notes"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>📞 Emergency Contacts</CardTitle>
          <CardDescription>Add family members and emergency contacts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showContactForm ? (
            <Button onClick={() => setShowContactForm(true)} className="w-full">
              Add Emergency Contact
            </Button>
          ) : (
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Name</Label>
                  <Input
                    id="contactName"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Father, Mother, Sister"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={contactForm.address}
                    onChange={(e) => setContactForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={contactForm.notes}
                    onChange={(e) => setContactForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add notes"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isEmergency"
                  checked={contactForm.isEmergency}
                  onChange={(e) => setContactForm(prev => ({ ...prev, isEmergency: e.target.checked }))}
                  aria-label="Primary emergency contact"
                />
                <Label htmlFor="isEmergency">Primary Emergency Contact</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddContact} className="flex-1">
                  Add Contact
                </Button>
                <Button onClick={() => setShowContactForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Contacts List */}
          {data.contacts.length > 0 && (
            <div className="space-y-3">
              {data.contacts.map((contact) => (
                <div key={contact.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {contact.name}
                        {contact.isEmergency && (
                          <Badge variant="destructive">Emergency</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-slate-600">{contact.relationship}</p>
                    </div>
                    <Button
                      onClick={() => handleDeleteContact(contact.id)}
                      variant="outline"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Phone:</strong> {contact.phone}</p>
                    {contact.email && <p><strong>Email:</strong> {contact.email}</p>}
                    {contact.address && <p><strong>Address:</strong> {contact.address}</p>}
                    {contact.notes && <p><strong>Notes:</strong> {contact.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Points */}
      <Card>
        <CardHeader>
          <CardTitle>📍 Meeting Points</CardTitle>
          <CardDescription>Designate safe meeting locations for your family</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showMeetingPointForm ? (
            <Button onClick={() => setShowMeetingPointForm(true)} className="w-full">
              Add Meeting Point
            </Button>
          ) : (
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingName">Name</Label>
                  <Input
                    id="meetingName"
                    value={meetingPointForm.name}
                    onChange={(e) => setMeetingPointForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Home, School, Church"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingAddress">Address</Label>
                  <Input
                    id="meetingAddress"
                    value={meetingPointForm.address}
                    onChange={(e) => setMeetingPointForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="meetingDescription">Description</Label>
                  <Textarea
                    id="meetingDescription"
                    value={meetingPointForm.description}
                    onChange={(e) => setMeetingPointForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this meeting point"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={meetingPointForm.isPrimary}
                  onChange={(e) => setMeetingPointForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  aria-label="Primary meeting point"
                />
                <Label htmlFor="isPrimary">Primary Meeting Point</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMeetingPoint} className="flex-1">
                  Add Meeting Point
                </Button>
                <Button onClick={() => setShowMeetingPointForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Meeting Points List */}
          {data.meetingPoints.length > 0 && (
            <div className="space-y-3">
              {data.meetingPoints.map((point) => (
                <div key={point.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {point.name}
                        {point.isPrimary && (
                          <Badge variant="default">Primary</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-slate-600">{point.address}</p>
                    </div>
                    <Button
                      onClick={() => handleDeleteMeetingPoint(point.id)}
                      variant="outline"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                  {point.description && (
                    <p className="text-sm text-slate-600">{point.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>🚨 Emergency Numbers</CardTitle>
          <CardDescription>Important emergency contact numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.emergencyNumbers.map((number, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                <span className="text-2xl">📞</span>
                <span className="font-medium">{number}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication Methods */}
      <Card>
        <CardHeader>
          <CardTitle>💬 Communication Methods</CardTitle>
          <CardDescription>Available communication methods during emergencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.communicationMethods.map((method, index) => (
              <Badge key={index} variant="outline">
                {method}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50">
        <CardHeader>
          <CardTitle>💡 Communication Plan Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Essential Elements:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Designate an out-of-area contact person</li>
              <li>Choose multiple meeting points (home, school, church)</li>
              <li>Practice your communication plan regularly</li>
              <li>Keep contact information updated</li>
            </ul>
            
            <p className="mt-4"><strong>During Emergencies:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Text messages often work when calls don't</li>
              <li>Use social media to check in with family</li>
              <li>Have a backup communication method</li>
              <li>Keep phones charged and have backup power</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
