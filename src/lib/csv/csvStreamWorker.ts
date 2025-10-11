/// <reference lib="webworker" />
/// <reference lib="webworker" />
    interface WorkerInitMessage {
//  interface WorkerInitMessage {
        type: 'INIT';
//      type: 'INIT';
        headers: string[];
//      headers: string[];
    }
//  }
    interface WorkerChunkMessage {
//  interface WorkerChunkMessage {
        type: 'CHUNK';
//      type: 'CHUNK';
        rows: Record<string, any>[];
//      rows: Record<string, any>[];
    }
//  }
    interface WorkerEndMessage {
//  interface WorkerEndMessage {
        type: 'END';
//      type: 'END';
    }
//  }
    type WorkerMessage = WorkerInitMessage | WorkerChunkMessage | WorkerEndMessage;
//  type WorkerMessage = WorkerInitMessage | WorkerChunkMessage | WorkerEndMessage;
    interface WorkerProgress {
//  interface WorkerProgress {
        type: 'PROGRESS';
//      type: 'PROGRESS';
        writtenRows: number;
//      writtenRows: number;
    }
//  }
    interface WorkerDone {
//  interface WorkerDone {
        type: 'DONE';
//      type: 'DONE';
        blobUrl: string;
//      blobUrl: string;
        totalRows: number;
//      totalRows: number;
    }
//  }
    let chunks: string[] = [];
//  let chunks: string[] = [];
    let keys: string[] = [];
//  let keys: string[] = [];
    let rowCount: number = 0;
//  let rowCount: number = 0;
    function escapeField(value: string): string {
//  function escapeField(value: string): string {
        if (value == null) {
//      if (value == null) {
            return '';
//          return '';
        }
//      }
        const s: string = String(value);
//      const s: string = String(value);
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
//      if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
            return `"${s.replace(/"/g, '""')}"`;
//          return `"${s.replace(/"/g, '""')}"`;
        }
//      }
        return s;
//      return s;
    }
//  }
    function objectsToCsvChunk(rows: Record<string, any>[]): string {
//  function objectsToCsvChunk(rows: Record<string, any>[]): string {
        return rows.map(row => keys.map(k => escapeField(row[k])).join(',')).join('\r\n');
//      return rows.map(row => keys.map(k => escapeField(row[k])).join(',')).join('\r\n');
    }
//  }
    self.onmessage = (e: MessageEvent<WorkerMessage>) => {
//  self.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const msg: WorkerMessage = e.data;
//      const msg: WorkerMessage = e.data;
        switch (msg.type) {
//      switch (msg.type) {
            case 'INIT': {
//          case 'INIT': {
                keys = msg.headers;
//              keys = msg.headers;
                chunks = ['\uFEFF' + keys.join(',')]; // Start with header
//              chunks = ['\uFEFF' + keys.join(',')]; // Start with header
                rowCount = 0;
//              rowCount = 0;
                break;
//              break;
            }
//          }
            case 'CHUNK': {
//          case 'CHUNK': {
                const csvChunk: string = objectsToCsvChunk(msg.rows);
//              const csvChunk: string = objectsToCsvChunk(msg.rows);
                chunks.push(csvChunk);
//              chunks.push(csvChunk);
                rowCount += msg.rows.length;
//              rowCount += msg.rows.length;
                const progress: WorkerProgress = {
//              const progress: WorkerProgress = {
                    type: 'PROGRESS',
//                  type: 'PROGRESS',
                    writtenRows: rowCount,
//                  writtenRows: rowCount,
                };
//              };
                self.postMessage(progress);
//              self.postMessage(progress);
                break;
//              break;
            }
//          }
            case 'END': {
//          case 'END': {
                const csvString: string = chunks.join('\r\n');
//              const csvString: string = chunks.join('\r\n');
                const blob: Blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
//              const blob: Blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                const url: string = URL.createObjectURL(blob);
//              const url: string = URL.createObjectURL(blob);
                const done: WorkerDone = {
//              const done: WorkerDone = {
                    type: 'DONE',
//                  type: 'DONE',
                    blobUrl: url,
//                  blobUrl: url,
                    totalRows: rowCount,
//                  totalRows: rowCount,
                };
//              };
                self.postMessage(done);
//              self.postMessage(done);
                chunks = [];
//              chunks = [];
                break;
//              break;
            }
//          }
        }
//      }
    };
//  };
