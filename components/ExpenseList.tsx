"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useExpenses, type Transaction } from "../contexts/ExpenseContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "../contexts/LanguageContext"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { addDays, subDays } from "date-fns"

interface ExpenseListProps {
  dateRange: { from: Date; to: Date }
}

const ExpenseList: React.FC<ExpenseListProps> = ({ dateRange, setDateRange }) => {
  const { transactions, updateTransaction, deleteTransaction, categories, goals } = useExpenses()
  const { t } = useLanguage()
  const [filter, setFilter] = useState({ status: "", category: "all", type: "all", tag: "" })
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)


  const filteredTransactions = transactions.filter(
    (transaction) =>
      (filter.status === "" || transaction.paymentStatus === filter.status) &&
      (filter.category === "all" || transaction.category === filter.category) &&
      (filter.type === "all" || transaction.type === filter.type) &&
      (filter.tag === "" || transaction.tags.includes(filter.tag)) &&
      new Date(transaction.date) >= dateRange.from &&
      new Date(transaction.date) <= dateRange.to,
  )

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleUpdate = (updatedTransaction: Transaction) => {
    updateTransaction(updatedTransaction.id, updatedTransaction)
    setEditingTransaction(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t("confirmDelete"))) {
      deleteTransaction(id)
    }
  }

  const toggleRecurringStatus = (transaction: Transaction) => {
    updateTransaction(transaction.id, { ...transaction, isPaused: !transaction.isPaused })
  }

  const setQuickDateRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days - 1),
      to: new Date(),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentTransactions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <DateRangePicker value={dateRange} onValueChange={setDateRange} className="w-full sm:w-auto" />
            <div className="flex gap-2">
              <Button onClick={() => setQuickDateRange(7)} variant="outline" size="sm">
                7 {t("days")}
              </Button>
              <Button onClick={() => setQuickDateRange(30)} variant="outline" size="sm">
                30 {t("days")}
              </Button>
              <Button onClick={() => setQuickDateRange(90)} variant="outline" size="sm">
                90 {t("days")}
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filter.type} onValueChange={(value) => setFilter({ ...filter, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("filterByType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="expense">{t("expense")}</SelectItem>
                <SelectItem value="income">{t("income")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter.category} onValueChange={(value) => setFilter({ ...filter, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("filterByCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="bg-secondary">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{transaction.description}</h3>
                    <p className="text-sm text-muted-foreground">{transaction.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}>
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(transaction)}>
                      {t("edit")}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(transaction.id)}>
                      {t("delete")}
                    </Button>
                  </div>
                  {transaction.isRecurring && (
                    <Switch
                      checked={!transaction.isPaused}
                      onCheckedChange={() => toggleRecurringStatus(transaction)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      {editingTransaction && (
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("editTransaction")}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdate(editingTransaction)
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="edit-description">{t("description")}</Label>
                <Input
                  id="edit-description"
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-amount">{t("amount")}</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={editingTransaction.amount}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, amount: Number.parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-type">{t("type")}</Label>
                <Select
                  value={editingTransaction.type}
                  onValueChange={(value) => setEditingTransaction({ ...editingTransaction, type: value })}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder={t("selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">{t("expense")}</SelectItem>
                    <SelectItem value="income">{t("income")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">{t("category")}</Label>
                <Select
                  value={editingTransaction.category}
                  onValueChange={(value) => setEditingTransaction({ ...editingTransaction, category: value })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder={t("selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-paymentStatus">{t("paymentStatus")}</Label>
                <Select
                  value={editingTransaction.paymentStatus}
                  onValueChange={(value: "Paid" | "Pending" | "Overdue") =>
                    setEditingTransaction({ ...editingTransaction, paymentStatus: value })
                  }
                >
                  <SelectTrigger id="edit-paymentStatus">
                    <SelectValue placeholder={t("selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">{t("paid")}</SelectItem>
                    <SelectItem value="Pending">{t("pending")}</SelectItem>
                    <SelectItem value="Overdue">{t("overdue")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-date">{t("date")}</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingTransaction.date}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-goal">{t("linkToGoal")}</Label>
                <Select
                  value={editingTransaction.goalId}
                  onValueChange={(value) => setEditingTransaction({ ...editingTransaction, goalId: value })}
                >
                  <SelectTrigger id="edit-goal">
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
              <Button type="submit">{t("update")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}

export default ExpenseList

