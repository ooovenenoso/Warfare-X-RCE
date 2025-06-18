"use client"

import { useState } from "react"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "@/components/admin/columns-transactions"

export function TransactionsClient({
  initialTransactions,
  initialTransactionCount,
}: {
  initialTransactions: any[]
  initialTransactionCount: number
}) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [transactionCount, setTransactionCount] = useState(initialTransactionCount)

  // TODO: Implement server-side pagination and filtering

  return <DataTable columns={columns} data={transactions} />
}
