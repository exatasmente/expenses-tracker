"use client"

import type React from "react"
import { useState } from "react"
import { useExpenses, type Transaction, type Category } from "../contexts/ExpenseContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "../contexts/LanguageContext"

const ExpenseForm: React.FC = () => {
  const { addTransaction, categories, goals, addCategory } = useExpenses()
  const { t } = useLanguage()
  const [transaction, setTransaction] = useState<Partial<Transaction>>({
    description: "",
    amount: 0,
    category: "",
    paymentStatus: "Pending",
    date: "",
    type: "expense",
    source: "",
    isRecurring: false,
    tags: [],
  })
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ name: "", type: "expense" })
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transaction.description || !transaction.amount || !transaction.category || !transaction.date) {
      alert(t("fillAllFields"))
      return
    }
    addTransaction({
      ...transaction,
      id: Date.now().toString(),
      amount: Number(transaction.amount),
    } as Transaction)
    setTransaction({
      description: "",
      amount: 0,
      category: "",
      paymentStatus: "Pending",
      date: "",
      type: "expense",
      source: "",
      isRecurring: false,
      tags: [],
    })
  }

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.type) {
      const addedCategory = addCategory({
        ...newCategory,
        id: Date.now().toString(),
      } as Category)
      setTransaction({ ...transaction, category: addedCategory.id })
      setNewCategory({ name: "", type: "expense" })
      setShowNewCategoryDialog(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTransaction({ ...transaction, receipt: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card id="expense-form" className="mb-4">
      <CardHeader>
        <CardTitle>{t("addTransaction")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">{t("description")}</Label>
            <Input
              id="description"
              value={transaction.description}
              onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">{t("amount")}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={transaction.amount}
              onChange={(e) => setTransaction({ ...transaction, amount: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">{t("type")}</Label>
            <Select
              value={transaction.type}
              onValueChange={(value: "expense" | "income") =>
                setTransaction({ ...transaction, type: value, category: "" })
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder={t("selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">{t("expense")}</SelectItem>
                <SelectItem value="income">{t("income")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">{t("category")}</Label>
            <Select
              value={transaction.category}
              onValueChange={(value) => setTransaction({ ...transaction, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((category) => category.type === transaction.type)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {transaction.type === "income" && (
            <div>
              <Label htmlFor="source">{t("source")}</Label>
              <Input
                id="source"
                value={transaction.source}
                onChange={(e) => setTransaction({ ...transaction, source: e.target.value })}
              />
            </div>
          )}
          <div>
            <Label htmlFor="paymentStatus">{t("paymentStatus")}</Label>
            <Select
              value={transaction.paymentStatus}
              onValueChange={(value: "Paid" | "Pending" | "Overdue") =>
                setTransaction({ ...transaction, paymentStatus: value })
              }
            >
              <SelectTrigger id="paymentStatus">
                <SelectValue placeholder={t("selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">{t("paid")}</SelectItem>
                <SelectItem value="Pending">{t("pending")}</SelectItem>
                <SelectItem value="Overdue">{t("overdue")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date">{t("date")}</Label>
            <Input
              id="date"
              type="date"
              value={transaction.date}
              onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="receipt">{t("receipt")}</Label>
            <Input id="receipt" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isRecurring"
              checked={transaction.isRecurring}
              onCheckedChange={(checked) => setTransaction({ ...transaction, isRecurring: checked })}
            />
            <Label htmlFor="isRecurring">{t("recurringTransaction")}</Label>
          </div>
          {transaction.isRecurring && (
            <>
              <div>
                <Label htmlFor="recurrenceInterval">{t("recurrenceInterval")}</Label>
                <Select
                  value={transaction.recurrenceInterval}
                  onValueChange={(value: "weekly" | "monthly" | "yearly") =>
                    setTransaction({ ...transaction, recurrenceInterval: value })
                  }
                >
                  <SelectTrigger id="recurrenceInterval">
                    <SelectValue placeholder={t("selectInterval")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{t("weekly")}</SelectItem>
                    <SelectItem value="monthly">{t("monthly")}</SelectItem>
                    <SelectItem value="yearly">{t("yearly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recurrenceEndDate">{t("recurrenceEndDate")}</Label>
                <Input
                  id="recurrenceEndDate"
                  type="date"
                  value={transaction.recurrenceEndDate}
                  onChange={(e) => setTransaction({ ...transaction, recurrenceEndDate: e.target.value })}
                />
              </div>
            </>
          )}
          <div>
            <Label htmlFor="tags">{t("tags")}</Label>
            <Input
              id="tags"
              value={transaction.tags?.join(", ")}
              onChange={(e) =>
                setTransaction({ ...transaction, tags: e.target.value.split(",").map((tag) => tag.trim()) })
              }
            />
          </div>
          <div>
            <Label htmlFor="goal">{t("linkToGoal")}</Label>
            <Select
              value={transaction.goalId}
              onValueChange={(value) => setTransaction({ ...transaction, goalId: value })}
            >
              <SelectTrigger id="goal">
                <SelectValue placeholder={t("selectGoal")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">{t("none")}</SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">{t("submit")}</Button>
        </form>
      </CardContent>

      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addNewCategory")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newCategoryName">{t("categoryName")}</Label>
              <Input
                id="newCategoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="newCategoryType">{t("categoryType")}</Label>
              <Select
                value={newCategory.type}
                onValueChange={(value: "income" | "expense") => setNewCategory({ ...newCategory, type: value })}
              >
                <SelectTrigger id="newCategoryType">
                  <SelectValue placeholder={t("selectType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t("income")}</SelectItem>
                  <SelectItem value="expense">{t("expense")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddCategory}>{t("addCategory")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default ExpenseForm

