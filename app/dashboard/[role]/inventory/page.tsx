"use client"

// 1. Import 'use' from React
import React, { useEffect, useState, use } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout"; // Assuming this component exists
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Removed TabsContent as it wasn't used directly here
import { AlertCircle, ArrowUpDown, Box, CheckCircle2, Filter, Package, Plus, Search } from "lucide-react";

// 2. Update props interface to indicate params is a Promise
interface InventoryPageProps {
  params: Promise<{
    role: "provider" | "manufacturer" | "distributor" | "retailer";
  }>;
}

export default function InventoryPage({ params }: InventoryPageProps) {
  // 3. Unwrap the params Promise *before* accessing its properties
  const resolvedParams = use(params);
  // 4. Destructure 'role' from the resolved object
  const { role } = resolvedParams;

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Role-specific inventory data (remains the same)
  const inventoryItems = {
     provider: [
       { id: "RM-2023", name: "Acetylsalicylic Acid", category: "Active Ingredient", quantity: 500, unit: "kg", status: "In Stock", expiry: "2025-06-30" },
       { id: "RM-2024", name: "Microcrystalline Cellulose", category: "Excipient", quantity: 1200, unit: "kg", status: "In Stock", expiry: "2026-03-15" },
       { id: "RM-2025", name: "Magnesium Stearate", category: "Excipient", quantity: 300, unit: "kg", status: "Low Stock", expiry: "2025-09-22" },
       { id: "RM-2026", name: "Paracetamol", category: "Active Ingredient", quantity: 750, unit: "kg", status: "In Stock", expiry: "2024-12-10" },
       { id: "RM-2027", name: "Starch", category: "Excipient", quantity: 850, unit: "kg", status: "In Stock", expiry: "2025-08-05" },
    ],
    manufacturer: [
       { id: "PRD-101", name: "Aspirin 100mg", category: "Analgesic", quantity: 10000, unit: "tablets", status: "In Stock", expiry: "2025-04-15" },
       { id: "PRD-102", name: "Paracetamol 500mg", category: "Analgesic", quantity: 15000, unit: "tablets", status: "In Stock", expiry: "2024-11-20" },
       { id: "PRD-103", name: "Amoxicillin 250mg", category: "Antibiotic", quantity: 5000, unit: "capsules", status: "Low Stock", expiry: "2024-08-30" },
       { id: "PRD-104", name: "Ibuprofen 400mg", category: "NSAID", quantity: 8000, unit: "tablets", status: "In Stock", expiry: "2025-02-28" },
       { id: "PRD-105", name: "Loratadine 10mg", category: "Antihistamine", quantity: 6000, unit: "tablets", status: "In Stock", expiry: "2025-05-10" },
    ],
    distributor: [
        { id: "PRD-101", name: "Aspirin 100mg", category: "Analgesic", quantity: 5000, unit: "boxes", status: "In Stock", expiry: "2025-04-15" },
        { id: "PRD-102", name: "Paracetamol 500mg", category: "Analgesic", quantity: 7500, unit: "boxes", status: "In Stock", expiry: "2024-11-20" },
        { id: "PRD-103", name: "Amoxicillin 250mg", category: "Antibiotic", quantity: 1200, unit: "boxes", status: "Low Stock", expiry: "2024-08-30" },
        { id: "PRD-104", name: "Ibuprofen 400mg", category: "NSAID", quantity: 3000, unit: "boxes", status: "In Stock", expiry: "2025-02-28" },
        { id: "PRD-105", name: "Loratadine 10mg", category: "Antihistamine", quantity: 2500, unit: "boxes", status: "In Stock", expiry: "2025-05-10" },
    ],
    retailer: [
       { id: "PRD-101", name: "Aspirin 100mg", category: "Analgesic", quantity: 200, unit: "boxes", status: "In Stock", expiry: "2025-04-15" },
       { id: "PRD-102", name: "Paracetamol 500mg", category: "Analgesic", quantity: 350, unit: "boxes", status: "In Stock", expiry: "2024-11-20" },
       { id: "PRD-103", name: "Amoxicillin 250mg", category: "Antibiotic", quantity: 50, unit: "boxes", status: "Low Stock", expiry: "2024-08-30" },
       { id: "PRD-104", name: "Ibuprofen 400mg", category: "NSAID", quantity: 180, unit: "boxes", status: "In Stock", expiry: "2025-02-28" },
       { id: "PRD-105", name: "Loratadine 10mg", category: "Antihistamine", quantity: 120, unit: "boxes", status: "In Stock", expiry: "2025-05-10" },
    ],
  };

  // Use the 'role' variable which is now correctly obtained
  const roleColor =
    role === "provider" || role === "retailer" ? "primary" : role === "manufacturer" ? "secondary" : "accent";

  // Filtered items based on search and active tab
  const filteredItems = inventoryItems[role]
    .filter((item) => activeTab === "all" || item.status === "Low Stock")
    .filter(
      (item) =>
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and track your inventory items</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="cyber-button">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-8 border-border/50 bg-background/50 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             {/* Use controlled Tabs component */}
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
               <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm border border-border/50">
                 <TabsTrigger
                   value="all"
                   className={`data-[state=active]:bg-${roleColor}/20 data-[state=active]:text-${roleColor} transition-all duration-300`}
                 >
                   All
                 </TabsTrigger>
                 <TabsTrigger
                   value="low"
                   className={`data-[state=active]:bg-${roleColor}/20 data-[state=active]:text-${roleColor} transition-all duration-300`}
                 >
                   Low Stock
                 </TabsTrigger>
               </TabsList>
             </Tabs>
            <Button variant="outline" size="icon" className="cyber-button">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <div
            className={`absolute -inset-0.5 rounded-lg bg-gradient-to-br from-${roleColor} to-${roleColor}/30 opacity-30 blur-sm`}
          ></div>
          <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>
                    {activeTab === "all" ? "All inventory items" : "Items with low stock levels"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs border border-primary/30">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-primary">Blockchain Verified</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-4 py-3 text-left font-medium">
                        <div className="flex items-center gap-1">
                          ID
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        <div className="flex items-center gap-1">
                          Name
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Category</th>
                      <th className="px-4 py-3 text-left font-medium">
                        <div className="flex items-center gap-1">
                          Quantity
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Expiry Date</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, index) => ( // Use the filteredItems array
                      <tr
                        key={item.id}
                        className={`border-b border-border/50 transition-all duration-500 ${
                          isLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ transitionDelay: `${index * 50}ms` }}
                      >
                        <td className="px-4 py-3 font-medium">{item.id}</td>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {item.status === "In Stock" ? (
                              <CheckCircle2 className={`mr-2 h-4 w-4 text-${roleColor}`} />
                            ) : (
                              <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                            )}
                            <span className={item.status === "In Stock" ? `text-${roleColor}` : "text-amber-500"}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{item.expiry}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Package className="h-4 w-4" /> {/* Icon for details? */}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Search className="h-4 w-4" /> {/* Icon for track? */}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredItems.length === 0 && ( // Check filteredItems length
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-3">
                    <Box className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No items found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                       ? "No items match your search."
                       : activeTab === "all"
                       ? "Your inventory is empty."
                       : "No low stock items found."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Removed the second summary card as it wasn't present in the provided code */}

      </div>
    </DashboardLayout>
  );
}