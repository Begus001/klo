import express, { Request } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { type Message, MessageType } from "../messages.js";

class VideoState {
    time: number = 0;
    playbackState: boolean = false;
}

class Client {
    address: string;
    pingSendInterval: NodeJS.Timeout;
    timedOutTimeout?: NodeJS.Timeout;
    lastPingSent: number = Date.now();
    latency: number = 0;
    pingInFlight = false;

    constructor(
        public ws: WebSocket,
        public req: Request,
        public timedOutCallback: () => void
    ) {
        this.address = req.socket.remoteAddress!;

        console.log(`client ${this.address} connected`);

        this.pingSendInterval = setInterval(() => {
            if (this.pingInFlight) {
                return;
            }
            this.ws.ping();
            this.lastPingSent = Date.now();
            this.pingInFlight = true;
        }, 100);

        this.ws.on("pong", () => {
            this.resetTimedOutTimeout();
            this.pingInFlight = false;
            const pongReceivedAt = Date.now();
            this.latency = (pongReceivedAt - this.lastPingSent) / 2;
            console.log(`client ${this.address} latency: ${this.latency}ms`);
        });
    }

    resetTimedOutTimeout() {
        if (this.timedOutTimeout) {
            clearTimeout(this.timedOutTimeout);
        }

        this.timedOutTimeout = setTimeout(() => {
            console.log(`client ${this.address} timed out`);
            this.disconnect();
        }, 2000);
    }

    disconnect() {
        clearInterval(this.pingSendInterval);
        clearTimeout(this.timedOutTimeout);
        this.ws.close();
    }
}

function sendToAllClients(sender: WebSocket, msg: Message) {
    for (let client of clients) {
        if (client.ws == sender) continue;
        client.ws.send(JSON.stringify(msg));
    }
}

let PORT = 42070;

if (process.argv.length > 2 && !isNaN(Number(process.argv[2]))) {
    PORT = Number(process.argv[2]);
}

let videoState = new VideoState;

let clients: Array<Client> = [];

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });

function removeClient(ws: WebSocket) {
    let matchingClients = clients.filter((c) => c.ws === ws);

    if (matchingClients.length === 0) {
        console.warn("Client not found in list");
        return;
    }

    let client = matchingClients[0];
    clients = clients.filter((c) => c.ws !== ws);
    console.log(`client ${client.address} disconnected`);
}

function getClientByWs(ws: WebSocket) {
    let client = clients.filter((c) => c.ws === ws);
}

wss.on("connection", (ws: WebSocket, req: Request) => {

    let client = new Client(ws, req, () => removeClient(ws));
    clients.push(client);

    ws.on("message", (strmsg: string) => {
        let msg: Message = JSON.parse(strmsg);
        if (msg.type === MessageType.PLAYBACK) {
            console.log(`Message from ${req.socket.remoteAddress}:`);
            console.log(`  type: PLAYBACK`);
            console.log(`  data:`, msg.data);
            sendToAllClients(ws, msg);
        }
        else if (msg.type === MessageType.SEEK) {
            console.log(`Message from ${req.socket.remoteAddress}:`);
            console.log(`  type: SEEK`);
            console.log(`  data:`, msg.data);
            sendToAllClients(ws, msg);
        }
    });

    ws.on("close", () => {
        removeClient(ws);
    });
});

server.listen(PORT, () => {
    console.log("listening on :" + PORT);
})
