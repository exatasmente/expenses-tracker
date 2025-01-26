import type { Transaction } from "../contexts/ExpenseContext"

export const detectRecurringTransactions = (transactions: Transaction[]): Transaction[] => {
  const transactionMap = new Map<string, number>()
  const recurringTransactions: Transaction[] = []

  transactions.forEach((transaction) => {
    const key = `${transaction.description}-${transaction.amount}`
    const count = (transactionMap.get(key) || 0) + 1
    transactionMap.set(key, count)

    if (count >= 3 && !transaction.isRecurring) {
      recurringTransactions.push(transaction)
    }
  })

  return recurringTransactions
}

export const detectUnusualExpenses = (transactions: Transaction[]): Transaction[] => {
  const categoryAverages = new Map<string, number>()
  const categoryTransactions = new Map<string, Transaction[]>()

  transactions
    .filter((t) => t.type === "expense")
    .forEach((transaction) => {
      if (!categoryAverages.has(transaction.category)) {
        categoryAverages.set(transaction.category, 0)
        categoryTransactions.set(transaction.category, [])
      }
      categoryAverages.set(transaction.category, categoryAverages.get(transaction.category)! + transaction.amount)
      categoryTransactions.get(transaction.category)!.push(transaction)
    })

  categoryAverages.forEach((total, category) => {
    categoryAverages.set(category, total / categoryTransactions.get(category)!.length)
  })

  return transactions.filter((t) => t.type === "expense" && t.amount > 3 * (categoryAverages.get(t.category) || 0))
}

export const analyzeCryptoPerformance = (
  transactions: Transaction[],
): { totalInvested: number; totalValue: number; performance: number } => {
  const cryptoTransactions = transactions.filter(
    (t) => t.category === "Investimentos" && t.description.includes("criptomoedas"),
  )

  const totalInvested = cryptoTransactions.reduce((sum, t) => sum + (t.type === "expense" ? t.amount : 0), 0)
  const totalValue = cryptoTransactions.reduce((sum, t) => sum + (t.type === "income" ? t.amount : 0), 0)
  const performance = totalValue - totalInvested

  return { totalInvested, totalValue, performance }
}

export const calculateAverageCost = (transactions: Transaction[]): number => {
  const cryptoTransactions = transactions.filter(
    (t) => t.category === "Investimentos" && t.description.includes("criptomoedas"),
  )
  const totalCost = cryptoTransactions.reduce((sum, t) => sum + (t.type === "expense" ? t.amount : 0), 0)
  return totalCost / cryptoTransactions.length
}

