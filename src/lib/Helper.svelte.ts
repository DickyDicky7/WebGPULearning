    export function getDetailedTimestamp(): string {
//  export function getDetailedTimestamp(): string {
        const now: Date = new Date();
//      const now: Date = new Date();
        const year: number = now.getFullYear();
//      const year: number = now.getFullYear();
        const month: string = String(now.getMonth() + 1).padStart(2, "0");
//      const month: string = String(now.getMonth() + 1).padStart(2, "0");
        const day: string = String(now.getDate()).padStart(2, "0");
//      const day: string = String(now.getDate()).padStart(2, "0");
        const hours: string = String(now.getHours()).padStart(2, "0");
//      const hours: string = String(now.getHours()).padStart(2, "0");
        const minutes: string = String(now.getMinutes()).padStart(2, "0");
//      const minutes: string = String(now.getMinutes()).padStart(2, "0");
        const seconds: string = String(now.getSeconds()).padStart(2, "0");
//      const seconds: string = String(now.getSeconds()).padStart(2, "0");
        const milliseconds: string = String(now.getMilliseconds()).padStart(3, "0");
//      const milliseconds: string = String(now.getMilliseconds()).padStart(3, "0");
        // timezone offset (e.g. +0700)
        // timezone offset (e.g. +0700)
        const offset: number = -now.getTimezoneOffset();
//      const offset: number = -now.getTimezoneOffset();
        const sign: "+" | "-" = offset >= 0 ? "+" : "-";
//      const sign: "+" | "-" = offset >= 0 ? "+" : "-";
        const offsetHours: string = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
//      const offsetHours: string = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
        const offsetMinutes: string = String(Math.abs(offset) % 60).padStart(2, "0");
//      const offsetMinutes: string = String(Math.abs(offset) % 60).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}${offsetMinutes}`;
//      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}${offsetMinutes}`;
    }
//  }

    export async function loadPublicFileAsFile(path: string, name?: string): Promise<File> {
//  export async function loadPublicFileAsFile(path: string, name?: string): Promise<File> {
        const response: Response = await fetch(path);
//      const response: Response = await fetch(path);
        const blob: Blob = await response.blob();
//      const blob: Blob = await response.blob();
        const filename: string = name ?? path.split("/").pop() ?? "file.bin"; // Use the provided name or infer from the URL
//      const filename: string = name ?? path.split("/").pop() ?? "file.bin"; // Use the provided name or infer from the URL
        return new File([blob], filename, { type: blob.type || "application/octet-stream", });
//      return new File([blob], filename, { type: blob.type || "application/octet-stream", });
    }
//  }

//  // Example usage:
//  // Example usage:
//  const file: File = await loadPublicFileAsFile("/weights/model.bin");
//  const file: File = await loadPublicFileAsFile("/weights/model.bin");
//  console.log(file.name, file.size, file.type);
//  console.log(file.name, file.size, file.type);

    export function compareArrays<T>(a: T[], b: T[], compareFn?: (x: T, y: T) => boolean): boolean {
//  export function compareArrays<T>(a: T[], b: T[], compareFn?: (x: T, y: T) => boolean): boolean {
        if (a.length !== b.length) {
//      if (a.length !== b.length) {
            return false;
//          return false;
        }
//      }
        const equals: (x: T, y: T) => boolean = compareFn ?? ((x, y) => x === y);
//      const equals: (x: T, y: T) => boolean = compareFn ?? ((x, y) => x === y);
        for (let i = 0; i < a.length; i++) {
//      for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) {
//          if (!equals(a[i], b[i])) {
                return false;
//              return false;
            }
//          }
        }
//      }
        return true;
//      return true;
    }
//  }

    export const isEqual = (x: number, y: number): boolean => x === y;
