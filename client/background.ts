import { ReconWebSocket } from "./recon-websocket.js";
import { Message, MessageType, PlaybackMessage, SeekMessage, UrlChangeMessage } from "../messages.js";

let blockUrlChange = false;

let targetTab = (await browser.tabs.query({ index: 0 }))[0];
console.debug(`selected tab: id=${targetTab.id}, title=${targetTab.title}`);

console.log("background script running")

const onMsg = (ws: WebSocket, strmsg: string) => {
    console.log("Klo:", strmsg);
    let msg: Message = JSON.parse(strmsg);
    if (msg.type === MessageType.PLAYBACK) {
        console.log("got playback msg");
        browser.tabs.sendMessage(targetTab.id!, {
            action: "playback",
            value: msg.data,
        });
    }
    else if (msg.type === MessageType.SEEK) {
        console.log("got seek msg");
        browser.tabs.sendMessage(targetTab.id!, {
            action: "seek",
            value: msg.data,
        });
    } else if (msg.type === MessageType.URL_CHANGE) {
        console.log("got url msg");
        browser.tabs.sendMessage(targetTab.id!, {
            action: "url",
            value: msg.data,
        });
    }
};

browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === "playback") {
        sendJson(new PlaybackMessage(msg.value));
    }
    else if (msg.type === "seek") {
        sendJson(new SeekMessage(msg.value));
    }
    else if (msg.type === "url") {
        sendJson(new UrlChangeMessage(msg.value));
    }
});

browser.tabs.onUpdated.addListener((tabId, info, tab) => {
});

let ws = new ReconWebSocket(onMsg);

const sendJson = (obj: object) => ws.send(JSON.stringify(obj));
await ws.connect("wss://goisser.net:42070").catch(e => {
    console.warn("Klo: could not connect");
});

