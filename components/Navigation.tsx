import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, BarChart3, Settings, Home, Target, TrendingUp, Globe, Download, Upload } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useExpenses } from "../contexts/ExpenseContext"

const Navigation: React.FC = () => {
  const { language, setLanguage, t } = useLanguage()
  const { exportData, importData } = useExpenses()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === "string") {
          try {
            importData(content)
            alert(t("importSuccess"))
          } catch (error) {
            alert(t("importError"))
          }
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 flex justify-around items-center overflow-x-auto">
      <Button variant="ghost" size="icon" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <Home className="h-5 w-5" />
        <span className="sr-only">{t("home")}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => document.getElementById("expense-form")?.scrollIntoView({ behavior: "smooth" })}
      >
        <PlusCircle className="h-5 w-5" />
        <span className="sr-only">{t("addTransaction")}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => document.getElementById("reports")?.scrollIntoView({ behavior: "smooth" })}
      >
        <BarChart3 className="h-5 w-5" />
        <span className="sr-only">{t("reports")}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => document.getElementById("forecast")?.scrollIntoView({ behavior: "smooth" })}
      >
        <TrendingUp className="h-5 w-5" />
        <span className="sr-only">{t("financialForecast")}</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={exportData}>
        <Download className="h-5 w-5" />
        <span className="sr-only">{t("export")}</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-5 w-5" />
        <span className="sr-only">{t("import")}</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setLanguage(language === "en" ? "pt-BR" : "en")}>
        <Globe className="h-5 w-5" />
        <span className="sr-only">Change Language</span>
      </Button>
      <input type="file" accept=".json" onChange={handleImport} ref={fileInputRef} style={{ display: "none" }} />
    </nav>
  )
}

export default Navigation

