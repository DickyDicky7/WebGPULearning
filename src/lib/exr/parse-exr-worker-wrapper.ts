    export const parseEXRWithWorker = (buffer: ArrayBuffer, type: 1015 | 1016): Promise<{ data: Float32Array | Uint16Array, width: number, height: number }> => {
//  export const parseEXRWithWorker = (buffer: ArrayBuffer, type: 1015 | 1016): Promise<{ data: Float32Array | Uint16Array, width: number, height: number }> => {
        return new Promise((resolve, reject) => {
//      return new Promise((resolve, reject) => {
            const worker: Worker = new Worker(new URL("./parse-exr-worker.ts", import.meta.url), { type: "module" });
//          const worker: Worker = new Worker(new URL("./parse-exr-worker.ts", import.meta.url), { type: "module" });
            worker.onmessage = (event: MessageEvent<{ success: boolean, result?: any, error?: string }>) => {
//          worker.onmessage = (event: MessageEvent<{ success: boolean, result?: any, error?: string }>) => {
                if (event.data.success) {
//              if (event.data.success) {
                    resolve(event.data.result);
//                  resolve(event.data.result);
                } else {
//              } else {
                    reject(new Error(event.data.error));
//                  reject(new Error(event.data.error));
                }
//              }
                worker.terminate();
//              worker.terminate();
            };
//          };
            worker.onerror = (error: ErrorEvent) => {
//          worker.onerror = (error: ErrorEvent) => {
                reject(error);
//              reject(error);
                worker.terminate();
//              worker.terminate();
            };
//          };
            worker.postMessage({ buffer, type }, [buffer]);
//          worker.postMessage({ buffer, type }, [buffer]);
        });
//      });
    };
//  };
