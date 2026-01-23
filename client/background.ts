import { ReconWebSocket } from "./recon-websocket.js";
import { ConnectionState, type Message, MessageType } from "./internal-messages.js";
import { type Message as ExternalMessage, MessageType as ExternalMessageType } from "../messages.js";

console.log("background script running")

let targetTab = (await browser.tabs.query({ index: 0 }))[0];

console.debug(`selected tab: id=${targetTab.id}, title=${targetTab.title}`);

const onMsg = (_ws: WebSocket, strmsg: string) => {
    console.log(strmsg);
    let msg: ExternalMessage = JSON.parse(strmsg);
    if (msg.type === ExternalMessageType.PLAYBACK) {
        console.log("got playback msg");
        browser.tabs.sendMessage(targetTab.id!, {
            type: MessageType.PLAYBACK,
            data: msg.data,
        } as Message);
    }
    else if (msg.type === ExternalMessageType.SEEK) {
        console.log("got seek msg");
        browser.tabs.sendMessage(targetTab.id!, {
            type: MessageType.SEEK,
            data: msg.data,
        } as Message);
    }
};

const onConnecting = () => {
    browser.runtime.sendMessage({
        type: MessageType.CONNECTION_CHANGED,
        data: ConnectionState.CONNECTING,
    } as Message);
};
const onConnected = () => {
    browser.runtime.sendMessage({
        type: MessageType.CONNECTION_CHANGED,
        data: ConnectionState.CONNECTED,
    } as Message);
};
const onDisconnected = () => {
    browser.runtime.sendMessage({
        type: MessageType.CONNECTION_CHANGED,
        data: ConnectionState.DISCONNECTED,
    } as Message);
};

let ws = new ReconWebSocket(onMsg, onConnecting, onConnected, onDisconnected);

browser.runtime.onMessage.addListener((msg: Message) => {
    if (msg.type === MessageType.CONNECT) {
        ws.close();
        if (msg.data) {
            let address = msg.data;
            if (msg.data.indexOf("://") < 0) {
                address = `wss://${msg.data}`;
            }
            ws.connect(address);
        }
    }
    else if (msg.type === MessageType.PLAYBACK) {
        ws.send(JSON.stringify({
            type: ExternalMessageType.PLAYBACK,
            data: msg.data,
        } as ExternalMessage));
    }
    else if (msg.type === MessageType.SEEK) {
        ws.send(JSON.stringify({
            type: ExternalMessageType.SEEK,
            data: msg.data,
        } as ExternalMessage));
    }
});
