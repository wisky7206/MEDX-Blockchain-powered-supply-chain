// File: app/dashboard/[role]/settings/page.tsx
"use client"

import React, { useState, useEffect, use } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from '@/context/wallet-context'; // Adjust the path if needed
import DashboardLayout from '@/components/dashboard-layout'; // Adjust the path if needed
import { Copy, Save, Edit, Wallet, CheckCircle, AlertCircle } from "lucide-react"; // Import relevant icons
import { toast } from "@/hooks/use-toast"; // Assuming path is correct, replace if needed


// Define the props for the Settings page, including the 'role' parameter
interface SettingsPageProps {
  params: Promise<{ role: "provider" | "manufacturer" | "distributor" | "retailer" }>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ params }) => {
  // Unwrap the params promise using React.use()
  const resolvedParams = use(params);
  const { role } = resolvedParams;

  const { address, userData, updateUserProfile } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    location: "",
    registrationId: "",
    licenseNumber: "",
  });
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading state during save

  // Populate form when userData from context is available
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        companyName: userData.companyName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        location: userData.location || "",
        registrationId: userData.registrationId || "", // Ensure these exist in your IUser interface
        licenseNumber: userData.licenseNumber || "",  // Ensure these exist in your IUser interface
      });
    }
  }, [userData]);

  // Handle input changes in edit mode
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Function to save the updated profile data using the context function
  const handleSave = async () => {
    if (!address || !updateUserProfile) {
      toast({ title: "Error", description: "Wallet not connected or update function unavailable.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile(address, formData);
      setIsEditing(false);
      toast({ title: "Success", description: "Profile updated successfully!" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: error.message || "Failed to update profile.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to copy wallet address
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

   // Determine color based on role
   const roleColor =
    role === "provider" || role === "retailer" ? "primary" : role === "manufacturer" ? "secondary" : "accent";


  return (
    // Assuming DashboardLayout accepts role prop
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your profile and account settings</p>
          </div>
          {/* Toggle Edit/Save Button */}
          <Button
             onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
             className="cyber-button" // Assuming cyber-button class exists
             disabled={isLoading}
           >
            {isEditing ? (
              <>
                {isLoading ? (
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-primary"></div>
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Profile Information Card */}
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
             className="relative"
           >
             <div
               className={`absolute -inset-0.5 rounded-lg bg-gradient-to-br from-${roleColor} to-${roleColor}/30 opacity-30 blur-sm`}
             ></div>
             <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                 <CardTitle>Profile Information</CardTitle>
                 <CardDescription>
                   View and edit your personal and business details.
                 </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Form fields using formData state */}
                    <div className="space-y-2">
                     <Label htmlFor="name">Name</Label>
                     <Input id="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="border-border/50 bg-background/80 backdrop-blur-sm"/>
                    </div>
                    <div className="space-y-2">
                     <Label htmlFor="companyName">Company Name</Label>
                     <Input id="companyName" value={formData.companyName} onChange={handleInputChange} disabled={!isEditing} className="border-border/50 bg-background/80 backdrop-blur-sm"/>
                    </div>
                    <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input id="email" type="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className="border-border/50 bg-background/80 backdrop-blur-sm"/>
                    </div>
                    <div className="space-y-2">
                     <Label htmlFor="phone">Phone</Label>
                     <Input id="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} className="border-border/50 bg-background/80 backdrop-blur-sm"/>
                    </div>
                    <div className="space-y-2">
                     <Label htmlFor="location">Location</Label>
                     <Input id="location" value={formData.location} onChange={handleInputChange} disabled={!isEditing} className="border-border/50 bg-background/80 backdrop-blur-sm"/>
                    </div>
                 </CardContent>
             </Card>
          </motion.div>

          {/* Account Information Card */}
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3, delay: 0.1 }}
             className="relative"
          >
            <div
               className={`absolute -inset-0.5 rounded-lg bg-gradient-to-br from-${roleColor} to-${roleColor}/30 opacity-30 blur-sm`}
             ></div>
            <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your wallet address and verification status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Address Display */}
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <div className="flex items-center gap-2">
                    <Input value={address || "Not connected"} disabled className="font-mono text-sm border-border/50 bg-background/80 backdrop-blur-sm" />
                    <Button variant="outline" size="icon" className="cyber-button" onClick={copyAddress} disabled={!address}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && <p className="text-xs text-primary mt-1">Address copied!</p>}
                </div>
                {/* Role Display */}
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={role} disabled className="border-border/50 bg-background/80 backdrop-blur-sm capitalize" />
                </div>
                {/* Verification Status */}
                <div className="space-y-2">
                   <Label>Verification Status</Label>
                   <div className="flex items-center gap-2 text-sm">
                    {userData?.verified ? (
                     <> <CheckCircle className="h-4 w-4 text-emerald-500" /> <span className="text-emerald-500">Verified</span> </>
                    ) : (
                     <> <AlertCircle className="h-4 w-4 text-amber-500" /> <span className="text-amber-500">Not Verified</span> </>
                    )}
                   </div>
                </div>
                 {/* Registration and License Info */}
                <div className="space-y-2">
                  <Label htmlFor="registrationId">Registration ID</Label>
                  <Input id="registrationId" value={formData.registrationId} onChange={handleInputChange} disabled={!isEditing} className="border-border/50 bg-background/80 backdrop-blur-sm"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input id="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} disabled={!isEditing} className="border-border/50 bg-background/80 backdrop-blur-sm"/>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;