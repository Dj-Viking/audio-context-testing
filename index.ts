/**
    @see https://stackoverflow.com/questions/27846392/access-microphone-from-a-browser-javascript 

    audio worklet 
    @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet

    official web audio API docs
    @see https://webaudio.github.io/web-audio-api
*/

import { MeterNode } from "./meterNode.js";

class Main {
    private rootEl: HTMLDivElement;
    private audioCtx: AudioContext = null as any;
    private volumeCtrl: { inputEl: HTMLInputElement; valueEl: HTMLSpanElement } = {} as any;
    private ctxInfoEl: HTMLDivElement = null as any;

    public constructor() {
        this.rootEl = document.querySelector("#root") as HTMLDivElement;
        this.init();
    }

    private async gotStream(stream: MediaStream, _this: this): Promise<void> {

        _this.audioCtx = new AudioContext();

        _this.debugCurrentAudioContext(_this.audioCtx);

        // have to provide dist in the path because I think the context of this index.js is within the scope of dist folder 
        // defined in the script tag of index.html otherwise we get "user aborted" error message which doesn't describe what went wrong
        // we only get more descriptive messages if the promise is uncaught - caught errors do not yield anything helpful here
        await _this.audioCtx.audioWorklet.addModule("./dist/test-processor.js");

        // test the meter node with an oscillator
        // const oscillator = new OscillatorNode(_this.audioCtx);
        // const vuMeterNode = new MeterNode(_this.audioCtx, 25);
        // oscillator.connect(vuMeterNode);
        // oscillator.start();

        // build audio graph

        // Create an AudioNode from the stream. in this case is the user microphone from getUserMedia callback
        const streamNode = _this.audioCtx.createMediaStreamSource(stream);

        // create source node where the audio will be taken into
        const mediaStreamSource = _this.audioCtx.createMediaStreamSource(streamNode.mediaStream);
        
        // create a meter processing node
        const meterNode = new MeterNode(_this.audioCtx, 15);
        const gainNode = _this.audioCtx.createGain();
        // allow the input el to control the input gain of the microphone into the browser
        _this.volumeCtrl.inputEl.addEventListener("input", (event) => {
            _this.volumeCtrl.inputEl.value = event.target!.value;
            _this.volumeCtrl.valueEl.textContent = event.target!.value;
            gainNode.gain.value = Number(event.target!.value);
        });
        
        // Connect the stream to the destination to hear yourself (or any other node for processing!)
        mediaStreamSource.connect(gainNode);
        // connect gain node to meter node for worklet thread processing
        gainNode.connect(meterNode);
        // plug microphone input into the speaker output
        gainNode.connect(_this.audioCtx.destination);
    }

    // basically allows microphone input into the browser after user allows access
    private getUserMedia(): void {
        window.navigator.getUserMedia(
            {
                audio: true,
            },
            (stream) => this.gotStream(stream, this),
            (err) => {
                console.log("get user media error", err);
            }
        );
    }

    public debugCurrentAudioContext(ctx: AudioContext): void {
        const content: HTMLParagraphElement[] = [];

        let p = document.createElement("p");
        p.textContent = "base latency: " + ctx.baseLatency.toString();
        content.push(p);

        p = document.createElement("p");
        p.textContent = "current time: " + ctx.currentTime.toString();
        content.push(p);

        p = document.createElement("p");
        p.textContent = "audio context state: " + ctx.state;
        content.push(p);

        p = document.createElement("p");
        p.textContent = "audio context sample rate: " + ctx.sampleRate;
        content.push(p);

        console.log("content", content);
        this.ctxInfoEl.innerHTML = "";

        content.forEach((el) => {
            this.ctxInfoEl.appendChild(el);
        });
    }

    private startContext(this: Main, event: MouseEvent): void {
        console.log("start context event", event);
        // this.audioCtx = new AudioContext();

        // this.debugCurrentAudioContext(this.audioCtx);

        this.getUserMedia();
    }
    private init(): void {
        const btn = document.createElement("button");
        btn.textContent = "start audio context";
        btn.addEventListener("click", (event) => {
            this.startContext(event);
        });

        this.ctxInfoEl = document.createElement("div");
        this.ctxInfoEl.textContent = "waiting to start audio context";

        this.volumeCtrl.inputEl = document.querySelector("#volume") as HTMLInputElement;
        this.volumeCtrl.valueEl = document.querySelector("#volume-ctrl-view") as HTMLSpanElement;

        this.volumeCtrl.valueEl.textContent = "0.5";

        this.rootEl.appendChild(btn);
        this.rootEl.appendChild(this.ctxInfoEl);
    }
    public run(): void {
        console.log("running main");
    }
}

new Main().run();
