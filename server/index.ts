import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Message, MessageType, PlaybackMessage, SeekMessage, Sync2Message, UrlChangeMessage } from "../messages.js";

class VideoState {
    url?: string = undefined;
    time: number = 0;
    playbackState: boolean = false;
}

class Client {
    ws: WebSocket;
    constructor(ws: WebSocket) {
        this.ws = ws;
    }
}

function sendToAllClients(sender: WebSocket, msg: Message) {
    for (let client of clients) {
        if (client.ws == sender) continue;
        client.ws.send(JSON.stringify(msg));
    }
}

let videoState = new VideoState;

let clients: Array<Client> = [];

const app = express();
const server = createServer(app);

const PORT = 42070;

const wss = new WebSocketServer({ server });
wss.on("close", () => {
    console.log("ONCLOSE");
})
wss.on("error", () => {
    console.log("ONERROR");
})
wss.on("connection", (ws) => {
    console.log("new connection from", ws.url);

    clients.push(new Client(ws));
    console.log("adding", ws.url);
    clients.forEach(c => {
        console.log(c.ws.url);
    })

    ws.on("message", (strmsg: string) => {
        let msg: Message = JSON.parse(strmsg);
        console.log(msg);
        if (msg instanceof SeekMessage) {
            videoState.time = msg.data;
            sendToAllClients(ws, msg);
        }
        // if (msg.type === MessageType.SYNC_1) {
        //     console.log("videoState:");
        //     console.log(videoState);
        //     if (!videoState.url) {
        //         ws.send(JSON.stringify({
        //             type: MessageType.NOT_INIT
        //         } satisfies Message));
        //
        //         ws.send(JSON.stringify({
        //             type: MessageType.SYNC_1
        //         } satisfies Message));
        //
        //         return;
        //     }
        //
        //     ws.send(JSON.stringify({
        //         type: MessageType.SYNC_2,
        //         data: videoState
        //     }));
        // }
        // else if (msg.type === MessageType.SYNC_2) {
        //     // let data = msg.data as Sync2Message;
        //     // videoState = data;
        // }
        if (msg.type === MessageType.PLAYBACK) {
            console.log("got playback msg");
            sendToAllClients(ws, msg);
        }
        else if (msg.type === MessageType.SEEK) {
            console.log("got seek msg");
            sendToAllClients(ws, msg);
        }
        else if (msg.type === MessageType.URL_CHANGE) {
            console.log("got url msg");
            sendToAllClients(ws, msg);
        }
    });

    ws.on("close", () => {
        clients = clients.filter((c) => c.ws !== ws);
        console.log("disconnect", ws);
        clients.forEach(c => {
            console.log(c.ws);
        })
    });
});

server.listen(PORT, () => {
    console.log("listening on :" + PORT);
})
