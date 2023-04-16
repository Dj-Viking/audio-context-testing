/**
     @see https://stackoverflow.com/questions/27846392/access-microphone-from-a-browser-javascript 
     audio worklet 
     @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet
     */

// TODO:
// start_microphone
// process_microphone_buffer
// show_some_data

class Main {
    private rootEl: HTMLDivElement;
    private audioCtx: AudioContext = null as any;
    private ctxInfoEl: HTMLDivElement = null as any;

    public constructor() {
        this.rootEl = document.querySelector("#root") as HTMLDivElement;
        this.init();
    }

    private gotStream(stream: MediaStream) {
        console.log("got stream success", stream);

        const ctx = new AudioContext();

        // Create an AudioNode from the stream.
        const streamNode = ctx.createMediaStreamSource(stream);

        const mediaStreamSource = ctx.createMediaStreamSource(
            streamNode.mediaStream
        );

        // Connect it to the destination to hear yourself (or any other node for processing!)
        mediaStreamSource.connect(ctx.destination);

        console.log("source node after connect", mediaStreamSource);
    }

    private getUserMedia(): void {
        window.navigator.getUserMedia(
            {
                audio: true,
            },
            this.gotStream,
            (err) => {
                console.log("get user media error", err);
            }
        );
    }

    private startContext(this: Main, event: MouseEvent): void {
        console.log("event", event);
        this.audioCtx = new AudioContext();

        const content: HTMLParagraphElement[] = [];

        let p = document.createElement("p");
        p.textContent = "base latency: " + this.audioCtx.baseLatency.toString();
        content.push(p);

        p = document.createElement("p");
        p.textContent = "current time: " + this.audioCtx.currentTime.toString();
        content.push(p);

        p = document.createElement("p");
        p.textContent = "audio context state: " + this.audioCtx.state;
        content.push(p);

        p = document.createElement("p");
        p.textContent =
            "audio context sample rate: " + this.audioCtx.sampleRate;
        content.push(p);

        console.log("content", content);
        this.ctxInfoEl.innerHTML = "";

        content.forEach((el) => {
            this.ctxInfoEl.appendChild(el);
        });
        this.getUserMedia();
    }
    private init(): void {
        console.log("my ctx", this.audioCtx);

        const btn = document.createElement("button");
        btn.textContent = "start audio context";
        btn.addEventListener("click", (event) => {
            this.startContext(event);
        });

        this.ctxInfoEl = document.createElement("div");
        this.ctxInfoEl.textContent = "waiting to start audio context";

        btn.click();

        this.rootEl.appendChild(btn);
        this.rootEl.appendChild(this.ctxInfoEl);
    }
    public run(): void {
        console.log("running main");
    }
}

new Main().run();
