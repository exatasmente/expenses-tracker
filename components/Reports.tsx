"use client"

import { useState, useEffect } from "react"
import { useExpenses } from "../contexts/ExpenseContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorBoundary } from "react-error-boundary"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sankey,
  Rectangle,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { useLanguage } from "../contexts/LanguageContext"
import NubankCsvImport from "./NubankCsvImport"
import {
  detectRecurringTransactions,
  detectUnusualExpenses,
  analyzeCryptoPerformance,
  calculateAverageCost,
} from "../utils/dataAnalysis"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

const Reports: React.FC = () => {
  const { transactions, categories, goals } = useExpenses()
  const { t } = useLanguage()
  const [monthlyData, setMonthlyData] = useState<any>({})
  const [topCategories, setTopCategories] = useState<any[]>([])
  const [sankeyData, setSankeyData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] })
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<Transaction[]>([])
  const [unusualExpenses, setUnusualExpenses] = useState<Transaction[]>([])
  const [cryptoPerformance, setCryptoPerformance] = useState<{
    totalInvested: number
    totalValue: number
    performance: number
  }>({ totalInvested: 0, totalValue: 0, performance: 0 })
  const [averageCost, setAverageCost] = useState<number>(0)
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<any[]>([])
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([])
  const [dailyCashFlow, setDailyCashFlow] = useState<any[]>([])
  const [fixedVsVariable, setFixedVsVariable] = useState<any[]>([])
  const [goalProgress, setGoalProgress] = useState<any[]>([])
  const [savingsRate, setSavingsRate] = useState<any[]>([])
  const [expenseToIncomeRatio, setExpenseToIncomeRatio] = useState<any[]>([])
  const [financialDecisionImpact, setFinancialDecisionImpact] = useState<any[]>([])

  useEffect(() => {
    if (transactions.length > 0) {
      processData()
    } else {
      // Reset states to default values when there are no transactions
      setMonthlyData({})
      setTopCategories([])
      setSankeyData({ nodes: [], links: [] })
      setHeatmapData([])
      setRecurringTransactions([])
      setUnusualExpenses([])
      setCryptoPerformance({ totalInvested: 0, totalValue: 0, performance: 0 })
      setAverageCost(0)
      setIncomeVsExpenses([])
      setCategoryDistribution([])
      setDailyCashFlow([])
      setFixedVsVariable([])
      setGoalProgress([])
      setSavingsRate([])
      setExpenseToIncomeRatio([])
      setFinancialDecisionImpact([])
    }
  }, [transactions])

  const processData = () => {
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

    // Monthly summary and Income vs Expenses
    const summary = transactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.totalIncome += t.amount
        else if (t.type === "expense") acc.totalExpenses += t.amount
        return acc
      },
      { totalIncome: 0, totalExpenses: 0 },
    )
    setMonthlyData(summary)
    setIncomeVsExpenses([
      { name: t("income"), value: summary.totalIncome },
      { name: t("expenses"), value: summary.totalExpenses },
    ])

    // Category distribution
    const categoryExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          const category = categories.find((c) => c.id === t.category)?.name || t.category
          acc[category] = (acc[category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )
    setCategoryDistribution(
      Object.entries(categoryExpenses).map(([category, amount]) => ({ name: category, value: amount })),
    )

    // Daily cash flow
    const dailyData = transactions.reduce(
      (acc, t) => {
        const date = t.date.split("T")[0]
        if (!acc[date]) acc[date] = { date, income: 0, expenses: 0 }
        if (t.type === "income") acc[date].income += t.amount
        else acc[date].expenses += t.amount
        return acc
      },
      {} as Record<string, { date: string; income: number; expenses: number }>,
    )
    setDailyCashFlow(Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)))

    // Fixed vs Variable expenses
    const fixedCategories = ["Rent", "Utilities", "Insurance"] // Add more as needed
    const fixedExpenses = transactions
      .filter(
        (t) =>
          t.type === "expense" && fixedCategories.includes(categories.find((c) => c.id === t.category)?.name || ""),
      )
      .reduce((sum, t) => sum + t.amount, 0)
    const variableExpenses = summary.totalExpenses - fixedExpenses
    setFixedVsVariable([
      { name: t("fixed"), value: fixedExpenses },
      { name: t("variable"), value: variableExpenses },
    ])

    // Goal progress
    setGoalProgress(
      goals.map((goal) => {
        const linkedTransactions = transactions.filter((t) => t.goalId === goal.id)
        const totalAmount = linkedTransactions.reduce((sum, t) => sum + t.amount, 0)
        const progress = Math.min(100, (totalAmount / goal.targetAmount) * 100)
        return { name: goal.name, value: progress }
      }),
    )

    // Heatmap data
    const heatmap = transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          const date = new Date(t.date)
          const day = date.getDay()
          const hour = date.getHours()
          acc[day] = acc[day] || {}
          acc[day][hour] = (acc[day][hour] || 0) + t.amount
          return acc
        },
        {} as Record<number, Record<number, number>>,
      )
    setHeatmapData(
      Object.entries(heatmap).flatMap(([day, hours]) =>
        Object.entries(hours).map(([hour, value]) => ({ day: Number(day), hour: Number(hour), value })),
      ),
    )

    // Other existing calculations
    setRecurringTransactions(detectRecurringTransactions(transactions))
    setUnusualExpenses(detectUnusualExpenses(transactions))
    setCryptoPerformance(analyzeCryptoPerformance(transactions))
    setAverageCost(calculateAverageCost(transactions))

    // Top 3 expense categories
    const categoryExpenses2 = transactions
      .filter((t) => t.type === "expense" && t.category && t.amount)
      .reduce(
        (acc, t) => {
          const category = categories.find((c) => c.id === t.category)?.name || t.category
          acc[category] = (acc[category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

    setTopCategories(
      Object.entries(categoryExpenses2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, amount]) => ({ category, amount })),
    )

    // Sankey data for transfers
    const transfers = transactions.filter((t) => t.category === "Transferências" && t.description && t.amount)
    const sankeyNodes = [
      ...new Set(
        transfers.flatMap((t) => {
          const parts = t.description.split(" - ")
          return [parts[1], parts[2]].filter(Boolean)
        }),
      ),
    ]
    const sankeyLinks = transfers
      .map((t) => {
        const parts = t.description.split(" - ")
        return {
          source: parts[1],
          target: parts[2],
          value: t.amount,
        }
      })
      .filter((link) => link.source && link.target)

    setSankeyData({
      nodes: sankeyNodes.map((name) => ({ name })),
      links: sankeyLinks,
    })

    // Savings Rate
    const monthlySavingsRate = Object.values(dailyData).map((day) => {
      const savingsRate = day.income > 0 ? ((day.income - day.expenses) / day.income) * 100 : 0
      return { date: day.date, savingsRate }
    })
    setSavingsRate(monthlySavingsRate)

    // Expense to Income Ratio
    const monthlyExpenseToIncomeRatio = Object.values(dailyData).map((day) => {
      const ratio = day.income > 0 ? (day.expenses / day.income) * 100 : 0
      return { date: day.date, ratio }
    })
    setExpenseToIncomeRatio(monthlyExpenseToIncomeRatio)

    // Financial Decision Impact
    const decisions = [
      { name: t("budgeting"), impact: 8 },
      { name: t("investing"), impact: 7 },
      { name: t("debtReduction"), impact: 9 },
      { name: t("emergencyFund"), impact: 6 },
      { name: t("incomeIncrease"), impact: 8 },
    ]
    setFinancialDecisionImpact(decisions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("reports")}</CardTitle>
      </CardHeader>
      <CardContent>
        <NubankCsvImport />

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("incomeVsExpenses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("categoryDistribution")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dailyCashFlow")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyCashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#82ca9d" name={t("income")} />
                  <Line type="monotone" dataKey="expenses" stroke="#8884d8" name={t("expenses")} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("fixedVsVariableExpenses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fixedVsVariable}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("goalProgress")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={goalProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name={t("progress")} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("expenseHeatmap")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" type="number" name={t("hour")} domain={[0, 23]} />
                  <YAxis dataKey="day" type="number" name={t("day")} domain={[0, 6]} />
                  <ZAxis dataKey="value" range={[0, 500]} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={heatmapData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-sm text-muted-foreground mt-2">{t("heatmapNote")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("savingsRate")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={savingsRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="savingsRate" stroke="#82ca9d" name={t("savingsRate")} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("expenseToIncomeRatio")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={expenseToIncomeRatio}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ratio" stroke="#8884d8" name={t("expenseToIncomeRatio")} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-4">{t("monthlySummary")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg font-semibold">
                {t("totalIncome")}: ${monthlyData.totalIncome?.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg font-semibold">
                {t("totalExpenses")}: ${monthlyData.totalExpenses?.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg font-semibold">
                {t("netBalance")}: ${((monthlyData.totalIncome || 0) - (monthlyData.totalExpenses || 0)).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">{t("topExpenseCategories")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topCategories && topCategories.length > 0 ? (
            topCategories.map((category, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <p className="text-md font-semibold">
                    {category.category}: ${category.amount.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>{t("noDataAvailable")}</p>
          )}
        </div>
        <h3 className="text-lg font-semibold mt-6 mb-2">{t("transferFlow")}</h3>
        <ErrorBoundary FallbackComponent={() => <div>ERROR</div>}>
          <div style={{ width: "100%", height: 400 }}>
            {sankeyData &&
            sankeyData.nodes &&
            sankeyData.nodes.length > 0 &&
            sankeyData.links &&
            sankeyData.links.length > 0 ? (
              <ResponsiveContainer>
                <Sankey
                  data={sankeyData}
                  node={<Rectangle fill="#8884d8" />}
                  link={{ stroke: "#77c878" }}
                  nodePadding={50}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Tooltip />
                </Sankey>
              </ResponsiveContainer>
            ) : (
              <p>{t("noDataAvailable")}</p>
            )}
          </div>
        </ErrorBoundary>

        <h3 className="text-lg font-semibold mt-6 mb-2">{t("patternDetection")}</h3>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("potentialRecurringTransactions")}</CardTitle>
            </CardHeader>
            <CardContent>
              {recurringTransactions && recurringTransactions.length > 0 ? (
                <ul>
                  {recurringTransactions.map((transaction, index) => (
                    <li key={index}>
                      {transaction.description} - ${transaction.amount.toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t("noRecurringTransactions")}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("unusualExpenses")}</CardTitle>
            </CardHeader>
            <CardContent>
              {unusualExpenses && unusualExpenses.length > 0 ? (
                <ul>
                  {unusualExpenses.map((transaction, index) => (
                    <li key={index}>
                      {transaction.description} - ${transaction.amount.toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t("noUnusualExpenses")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">{t("investmentReport")}</h3>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("cryptoPerformance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {t("totalInvested")}: ${cryptoPerformance.totalInvested.toFixed(2)}
              </p>
              <p>
                {t("currentValue")}: ${cryptoPerformance.totalValue.toFixed(2)}
              </p>
              <p>
                {t("performance")}: ${cryptoPerformance.performance.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("averageCostPerOperation")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>${averageCost.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export default Reports

