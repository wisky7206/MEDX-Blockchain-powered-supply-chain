"use client"

import { IInventoryItem } from "@/models/Inventory"

interface DeleteItemModalProps {
  item: IInventoryItem
  onClose: () => void
  onDelete: () => void
}

export default function DeleteItemModal({ item, onClose, onDelete }: DeleteItemModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Delete Item</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold">{item.name}</span>? This action
          cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
} 