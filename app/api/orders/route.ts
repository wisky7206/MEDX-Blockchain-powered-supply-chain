import { NextResponse } from "next/server"
import Order from "../../../models/Order"
import User from "../../../models/User"
import Product from "../../../models/Product"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const buyerAddress = searchParams.get("buyer")
    const sellerAddress = searchParams.get("seller")
    const status = searchParams.get("status")

    const query: any = {}

    if (buyerAddress) {
      const buyer = await User.findOne({ walletAddress: { $regex: new RegExp(`^${buyerAddress}$`, "i") } })
      if (buyer) {
        query.buyer = buyer._id
      }
    }

    if (sellerAddress) {
      const seller = await User.findOne({ walletAddress: { $regex: new RegExp(`^${sellerAddress}$`, "i") } })
      if (seller) {
        query.seller = seller._id
      }
    }

    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .populate("buyer", "walletAddress name companyName")
      .populate("seller", "walletAddress name companyName")
      .populate("items.product")
      .lean()

    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.buyerAddress || !body.sellerAddress || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find buyer and seller
    const buyer = await User.findOne({ walletAddress: { $regex: new RegExp(`^${body.buyerAddress}$`, "i") } })
    const seller = await User.findOne({ walletAddress: { $regex: new RegExp(`^${body.sellerAddress}$`, "i") } })

    if (!buyer || !seller) {
      return NextResponse.json({ error: "Buyer or seller not found" }, { status: 404 })
    }

    // Process items and calculate total
    const orderItems = []
    let totalAmount = 0

    for (const item of body.items) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 })
      }

      if (product.quantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient quantity for product ${product.name}` }, { status: 400 })
      }

      // Update product quantity
      product.quantity -= item.quantity
      if (product.quantity <= 10) {
        product.status = "Low Stock"
      }
      if (product.quantity <= 0) {
        product.status = "Out of Stock"
      }
      await product.save()

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      })

      totalAmount += product.price * item.quantity
    }

    // Generate a unique order ID
    const lastOrder = await Order.findOne().sort({ createdAt: -1 })
    const lastId = lastOrder ? Number.parseInt(lastOrder.orderId.split("-")[1]) : 0
    const orderId = `ORD-${(lastId + 1).toString().padStart(3, "0")}`

    // Create new order
    const order = new Order({
      orderId,
      buyer: buyer._id,
      seller: seller._id,
      items: orderItems,
      totalAmount,
      status: "Pending",
      shippingAddress: body.shippingAddress || "",
    })

    await order.save()

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate("buyer", "walletAddress name companyName")
      .populate("seller", "walletAddress name companyName")
      .populate("items.product")

    return NextResponse.json(populatedOrder, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
