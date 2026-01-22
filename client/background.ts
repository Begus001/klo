import { ReconWebSocket } from "./recon-websocket.js";
import { type Message as ExternalMessage, MessageType as ExternalMessageType, PlaybackMessage, SeekMessage, UrlChangeMessage } from "../messages.js";
import { ConnectionState, type Message, MessageType } from "./internal-messages.js";

let targetTab = (await browser.tabs.query({ index: 0 }))[0];

console.debug(`selected tab: id=${targetTab.id}, title=${targetTab.title}`);

console.log("background script running")

const onMsg = (_ws: WebSocket, strmsg: string) => {
    console.log("Klo:", strmsg);
    let msg: ExternalMessage = JSON.parse(strmsg);
    if (msg.type === ExternalMessageType.PLAYBACK) {
        console.log("got playback msg");
        browser.tabs.sendMessage(targetTab.id!, {
            action: "playback",
            value: msg.data,
        });
    }
    else if (msg.type === ExternalMessageType.SEEK) {
        console.log("got seek msg");
        browser.tabs.sendMessage(targetTab.id!, {
            action: "seek",
            value: msg.data,
        });
    } else if (msg.type === ExternalMessageType.URL_CHANGE) {
        console.log("got url msg");
        browser.tabs.sendMessage(targetTab.id!, {
            action: "url",
            value: msg.data,
        });
    }
};

const onConnecting = () => {
    browser.runtime.sendMessage({
        type: MessageType.CONNECTION_CHANGED,
        data: ConnectionState.CONNECTING,
    });
};
const onConnected = () => {
    browser.runtime.sendMessage({
        type: MessageType.CONNECTION_CHANGED,
        data: ConnectionState.CONNECTED,
    });
};
const onDisconnected = () => {
    browser.runtime.sendMessage({
        type: MessageType.CONNECTION_CHANGED,
        data: ConnectionState.DISCONNECTED,
    });
};

let ws = new ReconWebSocket(onMsg, onConnecting, onConnected, onDisconnected);

browser.runtime.onMessage.addListener((msg: Message) => {
    // if (msg.type === "playback") {
    //     sendJson(new PlaybackMessage(msg.value));
    // }
    // else if (msg.type === "seek") {
    //     sendJson(new SeekMessage(msg.value));
    // }
    // else if (msg.type === "url") {
    //     sendJson(new UrlChangeMessage(msg.value));
    // }
    if (msg.type === MessageType.CONNECT) {
        ws.close();
        if (msg.data) {
            ws.connect(msg.data);
        }
    }
});

browser.tabs.onUpdated.addListener(() => {
});

const sendJson = (obj: object) => ws.send(JSON.stringify(obj));
// ws.connect("wss://goisser.net:42070").catch(() => {
//     console.warn("Klo: could not connect");
// });
