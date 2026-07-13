const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");
const { initSocket } = require("./socket");

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server from Express app (required for Socket.IO)
  // On Render, both REST and WebSocket traffic share this single port
  const httpServer = http.createServer(app);

  // Initialize Socket.IO on the HTTP server
  initSocket(httpServer);

  // Start listening
  httpServer.listen(PORT, () => {
    console.log(`\n🛡️  Legal Guardian API running on port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/health`);
    console.log(`📄 Upload: POST http://localhost:${PORT}/api/upload`);
    console.log(`🧠 Analyze: POST http://localhost:${PORT}/api/analyze`);
    console.log(`💬 Chat:   POST http://localhost:${PORT}/api/chat`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}/socket.io/\n`);
  });
};

startServer();
