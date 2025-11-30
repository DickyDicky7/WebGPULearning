    export type ColumnAtlas = {
//  export type ColumnAtlas = {
        mergedImageBuffer: Uint8Array,
//      mergedImageBuffer: Uint8Array,
        mergedImageWidth: number,
//      mergedImageWidth: number,
        mergedImageHeight: number,
//      mergedImageHeight: number,
    }
//  }
    type CreateColumnAtlasInput = {
//  type CreateColumnAtlasInput = {
        publicURLs: string[],
//      publicURLs: string[],
        cellImageWidth: number,
//      cellImageWidth: number,
        cellImageHeight: number,
//      cellImageHeight: number,
    }
//  }
    type WorkerResponse = {
//  type WorkerResponse = {
        mergedResult: undefined | ColumnAtlas,
//      mergedResult: undefined | ColumnAtlas,
        errorString: undefined | string,
//      errorString: undefined | string,
    }
//  }
    export function createColumnAtlas(createColumnAtlasInput: CreateColumnAtlasInput): Promise<ColumnAtlas> {
//  export function createColumnAtlas(createColumnAtlasInput: CreateColumnAtlasInput): Promise<ColumnAtlas> {
        return new Promise((resolve, reject) => {
//      return new Promise((resolve, reject) => {
            const worker: Worker = new Worker(new URL("./atlas-images-merger-column-worker.ts", import.meta.url), { type: "module" });
//          const worker: Worker = new Worker(new URL("./atlas-images-merger-column-worker.ts", import.meta.url), { type: "module" });
            worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
//          worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
                const workerResponse: WorkerResponse = event.data;
//              const workerResponse: WorkerResponse = event.data;
                if (workerResponse.errorString) {
//              if (workerResponse.errorString) {
                    reject (new Error(workerResponse.errorString));
//                  reject (new Error(workerResponse.errorString));
                } else if  (workerResponse.mergedResult) {
//              } else if  (workerResponse.mergedResult) {
                    resolve(workerResponse.mergedResult);
//                  resolve(workerResponse.mergedResult);
                }
                worker.terminate();
//              worker.terminate();
            }
//          }
            worker.onerror = (errorEvent: ErrorEvent) => {
//          worker.onerror = (errorEvent: ErrorEvent) => {
                reject(errorEvent);
//              reject(errorEvent);
                worker.terminate();
//              worker.terminate();
            }
//          }
            worker.postMessage(createColumnAtlasInput);
//          worker.postMessage(createColumnAtlasInput);
        });
//      });
    }
//  }
