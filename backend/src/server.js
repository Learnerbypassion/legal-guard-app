const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start Express server
  app.listen(PORT, () => {
    console.log(`\n🛡️  Legal Guardian API running on port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/health`);
    console.log(`📄 Upload: POST http://localhost:${PORT}/api/upload`);
    console.log(`🧠 Analyze: POST http://localhost:${PORT}/api/analyze`);
    console.log(`💬 Chat:   POST http://localhost:${PORT}/api/chat\n`);
  });
};

startServer();
