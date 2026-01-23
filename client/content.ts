import { MessageType, type Message } from "./internal-messages";

let targetVideoElement: HTMLVideoElement | null = null;
let isProgrammaticSeek = false;
let isProgrammaticPlay = false;
let isProgrammaticPause = false;

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

async function main() {
    log("content script running");
    let targetVideoElement = document.querySelector("video");
    if (!targetVideoElement) {
        warn("no video element on this page");
        return;
    }

    debug("video element found");

    targetVideoElement.addEventListener("seeking", (e) => {
        if (!targetVideoElement) {
            targetVideoElement = e.target as HTMLVideoElement;
        }

        if (isProgrammaticSeek) {
            isProgrammaticSeek = false;
            return;
        }

        debug("user seek");
        browser.runtime.sendMessage({
            type: MessageType.SEEK,
            data: targetVideoElement.currentTime,
        } as Message);
    });

    targetVideoElement.addEventListener("play", (e) => {
        if (!targetVideoElement) {
            targetVideoElement = e.target as HTMLVideoElement;
        }

        if (isProgrammaticPlay) {
            isProgrammaticPlay = false;
            return;
        }

        debug("user play");
        browser.runtime.sendMessage({
            type: MessageType.PLAYBACK,
            data: !targetVideoElement.paused,
        } as Message);
    });

    targetVideoElement.addEventListener("pause", (e) => {
        if (!targetVideoElement) {
            targetVideoElement = e.target as HTMLVideoElement;
        }

        if (isProgrammaticPause) {
            isProgrammaticPause = false;
            return;
        }

        debug("user pause");
        browser.runtime.sendMessage({
            type: MessageType.PLAYBACK,
            data: !targetVideoElement.paused,
        } as Message);
    });
}

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
});

function seek(time: number) {
    if (targetVideoElement == null) {
        targetVideoElement = document.querySelector("video");
    }
    debug("program seek");
    isProgrammaticSeek = true;
    targetVideoElement!.currentTime = time;
}

function play() {
    if (targetVideoElement == null) {
        targetVideoElement = document.querySelector("video");
    }
    debug("program play");
    isProgrammaticPlay = true;
    targetVideoElement!.play();
}

function pause() {
    if (targetVideoElement == null) {
        targetVideoElement = document.querySelector("video");
    }
    debug("program pause");
    isProgrammaticPause = true;
    targetVideoElement!.pause();
}

main()

