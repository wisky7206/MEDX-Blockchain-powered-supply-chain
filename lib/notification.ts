import axios from "axios"
import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

// Initialize socket connection
export const initSocketConnection = async () => {
  if (!socket) {
    // First, ensure the socket server is running
    await axios.get("/api/socket")

    // Then connect to it
    socket = io({
      path: "/api/socket",
    })

    socket.on("connect", () => {
      console.log("Socket connected")
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })
  }

  return socket
}

// Join notification rooms based on user's address
export const joinUserRooms = async (address: string) => {
  const socket = await initSocketConnection()

  // Join the user's personal room
  socket.emit("join", `user-${address}`)

  console.log(`Joined room: user-${address}`)
}

// Leave rooms when logging out
export const leaveAllRooms = async () => {
  if (socket) {
    socket.emit("leaveAll")
    socket.disconnect()
    socket = null
  }
}

// Send a notification to a specific user or room
export const sendNotification = async (room: string, notification: any) => {
  try {
    await axios.post("/api/notifications", { room, notification })
  } catch (error) {
    console.error("Error sending notification:", error)
  }
}

// Listen for notifications
export const listenForNotifications = async (callback: (notification: any) => void) => {
  const socket = await initSocketConnection()

  socket.on("notification", callback)

  return () => {
    socket?.off("notification", callback)
  }
}
