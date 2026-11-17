import "dotenv/config";
import app from "./app.js";
import http from 'http';
import { initializeSocket } from "./modules/socket/socket.server.js";
import { configureSocketAuth } from "./middlewares/socket.middleware.js";

const server = http.createServer(app);

const io = initializeSocket(server);

configureSocketAuth(io);

const port = Number(process.env.PORT ?? 3000);

server.listen(port, "0.0.0.0", () => {
  console.log(`API available on port ${port}`);
});