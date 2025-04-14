// components/NewOrderModal.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form'; // Import useFieldArray
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';

// Define the structure for products and users fetched from your API
interface Product {
  _id: string; // Assuming MongoDB ObjectId string
  productId: string;
  name: string;
}

interface User {
  _id: string; // Assuming MongoDB ObjectId string
  walletAddress: string;
  name: string;
  companyName: string;
  role: string;
}

// Zod Schema for Form Validation
const orderItemSchema = z.object({
  productId: z.string().min(1, "Product selection is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
});

const formSchema = z.object({
  otherPartyAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
  items: z.array(orderItemSchema).min(1, "At least one item is required."),
  shippingAddress: z.string().optional(),
});

type OrderFormValues = z.infer<typeof formSchema>;

// Component Props
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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otherPartyAddress: '',
      items: [{ productId: '', quantity: 1 }],
      shippingAddress: '',
    },
  });

  // --- CORRECTED: Use useFieldArray ---
  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "items"
  });
  // --- END CORRECTION ---

  // Fetch Products and Users
  useEffect(() => {
    if (isOpen) {
       // Reset form when modal opens
       form.reset({
        otherPartyAddress: '',
        items: [{ productId: '', quantity: 1 }],
        shippingAddress: '',
      });

      // Fetch products
      axios.get('/api/products')
        .then(response => setProducts(response.data))
        .catch(error => {
          console.error("Failed to fetch products:", error);
          toast({ variant: "destructive", title: "Error", description: "Could not load products." });
        });

      // Fetch users
      axios.get('/api/users')
        .then(response => {
            const otherUsers = response.data.filter((user: User) =>
                user.walletAddress.toLowerCase() !== currentUserAddress?.toLowerCase()
            );
            setUsers(otherUsers);
        })
        .catch(error => {
          console.error("Failed to fetch users:", error);
          toast({ variant: "destructive", title: "Error", description: "Could not load users." });
        });
    }
  }, [isOpen, currentUserAddress, form, toast]);

  // Form Submission Handler
  async function onSubmit(values: OrderFormValues) {
    if (!currentUserAddress) {
      toast({ variant: "destructive", title: "Error", description: "User address not found." });
      return;
    }
    setIsLoading(true);

    const buyerAddress = currentUserRole === 'retailer' || currentUserRole === 'distributor' || currentUserRole === 'manufacturer' ? currentUserAddress : values.otherPartyAddress;
    const sellerAddress = currentUserRole === 'provider' || currentUserRole === 'manufacturer' || currentUserRole === 'distributor' ? currentUserAddress : values.otherPartyAddress;

    if (buyerAddress.toLowerCase() === sellerAddress.toLowerCase()) {
        toast({ variant: "destructive", title: "Error", description: "Buyer and Seller cannot be the same." });
        setIsLoading(false);
        return;
    }

    const orderPayload = {
      buyerAddress: buyerAddress,
      sellerAddress: sellerAddress,
      items: values.items.map(item => ({
          productId: item.productId, // Sends MongoDB _id
          quantity: item.quantity,
      })),
      shippingAddress: values.shippingAddress || '',
    };

    try {
      const response = await axios.post('/api/orders', orderPayload);
      toast({ title: "Success", description: `Order ${response.data.orderId} created successfully!` });
      onOrderCreated();
      onClose();
    } catch (error: any) {
      console.error("Error creating order:", error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to create order.";
      toast({ variant: "destructive", title: "Error", description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }

  // Helper functions for labels/roles
  const getOtherPartyLabel = () => {
    switch (currentUserRole) {
        case 'retailer': return 'Distributor Address';
        case 'distributor': return 'Manufacturer Address';
        case 'manufacturer': return 'Provider Address';
        case 'provider': return 'Manufacturer Address';
        default: return 'Other Party Address';
    }
  };

  const getOtherPartyRole = () => {
      switch (currentUserRole) {
          case 'retailer': return 'distributor';
          case 'distributor': return 'manufacturer';
          case 'manufacturer': return 'provider';
          case 'provider': return 'manufacturer';
          default: return '';
      }
  }

  const filteredUsers = users.filter(user => user.role === getOtherPartyRole());

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Select Other Party */}
             <FormField
              control={form.control}
              name="otherPartyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getOtherPartyLabel()}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select a ${getOtherPartyRole()}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <SelectItem key={user._id} value={user.walletAddress}>
                              {user.companyName} ({user.name}) - {user.walletAddress.substring(0, 6)}...
                            </SelectItem>
                          ))
                      ) : (
                          <SelectItem value="no-users" disabled>No available users found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Items Section */}
            <div className='space-y-4'>
              <FormLabel>Order Items</FormLabel>
              {fields.map((field, index) => ( // This should now work
                <div key={field.id} className="flex items-end gap-2 border p-3 rounded-md relative">
                   <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field: itemField }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Product</FormLabel>
                         <Select onValueChange={itemField.onChange} defaultValue={itemField.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                             {products.length > 0 ? (
                                products.map((product) => (
                                <SelectItem key={product._id} value={product._id}> {/* Send MongoDB _id */}
                                    {product.name} ({product.productId})
                                </SelectItem>
                                ))
                             ) : (
                                <SelectItem value="no-products" disabled>No products found</SelectItem>
                             )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field: itemField }) => (
                      <FormItem className="w-24">
                        <FormLabel className="text-xs">Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...itemField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length <= 1}
                    className='mb-1'
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
               <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: '', quantity: 1 })}
                  className="mt-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
                 {form.formState.errors.items && typeof form.formState.errors.items !== 'object' && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>
                 )}
            </div>

            {/* Optional Shipping Address */}
            <FormField
              control={form.control}
              name="shippingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Address (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter shipping address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}