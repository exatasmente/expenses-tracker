"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { addDays, subDays } from "date-fns"
import { useLanguage } from "@/contexts/LanguageContext"

interface DateRangeFilterProps {
  dateRange: { from: Date; to: Date }
  setDateRange: (range: { from: Date; to: Date }) => void
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ dateRange, setDateRange }) => {
  const { t } = useLanguage()

  const setQuickDateRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days - 1),
      to: new Date(),
    })
  }

  return (
    <div className="mb-6 p-4 bg-secondary rounded-lg">
      <h2 className="text-lg font-semibold mb-4">{t("filterByDate")}</h2>
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
    </div>
  )
}

export default DateRangeFilter

