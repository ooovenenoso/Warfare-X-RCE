"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Transaction = {
  transaction_number: string
  username: string
  package_name: string
  final_amount: number
  status: string
  created_at: string
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "transaction_number",
    header: "ID",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("transaction_number")}</div>,
  },
  {
    accessorKey: "username",
    header: "User",
    cell: ({ row }) => <div className="font-medium text-white">{row.getValue("username")}</div>,
  },
  {
    accessorKey: "package_name",
    header: "Package",
  },
  {
    accessorKey: "final_amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("final_amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={
          row.getValue("status") === "completed"
            ? "bg-green-500/20 text-green-400 border-green-500/30"
            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        }
      >
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
  },
]
