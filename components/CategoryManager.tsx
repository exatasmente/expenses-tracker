"use client"

import type React from "react"
import { useState } from "react"
import { useExpenses, type Category } from "../contexts/ExpenseContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "../contexts/LanguageContext"

const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useExpenses()
  const { t } = useLanguage()
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ name: "", type: "expense" })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name || !newCategory.type) {
      alert(t("fillAllFields"))
      return
    }
    addCategory({
      ...newCategory,
      id: newCategory.name.toLowerCase().trim().replaceAll('  ', ' ').replaceAll(' ', '-')
    } as Category)
    setNewCategory({ name: "", type: "expense" })
  }

  const handleUpdateCategory = (updatedCategory: Category) => {
    updateCategory(updatedCategory.id, updatedCategory)
    setEditingCategory(null)
  }

  const handleDeleteCategory = (id: string) => {
    if (window.confirm(t("confirmDeleteCategory"))) {
      deleteCategory(id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("categoryManager")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddCategory} className="space-y-4 mb-4">
          <div>
            <Label htmlFor="categoryName">{t("categoryName")}</Label>
            <Input
              id="categoryName"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="categoryType">{t("categoryType")}</Label>
            <Select
              value={newCategory.type}
              onValueChange={(value: "income" | "expense") => setNewCategory({ ...newCategory, type: value })}
            >
              <SelectTrigger id="categoryType">
                <SelectValue placeholder={t("selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">{t("income")}</SelectItem>
                <SelectItem value="expense">{t("expense")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">{t("addCategory")}</Button>
        </form>

        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-500">{t(category.type)}</p>
                </div>
                <div>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => setEditingCategory(category)}>
                    {t("edit")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                    {t("delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingCategory && (
          <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("editCategory")}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdateCategory(editingCategory)
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="editCategoryName">{t("categoryName")}</Label>
                  <Input
                    id="editCategoryName"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editCategoryType">{t("categoryType")}</Label>
                  <Select
                    value={editingCategory.type}
                    onValueChange={(value: "income" | "expense") =>
                      setEditingCategory({ ...editingCategory, type: value })
                    }
                  >
                    <SelectTrigger id="editCategoryType">
                      <SelectValue placeholder={t("selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">{t("income")}</SelectItem>
                      <SelectItem value="expense">{t("expense")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">{t("updateCategory")}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}

export default CategoryManager

