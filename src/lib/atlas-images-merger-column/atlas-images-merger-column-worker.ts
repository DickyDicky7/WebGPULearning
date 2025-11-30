    import * as ijs from "image-js";
//  import * as ijs from "image-js";

    onmessage = async (event: MessageEvent<{ publicURLs: string[], cellImageWidth: number, cellImageHeight: number, }>): Promise<void> => {
//  onmessage = async (event: MessageEvent<{ publicURLs: string[], cellImageWidth: number, cellImageHeight: number, }>): Promise<void> => {
        try {
//      try {
            const { publicURLs, cellImageWidth, cellImageHeight, }: { publicURLs: string[], cellImageWidth: number, cellImageHeight: number, } = event.data;
//          const { publicURLs, cellImageWidth, cellImageHeight, }: { publicURLs: string[], cellImageWidth: number, cellImageHeight: number, } = event.data;
            const images: ijs.Image[] = await Promise.all(
//          const images: ijs.Image[] = await Promise.all(
                publicURLs.map(
//              publicURLs.map(
                    (publicURL: string): Promise<ijs.Image> => {
//                  (publicURL: string): Promise<ijs.Image> => {
                        return ijs.fetchURL(publicURL);
//                      return ijs.fetchURL(publicURL);
                    }
//                  }
                )
//              )
            );
//          );
            const numberOfColorChannels: number = 4;
//          const numberOfColorChannels: number = 4;
            /*
            const cellImageWidth: number = 8192; // 1024 | 512 | 256
//          const cellImageWidth: number = 8192; // 1024 | 512 | 256
            const cellImageHeight: number = 8192; // 1024 | 512 | 256
//          const cellImageHeight: number = 8192; // 1024 | 512 | 256
            */
            const cellImageRawDataLength: number = cellImageWidth * cellImageHeight * numberOfColorChannels;
//          const cellImageRawDataLength: number = cellImageWidth * cellImageHeight * numberOfColorChannels;
            const mergedImageWidth: number = cellImageWidth;
//          const mergedImageWidth: number = cellImageWidth;
            const mergedImageHeight: number = cellImageHeight * images.length;
//          const mergedImageHeight: number = cellImageHeight * images.length;
            const mergedImageRawDataLength: number = mergedImageWidth * mergedImageHeight * numberOfColorChannels;
//          const mergedImageRawDataLength: number = mergedImageWidth * mergedImageHeight * numberOfColorChannels;
            const mergedImageBuffer: Uint8Array = new Uint8Array(mergedImageRawDataLength);
//          const mergedImageBuffer: Uint8Array = new Uint8Array(mergedImageRawDataLength);
            for (let i = 0; i < images.length; ++i) {
//          for (let i = 0; i < images.length; ++i) {
                images[i] = images[i].resize({
//              images[i] = images[i].resize({
                    borderType: "constant",
//                  borderType: "constant",
                    borderValue: 0,
//                  borderValue: 0,
                    width: cellImageWidth,
//                  width: cellImageWidth,
                    height: cellImageHeight,
//                  height: cellImageHeight,
                    preserveAspectRatio: true,
//                  preserveAspectRatio: true,
                    interpolationType: ijs.InterpolationType.BILINEAR,
//                  interpolationType: ijs.InterpolationType.BILINEAR,
                });
//              });
                images[i] = images[i].convertColor("RGBA");
//              images[i] = images[i].convertColor("RGBA");
                const rawData: Uint8Array = images[i].getRawImage().data as Uint8Array;
//              const rawData: Uint8Array = images[i].getRawImage().data as Uint8Array;
                const offset: number = i * cellImageRawDataLength;
//              const offset: number = i * cellImageRawDataLength;
                mergedImageBuffer.set(rawData, offset);
//              mergedImageBuffer.set(rawData, offset);
            }
//          }
            postMessage({
//          postMessage({
                mergedResult: {
//              mergedResult: {
                    mergedImageBuffer: mergedImageBuffer,
//                  mergedImageBuffer: mergedImageBuffer,
                    mergedImageWidth: mergedImageWidth,
//                  mergedImageWidth: mergedImageWidth,
                    mergedImageHeight: mergedImageHeight,
//                  mergedImageHeight: mergedImageHeight,
                },
//              },
                errorString: undefined,
//              errorString: undefined,
            });
//          });
        } catch (error: any) {
//      } catch (error: any) {
            if (error) {
//          if (error) {
                postMessage({ mergedResult: undefined, errorString: error.message, });
//              postMessage({ mergedResult: undefined, errorString: error.message, });
            } else {
//          } else {
                postMessage({ mergedResult: undefined, errorString: String(error), });
//              postMessage({ mergedResult: undefined, errorString: String(error), });
            }
//          }
        }
//      }
    }
//  }
