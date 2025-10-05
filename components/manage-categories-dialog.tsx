"use client"

import { useState, useEffect } from "react"
import { storage, type Category, DEFAULT_CATEGORIES } from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"

interface ManageCategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EMOJI_OPTIONS = ["🍔", "🚌", "📚", "📱", "🍿", "🎮", "✂️", "💰", "🏠", "⚡", "🎵", "👕", "💊", "🎓", "🎨", "⚽"]

export function ManageCategoriesDialog({ open, onOpenChange }: ManageCategoriesDialogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState("💰")

  useEffect(() => {
    if (open) {
      setCategories(storage.getCategories())
    }
  }, [open])

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name")
      return
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      color: "oklch(0.6 0.15 180)",
    }

    storage.addCategory(newCategory)
    setCategories([...categories, newCategory])
    setNewCategoryName("")
    setNewCategoryIcon("💰")
  }

  const handleDeleteCategory = (id: string) => {
    const isDefault = DEFAULT_CATEGORIES.some((c) => c.id === id)
    if (isDefault) {
      alert("Cannot delete default categories")
      return
    }

    if (confirm("Delete this category?")) {
      storage.deleteCategory(id)
      setCategories(categories.filter((c) => c.id !== id))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Category */}
          <Card className="p-4 bg-muted/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Custom Category
            </h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder="e.g., Gym, Hobbies"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewCategoryIcon(emoji)}
                      className={`p-2 text-2xl rounded-lg border-2 transition-all ${
                        newCategoryIcon === emoji
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleAddCategory} className="w-full">
                Add Category
              </Button>
            </div>
          </Card>

          {/* Existing Categories */}
          <div className="space-y-2">
            <h3 className="font-semibold">Your Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const isDefault = DEFAULT_CATEGORIES.some((c) => c.id === category.id)
                return (
                  <Card key={category.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="flex-1 font-medium">{category.name}</span>
                      {isDefault ? (
                        <span className="text-xs text-muted-foreground">Default</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
