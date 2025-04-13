"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Box, FileText, Package2, Shield, Truck } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)

    // Simple animation for blockchain nodes
    const animateNodes = () => {
      const nodes = document.querySelectorAll(".blockchain-node")
      nodes.forEach((node, index) => {
        setTimeout(() => {
          node.classList.add("animate-pulse-glow")
        }, index * 200)
      })
    }

    animateNodes()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/30 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-md bg-gradient-to-br from-primary to-secondary opacity-70 blur-sm"></div>
              <div className="absolute inset-0.5 rounded-md bg-background flex items-center justify-center">
                <Package2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">MedX</span>
          </div>
          <Link href="/auth">
            <Button variant="outline" className="cyber-button group">
              <span className="relative z-10">Connect Wallet</span>
              <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section
          ref={heroRef}
          className={`container space-y-10 py-24 transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0 translate-y-10"}`}
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-8 text-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-70 blur-lg"></div>
              <span className="relative bg-background px-6 py-2 rounded-full border border-primary/20 text-sm font-medium text-primary">
                Next Generation Supply Chain
              </span>
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Blockchain-Powered</span>
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Medicine Supply Chain
              </span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              End-to-end tracking of pharmaceutical products from raw material suppliers to retailers, ensuring
              transparency and authenticity throughout the supply chain.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth">
                <Button size="lg" className="h-12 px-8 cyber-button group">
                  <span className="relative z-10">Connect Wallet</span>
                  <ArrowRight className="relative z-10 ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-12 px-8 cyber-button">
                  <span className="relative z-10">Learn More</span>
                </Button>
              </Link>
            </div>
          </div>

          
        </section>

        <section id="features" className="container space-y-12 py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-70 blur-lg"></div>
              <span className="relative bg-background px-6 py-2 rounded-full border border-primary/20 text-sm font-medium text-primary">
                Platform Features
              </span>
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tighter sm:text-4xl">
              Advanced Blockchain Technology
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our blockchain-based platform ensures complete transparency and traceability across the entire
              pharmaceutical supply chain.
            </p>
          </div>

          <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {[
              {
                title: "Blockchain Authentication",
                description:
                  "Secure wallet-based authentication and digital signatures for all supply chain operations.",
                icon: <Shield className="h-6 w-6 text-primary" />,
                color: "primary",
              },
              {
                title: "Order Management",
                description:
                  "Create, track, and manage orders with smart contract validation and real-time status updates.",
                icon: <FileText className="h-6 w-6 text-secondary" />,
                color: "secondary",
              },
              {
                title: "Supply Chain Tracking",
                description:
                  "Complete product tracking from origin to consumer with real-time location and status updates.",
                icon: <Truck className="h-6 w-6 text-accent" />,
                color: "accent",
              },
              {
                title: "Inventory Management",
                description:
                  "Track inventory levels, manage warehousing, and receive alerts for low stock or expiring products.",
                icon: <Box className="h-6 w-6 text-primary" />,
                color: "primary",
              },
              {
                title: "Analytics & Reporting",
                description:
                  "Comprehensive analytics on supply chain performance, order fulfillment, and inventory forecasting.",
                icon: <FileText className="h-6 w-6 text-secondary" />,
                color: "secondary",
              },
              {
                title: "Verification & Compliance",
                description:
                  "Verify product authenticity and ensure compliance with regulatory requirements through immutable records.",
                icon: <Shield className="h-6 w-6 text-accent" />,
                color: "accent",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border bg-background/50 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-background/80 hover:shadow-lg"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-${feature.color}/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 bg-${feature.color} transition-all duration-300 group-hover:w-full`}
                ></div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-${feature.color}/10 transition-all duration-300 group-hover:scale-110`}
                >
                  {feature.icon}
                </div>
                <h3 className="mt-4 font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <Link href="/auth">
              <Button size="lg" className="h-12 px-8 cyber-button group">
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="relative z-10 ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/40 py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground md:text-base">
            &copy; {new Date().getFullYear()} MedX. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground md:text-base">
            <Link href="#" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
