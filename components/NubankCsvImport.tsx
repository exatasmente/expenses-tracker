"use client"

import type React from "react"
import { useState } from "react"
import { Category, useExpenses } from "../contexts/ExpenseContext"
import { useLanguage } from "../contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NubankTransaction {
  date: string
  amount: number
  identifier: string
  description: string
  category: string
  type: string
}

const NubankCsvImport: React.FC = () => {
  const { addTransactions, addCategory, categories } = useExpenses()
  const { t } = useLanguage()
  const [previewData, setPreviewData] = useState<NubankTransaction[]>([])

  const mapCategory = (description: string): string => {
    if (description.includes("Transferência enviada pelo Pix")) return "Transferências"
    if (description.includes("Compra no débito")) return "Alimentação/Restaurantes"
    if (description.includes("Crédito em conta")) return "Ajustes"
    if (description.includes("Compra de criptomoedas")) return "Investimentos"
    return "Outros"
  }

  const mapType = (description: string): string => {
    if (description.includes("Transferência")) return "Transferência"
    if (description.includes("Compra")) return "Compra"
    if (description.includes("criptomoedas")) return "Investimento"
    return "Outros"
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const lines = content.split("\n").filter((line) => line.trim() !== "")
          if (lines.length > 1) {
            const headers = lines[0].split(",")
            const transactions: NubankTransaction[] = lines.slice(1, lines.length).map((line) => {
              const values = line.split(",")
              const amount = Number.parseFloat(values[1]) || 0
              return {
                date: values[0] || "",
                amount,
                identifier: values[2] || "",
                description: values[3] || "",
                category: mapCategory(values[3] || ""),
                type: amount < 0 ? "expense" : "income",
              }
            })
            setPreviewData(transactions)
          } else {
            setPreviewData([])
            console.error("No data found in the CSV file")
          }
        } catch (error) {
          console.error("Error parsing CSV file:", error)
          setPreviewData([])
        }
      }
      reader.readAsText(file)
    }
  }

  const handleImport = () => {
    addTransactions(previewData.map((transaction) => {
      let category = categories.find((c) => c.name === transaction.category && c.type === transaction.type);
      if (!category) {
        category = addCategory({name: transaction.category, type: transaction.type, id: transaction.category} as Category);
      }

      

      return{
        id: transaction.identifier,
        description: transaction.description,
        amount: Math.abs(transaction.amount),
        category: category.id,
        paymentStatus: "Paid",
        date: transaction.date.split("/").reverse().join("-"), // Convert DD/MM/YYYY to YYYY-MM-DD
        type: transaction.amount < 0 ? "expense" : "income",
        isRecurring: false,
        tags: [transaction.type],
      }
    }))
    // setPreviewData([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("importNubankCsv")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Input type="file" accept=".csv" onChange={handleFileUpload} />
        {previewData && previewData.length > 0 ? (
          <>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("description")}</TableHead>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleImport} className="mt-4">
              {t("importTransactions")}
            </Button>
          </>
        ) : (
          <p>{t("noPreviewData")}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default NubankCsvImport

