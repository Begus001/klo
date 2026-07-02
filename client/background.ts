import { ReconWebSocket } from "./recon-websocket.js";
import { ConnectionState, type Message, MessageType } from "./internal-messages.js";
import { type Message as ExternalMessage, MessageType as ExternalMessageType } from "../messages.js";

console.log("background script running")

let targetTab: browser.tabs.Tab | undefined;

const onMsg = (_ws: WebSocket, strmsg: string) => {
    console.debug(strmsg);

    let msg: ExternalMessage = JSON.parse(strmsg);
    if (msg.type === ExternalMessageType.PLAYBACK) {
        console.debug("got playback msg");

        if (!targetTab || !targetTab.id) {
            return;
        }

        browser.tabs.sendMessage(targetTab.id, {
            type: MessageType.PLAYBACK,
            data: msg.data,
        } as Message);
    }
    else if (msg.type === ExternalMessageType.SEEK) {
        console.debug("got seek msg");

        if (!targetTab || !targetTab.id) {
            return;
        }

        browser.tabs.sendMessage(targetTab.id, {
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

browser.runtime.onMessage.addListener(async (msg: Message) => {
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
    else if (msg.type === MessageType.SELECT_TAB) {
        console.debug("background tab select");

        const win = await browser.windows.getCurrent();
        console.debug(`current window is ${win.id}`);
        browser.tabs.query({ active: true, windowId: win.id }).then(tabs => {
            if (tabs.length < 1) {
                console.error("no tabs found");
                return;
            }
            targetTab = tabs[0];
            console.debug(`selected tab: id=${targetTab.id}, title=${targetTab.title}`);

            browser.runtime.sendMessage({
                type: MessageType.TAB_SELECTED,
                data: targetTab,
            } as Message);

            if (!targetTab.id) {
                return;
            }

            // TODO: instead of reloading, load the page set on the server
            browser.tabs.reload(targetTab.id);
        });
    }
    else if (msg.type === MessageType.DESELECT_TAB) {
        targetTab = undefined;
        browser.runtime.sendMessage({
            type: MessageType.TAB_SELECTED,
            data: undefined,
        } as Message);
        console.debug("background tab deselect");
    }
    else if (msg.type === MessageType.GET_SELECTED_TAB) {
        console.debug("background get selected tab", targetTab)
        browser.runtime.sendMessage({
            type: MessageType.TAB_SELECTED,
            data: targetTab,
        } as Message);
    }
});

let ws = new ReconWebSocket(onMsg, onConnecting, onConnected, onDisconnected);

