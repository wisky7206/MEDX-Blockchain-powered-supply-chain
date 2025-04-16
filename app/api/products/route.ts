import { NextResponse } from "next/server"
import Product from "../../../models/Product"
import dbConnect from "../../../lib/mongodb"
import { z } from "zod"

// Input validation schema
const querySchema = z.object({
  category: z.string().optional(),
  status: z.enum(["Available", "Low Stock", "Out of Stock"]).optional(),
})

export async function GET(request: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    // Validate query parameters
    const validatedQuery = querySchema.safeParse({
      category,
      status: status as "Available" | "Low Stock" | "Out of Stock" | undefined,
    })

    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validatedQuery.error },
        { status: 400 }
      )
    }

    const query: any = {}

    if (validatedQuery.data.category) {
      query.category = validatedQuery.data.category
    }

    if (validatedQuery.data.status) {
      query.status = validatedQuery.data.status
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Generate a unique product ID
    const lastProduct = await Product.findOne().sort({ createdAt: -1 })
    const lastId = lastProduct ? Number.parseInt(lastProduct.productId.split("-")[1]) : 0
    body.productId = `PRD-${(lastId + 1).toString().padStart(3, "0")}`

    const product = new Product(body)
    await product.save()

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
