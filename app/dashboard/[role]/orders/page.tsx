"use client"

// 1. Import 'use' from React
import React, { use } from "react"; // Ensure 'React' is also imported if used for types

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout"; // Assuming this component exists
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, FileText, Filter, Plus, Search, XCircle } from "lucide-react";
import Link from "next/link";

// 2. Update props interface
interface OrdersPageProps {
  params: {
    role: "provider" | "manufacturer" | "distributor" | "retailer";
  };
}

export default function OrdersPage({ params }: OrdersPageProps) {
  // 3. Destructure 'role' directly from params
  const { role } = params;

  // Role-specific order data (remains the same)
  const incomingOrders = {
     provider: [
       { id: "PO-5678", from: "Acme Pharmaceuticals", date: "2023-04-05", items: 5, total: "$12,500.00", status: "Pending" },
       { id: "PO-5679", from: "MediCorp Inc.", date: "2023-04-03", items: 3, total: "$8,750.00", status: "Approved" },
       { id: "PO-5680", from: "HealthGen Labs", date: "2023-04-01", items: 7, total: "$15,200.00", status: "Rejected" },
    ],
    manufacturer: [
       { id: "DO-789", from: "PharmaDist Co.", date: "2023-04-05", items: 4, total: "$24,800.00", status: "Pending" },
       { id: "DO-790", from: "MedSupply Chain", date: "2023-04-03", items: 6, total: "$31,500.00", status: "Approved" },
       { id: "DO-791", from: "Global Pharma Distributors", date: "2023-04-01", items: 2, total: "$18,900.00", status: "Rejected" },
    ],
    distributor: [
       { id: "RO-890", from: "City Pharmacy", date: "2023-04-05", items: 8, total: "$9,600.00", status: "Pending" },
       { id: "RO-891", from: "MediMart Chain", date: "2023-04-03", items: 12, total: "$14,300.00", status: "Approved" },
       { id: "RO-892", from: "HealthPoint Stores", date: "2023-04-01", items: 5, total: "$6,750.00", status: "Rejected" },
    ],
    retailer: [], // Retailers typically don't receive orders in this model, they place them
  };

  const outgoingOrders = {
     provider: [], // Providers typically don't place orders in this model, they receive them
    manufacturer: [
       { id: "PO-5678", to: "RawMat Suppliers", date: "2023-04-04", items: 5, total: "$12,500.00", status: "Pending" },
       { id: "PO-5681", to: "BioSource Materials", date: "2023-04-02", items: 3, total: "$9,200.00", status: "Approved" },
    ],
    distributor: [
       { id: "DO-789", to: "MediPharma Inc.", date: "2023-04-04", items: 4, total: "$24,800.00", status: "Pending" },
       { id: "DO-792", to: "BioGen Manufacturers", date: "2023-04-02", items: 6, total: "$32,100.00", status: "Approved" },
    ],
    retailer: [
       { id: "RO-890", to: "MedSupply Distributors", date: "2023-04-04", items: 8, total: "$9,600.00", status: "Pending" },
       { id: "RO-893", to: "Global Health Distributors", date: "2023-04-02", items: 5, total: "$7,200.00", status: "Approved" },
    ],
  };

  // Use the 'role' variable which is now correctly obtained
  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Order
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search orders..." className="pl-8" />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="incoming">
          <TabsList>
            <TabsTrigger value="incoming">Incoming Orders</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="incoming" className="border-none p-0 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Orders</CardTitle>
                <CardDescription>Orders received from customers or downstream partners</CardDescription>
              </CardHeader>
              <CardContent>
                {incomingOrders[role].length > 0 ? (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left">Order ID</th>
                          <th className="px-4 py-3 text-left">From</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Items</th>
                          <th className="px-4 py-3 text-left">Total</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incomingOrders[role].map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="px-4 py-3 font-medium">{order.id}</td>
                            <td className="px-4 py-3">{order.from}</td>
                            <td className="px-4 py-3">{order.date}</td>
                            <td className="px-4 py-3">{order.items}</td>
                            <td className="px-4 py-3">{order.total}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {order.status === "Pending" ? (
                                  <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                ) : order.status === "Approved" ? (
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4 text-rose-500" />
                                )}
                                <span
                                  className={
                                    order.status === "Pending"
                                      ? "text-amber-500"
                                      : order.status === "Approved"
                                      ? "text-emerald-500"
                                      : "text-rose-500"
                                  }
                                >
                                  {order.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {/* Ensure the Link uses the correct role from resolvedParams */}
                              <Link href={`/dashboard/${role}/orders/${order.id}`}>
                                <Button variant="ghost" size="sm">
                                  <FileText className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-muted p-3">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No incoming orders</h3>
                    <p className="text-sm text-muted-foreground">You haven't received any orders yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="outgoing" className="border-none p-0 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Outgoing Orders</CardTitle>
                <CardDescription>Orders placed to suppliers or upstream partners</CardDescription>
              </CardHeader>
              <CardContent>
                {outgoingOrders[role].length > 0 ? (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left">Order ID</th>
                          <th className="px-4 py-3 text-left">To</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Items</th>
                          <th className="px-4 py-3 text-left">Total</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {outgoingOrders[role].map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="px-4 py-3 font-medium">{order.id}</td>
                            <td className="px-4 py-3">{order.to}</td>
                            <td className="px-4 py-3">{order.date}</td>
                            <td className="px-4 py-3">{order.items}</td>
                            <td className="px-4 py-3">{order.total}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {order.status === "Pending" ? (
                                  <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                ) : order.status === "Approved" ? (
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4 text-rose-500" />
                                )}
                                <span
                                  className={
                                    order.status === "Pending"
                                      ? "text-amber-500"
                                      : order.status === "Approved"
                                      ? "text-emerald-500"
                                      : "text-rose-500"
                                  }
                                >
                                  {order.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                               {/* Ensure the Link uses the correct role from resolvedParams */}
                              <Link href={`/dashboard/${role}/orders/${order.id}`}>
                                <Button variant="ghost" size="sm">
                                  <FileText className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-muted p-3">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No outgoing orders</h3>
                    <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}