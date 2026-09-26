import React from 'react'
import { Button } from './components/ui/Button'
import { Input } from './components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/Card'

function App() {
  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-primary">Innomatrics CRM</h1>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Design System Check</CardTitle>
          <CardDescription>Testing core UI components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Enter your email" />
          <Button className="w-full">Get Started</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
