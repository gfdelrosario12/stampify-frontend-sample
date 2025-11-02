"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function UnauthorizedPage() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You don't have permission to access this page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your account role doesn't have access to this resource. If you believe this is a mistake, please contact
            support.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="destructive" onClick={logout} className="flex-1">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
