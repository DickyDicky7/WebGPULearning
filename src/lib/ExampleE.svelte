<script lang="ts">
    import { onMount } from "svelte";
//  import { onMount } from "svelte";
    import shaderString from "../assets/5.wgsl?raw";
//  import shaderString from "../assets/5.wgsl?raw";



    let gpuAdapter: GPUAdapter;
//  let gpuAdapter: GPUAdapter;
    let gpuDevice: GPUDevice;
//  let gpuDevice: GPUDevice;
    let canvas: HTMLCanvasElement;
//  let canvas: HTMLCanvasElement;
    let gpuCanvasContext: GPUCanvasContext;
//  let gpuCanvasContext: GPUCanvasContext;
    let presentationFormat: GPUTextureFormat;
//  let presentationFormat: GPUTextureFormat;
    let gpuShaderModule: GPUShaderModule;
//  let gpuShaderModule: GPUShaderModule;
    let gpuRenderPipeline: GPURenderPipeline;
//  let gpuRenderPipeline: GPURenderPipeline;
    let gpuRenderPassDescriptor: GPURenderPassDescriptor;
//  let gpuRenderPassDescriptor: GPURenderPassDescriptor;
    let gpuCommandEncoder: GPUCommandEncoder;
//  let gpuCommandEncoder: GPUCommandEncoder;
    let gpuRenderPassEncoder: GPURenderPassEncoder;
//  let gpuRenderPassEncoder: GPURenderPassEncoder;
    let gpuCommandBuffer: GPUCommandBuffer;
//  let gpuCommandBuffer: GPUCommandBuffer;
    let resizeObserver: ResizeObserver;
//  let resizeObserver: ResizeObserver;
    let staticVertexBuffer: GPUBuffer;
//  let staticVertexBuffer: GPUBuffer;
    let dynamicVertexBuffer: GPUBuffer;
//  let dynamicVertexBuffer: GPUBuffer;
    let staticUnitSize: number;
//  let staticUnitSize: number;
    let dynamicUnitSize: number;
//  let dynamicUnitSize: number;
    let staticVertexBufferSize: number;
//  let staticVertexBufferSize: number;
    let dynamicVertexBufferSize: number;
//  let dynamicVertexBufferSize: number;
    let kColorOffset: number;
//  let kColorOffset: number;
    let kOffsetOffset: number;
//  let kOffsetOffset: number;
    let kScaleOffset: number;
//  let kScaleOffset: number;
    let kNumObjects: number;
//  let kNumObjects: number;
    type ObjectInfo =
//  type ObjectInfo =
    {
        scale:number,
//      scale:number,
    };
    let objectInfos: ObjectInfo[];
//  let objectInfos: ObjectInfo[];
    let dynamicVertexValues: Float32Array;
//  let dynamicVertexValues: Float32Array;
    type CreateCircleVerticesResult = { vertexData: Float32Array, numVertices: number, };
//  type CreateCircleVerticesResult = { vertexData: Float32Array, numVertices: number, };
    let createCircleVerticesResult: CreateCircleVerticesResult;
//  let createCircleVerticesResult: CreateCircleVerticesResult;
    let vertexBuffer: GPUBuffer;