//  export const isEqual = (x: number, y: number): boolean => x === y;

    export function encodeOctahedralNormal(normal: [number, number, number]): number {
//  export function encodeOctahedralNormal(normal: [number, number, number]): number {
        const length: number = Math.hypot(normal[0], normal[1], normal[2]);
//      const length: number = Math.hypot(normal[0], normal[1], normal[2]);
        if (length === 0)
//      if (length === 0)
        {
//      {
            return 0;
//          return 0;
        }
//      }
        let nx: number = normal[0] / length;
//      let nx: number = normal[0] / length;
        let ny: number = normal[1] / length;
//      let ny: number = normal[1] / length;
        let nz: number = normal[2] / length;
//      let nz: number = normal[2] / length;
        const invL1Norm: number = 1.0 / (Math.abs(nx) + Math.abs(ny) + Math.abs(nz));
//      const invL1Norm: number = 1.0 / (Math.abs(nx) + Math.abs(ny) + Math.abs(nz));
        nx *= invL1Norm;
//      nx *= invL1Norm;
        ny *= invL1Norm;
//      ny *= invL1Norm;
        if (nz < 0.0)
//      if (nz < 0.0)
        {
//      {
            const previousX: number = nx;
//          const previousX: number = nx;
            let signX: number;
//          let signX: number;
            if (previousX >= 0)
//          if (previousX >= 0)
            {
//          {
                signX = 1;
//              signX = 1;
            }
//          }
            else
//          else
            {
//          {
                signX = -1;
//              signX = -1;
            }
//          }
            let signY: number;
//          let signY: number;
            if (ny >= 0)
//          if (ny >= 0)
            {
//          {
                signY = 1;
//              signY = 1;
            }
//          }
            else
//          else
            {
//          {
                signY = -1;
//              signY = -1;
            }
//          }
            nx = (1.0 - Math.abs(ny)) * signX;
//          nx = (1.0 - Math.abs(ny)) * signX;
            ny = (1.0 - Math.abs(previousX)) * signY;
//          ny = (1.0 - Math.abs(previousX)) * signY;
        }
//      }
        const encodedX: number = Math.round((nx * 0.5 + 0.5) * 65535);
//      const encodedX: number = Math.round((nx * 0.5 + 0.5) * 65535);
        const encodedY: number = Math.round((ny * 0.5 + 0.5) * 65535);
//      const encodedY: number = Math.round((ny * 0.5 + 0.5) * 65535);
        return (((encodedX & 0xffff) << 16) | (encodedY & 0xffff)) >>> 0;
//      return (((encodedX & 0xffff) << 16) | (encodedY & 0xffff)) >>> 0;
    }
//  }

    export function decodeOctahedralNormal(packedNormal: number): [number, number, number] {
//  export function decodeOctahedralNormal(packedNormal: number): [number, number, number] {
        packedNormal >>>= 0;
//      packedNormal >>>= 0;
        const encodedX: number = (packedNormal >>> 16) & 0xffff;
//      const encodedX: number = (packedNormal >>> 16) & 0xffff;
        const encodedY: number = packedNormal & 0xffff;
//      const encodedY: number = packedNormal & 0xffff;
        let nx: number = (encodedX / 65535) * 2.0 - 1.0;
//      let nx: number = (encodedX / 65535) * 2.0 - 1.0;
        let ny: number = (encodedY / 65535) * 2.0 - 1.0;
//      let ny: number = (encodedY / 65535) * 2.0 - 1.0;
        let nz: number = 1.0 - Math.abs(nx) - Math.abs(ny);
//      let nz: number = 1.0 - Math.abs(nx) - Math.abs(ny);
        if (nz < 0.0)
//      if (nz < 0.0)
        {
//      {
            const previousX: number = nx;
//          const previousX: number = nx;
            let signX: number;
//          let signX: number;
            if (previousX >= 0)
//          if (previousX >= 0)
            {
//          {
                signX = 1;
//              signX = 1;
            }
//          }
            else
//          else
            {
//          {
                signX = -1;
//              signX = -1;
            }
//          }
            let signY: number;
//          let signY: number;
            if (ny >= 0)
//          if (ny >= 0)
            {
//          {
                signY = 1;
//              signY = 1;
            }
//          }
            else
//          else
            {
//          {
                signY = -1;
//              signY = -1;
            }
//          }
            nx = (1.0 - Math.abs(ny)) * signX;
//          nx = (1.0 - Math.abs(ny)) * signX;
            ny = (1.0 - Math.abs(previousX)) * signY;
//          ny = (1.0 - Math.abs(previousX)) * signY;
        }
//      }
        const length: number = Math.hypot(nx, ny, nz);
//      const length: number = Math.hypot(nx, ny, nz);
        if (length === 0)
//      if (length === 0)
        {
//      {
            return [0, 0, 1];
//          return [0, 0, 1];
        }
//      }
        return [nx / length, ny / length, nz / length];
//      return [nx / length, ny / length, nz / length];
    }
//  }

    export function encodeQuantizedUV(uv: [number, number]): number {
//  export function encodeQuantizedUV(uv: [number, number]): number {
        const quantizedU: number = Math.min(65535, Math.max(0, Math.round(uv[0] * 65535)));
//      const quantizedU: number = Math.min(65535, Math.max(0, Math.round(uv[0] * 65535)));
        const quantizedV: number = Math.min(65535, Math.max(0, Math.round(uv[1] * 65535)));
//      const quantizedV: number = Math.min(65535, Math.max(0, Math.round(uv[1] * 65535)));
        return ((quantizedU << 16) | quantizedV) >>> 0;
//      return ((quantizedU << 16) | quantizedV) >>> 0;
    }
//  }

    export function decodeQuantizedUV(packedUV: number): [number, number] {
//  export function decodeQuantizedUV(packedUV: number): [number, number] {
        const quantizedU: number = (packedUV >>> 16) & 0xffff;
//      const quantizedU: number = (packedUV >>> 16) & 0xffff;
        const quantizedV: number = packedUV & 0xffff;
//      const quantizedV: number = packedUV & 0xffff;
        const u: number = quantizedU / 65535.0;
//      const u: number = quantizedU / 65535.0;
        const v: number = quantizedV / 65535.0;
//      const v: number = quantizedV / 65535.0;
        return [u, v];
//      return [u, v];
    }
//  }
