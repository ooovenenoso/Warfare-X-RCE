"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Package = {
  id: string
  name: string
  credits: number
  current_price: number
  is_active: boolean
  is_popular: boolean
}

export const columns: ColumnDef<Package>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium text-white">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "credits",
    header: "Credits",
    cell: ({ row }) => <div>{Number(row.getValue("credits")).toLocaleString()}</div>,
  },
  {
    accessorKey: "current_price",
    header: "Price",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("current_price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
        {row.getValue("is_active") ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "is_popular",
    header: "Popular",
    cell: ({ row }) => (row.getValue("is_popular") ? "Yes" : "No"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const pkg = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(pkg.id)}>Copy ID</DropdownMenuItem>
            <DropdownMenuItem>Edit Package</DropdownMenuItem>
            <DropdownMenuItem className="text-red-400">Delete Package</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
