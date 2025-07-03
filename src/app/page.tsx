"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { dummyUser } from "@/lib/userMockData"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function Home() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    if (email === dummyUser.email && password === dummyUser.password) {
      router.push("/store-creator") // redirect to store
    } else {
      setError("Invalid email or password")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="flex w-full max-w-sm justify-center align-center flex-col gap-6">
      <Tabs defaultValue="account">
        <TabsList className="w-full justify-center hover:bg-amber-600">
          <TabsTrigger value="account">Sweeps Squad Admin Login</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Login to Sweeps Squad Dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter Email id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button onClick={handleLogin}>Login</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
