    type AssimpJSON = any;
//  type AssimpJSON = any;

    export function customLoadFileObj(files: { publicURL: string, name: string, }[]): Promise<AssimpJSON[]> {
//  export function customLoadFileObj(files: { publicURL: string, name: string, }[]): Promise<AssimpJSON[]> {
        return new Promise((resolve, reject) => {
//      return new Promise((resolve, reject) => {
            // Create a new worker
//          // Create a new worker
            const worker = new Worker(new URL("./assimp-worker.ts", import.meta.url), { type: "module" });
//          const worker = new Worker(new URL("./assimp-worker.ts", import.meta.url), { type: "module" });

            // Define expected message structure
//          // Define expected message structure
            interface WorkerResponse {
//          interface WorkerResponse {
                parsedResults?: AssimpJSON[];
//              parsedResults?: AssimpJSON[];
                error?: string;
//              error?: string;
            }
//          }

            worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
//          worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
                const { parsedResults, error } = event.data;
//              const { parsedResults, error } = event.data;
                if (error) {
//              if (error) {
                    reject(new Error(error));
//                  reject(new Error(error));
                } else if (parsedResults) {
//              } else if (parsedResults) {
                    resolve(parsedResults);
//                  resolve(parsedResults);
                }
//              }
                worker.terminate();
//              worker.terminate();
            };
//          };

            worker.onerror = (errorEvent: ErrorEvent) => {
//          worker.onerror = (errorEvent: ErrorEvent) => {
                reject(errorEvent);
//              reject(errorEvent);
                worker.terminate();
//              worker.terminate();
            };
//          };

            // Send data to worker
//          // Send data to worker
            worker.postMessage({ files });
//          worker.postMessage({ files });
        });
//      });
    }
//  }
