import type { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import type { NextApiRequest } from "next"
import type { NextApiResponse } from "next"

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer
    }
  }
}

export const initSocket = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server...")

    const io = new SocketIOServer(res.socket.server)

    io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`)

      socket.on("join", (room) => {
        socket.join(room)
        console.log(`Socket ${socket.id} joined room ${room}`)
      })

      socket.on("leave", (room) => {
        socket.leave(room)
        console.log(`Socket ${socket.id} left room ${room}`)
      })

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`)
      })
    })

    res.socket.server.io = io
  }

  return res.socket.server.io
}
