class Main {
    public rootEl: HTMLDivElement;
    public audioCtx: AudioContext;
    public constructor() {
        this.rootEl = document.querySelector("#root") as HTMLDivElement;
        this.audioCtx = new AudioContext();
        console.log("my ctx", this.audioCtx);
    }
    public run(): void {
        console.log("running main");
    }
}

new Main().run();
