"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  paymentStatus: "Paid" | "Pending" | "Overdue"
  date: string
  receipt?: string
  type: "expense" | "income"
  source?: string
  isRecurring: boolean
  recurrenceInterval?: "weekly" | "monthly" | "yearly"
  recurrenceEndDate?: string
  isPaused?: boolean
  tags: string[]
  goalId?: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
}

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
}

interface ExpenseContextType {
  transactions: Transaction[]
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updatedTransaction: Transaction) => void
  deleteTransaction: (id: string) => void
  goals: Goal[]
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, updatedGoal: Goal) => void
  deleteGoal: (id: string) => void
  categories: Category[]
  addCategory: (category: Category) => void
  updateCategory: (id: string, updatedCategory: Category) => void
  deleteCategory: (id: string) => void
  clearAllData: () => void
  importData: (data: string) => void
  exportData: () => void
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export const useExpenses = () => {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider")
  }
  return context
}

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions")
    const storedGoals = localStorage.getItem("goals")
    const storedCategories = localStorage.getItem("categories")
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    }
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals))
    }
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions))
    localStorage.setItem("goals", JSON.stringify(goals))
    localStorage.setItem("categories", JSON.stringify(categories))
  }, [transactions, goals, categories])

  const addTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction])
  }

  const updateTransaction = (id: string, updatedTransaction: Transaction) => {
    setTransactions(transactions.map((transaction) => (transaction.id === id ? updatedTransaction : transaction)))
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id))
  }

  const addGoal = (goal: Goal) => {
    setGoals([...goals, goal])
  }

  const updateGoal = (id: string, updatedGoal: Goal) => {
    setGoals(goals.map((goal) => (goal.id === id ? updatedGoal : goal)))
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const addCategory = (category: Category) => {
    if (!category.id) {
      category.id = category.name.toUpperCase()
    }
    setCategories([...categories, category])
    return category
  }

  const updateCategory = (id: string, updatedCategory: Category) => {
    setCategories(categories.map((category) => (category.id === id ? updatedCategory : category)))
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id))
  }

  const clearAllData = () => {
    setTransactions([])
    setGoals([])
    setCategories([])
    localStorage.removeItem("transactions")
    localStorage.removeItem("goals")
    localStorage.removeItem("categories")
  }

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData)
      setTransactions(data.transactions || [])
      setGoals(data.goals || [])
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Error importing data:", error)
      throw new Error("Invalid JSON data")
    }
  }

  const exportData = () => {
    const data = {
      transactions,
      goals,
      categories,
    }
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "expense-tracker-data.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        clearAllData,
        importData,
        exportData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

