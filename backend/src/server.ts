import "dotenv/config";
import app from "./app.js";
import http from 'http';
import { initializeSocket } from "./modules/socket/socket.server.js";
import { configureSocketAuth } from "./modules/socket/socket.middleware.js";

const server = http.createServer(app);

const io = initializeSocket(server);

configureSocketAuth(io);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`API available on port ${port}`);
});