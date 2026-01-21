import { type Message, MessageType, Sync2Message, PlaybackMessage, SeekMessage, UrlChangeMessage } from "../messages.js";

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
    let targetVideoElement = document.querySelector("video");
    if (!targetVideoElement) {
        warn("no video element on this page");
        return;
    }

    debug("video element found");



    log("connected")

    // ws.send(JSON.stringify({
    //     type: MessageType.SYNC_1
    // } satisfies Message));

    targetVideoElement.addEventListener("seeking", (e) => {
        if (!targetVideoElement) {
            targetVideoElement = e.target as HTMLVideoElement;
        }

        if (isProgrammaticSeek) {
            isProgrammaticSeek = false;
            return;
        }

        console.log("sending seek message to backend")
        browser.runtime.sendMessage({
            type: "seek",
            value: targetVideoElement.currentTime,
        });

        // debug("user seek");
        // ws.send(JSON.stringify({
        //     type: MessageType.SEEK,
        //     data: {
        //         time: targetVideoElement.currentTime,
        //     } satisfies SeekMessage
        // } satisfies Message));
    });

    targetVideoElement.addEventListener("play", (e) => {
        if (!targetVideoElement) {
            targetVideoElement = e.target as HTMLVideoElement;
        }

        if (isProgrammaticPlay) {
            isProgrammaticPlay = false;
            return;
        }

        browser.runtime.sendMessage({
            type: "playback",
            value: !targetVideoElement.paused,
        });

        // debug("user play");
        // ws.send(JSON.stringify({
        //     type: MessageType.PLAYBACK,
        //     data: {
        //         state: true
        //     } satisfies PlaybackMessage
        // } satisfies Message));

    });

    targetVideoElement.addEventListener("pause", (e) => {
        if (!targetVideoElement) {
            targetVideoElement = e.target as HTMLVideoElement;
        }

        if (isProgrammaticPause) {
            isProgrammaticPause = false;
            return;
        }

        browser.runtime.sendMessage({
            type: "playback",
            value: !targetVideoElement.paused,
        });

        // debug("user pause");
        // ws.send(JSON.stringify({
        //     type: MessageType.PLAYBACK,
        //     data: {
        //         state: false
        //     } satisfies PlaybackMessage
        // } satisfies Message));
    });
}

browser.runtime.onMessage.addListener((msg, resp) => {
    if (msg.action === "playback") {
        if (msg.value) {
            play();
        } else {
            pause();
        }
    }
    else if (msg.action === "seek") {
        seek(msg.value);
    }
    else if (msg.action === "url") {
        log("url change to " + msg.value);
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

// setInterval(() => {
//     let rand = Math.random();
//     if (rand < 1/3) {
//         play();
//     } else if (rand < 2/3) {
//         pause();
//     } else {
//         seek(Math.random() * 10);
//     }
// }, 2000);

