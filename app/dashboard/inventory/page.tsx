"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { IInventoryItem } from "@/models/Inventory"
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import AddItemModal from "@/components/inventory/AddItemModal"
import EditItemModal from "@/components/inventory/EditItemModal"
import DeleteItemModal from "@/components/inventory/DeleteItemModal"
import { toast } from "react-hot-toast"

interface InventoryFormData {
  name: string
  description: string
  quantity: number
  price: number
  category: string
  imageUrl: string
}

export default function InventoryPage() {
  const { walletAddress } = useWallet()
  const [items, setItems] = useState<IInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<IInventoryItem | null>(null)

  const fetchInventory = async () => {
    if (!walletAddress) return

    try {
      const response = await fetch(`/api/inventory?walletAddress=${walletAddress}`)
      if (!response.ok) throw new Error("Failed to fetch inventory")
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast.error("Failed to load inventory items")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (walletAddress) {
      fetchInventory()
    }
  }, [walletAddress])

  const handleAddItem = async (item: InventoryFormData) => {
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, walletAddress }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add item")
      }

      const newItem = await response.json()
      setItems((prevItems) => [...prevItems, newItem])
      setShowAddModal(false)
      toast.success("Item added successfully")
    } catch (error) {
      console.error("Error adding item:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add item")
    }
  }

  const handleEditItem = async (item: Partial<IInventoryItem>) => {
    if (!selectedItem) return

    try {
      const response = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          name: selectedItem.name,
          ...item,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update item")
      }

      const updatedItem = await response.json()
      setItems((prevItems) => prevItems.map((i) => (i.name === selectedItem.name ? updatedItem : i)))
      setShowEditModal(false)
      setSelectedItem(null)
      toast.success("Item updated successfully")
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update item")
    }
  }

  const handleDeleteItem = async () => {
    if (!selectedItem) return

    try {
      const response = await fetch(
        `/api/inventory?walletAddress=${walletAddress}&name=${selectedItem.name}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete item")
      }

      setItems((prevItems) => prevItems.filter((i) => i.name !== selectedItem.name))
      setShowDeleteModal(false)
      setSelectedItem(null)
      toast.success("Item deleted successfully")
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete item")
    }
  }

  if (!walletAddress) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please connect your wallet to view inventory</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No items in inventory. Add your first item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{item.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedItem(item)
                    setShowEditModal(true)
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedItem(item)
                    setShowDeleteModal(true)
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddItem}
        />
      )}

      {showEditModal && selectedItem && (
        <EditItemModal
          item={selectedItem}
          onClose={() => {
            setShowEditModal(false)
            setSelectedItem(null)
          }}
          onSave={handleEditItem}
        />
      )}

      {showDeleteModal && selectedItem && (
        <DeleteItemModal
          item={selectedItem}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedItem(null)
          }}
          onDelete={handleDeleteItem}
        />
      )}
    </div>
  )
} 