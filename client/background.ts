import { ReconWebSocket } from "./recon-websocket.js";
import { ConnectionState, type Message, MessageType } from "./internal-messages.js";
import { type Message as ExternalMessage, MessageType as ExternalMessageType } from "../messages.js";

console.log("background script running")

let targetTab: browser.tabs.Tab | undefined;
let selfUpdate = false;
let connectionState = ConnectionState.DISCONNECTED;

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
    else if (msg.type === ExternalMessageType.URL_CHANGE) {
        console.debug("got url msg");
        if (!targetTab || !targetTab.id) {
            return;
        }
        if (msg.data === targetTab.url) {
            console.debug("received url change msg with same url as ours");
            return;
        }
        browser.tabs.update(targetTab.id, {
            url: msg.data
        });
    }
};

const onConnecting = () => {
    browser.runtime.sendMessage({
        type: MessageType.CONNECTION_CHANGED,
        data: ConnectionState.CONNECTING,
    } as Message);
    connectionState = ConnectionState.CONNECTING;
};
const onConnected = () => {
    browser.runtime.sendMessage({
        type: MessageType.CONNECTION_CHANGED,
        data: ConnectionState.CONNECTED,
    } as Message);
    connectionState = ConnectionState.CONNECTED;
};
const onDisconnected = () => {
    browser.runtime.sendMessage({
        type: MessageType.CONNECTION_CHANGED,
        data: ConnectionState.DISCONNECTED,
    } as Message);
    connectionState = ConnectionState.DISCONNECTED;
};

async function selectTab(): Promise<browser.tabs.Tab> {
    return new Promise(async (res, rej) => {
        const win = await browser.windows.getCurrent();
        const tabs = await browser.tabs.query({ active: true, windowId: win.id });

        if (tabs.length < 1 || !tabs[0].id) {
            console.error("no tabs found");
            rej();
        }

        res(tabs[0]);
    });
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!targetTab || !targetTab.id || targetTab.id != tabId || !tab.id) {
        return;
    }

    if (selfUpdate) {
        console.debug("selfUpdate");
        selfUpdate = false;
        return;
    }

    console.debug("tab update status:", changeInfo.status);
    const msg: Message = {
        type: MessageType.TAB_CHANGED,
        data: { changeInfo: changeInfo, tab: tab },
    };

    if (changeInfo.url && changeInfo.url !== targetTab.url) {
        console.debug("url changed on target tab:", changeInfo.url);
        ws.send(JSON.stringify({
            type: ExternalMessageType.URL_CHANGE,
            data: changeInfo.url
        } as ExternalMessage));
    }

    targetTab = tab;

    browser.runtime.sendMessage(msg);
    browser.tabs.sendMessage(targetTab.id!, msg);
});

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
    else if (msg.type === MessageType.CONNECTION_STATE_REQ) {
        browser.runtime.sendMessage({
            type: MessageType.CONNECTION_CHANGED,
            data: connectionState,
        } as Message);
    }
    else if (msg.type === MessageType.PLAYBACK) {
        if (!targetTab) return;
        console.log("background got playback from content");
        ws.send(JSON.stringify({
            type: ExternalMessageType.PLAYBACK,
            data: msg.data,
        } as ExternalMessage));
    }
    else if (msg.type === MessageType.SEEK) {
        if (!targetTab) return;
        console.log("background got seek from content");
        ws.send(JSON.stringify({
            type: ExternalMessageType.SEEK,
            data: msg.data,
        } as ExternalMessage));
    }
    else if (msg.type === MessageType.SELECT_TAB) {
        console.debug("background tab select");
        selectTab().then(tab => {
            browser.runtime.sendMessage({
                type: MessageType.TAB_SELECTED,
                data: tab,
            } as Message);

            targetTab = tab;

            // TODO: instead of reloading, load the page set on the server
            // browser.tabs.reload(tab.id!);
        });
    }
    else if (msg.type === MessageType.DESELECT_TAB) {
        console.debug("background tab deselect");
        targetTab = undefined;
        browser.runtime.sendMessage({
            type: MessageType.TAB_SELECTED,
            data: undefined,
        } as Message);
    }
    else if (msg.type === MessageType.TAB_INFO_REQ) {
        if (!targetTab || !targetTab.url) {
            return;
        }
        browser.runtime.sendMessage({
            type: MessageType.TAB_SELECTED,
            data: targetTab,
        } as Message);
    }
    else if (msg.type === MessageType.FORCE_SYNC_URL) {
        if (!targetTab || !targetTab.url) {
            return;
        }

        console.debug("background force sync url");

        ws.send(JSON.stringify({
            type: ExternalMessageType.URL_CHANGE,
            data: targetTab.url
        } as ExternalMessage));
    }
    else if (
        msg.type === MessageType.REGRAB_VIDEO_ELEMENT    ||
        msg.type === MessageType.PLAYER_CONTROL_BACKWARD ||
        msg.type === MessageType.PLAYER_CONTROL_PLAY     ||
        msg.type === MessageType.PLAYER_CONTROL_PAUSE    ||
        msg.type === MessageType.PLAYER_CONTROL_FORWARD  ||
        msg.type === MessageType.FORCE_SYNC_PLAYBACK
    ) {
        if (!targetTab || !targetTab.id) {
            return;
        }

        browser.tabs.sendMessage(targetTab.id, msg);
    }
});

let ws = new ReconWebSocket(onMsg, onConnecting, onConnected, onDisconnected);

