"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { ExpenseProvider } from "../contexts/ExpenseContext"
import { ErrorBoundary } from "react-error-boundary"
import { ThemeProvider } from "next-themes"
import { LanguageProvider } from "../contexts/LanguageContext"
import { Shimmer } from "@/components/Shimmer"
import { subDays } from "date-fns"
import DateRangeFilter from "../components/DateRangeFilter"

const ExpenseForm = lazy(() => import("../components/ExpenseForm"))
const ExpenseList = lazy(() => import("../components/ExpenseList"))
const Reports = lazy(() => import("../components/Reports"))
const BudgetOverview = lazy(() => import("../components/BudgetOverview"))
const GoalManager = lazy(() => import("../components/GoalManager"))
const TutorialModal = lazy(() => import("../components/TutorialModal"))
const CategoryManager = lazy(() => import("../components/CategoryManager"))
const Navigation = lazy(() => import("../components/Navigation"))
const Gamification = lazy(() => import("../components/Gamification"))
const ForecastAnalysis = lazy(() => import("../components/ForecastAnalysis"))
const InstallBanner = lazy(() => import("../components/InstallBanner"))

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <h2 className="text-lg font-semibold mb-2">Oops! Something went wrong</h2>
      <p className="mb-2">Error details:</p>
      <pre className="whitespace-pre-wrap bg-red-50 p-2 rounded">{error.message}</pre>
    </div>
  )
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Shimmer className="w-full h-48" />}>{children}</Suspense>
}

function ExpenseTrackerContent() {
  const [showTutorial, setShowTutorial] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstVisit") !== "false"
    if (isFirstVisit) {
      setShowTutorial(true)
      localStorage.setItem("firstVisit", "false")
    }

    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope)
          },
          (err) => {
            console.log("ServiceWorker registration failed: ", err)
          },
        )
      })
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "e") {
        document.getElementById("expense-form")?.scrollIntoView({ behavior: "smooth" })
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <SuspenseWrapper>
        <Navigation />
      </SuspenseWrapper>
      <main className="container mx-auto px-4 py-6 space-y-6 md:space-y-8">
        <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
        <SuspenseWrapper>
          <BudgetOverview dateRange={dateRange} />
        </SuspenseWrapper>
        <SuspenseWrapper>
          <Gamification dateRange={dateRange} />
        </SuspenseWrapper>
        <SuspenseWrapper>
          <GoalManager dateRange={dateRange} />
        </SuspenseWrapper>
        <SuspenseWrapper>
          <CategoryManager />
        </SuspenseWrapper>
        <SuspenseWrapper>
          <ExpenseList dateRange={dateRange} setDateRange={setDateRange} />
        </SuspenseWrapper>
        <section id="expense-form" className="scroll-mt-16">
          <SuspenseWrapper>
            <ExpenseForm />
          </SuspenseWrapper>
        </section>
        <section id="reports" className="scroll-mt-16">
          <SuspenseWrapper>
            <Reports />
          </SuspenseWrapper>
        </section>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <section id="forecast" className="scroll-mt-16">
            <SuspenseWrapper>
              <ForecastAnalysis dateRange={dateRange} />
            </SuspenseWrapper>
          </section>
        </ErrorBoundary>
      </main>
      {showTutorial && (
        <SuspenseWrapper>
          <TutorialModal onClose={() => setShowTutorial(false)} />
        </SuspenseWrapper>
      )}
      <SuspenseWrapper>
        <InstallBanner />
      </SuspenseWrapper>
    </div>
  )
}

export default function ExpenseTracker() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LanguageProvider>
        <ExpenseProvider>
          <ExpenseTrackerContent />
        </ExpenseProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