//  let vertexBuffer: GPUBuffer;



    onMount(async () =>
//  onMount(async () =>
    {
        gpuAdapter = (await navigator.gpu.requestAdapter())!;
//      gpuAdapter = (await navigator.gpu.requestAdapter())!;
        if (!gpuAdapter)
//      if (!gpuAdapter)
        {
            console.error(`gpuAdapter: ${gpuAdapter}`);
//          console.error(`gpuAdapter: ${gpuAdapter}`);
            return;
//          return;
        }

        gpuDevice = await gpuAdapter.requestDevice();
//      gpuDevice = await gpuAdapter.requestDevice();
        if (!gpuDevice)
//      if (!gpuDevice)
        {
            console.error(`gpuDevice: ${gpuDevice}`);
//          console.error(`gpuDevice: ${gpuDevice}`);
            return;
//          return;
        }

        gpuCanvasContext = canvas.getContext("webgpu")!;
//      gpuCanvasContext = canvas.getContext("webgpu")!;
        if (!gpuCanvasContext)
//      if (!gpuCanvasContext)
        {
            console.error(`gpuCanvasContext: ${gpuCanvasContext}`);
//          console.error(`gpuCanvasContext: ${gpuCanvasContext}`);
            return;
//          return;
        }

        presentationFormat = navigator.gpu.getPreferredCanvasFormat();
//      presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        gpuCanvasContext.configure({
//      gpuCanvasContext.configure({
            device: gpuDevice,
//          device: gpuDevice,
            format: presentationFormat,
//          format: presentationFormat,
        });

        gpuShaderModule = gpuDevice.createShaderModule({
//      gpuShaderModule = gpuDevice.createShaderModule({
            label: "GPU_SHADER_MODULE",
//          label: "GPU_SHADER_MODULE",
            code: shaderString,
//          code: shaderString,
        });

        gpuRenderPipeline = await gpuDevice.createRenderPipelineAsync({
//      gpuRenderPipeline = await gpuDevice.createRenderPipelineAsync({
            label: "GPU_RENDER_PIPELINE",
//          label: "GPU_RENDER_PIPELINE",
            layout: "auto",
//          layout: "auto",
            vertex:
//          vertex:
            {
                module: gpuShaderModule,
//              module: gpuShaderModule,
                buffers:
//              buffers:
                [
                    {
                        arrayStride: 2 * 4, // 2 floats, 4 bytes each
//                      arrayStride: 2 * 4, // 2 floats, 4 bytes each
                        stepMode: "vertex",
//                      stepMode: "vertex",
                        attributes:
//                      attributes:
                        [
                            { shaderLocation: 0, offset:  0, format: "float32x2", }, // position
//                          { shaderLocation: 0, offset:  0, format: "float32x2", }, // position
                        ]
                        ,
                    }
                    ,
                    {
                        arrayStride: 6 * 4, // 6 floats, 4 bytes each
//                      arrayStride: 6 * 4, // 6 floats, 4 bytes each
                        stepMode: "instance",
//                      stepMode: "instance",
                        attributes:
//                      attributes:
                        [
                            { shaderLocation: 1, offset:  0, format: "float32x4", }, // color
//                          { shaderLocation: 1, offset:  0, format: "float32x4", }, // color
                            { shaderLocation: 2, offset: 16, format: "float32x2", }, // offset
//                          { shaderLocation: 2, offset: 16, format: "float32x2", }, // offset
                        ]
                        ,
                    }
                    ,
                    {
                        arrayStride: 2 * 4, // 2 floats, 4 bytes each
//                      arrayStride: 2 * 4, // 2 floats, 4 bytes each
                        stepMode: "instance",
//                      stepMode: "instance",
                        attributes:
//                      attributes:
                        [
                            { shaderLocation: 3, offset:  0, format: "float32x2", }, // scale
//                          { shaderLocation: 3, offset:  0, format: "float32x2", }, // scale
                        ]
                        ,
                    }
                    ,
                ]
                ,
            }
            ,
            fragment:
//          fragment:
            {
                module: gpuShaderModule,
//              module: gpuShaderModule,
                targets: [ { format: presentationFormat } ],
//              targets: [ { format: presentationFormat } ],
            }
            ,
        });

        staticUnitSize =
//      staticUnitSize =
            4 * 4 + // color  is 4 32bit floats (4bytes each)
//          4 * 4 + // color  is 4 32bit floats (4bytes each)
            2 * 4;  // offset is 2 32bit floats (4bytes each)
//          2 * 4;  // offset is 2 32bit floats (4bytes each)
        dynamicUnitSize =
//      dynamicUnitSize =
            2 * 4;  // scale  is 2 32bit floats (4bytes each)
//          2 * 4;  // scale  is 2 32bit floats (4bytes each)
        kColorOffset = 0;
//      kColorOffset = 0;
        kOffsetOffset = 4;
//      kOffsetOffset = 4;
        kScaleOffset = 0;
//      kScaleOffset = 0;
        kNumObjects = 100;
//      kNumObjects = 100;
        objectInfos = [];
//      objectInfos = [];
        staticVertexBufferSize = staticUnitSize * kNumObjects;
//      staticVertexBufferSize = staticUnitSize * kNumObjects;
        dynamicVertexBufferSize = dynamicUnitSize * kNumObjects;
