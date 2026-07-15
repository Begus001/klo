import { MessageType, type Message } from "./internal-messages";

let targetTabSelected = false;
let targetVideoElement: HTMLVideoElement | null = null;
let isProgrammaticSeek = false;
let isProgrammaticPlay = false;
let isProgrammaticPause = false;

function querySelectorDeep(selector: string, root: Document | ShadowRoot = document): HTMLVideoElement | null {
    const direct = root.querySelector(selector) as HTMLVideoElement;
    if (direct) {
        return direct;
    }

    for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) {
            const found = querySelectorDeep(selector, el.shadowRoot);
            if (found) {
                return found;
            }
        }
    }

    return null;
}

function debug(msg: string) {
    console.debug("Klo:", msg);
}

function log(msg: string) {
    console.log("Klo:", msg);
}

function warn(msg: string) {
    console.warn("Klo:", msg);
}

function error(msg: string) {
    console.error("Klo:", msg);
}

function seek(time: number, setProgSeek = true) {
    if (targetVideoElement == null) {
        targetVideoElement = querySelectorDeep("video");
        if (!targetVideoElement) {
            error("received seek but found no video. there has to be a mismatch of this tab's url and the remote's");
        }
    }
    debug("program seek");
    if (setProgSeek) {
        isProgrammaticSeek = true;
    }
    targetVideoElement!.currentTime = time;
}

function play(setProgPlay = true) {
    if (targetVideoElement == null) {
        targetVideoElement = querySelectorDeep("video");
        if (!targetVideoElement) {
            error("received play but found no video. there has to be a mismatch of this tab's url and the remote's");
        }
    }
    debug("program play");
    if (setProgPlay) {
        isProgrammaticPlay = true;
    }
    targetVideoElement!.play();
}

function pause(setProgPause = true) {
    if (targetVideoElement == null) {
        targetVideoElement = querySelectorDeep("video");
        if (!targetVideoElement) {
            error("received pause but found no video. there has to be a mismatch of this tab's url and the remote's");
        }
    }
    debug("program pause");
    if (setProgPause) {
        isProgrammaticPause = true;
    }
    targetVideoElement!.pause();
}

function onSeeked(e: any) {
    if (!targetTabSelected) {
        debug("no target tab selected, not doing seek");
        return;
    }

    if (!targetVideoElement) {
        targetVideoElement = e.target as HTMLVideoElement;
    }

    if (isProgrammaticSeek) {
        setTimeout(() => isProgrammaticSeek = false, 20);
        return;
    }

    debug("user seek");
    browser.runtime.sendMessage({
        type: MessageType.SEEK,
        data: targetVideoElement.currentTime,
    } as Message);
}

function onPlay(e: any) {
    if (!targetTabSelected) {
        debug("no target tab selected, not doing play");
        return;
    }

    if (!targetVideoElement) {
        targetVideoElement = e.target as HTMLVideoElement;
    }

    if (isProgrammaticPlay) {
        setTimeout(() => isProgrammaticPlay = false, 20);
        return;
    }

    debug("user play");
    browser.runtime.sendMessage({
        type: MessageType.PLAYBACK,
        data: !targetVideoElement.paused,
    } as Message);
}

function onPause(e: any) {
    if (!targetTabSelected) {
        debug("no target tab selected, not doing pause");
        return;
    }

    if (!targetVideoElement) {
        targetVideoElement = e.target as HTMLVideoElement;
    }

    if (isProgrammaticPause) {
        setTimeout(() => isProgrammaticPause = false, 20);
        return;
    }

    debug("user pause");
    browser.runtime.sendMessage({
        type: MessageType.PLAYBACK,
        data: !targetVideoElement.paused,
    } as Message);
}

function registerEvents() {
    if (targetVideoElement) {
        targetVideoElement.removeEventListener("seeked", onSeeked);
        targetVideoElement.removeEventListener("play", onPlay);
        targetVideoElement.removeEventListener("pause", onPause);
    }

    targetVideoElement = querySelectorDeep("video");
    if (!targetVideoElement) {
        debug("no video element on this page");
        return;
    }

    debug("video element found");

    targetVideoElement.removeEventListener("seeked", onSeeked);
    targetVideoElement.removeEventListener("play", onPlay);
    targetVideoElement.removeEventListener("pause", onPause);

    targetVideoElement.addEventListener("seeked", onSeeked);
    targetVideoElement.addEventListener("play", onPlay);
    targetVideoElement.addEventListener("pause", onPause);
}

(() => {
    log("content script running");

    registerEvents();

    browser.runtime.onMessage.addListener((msg: Message) => {
        if (msg.type === MessageType.PLAYBACK) {
            if (msg.data) {
                play();
            }
            else {
                pause();
            }
        }
        else if (msg.type === MessageType.SEEK) {
            seek(msg.data);
        }
        else if (msg.type === MessageType.TAB_SELECTED) {
            targetTabSelected = msg.data !== undefined;
            debug("target tab selected: " + targetTabSelected);
        }
        else if (msg.type === MessageType.SELECT_TAB) {
            targetTabSelected = true;
            debug("target tab selected: " + targetTabSelected);
        }
        else if (msg.type === MessageType.DESELECT_TAB) {
            targetTabSelected = false;
            debug("target tab selected: " + targetTabSelected);
        }
        else if (msg.type === MessageType.TAB_CHANGED) {
            if (msg.data.changeInfo.status === "complete") {
                debug("tab loaded");
                debug("target tab still selected: " + targetTabSelected);
                registerEvents();
            }
        }
        else if (msg.type === MessageType.REGRAB_VIDEO_ELEMENT) {
            targetTabSelected = true;
            registerEvents();
        }
        else if (msg.type === MessageType.PLAYER_CONTROL_BACKWARD) {
            if (targetVideoElement == null) {
                return;
            }
            seek(targetVideoElement.currentTime - msg.data, false);
        }
        else if (msg.type === MessageType.PLAYER_CONTROL_PLAY) {
            play(false);
        }
        else if (msg.type === MessageType.PLAYER_CONTROL_PAUSE) {
            pause(false);
        }
        else if (msg.type === MessageType.PLAYER_CONTROL_FORWARD) {
            if (targetVideoElement == null) {
                return;
            }
            seek(targetVideoElement.currentTime + msg.data, false);
        }
        else if (msg.type === MessageType.FORCE_SYNC_PLAYBACK) {
            if (targetVideoElement == null) {
                return;
            }
            seek(targetVideoElement.currentTime, false);
        }
    });

    browser.runtime.sendMessage({
        type: MessageType.TAB_INFO_REQ,
    } as Message);
})()

