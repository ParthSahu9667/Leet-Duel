import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { duelHandler } from '../sockets/duel.socket';

// ─── Socket.io Configuration ────────────────────────────────────
// Initializes the Socket.io server, configures CORS to accept
// connections from the Next.js frontend, and wires up the
// duel handler for every new connection.

/**
 * Creates and configures a Socket.io Server instance attached
 * to the existing HTTP server.
 *
 * @param httpServer - The Node.js HTTP server (created from Express)
 * @returns The configured Socket.io Server instance
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true, // Allow cookies/auth headers from the frontend
    },
    // Performance tuning for competitive programming latency
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Connection Handler ──────────────────────────────────────
  // Every client that connects gets the duel event listeners
  // attached to their socket instance.
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 New socket connected: ${socket.id}`);

    // Delegate all duel-related events to the dedicated handler
    duelHandler(io, socket);
  });

  console.log('🚀 Socket.io initialized and listening for connections');

  return io;
};
