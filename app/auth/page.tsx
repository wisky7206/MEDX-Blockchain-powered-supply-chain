"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/context/wallet-context"
import { ArrowRight, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthPage() {
  const { connect, isConnected, address } = useWallet()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    if (isConnected) {
      // Redirect to role selection after successful connection
      router.push("/auth/role")
    }
  }, [isConnected, router])

  const handleConnect = async () => {
    setIsLoading(true)
    await connect()
    setIsLoading(false)
  }

  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <div
        className={`mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
      >
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-70 blur-lg animate-pulse"></div>
              <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to MedX</h1>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to access the blockchain-based supply chain management system
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-30 blur-lg"></div>
          <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Connect your wallet to continue</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Button onClick={handleConnect} className="w-full cyber-button group h-12" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-primary"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    <span>Connect to MetaMask</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col items-center text-center text-xs text-muted-foreground">
              <p>By connecting your wallet, you agree to our Terms of Service and Privacy Policy.</p>
            </CardFooter>
          </Card>
        </div>

        <div className="relative px-8 py-4 rounded-lg border border-border/30 bg-background/30 backdrop-blur-sm">
          <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary to-transparent"></div>
          <h3 className="text-sm font-medium text-primary mb-2">Why Connect a Wallet?</h3>
          <p className="text-xs text-muted-foreground">
            Your blockchain wallet serves as your secure digital identity in the MedX system, enabling you to sign
            transactions, verify product authenticity, and maintain an immutable record of all supply chain activities.
          </p>
        </div>
      </div>
    </div>
  )
}
