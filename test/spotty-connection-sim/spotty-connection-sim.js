import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const LISTEN_PORT = 42080; 
const TARGET_PORT = 42070; 

const DELAY_MS = 200;
const LOSS_PROB = 0.05;

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (clientWs, req) => {
  console.log("Client connected");

  const serverWs = new WebSocket(`ws://localhost:${TARGET_PORT}`);

  clientWs.on("message", (msg) => {
    if (Math.random() < LOSS_PROB) {
      console.log("Dropped client->server packet");
      console.log(msg);
      return;
    }
    setTimeout(() => {
      if (serverWs.readyState === WebSocket.OPEN) {
        serverWs.send(msg);
      }
    }, DELAY_MS);
  });

  serverWs.on("message", (msg) => {
    if (Math.random() < LOSS_PROB) {
      console.log("Dropped server->client packet");
      console.log(msg);
      return;
    }
    setTimeout(() => {
      if (clientWs.readyState === WebSocket.OPEN) {
        if (Buffer.isBuffer(msg)) {
          clientWs.send(msg.toString());
        } else {
          clientWs.send(msg);
        }
      }
    }, DELAY_MS);
  });

  clientWs.on("close", () => {
    serverWs.close();
  });
  serverWs.on("close", () => {
    clientWs.close();
  });
});

server.listen(LISTEN_PORT, () => {
  console.log(`MITM listening on :${LISTEN_PORT}, proxying to :${TARGET_PORT}`);
  console.log(`Delay: ${DELAY_MS}ms, Loss: ${LOSS_PROB * 100}%`);
});
