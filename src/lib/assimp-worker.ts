//  @ts-nocheck
//  @ts-nocheck

    import type { MainModule } from "assimpts";
//  import type { MainModule } from "assimpts";
    import init from "./wasm/dist/assimpts";
//  import init from "./wasm/dist/assimpts";

//  Initialize the WASM module once when the worker is created.
//  Initialize the WASM module once when the worker is created.
    const assimpReady: Promise<MainModule> = init();
//  const assimpReady: Promise<MainModule> = init();

    onmessage = async (event) => {
//  onmessage = async (event) => {
        try {
//      try {
            const assimp: MainModule = await assimpReady;
//          const assimp: MainModule = await assimpReady;
            const { files } = event.data;
//          const { files } = event.data;
            type AssimpJSON = any;
//          type AssimpJSON = any;

            // Fetch file data inside the worker
//          // Fetch file data inside the worker
            const fetchFiles = await Promise.all(
//          const fetchFiles = await Promise.all(
                files.map(
//              files.map(
                    (file) => fetch(file.publicURL)
//                  (file) => fetch(file.publicURL)
                        .then((response: Response) => response.arrayBuffer())
//                      .then((response: Response) => response.arrayBuffer())
                        .then((arrayBuffer: ArrayBuffer) => ({ data: new Uint8Array(arrayBuffer), path: file.name, }))
//                      .then((arrayBuffer: ArrayBuffer) => ({ data: new Uint8Array(arrayBuffer), path: file.name, }))
                )
//              )
            );
//          );

            // Process files with Assimp
//          // Process files with Assimp
            const models: Uint8Array[] = assimp.processFiles(fetchFiles, "assjson",
//          const models: Uint8Array[] = assimp.processFiles(fetchFiles, "assjson",
                    assimp.PostProcessFlags.triangulate.value
//                  assimp.PostProcessFlags.triangulate.value
                |   assimp.PostProcessFlags.genSmoothNormals.value
//              |   assimp.PostProcessFlags.genSmoothNormals.value
                |   assimp.PostProcessFlags.fixInfacingNormals.value
//              |   assimp.PostProcessFlags.fixInfacingNormals.value
                |   assimp.PostProcessFlags.optimizeGraph.value
//              |   assimp.PostProcessFlags.optimizeGraph.value
                |   assimp.PostProcessFlags.optimizeMeshes.value
//              |   assimp.PostProcessFlags.optimizeMeshes.value
            );
//          );

            // Decode and parse the JSON results
//          // Decode and parse the JSON results
            const decoder = new TextDecoder("utf-8");
//          const decoder = new TextDecoder("utf-8");
            const parsedResults = models.map((encodedModel) => {
//          const parsedResults = models.map((encodedModel) => {
                const jsonString = decoder.decode(encodedModel);
//              const jsonString = decoder.decode(encodedModel);
                return JSON.parse(jsonString);
//              return JSON.parse(jsonString);
            });
//          });

            // Send the final result back to the main thread
//          // Send the final result back to the main thread
            postMessage({ parsedResults });
//          postMessage({ parsedResults });

        } catch (error) {
//      } catch (error) {
            postMessage({ error: error?.message || String(error) });
//          postMessage({ error: error?.message || String(error) });
        }
//      }
    };
//  };
