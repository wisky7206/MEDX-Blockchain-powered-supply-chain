import axios from "axios"
import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 1000 // 1 second

// Initialize socket connection
export const initSocketConnection = async () => {
  if (!socket) {
    try {
      // First, ensure the socket server is running
      await axios.get("/api/socket")

      // Then connect to it
      socket = io({
        path: "/api/socket",
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: RECONNECT_DELAY,
        timeout: 20000,
        transports: ["websocket", "polling"],
      })

      socket.on("connect", () => {
        console.log("Socket connected")
        reconnectAttempts = 0 // Reset reconnect attempts on successful connection
      })

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
      })

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason)
        if (reason === "io server disconnect") {
          // Server initiated disconnect, try to reconnect
          socket?.connect()
        }
      })

      socket.on("reconnect_attempt", (attemptNumber) => {
        reconnectAttempts = attemptNumber
        console.log(`Reconnection attempt ${attemptNumber}/${MAX_RECONNECT_ATTEMPTS}`)
      })

      socket.on("reconnect_failed", () => {
        console.error("Failed to reconnect after maximum attempts")
        socket = null
      })

      socket.on("error", (error) => {
        console.error("Socket error:", error)
      })
    } catch (error) {
      console.error("Error initializing socket connection:", error)
      socket = null
      throw error
    }
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
    try {
      socket.emit("leaveAll")
      socket.disconnect()
      socket = null
    } catch (error) {
      console.error("Error leaving rooms:", error)
    }
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
  try {
    const socket = await initSocketConnection()
    if (!socket) {
      throw new Error("Socket connection not available")
    }

    socket.on("notification", callback)

    return () => {
      socket?.off("notification", callback)
    }
  } catch (error) {
    console.error("Error setting up notification listener:", error)
    throw error
  }
}
