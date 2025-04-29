"use client"

// 1. Import 'use' from React
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout"; // Assuming this component exists
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Added missing import
import { Badge } from "@/components/ui/badge"; // Added missing import
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Package, QrCode, Search, Truck } from "lucide-react"; // Added missing imports
import Link from "next/link"; // Added missing import
import { QRScanner } from "@/components/qr-scanner"; // Assuming this component exists and path is correct

// 2. Update props interface
interface TrackingPageProps {
  params: {
    role: "provider" | "manufacturer" | "distributor" | "retailer";
  };
}

export default function TrackingPage({ params }: TrackingPageProps) {
  // 3. Destructure 'role' directly from params
  const { role } = params;

  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("product");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (!searchQuery) return;

    setIsSearching(true);

    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      // Add logic here to actually display search results based on searchQuery
      // For now, it just stops the loading indicator
    }, 1000);
  };

  const handleScanQRCode = () => {
    setShowScanner(true);
  };

  const handleQRCodeScanned = (data: string | null) => { // Ensure 'data' type includes null if scanner can return null
    setShowScanner(false);
    if (data) { // Check if data is not null
        setSearchQuery(data);
        // Simulate search after QR scan
        setIsSearching(true);
        setTimeout(() => {
         setIsSearching(false);
         // Add logic here to actually display search results based on scanned data
        }, 1000);
    }
  };

  // Use the 'role' variable which is now correctly obtained
  const roleColor =
    role === "provider" || role === "retailer" ? "primary" : role === "manufacturer" ? "secondary" : "accent";

  // Example search result data (replace with actual search logic)
  const searchResults = isSearching ? [] : [ // Simulating empty results while searching
      {
        productId: "PRD-567",
        batch: "MFG-789",
        status: "Completed",
        date: "April 18, 2023 - 09:30 AM",
        title: "Retailer Verification",
        description: "Verification by City Pharmacy",
        transaction: "0x2e5f...1d8b",
        certificate: "SH-234",
        temperature: "15-25°C (Maintained)",
        locations: "Distribution Center → Regional Hub → Local Delivery Center",
     },
     // Add more steps if needed based on actual search result
  ];

  // Rest of the component JSX remains the same, using the 'role' variable
  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supply Chain Tracking</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track products and shipments throughout the supply chain
            </p>
          </div>
        </div>

        <div className="relative">
          <div
            className={`absolute -inset-0.5 rounded-lg bg-gradient-to-br from-${roleColor} to-${roleColor}/30 opacity-30 blur-sm`}
          ></div>
          <Card className="border border-border/50 bg-background/50 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Track Product or Shipment</CardTitle>
              <CardDescription>Enter a product ID, batch number, or shipment ID to track its journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Enter tracking ID..."
                    className="pl-8 border-border/50 bg-background/50 backdrop-blur-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSearch}
                    className="cyber-button flex-1 sm:flex-none"
                    disabled={isSearching || !searchQuery}
                  >
                    {isSearching ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-primary"></div>
                        <span>Searching...</span>
                      </div>
                    ) : (
                      "Track"
                    )}
                  </Button>
                  <Button onClick={handleScanQRCode} variant="outline" className="cyber-button flex-1 sm:flex-none">
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan QR
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Display search results section */}
        {(searchQuery && !isSearching) && (
             <div className="relative mt-6">
                <div
                 className={`absolute -inset-0.5 rounded-lg bg-gradient-to-br from-${roleColor} to-${roleColor}/30 opacity-30 blur-sm`}
                ></div>
                <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
                 <CardHeader>
                   <div className="flex items-center justify-between">
                     <div>
                       {/* Dynamically update title based on search results */}
                       <CardTitle>Tracking Results for "{searchQuery}"</CardTitle>
                       <CardDescription>Complete history for the searched item.</CardDescription>
                     </div>
                      {searchResults.length > 0 && ( // Show verified badge only if results exist
                        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs border border-primary/30">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                          <span className="text-primary">Blockchain Verified</span>
                        </div>
                      )}
                   </div>
                 </CardHeader>
                 <CardContent>
                    {searchResults.length > 0 ? (
                        <div className="space-y-8">
                         {searchResults.map((step, index) => (
                           <div
                             key={index} // Use a more stable key if possible, e.g., step.id or transaction hash
                             className={`relative pl-8 transition-all duration-500 ${
                               isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                             }`}
                             style={{ transitionDelay: `${index * 100}ms` }}
                           >
                             <div className="absolute left-0 top-1 h-full w-px bg-border"></div>
                             <div
                               className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border ${
                                 step.status === "Completed"
                                   ? `border-${roleColor} bg-${roleColor}/10`
                                   : step.status === "In Progress"
                                   ? "border-amber-500 bg-amber-500/10"
                                   : "border-muted bg-muted"
                               }`}
                             >
                               {/* Use different icons based on step type if available */}
                               <Package
                                 className={`h-3 w-3 ${
                                   step.status === "Completed"
                                     ? `text-${roleColor}`
                                     : step.status === "In Progress"
                                     ? "text-amber-500"
                                     : "text-muted-foreground"
                                 }`}
                               />
                             </div>
                             <div className="space-y-1">
                               <div className="flex items-center gap-2">
                                 <h4 className={`font-medium ${step.status === "Pending" ? "text-muted-foreground" : ""}`}>
                                   {step.title || "Event"} {/* Fallback title */}
                                 </h4>
                                 {step.status === "Completed" && (
                                   <span
                                     className={`rounded-full bg-${roleColor}/10 px-2 py-0.5 text-xs text-${roleColor} border border-${roleColor}/30`}
                                   >
                                     {step.status}
                                   </span>
                                 )}
                                 {step.status === "In Progress" && (
                                   <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-500 border border-amber-500/30">
                                     {step.status}
                                   </span>
                                 )}
                                 {step.status === "Pending" && (
                                     <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground border border-muted">
                                     {step.status}
                                     </span>
                                 )}
                               </div>
                               <p className="text-sm text-muted-foreground">{step.description}</p>
                               {step.date && (
                                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                   {step.status === "Completed" ? (
                                     <CheckCircle2 className={`h-3 w-3 text-${roleColor}`} />
                                   ) : step.status === "In Progress" ? (
                                     <Clock className="h-3 w-3 text-amber-500" />
                                   ) : (
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                   )}
                                   <span>{step.date}</span>
                                 </div>
                               )}
                               {(step.transaction || step.temperature || step.locations || step.certificate) && (
                                 <div className="mt-2 rounded-md border border-border/50 bg-background/30 p-2 backdrop-blur-sm text-xs text-muted-foreground">
                                   {step.transaction && <p>Tx: {step.transaction}</p>}
                                   {step.certificate && <p>Cert/Batch: {step.certificate}</p>}
                                   {step.temperature && <p>Temp: {step.temperature}</p>}
                                   {step.locations && <p>Route: {step.locations}</p>}
                                 </div>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No tracking information found for "{searchQuery}".</p>
                    )}
                 </CardContent>
                </Card>
            </div>
        )}

        {/* Original Tabs for example data (You might remove or repurpose this section) */}
        {/*
        <Tabs
          defaultValue="product"
          value={activeTab}
          onValueChange={setActiveTab}
          className={`transition-all duration-300 ${searchQuery ? 'mt-6' : ''}`} // Add margin if search results shown
        >
         // ... [Rest of the original Tabs and TabsContent code] ...
        </Tabs>
        */}

      </div>

      {showScanner && <QRScanner onScan={handleQRCodeScanned} onClose={() => setShowScanner(false)} />}
    </DashboardLayout>
  );
}