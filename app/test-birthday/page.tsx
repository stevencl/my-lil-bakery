"use client"

import { useState } from "react"
import { getDaysUntilBirthday, getBirthdayInfo, shouldShowBirthdayNotification } from "@/lib/birthday"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestBirthdayPage() {
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [result, setResult] = useState<any>(null)

  const testBirthday = () => {
    if (!dateOfBirth) {
      alert("Please enter a date of birth")
      return
    }

    const info = getBirthdayInfo(dateOfBirth)
    const shouldShow = shouldShowBirthdayNotification(dateOfBirth)
    const days = getDaysUntilBirthday(dateOfBirth)

    setResult({
      info,
      shouldShow,
      days,
      rawDate: dateOfBirth,
      parsedDate: new Date(dateOfBirth).toISOString(),
    })
  }

  // Pre-fill with a date that should trigger notification (today's date with birth year)
  const fillTestDate = () => {
    const today = new Date()
    const testDate = new Date(1990, today.getMonth(), today.getDate() + 5) // 5 days from now
    const formatted = testDate.toISOString().split('T')[0]
    setDateOfBirth(formatted)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-yellow-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Birthday Notification Tester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Birth</label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testBirthday}>Test Birthday Logic</Button>
            <Button variant="outline" onClick={fillTestDate}>
              Fill Test Date (5 days away)
            </Button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-2">Results:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              <div className="mt-4 space-y-2">
                <p className="font-medium">
                  Should Show Notification: {result.shouldShow ? "✅ YES" : "❌ NO"}
                </p>
                <p>Days Until Birthday: {result.days}</p>
                {result.info && (
                  <>
                    <p>Is Birthday Today: {result.info.isBirthdayToday ? "Yes" : "No"}</p>
                    <p>Is Upcoming (within 7 days): {result.info.isUpcoming ? "Yes" : "No"}</p>
                    <p>Next Birthday: {new Date(result.info.nextBirthdayDate).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
            <h4 className="font-bold mb-2">How to Test:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click &quot;Fill Test Date&quot; to populate a date 5 days from today</li>
              <li>Or manually enter your actual date of birth</li>
              <li>Click &quot;Test Birthday Logic&quot; to see if notification should show</li>
              <li>Check if &quot;Should Show Notification&quot; is YES</li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm">
            <h4 className="font-bold mb-2">Current Date Info:</h4>
            <p>Today: {new Date().toLocaleDateString()}</p>
            <p>Today (ISO): {new Date().toISOString().split('T')[0]}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
