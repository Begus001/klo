export class ReconWebSocket {
    private ws: WebSocket | null = null;
    private url = "";
    private reconnectDelayMs = 500;
    private manuallyClosed = false;

    constructor(
        private readonly onMessage: (ws: WebSocket, data: any) => void,
        private readonly onError?: (err: Event) => void,
    ) {}

    async connect(url: string): Promise<void> {
        this.url = url;
        this.manuallyClosed = false;

        return new Promise<void>((resolve, reject) => {
            console.log("Klo: trying to connect");
            const ws = new WebSocket(url);
            this.ws = ws;

            const cleanup = () => {
                ws.onopen = null;
                ws.onerror = null;
            };

            ws.onopen = () => {
                cleanup();
                console.log("Klo: connected");
                resolve();
            };

            ws.onerror = (e) => {
                cleanup();
                reject(new Error(`Failed to connect to ${url}`));
                this.onError?.(e);
            };

            ws.onmessage = (e) => {
                this.onMessage(this.ws!, e.data);
            };

            ws.onclose = () => {
                if (!this.manuallyClosed) {
                    console.log("Klo: disconnected");
                    this.scheduleReconnect();
                }
            };
        });
    }

    private scheduleReconnect() {
        setTimeout(() => {
            if (!this.manuallyClosed) {
                this.connect(this.url).catch(() => {
                    /* swallow initial connect failure; reconnect loop continues */
                });
            }
        }, this.reconnectDelayMs);
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        }
    }

    close() {
        this.manuallyClosed = true;
        this.ws?.close();
        this.ws = null;
    }
}
