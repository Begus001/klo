import express, { Request } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { type Message, MessageType } from "../messages.js";

class VideoState {
    time: number = 0;
    playbackState: boolean = false;
}

interface Client {
    ws: WebSocket;
    address: any;
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
wss.on("connection", (ws: WebSocket, req: Request) => {

    let client = { ws: ws, address: req.socket.remoteAddress! };
    clients.push(client);

    console.log("new connection from", client.address);

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
        let client = clients.filter((c) => c.ws === ws)[0];
        clients = clients.filter((c) => c.ws !== ws);
        console.log("disconnect", client.address);
        clients.forEach(c => {
            console.log(c.address);
        })
    });
});

server.listen(PORT, () => {
    console.log("listening on :" + PORT);
})
