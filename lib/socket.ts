import { Server as SocketIOServer } from "socket.io"
import type { NextApiRequest } from "next"
import type { Server as HTTPServer } from "http"
import type { Socket as NetSocket } from "net"

interface SocketServer extends HTTPServer {
  io?: SocketIOServer
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiRequest {
  socket: SocketWithIO
}

export const initSocket = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server...")

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ["websocket", "polling"],
    })

    io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`)

      // Handle room joining
      socket.on("join", (room) => {
        socket.join(room)
        console.log(`Socket ${socket.id} joined room ${room}`)
      })

      // Handle room leaving
      socket.on("leave", (room) => {
        socket.leave(room)
        console.log(`Socket ${socket.id} left room ${room}`)
      })

      // Handle errors
      socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error)
      })

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`)
      })

      // Handle reconnection attempts
      socket.on("reconnect_attempt", (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber} for ${socket.id}`)
      })

      // Handle successful reconnection
      socket.on("reconnect", (attemptNumber) => {
        console.log(`Successfully reconnected after ${attemptNumber} attempts for ${socket.id}`)
      })
    })

    res.socket.server.io = io
  }

  return res.socket.server.io
}
