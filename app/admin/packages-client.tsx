"use client"

import { useState } from "react"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "@/components/admin/columns-packages"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function PackagesClient({ initialPackages }: { initialPackages: any[] }) {
  const [packages, setPackages] = useState(initialPackages)

  // TODO: Implement add/edit/delete functionality

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>
      <DataTable columns={columns} data={packages} />
    </div>
  )
}