//      dynamicVertexBufferSize = dynamicUnitSize * kNumObjects;
        staticVertexBuffer = gpuDevice.createBuffer({
//      staticVertexBuffer = gpuDevice.createBuffer({
            label: "STATIC_VERTEX_FOR_OBJECTS",
//          label: "STATIC_VERTEX_FOR_OBJECTS",
            size: staticVertexBufferSize,
//          size: staticVertexBufferSize,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        dynamicVertexBuffer = gpuDevice.createBuffer({
//      dynamicVertexBuffer = gpuDevice.createBuffer({
            label: "DYNAMIC_VERTEX_FOR_OBJECTS",
//          label: "DYNAMIC_VERTEX_FOR_OBJECTS",
            size: dynamicVertexBufferSize,
//          size: dynamicVertexBufferSize,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        {
            const staticVertexValues: Float32Array = new Float32Array(staticVertexBufferSize / 4);
//          const staticVertexValues: Float32Array = new Float32Array(staticVertexBufferSize / 4);
            for (let i: number = 0; i < kNumObjects; ++i)
//          for (let i: number = 0; i < kNumObjects; ++i)
            {
                const staticOffset: number = i * (staticUnitSize / 4);
//              const staticOffset: number = i * (staticUnitSize / 4);

                staticVertexValues.set([rand(), rand(), rand(), 1], staticOffset + kColorOffset);
//              staticVertexValues.set([rand(), rand(), rand(), 1], staticOffset + kColorOffset);
                staticVertexValues.set([rand(-0.9, 0.9), rand(-0.9, 0.9)], staticOffset + kOffsetOffset);
//              staticVertexValues.set([rand(-0.9, 0.9), rand(-0.9, 0.9)], staticOffset + kOffsetOffset);

                objectInfos.push({
//              objectInfos.push({
                    scale: rand(0.2, 0.5),
//                  scale: rand(0.2, 0.5),
                });
            }
            gpuDevice.queue.writeBuffer(staticVertexBuffer, 0, staticVertexValues as GPUAllowSharedBufferSource);
//          gpuDevice.queue.writeBuffer(staticVertexBuffer, 0, staticVertexValues as GPUAllowSharedBufferSource);
        }
        dynamicVertexValues = new Float32Array(dynamicVertexBufferSize / 4);
//      dynamicVertexValues = new Float32Array(dynamicVertexBufferSize / 4);
        createCircleVerticesResult = createCircleVertices({ radius: 0.5, innerRadius: 0.25, });
//      createCircleVerticesResult = createCircleVertices({ radius: 0.5, innerRadius: 0.25, });
        vertexBuffer = gpuDevice.createBuffer({
//      vertexBuffer = gpuDevice.createBuffer({
            label: "VERTEX_BUFFER_VERTICES",
//          label: "VERTEX_BUFFER_VERTICES",
            size: createCircleVerticesResult.vertexData.byteLength,
//          size: createCircleVerticesResult.vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        gpuDevice.queue.writeBuffer(vertexBuffer, 0, createCircleVerticesResult.vertexData as GPUAllowSharedBufferSource);
//      gpuDevice.queue.writeBuffer(vertexBuffer, 0, createCircleVerticesResult.vertexData as GPUAllowSharedBufferSource);

        gpuRenderPassDescriptor =
//      gpuRenderPassDescriptor =
        {
            label: "GPU_RENDER_PASS_DESCRIPTOR",
//          label: "GPU_RENDER_PASS_DESCRIPTOR",
            colorAttachments:
//          colorAttachments:
            [
                {
                    // view: <- to be filled out when we render
                    // view: <- to be filled out when we render
                    view: undefined as any,
//                  view: undefined as any,
                    clearValue: [0.3, 0.3, 0.3, 1],
//                  clearValue: [0.3, 0.3, 0.3, 1],
                     loadOp: "clear",
//                   loadOp: "clear",
                    storeOp: "store",
//                  storeOp: "store",
                }
                ,
            ] as GPURenderPassColorAttachment[],
//          ] as GPURenderPassColorAttachment[],
        };

        resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) =>
//      resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) =>
        {
            for (const entry of entries)
//          for (const entry of entries)
            {
                const entryAsCanvas: HTMLCanvasElement = entry.target as HTMLCanvasElement;
//              const entryAsCanvas: HTMLCanvasElement = entry.target as HTMLCanvasElement;
                if (!entryAsCanvas)
//              if (!entryAsCanvas)
                {
                    return;
//                  return;
                }

                const width : number = entry.contentBoxSize[0].inlineSize;
//              const width : number = entry.contentBoxSize[0].inlineSize;
                const height: number = entry.contentBoxSize[0]. blockSize;
//              const height: number = entry.contentBoxSize[0]. blockSize;
                entryAsCanvas.width  = Math.max(1, Math.min(width , gpuDevice.limits.maxTextureDimension2D),);
//              entryAsCanvas.width  = Math.max(1, Math.min(width , gpuDevice.limits.maxTextureDimension2D),);
                entryAsCanvas.height = Math.max(1, Math.min(height, gpuDevice.limits.maxTextureDimension2D),);
//              entryAsCanvas.height = Math.max(1, Math.min(height, gpuDevice.limits.maxTextureDimension2D),);
            }
            // re-render
            // re-render
            render();
//          render();
        });
        
        resizeObserver.observe(canvas);
//      resizeObserver.observe(canvas);
    });



    const render = (): void =>
