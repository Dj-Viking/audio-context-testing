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

// test-processor.js
class TestProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        console.log(options.numberOfInputs);
        console.log(options.processorOptions.someUsefulVariable);
    }
    process(inputs, outputs, parameters) {
        return true;
    }
}

registerProcessor("test-processor", TestProcessor);
