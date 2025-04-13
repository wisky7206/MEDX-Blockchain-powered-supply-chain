import { NextResponse } from "next/server"
import Product from "../../../models/Product"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const query: any = {}

    if (category) {
      query.category = category
    }

    if (status) {
      query.status = status
    }

    const products = await Product.find(query).lean()

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
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
