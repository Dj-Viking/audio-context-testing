// TODO: create processor worklet for processing audio buffers!
/**
 * @see https://webaudio.github.io/web-audio-api/#AudioWorkletNodeOptions
 * 
 * dictionary AudioWorkletNodeOptions : AudioNodeOptions {
    unsigned long numberOfInputs = 1;
    unsigned long numberOfOutputs = 1;
    sequence<unsigned long> outputChannelCount;
    record<DOMString, double> parameterData;
    object processorOptions;
};
 */

interface IAudioWorkletProcessor {
    readonly port: globalThis.MessagePort
    process(): void
}

class AudioWorkletProcessor implements IAudioWorkletProcessor {
    port: MessagePort = null as any;
    constructor() {}
    public process(): void {
        
    }
}

// test-processor.js
// @ts-ignore
export class TestProcessor extends AudioWorkletProcessor {
    constructor(options: AudioWorkletNodeOptions) {
        super();
        console.log(options.numberOfInputs);
        // console.log(options.processorOptions.someUsefulVariable);
    }
    // @ts-ignore
    process(inputs, outputs, parameters) {
        console.log("process was called");
        return true;
    }
}
// @ts-ignore
const registerProcessor = function (name: string, processor: unknown) {};
registerProcessor("test-processor", TestProcessor);