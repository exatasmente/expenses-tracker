"use client"

import type React from "react"
import { useState } from "react"
import { useExpenses, type Goal } from "../contexts/ExpenseContext"
import { useLanguage } from "../contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

interface GoalManagerProps {
  dateRange: { from: Date; to: Date }
}

const GoalManager: React.FC<GoalManagerProps> = ({ dateRange }) => {
  const { t } = useLanguage()
  const { goals, addGoal, updateGoal, deleteGoal, transactions } = useExpenses()
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({ name: "", targetAmount: 0, currentAmount: 0, deadline: "" })
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const filteredTransactions = transactions.filter(
    (t) => new Date(t.date) >= dateRange.from && new Date(t.date) <= dateRange.to,
  )

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) {
      alert(t("fillAllFields"))
      return
    }
    addGoal({
      ...newGoal,
      id: Date.now().toString(),
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: Number(newGoal.currentAmount) || 0,
    } as Goal)
    setNewGoal({ name: "", targetAmount: 0, currentAmount: 0, deadline: "" })
  }

  const handleUpdateGoal = (updatedGoal: Goal) => {
    updateGoal(updatedGoal.id, updatedGoal)
    setEditingGoal(null)
  }

  const handleDeleteGoal = (id: string) => {
    if (window.confirm(t("confirmDeleteGoal"))) {
      deleteGoal(id)
    }
  }

  const calculateProgress = (goal: Goal) => {
    const linkedTransactions = filteredTransactions.filter((t) => t.goalId === goal.id)
    const totalAmount = linkedTransactions.reduce((sum, t) => sum + t.amount, 0)
    return Math.min(100, Math.max(0, (totalAmount / goal.targetAmount) * 100))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("financialGoals")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddGoal} className="space-y-4 mb-4">
          <div>
            <Label htmlFor="goalName">{t("goalName")}</Label>
            <Input
              id="goalName"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="targetAmount">{t("targetAmount")}</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="deadline">{t("deadline")}</Label>
            <Input
              id="deadline"
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              required
            />
          </div>
          <Button type="submit">{t("addGoal")}</Button>
        </form>

        <div className="space-y-4">
          {goals.filter(g => g.targetAmount).map((goal) => (
            <Card key={goal.id}>
              <CardContent className="pt-4">
                <h3 className="text-lg font-semibold">{goal.name}</h3>
                <p>
                  {t("target")}: ${goal?.targetAmount?.toFixed(2)}
                </p>
                <p>
                  {t("amountPaid")}: ${(goal?.targetAmount * calculateProgress(goal) )/ 100}
                </p>
                <p>
                  {t("deadline")}: {new Date(goal.deadline).toLocaleDateString()}
                </p>
                <Progress value={calculateProgress(goal)} className="mt-2" />
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => setEditingGoal(goal)}>
                    {t("edit")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                    {t("delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingGoal && (
          <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("editGoal")}</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdateGoal(editingGoal)
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="editGoalName">{t("goalName")}</Label>
                  <Input
                    id="editGoalName"
                    value={editingGoal.name}
                    onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editTargetAmount">{t("targetAmount")}</Label>
                  <Input
                    id="editTargetAmount"
                    type="number"
                    step="0.01"
                    value={editingGoal.targetAmount}
                    onChange={(e) =>
                      setEditingGoal({ ...editingGoal, targetAmount: Number.parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDeadline">{t("deadline")}</Label>
                  <Input
                    id="editDeadline"
                    type="date"
                    value={editingGoal.deadline}
                    onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit">{t("updateGoal")}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}

export default GoalManager