//  const render = (): void =>
    {
        const aspect: number = canvas.width / canvas.height;
//      const aspect: number = canvas.width / canvas.height;

        // Get the current texture from the canvas context and
        // Get the current texture from the canvas context and
        // set it as the texture to render to.
        // set it as the texture to render to.
        (gpuRenderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = gpuCanvasContext.getCurrentTexture().createView();
//      (gpuRenderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = gpuCanvasContext.getCurrentTexture().createView();

        // Make a command encoder to start encoding commands.
        // Make a command encoder to start encoding commands.
        gpuCommandEncoder = gpuDevice.createCommandEncoder({ label: "GPU_COMMAND_ENCODER" });
//      gpuCommandEncoder = gpuDevice.createCommandEncoder({ label: "GPU_COMMAND_ENCODER" });

        // Make a render pass encoder to encode render specific commands.
        // Make a render pass encoder to encode render specific commands.
        gpuRenderPassEncoder = gpuCommandEncoder.beginRenderPass(gpuRenderPassDescriptor);
//      gpuRenderPassEncoder = gpuCommandEncoder.beginRenderPass(gpuRenderPassDescriptor);
        gpuRenderPassEncoder.setPipeline(gpuRenderPipeline);
//      gpuRenderPassEncoder.setPipeline(gpuRenderPipeline);
        gpuRenderPassEncoder.setVertexBuffer(0, vertexBuffer);
//      gpuRenderPassEncoder.setVertexBuffer(0, vertexBuffer);
        gpuRenderPassEncoder.setVertexBuffer(1, staticVertexBuffer);
//      gpuRenderPassEncoder.setVertexBuffer(1, staticVertexBuffer);
        gpuRenderPassEncoder.setVertexBuffer(2, dynamicVertexBuffer);
//      gpuRenderPassEncoder.setVertexBuffer(2, dynamicVertexBuffer);
        objectInfos.forEach(({ scale, }, idx) => {
//      objectInfos.forEach(({ scale, }, idx) => {
            const dynamicOffset: number = idx * (dynamicUnitSize / 4);
//          const dynamicOffset: number = idx * (dynamicUnitSize / 4);
            dynamicVertexValues.set([scale / aspect, scale], dynamicOffset + kScaleOffset);
//          dynamicVertexValues.set([scale / aspect, scale], dynamicOffset + kScaleOffset);
        });
        gpuDevice.queue.writeBuffer(dynamicVertexBuffer, 0, dynamicVertexValues as GPUAllowSharedBufferSource);
//      gpuDevice.queue.writeBuffer(dynamicVertexBuffer, 0, dynamicVertexValues as GPUAllowSharedBufferSource);        
        gpuRenderPassEncoder.draw(createCircleVerticesResult.numVertices, kNumObjects); // Call our vertex shader numVertices times for each instance (numVertices vertices x 100 instances)
//      gpuRenderPassEncoder.draw(createCircleVerticesResult.numVertices, kNumObjects); // Call our vertex shader numVertices times for each instance (numVertices vertices x 100 instances)
        gpuRenderPassEncoder.end();
//      gpuRenderPassEncoder.end();
        gpuCommandBuffer = gpuCommandEncoder.finish();
//      gpuCommandBuffer = gpuCommandEncoder.finish();
        gpuDevice.queue.submit([gpuCommandBuffer]);
//      gpuDevice.queue.submit([gpuCommandBuffer]);
    };



    // A random number between [min and max)
    // A random number between [min and max)
    // With 1 argument it will be [0 to min)
    // With 1 argument it will be [0 to min)
    // With no arguments it will be [0 to 1)
    // With no arguments it will be [0 to 1)
    const rand = (min?: number, max?: number): number =>
//  const rand = (min?: number, max?: number): number =>
    {
        if (!min)
//      if (!min)
        {
            min = 0;
//          min = 0;
            max = 1;
//          max = 1;
        }
        else
//      else
        if (!max)
//      if (!max)
        {
            max = min;
//          max = min;
            min = 0;
//          min = 0;
        }
        return min + Math.random() * (max - min);
//      return min + Math.random() * (max - min);
    };



    const createCircleVertices = ({ radius = 1, numSubdivisions = 24, innerRadius = 0, startAngle = 0, endAngle = Math.PI * 2, } = {}) =>
    {
        // 2 triangles per subdivision, 3 verts per tri, 2 values (xy) each.
        // 2 triangles per subdivision, 3 verts per tri, 2 values (xy) each.
        const numVertices: number = numSubdivisions * 3 * 2;
//      const numVertices: number = numSubdivisions * 3 * 2;
        const vertexData: Float32Array = new Float32Array(numSubdivisions * 2 * 3 * 2);
//      const vertexData: Float32Array = new Float32Array(numSubdivisions * 2 * 3 * 2);
 
        let offset: number = 0;
//      let offset: number = 0;
        const addVertex = (x: number, y: number): void =>
//      const addVertex = (x: number, y: number): void =>
        {
            vertexData[offset++] = x;
//          vertexData[offset++] = x;
            vertexData[offset++] = y;
//          vertexData[offset++] = y;
        };
 
        // 2 triangles per subdivision
        // 2 triangles per subdivision
        //
        //
        // 0--1 4
        // | / /|
        // |/ / |
        // 2 3--5
        // 0--1 4
        // | / /|
        // |/ / |
        // 2 3--5        
        for (let i: number = 0; i < numSubdivisions; ++i)
//      for (let i: number = 0; i < numSubdivisions; ++i)
        {
            const angle1: number = startAngle + (i + 0) * (endAngle - startAngle) / numSubdivisions;
//          const angle1: number = startAngle + (i + 0) * (endAngle - startAngle) / numSubdivisions;
            const angle2: number = startAngle + (i + 1) * (endAngle - startAngle) / numSubdivisions;
//          const angle2: number = startAngle + (i + 1) * (endAngle - startAngle) / numSubdivisions;
 
            const c1: number = Math.cos(angle1);
//          const c1: number = Math.cos(angle1);
            const s1: number = Math.sin(angle1);
//          const s1: number = Math.sin(angle1);
            const c2: number = Math.cos(angle2);
//          const c2: number = Math.cos(angle2);
            const s2: number = Math.sin(angle2);
//          const s2: number = Math.sin(angle2);
 
            // first triangle
            // first triangle
            addVertex(c1 *      radius, s1 *      radius);
//          addVertex(c1 *      radius, s1 *      radius);
            addVertex(c2 *      radius, s2 *      radius);
//          addVertex(c2 *      radius, s2 *      radius);
            addVertex(c1 * innerRadius, s1 * innerRadius);
//          addVertex(c1 * innerRadius, s1 * innerRadius);
 
            // second triangle
            // second triangle
            addVertex(c1 * innerRadius, s1 * innerRadius);
//          addVertex(c1 * innerRadius, s1 * innerRadius);
            addVertex(c2 *      radius, s2 *      radius);
//          addVertex(c2 *      radius, s2 *      radius);
            addVertex(c2 * innerRadius, s2 * innerRadius);
//          addVertex(c2 * innerRadius, s2 * innerRadius);
        }
 
        return { vertexData, numVertices, };
//      return { vertexData, numVertices, };
    };



</script>

<canvas bind:this={canvas} style:width="100%" style:height="100%" style:display="block"></canvas>
