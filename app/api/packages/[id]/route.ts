import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase.from("credit_packages").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching package:", error)
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData } = await supabase.from("admins").select().eq("discord_id", session.user.id).single()

    if (!adminData) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Update package
    const { data, error } = await supabase
      .from("credit_packages")
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        credits: body.credits,
        image_url: body.image_url,
        active: body.active,
      })
      .eq("id", params.id)
      .select()

    if (error) {
      console.error("Error updating package:", error)
      return NextResponse.json({ error: "Failed to update package" }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData } = await supabase.from("admins").select().eq("discord_id", session.user.id).single()

    if (!adminData) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Soft delete by setting active to false
    const { error } = await supabase.from("credit_packages").update({ active: false }).eq("id", params.id)

    if (error) {
      console.error("Error deleting package:", error)
      return NextResponse.json({ error: "Failed to delete package" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
