import { NextResponse } from "next/server"
import Order from "../../../../models/Order"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id

    const order = await Order.findOne({ orderId })
      .populate("buyer", "walletAddress name companyName")
      .populate("seller", "walletAddress name companyName")
      .populate("items.product")
      .lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const body = await request.json()

    // Restricted fields that shouldn't be updated directly
    delete body.buyer
    delete body.seller
    delete body.orderId
    delete body.items
    delete body.totalAmount

    // Update timestamp
    body.updatedAt = new Date()

    // Add tracking update if provided
    if (body.status && body.trackingUpdate) {
      body.$push = {
        "trackingInfo.updates": {
          status: body.status,
          description: body.trackingUpdate,
          timestamp: new Date(),
        },
      }
      delete body.trackingUpdate
    }

    const order = await Order.findOneAndUpdate({ orderId }, body, { new: true, runValidators: true })
      .populate("buyer", "walletAddress name companyName")
      .populate("seller", "walletAddress name companyName")
      .populate("items.product")

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const body = await request.json()

    // This endpoint is specifically for updating blockchain transaction data
    if (!body.transactionHash && !body.blockchainOrderId) {
      return NextResponse.json({ error: "Missing blockchain transaction data" }, { status: 400 })
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.transactionHash) {
      updateData.transactionHash = body.transactionHash
    }

    if (body.blockchainOrderId) {
      updateData.blockchainOrderId = body.blockchainOrderId
    }

    const order = await Order.findOneAndUpdate({ orderId }, { $set: updateData }, { new: true, runValidators: true })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error("Error updating blockchain data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
