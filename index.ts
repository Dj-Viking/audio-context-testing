class Main {
    public rootEl: HTMLDivElement;
    public constructor() {
        this.rootEl = document.querySelector("#root") as HTMLDivElement;
    }
    public run(): void {
        console.log("running main");
    }
}

new Main().run();
