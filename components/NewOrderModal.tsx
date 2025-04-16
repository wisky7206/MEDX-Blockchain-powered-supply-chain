// components/NewOrderModal.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import axios from "axios";

interface User {
  _id: string;
  walletAddress: string;
  name: string;
  companyName?: string;
  role: string;
}

interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  imageUrl?: string;
}

interface CartItem extends InventoryItem {
  quantityInCart: number;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserAddress: string | null;
  currentUserRole: string;
  onOrderCreated: () => void;
}

export function NewOrderModal({
  isOpen,
  onClose,
  currentUserAddress,
  currentUserRole,
  onOrderCreated,
}: NewOrderModalProps) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch users when role is selected
  useEffect(() => {
    if (selectedRole) {
      fetchUsersByRole(selectedRole);
    }
  }, [selectedRole]);

  // Fetch inventory when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchInventoryItems(selectedUser.walletAddress);
    }
  }, [selectedUser]);

  const fetchUsersByRole = async (role: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users?role=${role}`);
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
        toast({
          title: "No users found",
          description: `No ${role}s found in the system`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryItems = async (address: string) => {
    try {
      setLoading(true);
      console.log("Fetching inventory for address:", address);
      const response = await axios.get(`/api/inventory/${address}`);
      console.log("Raw inventory response:", response);
      
      if (response.status === 200) {
        const data = response.data;
        console.log("Inventory data:", data);
        
        if (Array.isArray(data)) {
          setInventoryItems(data);
          console.log("Set inventory items:", data);
        } else {
          console.error("Invalid response format:", data);
          setInventoryItems([]);
          toast({
            title: "Error",
            description: "Invalid inventory data format",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setInventoryItems([]);
      toast({
        title: "Error",
        description: "Failed to fetch inventory items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: InventoryItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem._id === item._id);
      if (existingItem) {
        if (existingItem.quantityInCart < item.quantity) {
          return prevCart.map((cartItem) =>
            cartItem._id === item._id
              ? { ...cartItem, quantityInCart: cartItem.quantityInCart + 1 }
              : cartItem
          );
        }
        return prevCart;
      }
      return [...prevCart, { ...item, quantityInCart: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === itemId);
      if (existingItem && existingItem.quantityInCart > 1) {
        return prevCart.map((item) =>
          item._id === itemId
            ? { ...item, quantityInCart: item.quantityInCart - 1 }
            : item
        );
      }
      return prevCart.filter((item) => item._id !== itemId);
    });
  };

  const getTotalAmount = () => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantityInCart,
      0
    );
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/orders", {
        from: currentUserAddress,
        to: selectedUser?.walletAddress,
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantityInCart,
        })),
        totalAmount: getTotalAmount(),
      });

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Order created successfully",
        });
        onOrderCreated();
        onClose();
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Step 1: Select Role */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Select Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => {
                    setSelectedRole(value);
                    setSelectedUser(null);
                    setCart([]);
                    setInventoryItems([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="retailer">Retailer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedRole}
                className="w-full"
              >
                Next
              </Button>
            </div>
          )}

          {/* Step 2: Select User */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="user">Select {selectedRole}</Label>
                <Select
                  value={selectedUser?.walletAddress || ""}
                  onValueChange={(value) => {
                    const user = users.find((u) => u.walletAddress === value);
                    if (user) {
                      setSelectedUser(user);
                      fetchInventoryItems(user.walletAddress);
                    }
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select a ${selectedRole}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user.walletAddress}>
                        {user.name || user.companyName || user.walletAddress}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedUser}
                  className="flex-1"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Select Items */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Available Items</h3>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">
                    Total: ${getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : inventoryItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No items available in inventory
                </div>
              ) : (
                <div className="grid gap-4 max-h-[300px] overflow-y-auto">
                  {inventoryItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <p className="text-sm">
                          Price: ${item.price} | Available: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeFromCart(item._id)}
                          disabled={
                            !cart.find(
                              (cartItem) => cartItem._id === item._id
                            )?.quantityInCart
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">
                          {cart.find((cartItem) => cartItem._id === item._id)
                            ?.quantityInCart || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => addToCart(item)}
                          disabled={
                            (cart.find((cartItem) => cartItem._id === item._id)?.quantityInCart || 0) >= item.quantity
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={cart.length === 0 || loading}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Place Order"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}