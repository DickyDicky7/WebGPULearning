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

    // Encodes a normalized 3D normal vector into a 32-bit unsigned integer
    // Encodes a normalized 3D normal vector into a 32-bit unsigned integer
    // using octahedral (spherical) mapping.
    // using octahedral (spherical) mapping.
    export function encodeOctahedralNormal(normal: [number, number, number]): number {
//  export function encodeOctahedralNormal(normal: [number, number, number]): number {
        // Normalize the input vector
        // Normalize the input vector
        const length: number = Math.hypot(normal[0], normal[1], normal[2]);
//      const length: number = Math.hypot(normal[0], normal[1], normal[2]);
        let nx: number = normal[0] / length;
//      let nx: number = normal[0] / length;
        let ny: number = normal[1] / length;
//      let ny: number = normal[1] / length;
        let nz: number = normal[2] / length;
//      let nz: number = normal[2] / length;

        // Project onto the octahedron surface
        // Project onto the octahedron surface
        const invL1Norm: number = 1.0 / (Math.abs(nx) + Math.abs(ny) + Math.abs(nz));
//      const invL1Norm: number = 1.0 / (Math.abs(nx) + Math.abs(ny) + Math.abs(nz));
        nx *= invL1Norm;
//      nx *= invL1Norm;
        ny *= invL1Norm;
//      ny *= invL1Norm;

        // Reflect if below the z = 0 plane
        // Reflect if below the z = 0 plane
        if (nz < 0.0) {
//      if (nz < 0.0) {
            const previousX: number = nx;
//          const previousX: number = nx;
            nx = (1.0 - Math.abs(ny)) * Math.sign(previousX);
//          nx = (1.0 - Math.abs(ny)) * Math.sign(previousX);
            ny = (1.0 - Math.abs(previousX)) * Math.sign(ny);
//          ny = (1.0 - Math.abs(previousX)) * Math.sign(ny);
        }
//      }

        // Remap from [-1, 1] → [0, 1]
        // Remap from [-1, 1] → [0, 1]
        const encodedX: number = Math.round((nx * 0.5 + 0.5) * 65535);
//      const encodedX: number = Math.round((nx * 0.5 + 0.5) * 65535);
        const encodedY: number = Math.round((ny * 0.5 + 0.5) * 65535);
//      const encodedY: number = Math.round((ny * 0.5 + 0.5) * 65535);

        // Pack into 32 bits (16 bits per component)
        // Pack into 32 bits (16 bits per component)
        return ((encodedX & 0xffff) << 16) | (encodedY & 0xffff);
//      return ((encodedX & 0xffff) << 16) | (encodedY & 0xffff);
    }
//  }


    // Decodes a 32-bit packed normal (octahedral format) back into
    // Decodes a 32-bit packed normal (octahedral format) back into
    // a normalized 3D vector.
    // a normalized 3D vector.
    export function decodeOctahedralNormal(packedNormal: number): [number, number, number] {
//  export function decodeOctahedralNormal(packedNormal: number): [number, number, number] {
        packedNormal >>>= 0; // Ensure unsigned 32-bit integer
//      packedNormal >>>= 0; // Ensure unsigned 32-bit integer

        // Extract the two 16-bit components
        // Extract the two 16-bit components
        const encodedX: number = (packedNormal >>> 16) & 0xffff;
//      const encodedX: number = (packedNormal >>> 16) & 0xffff;
        const encodedY: number = packedNormal & 0xffff;
//      const encodedY: number = packedNormal & 0xffff;

        // Map back from [0, 65535] → [-1, 1]
        // Map back from [0, 65535] → [-1, 1]
        let nx: number = (encodedX / 65535) * 2.0 - 1.0;
//      let nx: number = (encodedX / 65535) * 2.0 - 1.0;
        let ny: number = (encodedY / 65535) * 2.0 - 1.0;
//      let ny: number = (encodedY / 65535) * 2.0 - 1.0;

        // Reconstruct z component
        // Reconstruct z component
        let nz: number = 1.0 - Math.abs(nx) - Math.abs(ny);
//      let nz: number = 1.0 - Math.abs(nx) - Math.abs(ny);

        // Reflect if necessary
        // Reflect if necessary
        if (nz < 0.0) {
//      if (nz < 0.0) {
            const previousX: number = nx;
//          const previousX: number = nx;
            nx = (1.0 - Math.abs(ny)) * Math.sign(previousX || 1);
//          nx = (1.0 - Math.abs(ny)) * Math.sign(previousX || 1);
            ny = (1.0 - Math.abs(previousX)) * Math.sign(ny || 1);
//          ny = (1.0 - Math.abs(previousX)) * Math.sign(ny || 1);
            nz = 1.0 - Math.abs(nx) - Math.abs(ny);
//          nz = 1.0 - Math.abs(nx) - Math.abs(ny);
        }
//      }

        // Normalize final vector
        // Normalize final vector
        const length: number = Math.hypot(nx, ny, nz);
//      const length: number = Math.hypot(nx, ny, nz);
        if (length === 0) {
//      if (length === 0) {
            return [0, 0, 1];
//          return [0, 0, 1];
        }
//      }
        return [nx / length, ny / length, nz / length];
//      return [nx / length, ny / length, nz / length];
    }
//  }

    // Encodes a 2D UV coordinate (in [0, 1] range) into a 32-bit integer.
    // Encodes a 2D UV coordinate (in [0, 1] range) into a 32-bit integer.
    export function encodeQuantizedUV(uv: [number, number]): number {
//  export function encodeQuantizedUV(uv: [number, number]): number {
        const quantizedU: number = Math.min(65535, Math.max(0, Math.round(uv[0] * 65535)));
//      const quantizedU: number = Math.min(65535, Math.max(0, Math.round(uv[0] * 65535)));
        const quantizedV: number = Math.min(65535, Math.max(0, Math.round(uv[1] * 65535)));
//      const quantizedV: number = Math.min(65535, Math.max(0, Math.round(uv[1] * 65535)));
        return (quantizedU << 16) | quantizedV;
//      return (quantizedU << 16) | quantizedV;
    }
//  }

    // Decodes a 32-bit packed UV value back into a [0, 1] range pair.
    // Decodes a 32-bit packed UV value back into a [0, 1] range pair.
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
