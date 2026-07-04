import { ReconWebSocket } from "./recon-websocket.js";
import { type AcceptUrlChangeData, ConnectionState, type Message, MessageType, Tab } from "./internal-messages.js";
import { type Message as ExternalMessage, MessageType as ExternalMessageType } from "../messages.js";

console.log("background script running")

let targetTabId: number | undefined;
let isRemoteUrlUpdate = false;
let connectionState = ConnectionState.DISCONNECTED;
let acceptUrlChange: AcceptUrlChangeData = { automatic: true, manual: true };

async function selectTab(): Promise<Tab> {
    return new Promise(async (res, rej) => {
        const win = await browser.windows.getCurrent();
        const tabs = await browser.tabs.query({ active: true, windowId: win.id });

        if (tabs.length < 1 || !tabs[0].id) {
            console.error("no tabs found");
            rej();
        }

        const tab = Tab.fromBrowserTab(tabs[0]);
        if (tab) {
            res(tab);
        }
        else {
            rej();
        }
    });
}

async function getTab(id: number | undefined = targetTabId): Promise<Tab | undefined> {
    if (id === undefined) {
        return undefined;
    }
    const targetTab = await browser.tabs.get(id);
    return Tab.fromBrowserTab(targetTab);
}

const onMsg = async (_ws: WebSocket, strmsg: string) => {
    console.debug(strmsg);

    let msg: ExternalMessage = JSON.parse(strmsg);
    if (msg.type === ExternalMessageType.PLAYBACK) {
        console.debug("got playback msg");

        const tab = await getTab();
        if (!tab) {
            return;
        }

        browser.tabs.sendMessage(tab.id, {
            type: MessageType.PLAYBACK,
            data: msg.data,
        } as Message);
    }
    else if (msg.type === ExternalMessageType.SEEK) {
        console.debug("got seek msg");

        const tab = await getTab();
        if (!tab) {
            return;
        }

        browser.tabs.sendMessage(tab.id, {
            type: MessageType.SEEK,
            data: msg.data,
        } as Message);
    }
    else if (msg.type === ExternalMessageType.URL_CHANGE) {
        console.debug("got url msg", msg.data);
        const tab = await getTab();
        if (!tab) {
            return;
        }

        if (msg.data === tab.url) {
            console.debug("received url change msg with same url as ours");
            return;
        }

        if (acceptUrlChange.automatic === false && msg.force === false) {
            console.debug("accept url change auto is false, so we're ignoring this");
            return;
        }

        if (acceptUrlChange.manual === false && msg.force === true) {
            console.debug("accept url change manual is false, so we're ignoring this");
            return;
        }

        setTimeout(() => isRemoteUrlUpdate = true, 20);
        browser.tabs.update(tab.id, {
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

async function handleNavigation(test: any) {
    const tab = await getTab();
    if (!tab) {
        return;
    }

    if (isRemoteUrlUpdate) {
        console.debug("isRemoteUrlUpdate");
        isRemoteUrlUpdate = false;
        return;
    }

    console.debug("navigation commited on target tab", tab.url);
    ws.send(JSON.stringify({
        type: ExternalMessageType.URL_CHANGE,
        data: tab.url,
        force: false
    } as ExternalMessage));
}

browser.webNavigation.onCommitted.addListener(handleNavigation);
browser.webNavigation.onHistoryStateUpdated.addListener(handleNavigation);
browser.webNavigation.onReferenceFragmentUpdated.addListener(handleNavigation);

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, browserTab) => {
    const tab = await getTab();
    if (!tab) {
        return;
    }

    console.debug("tab update status:", changeInfo.status);
    const msg: Message = {
        type: MessageType.TAB_CHANGED,
        data: { changeInfo: changeInfo, tab: tab },
    };

    browser.runtime.sendMessage(msg);
    browser.tabs.sendMessage(tab.id, msg);
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
        if (targetTabId === undefined) return;
        console.log("background got playback from content");
        ws.send(JSON.stringify({
            type: ExternalMessageType.PLAYBACK,
            data: msg.data,
        } as ExternalMessage));
    }
    else if (msg.type === MessageType.SEEK) {
        if (targetTabId === undefined) return;
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

            targetTabId = tab.id;

            // TODO: instead of reloading, load the page set on the server
            // browser.tabs.reload(tab.id!);
        });
    }
    else if (msg.type === MessageType.DESELECT_TAB) {
        console.debug("background tab deselect");
        targetTabId = undefined;
        browser.runtime.sendMessage({
            type: MessageType.TAB_SELECTED,
            data: undefined,
        } as Message);
    }
    else if (msg.type === MessageType.TAB_INFO_REQ) {
        const tab = await getTab();
        if (!tab) {
            return;
        }
        browser.runtime.sendMessage({
            type: MessageType.TAB_SELECTED,
            data: tab,
        } as Message);
    }
    else if (msg.type === MessageType.FORCE_SYNC_URL) {
        const tab = await getTab();
        if (!tab) {
            return;
        }

        console.debug("background force sync url");

        ws.send(JSON.stringify({
            type: ExternalMessageType.URL_CHANGE,
            data: tab.url,
            force: true
        } as ExternalMessage));
    }
    else if (msg.type === MessageType.SET_ACCEPT_URL_CHANGE) {
        acceptUrlChange = msg.data;
    }
    else if (msg.type === MessageType.GET_ACCEPT_URL_CHANGE) {
        browser.runtime.sendMessage({
            type: MessageType.SET_ACCEPT_URL_CHANGE,
            data: acceptUrlChange
        } as Message);
    }
    else if (
        msg.type === MessageType.REGRAB_VIDEO_ELEMENT    ||
        msg.type === MessageType.PLAYER_CONTROL_BACKWARD ||
        msg.type === MessageType.PLAYER_CONTROL_PLAY     ||
        msg.type === MessageType.PLAYER_CONTROL_PAUSE    ||
        msg.type === MessageType.PLAYER_CONTROL_FORWARD  ||
        msg.type === MessageType.FORCE_SYNC_PLAYBACK
    ) {
        const tab = await getTab();
        if (!tab) {
            return;
        }

        browser.tabs.sendMessage(tab.id, msg);
    }
});

let ws = new ReconWebSocket(onMsg, onConnecting, onConnected, onDisconnected);

