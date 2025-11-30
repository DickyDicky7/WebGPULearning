    import { type EXRData, parseEXR, } from "./parse-exr";
//  import { type EXRData, parseEXR, } from "./parse-exr";
    self.onmessage = (event: MessageEvent<{ buffer: ArrayBuffer, type: 1015 | 1016 }>) => {
//  self.onmessage = (event: MessageEvent<{ buffer: ArrayBuffer, type: 1015 | 1016 }>) => {
        try {
//      try {
            const { buffer, type }: { buffer: ArrayBuffer, type: 1015 | 1016 } = event.data;
//          const { buffer, type }: { buffer: ArrayBuffer, type: 1015 | 1016 } = event.data;
            const result: EXRData = parseEXR(buffer, type);
//          const result: EXRData = parseEXR(buffer, type);
            self.postMessage({ success: true, result }, [result.data.buffer]);
//          self.postMessage({ success: true, result }, [result.data.buffer]);
        } catch (error: any) {
//      } catch (error: any) {
            self.postMessage({ success: false, error: error.message });
//          self.postMessage({ success: false, error: error.message });
        }
//      }
    };
//  };
