"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { DataTable } from "@/components/admin/data-table"
import { columns, type Transaction } from "@/components/admin/columns-transactions"

interface TransactionsClientProps {
  initialTransactions: Transaction[]
  initialTransactionCount: number
}

export function TransactionsClient({ initialTransactions, initialTransactionCount }: TransactionsClientProps) {
  const [transactions] = useState<Transaction[]>(initialTransactions)

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Transaction History
        </CardTitle>
        <CardDescription className="text-sm text-gray-400">
          View all completed credit purchases ({initialTransactionCount} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={transactions} />
      </CardContent>
    </Card>
  )
}
