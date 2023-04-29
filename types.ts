/**
 *
 *
 *  dictionary AudioWorkletNodeOptions : AudioNodeOptions {
        unsigned long numberOfInputs = 1;
        unsigned long numberOfOutputs = 1;
        sequence<unsigned long> outputChannelCount;
        record<DOMString, double> parameterData;
        object processorOptions;
    };
 */

declare global {
    interface Navigator {
        getUserMedia(
            options: { video?: boolean; audio?: boolean },
            success: (stream: MediaStream) => void,
            error?: (error: string) => void
        ): void;
    }
    interface CSSStyleDeclaration {
        y: number;
        x: number;
    }
    interface EventTarget {
        value: string;
    }
}

export {};
