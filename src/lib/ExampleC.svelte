<script lang="ts">
    import { onMount } from "svelte";
//  import { onMount } from "svelte";
    import shaderString from "../assets/3.wgsl?raw";
//  import shaderString from "../assets/3.wgsl?raw";



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
    let staticUniformBufferSize: number;
//  let staticUniformBufferSize: number;
    let dynamicUniformBufferSize: number;
//  let dynamicUniformBufferSize: number;
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
//      staticUniformBuffer: GPUBuffer,
//      staticUniformBuffer: GPUBuffer,
        dynamicUniformBuffer: GPUBuffer,
//      dynamicUniformBuffer: GPUBuffer,
        dynamicUniformValues: Float32Array,
//      dynamicUniformValues: Float32Array,
        bindGroup:GPUBindGroup,
//      bindGroup:GPUBindGroup,
    };
    let objectInfos: ObjectInfo[];
//  let objectInfos: ObjectInfo[];



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

        staticUniformBufferSize =
//      staticUniformBufferSize =
            4 * 4 + // color  is 4 32bit floats (4bytes each)
//          4 * 4 + // color  is 4 32bit floats (4bytes each)
            2 * 4 + // offset is 2 32bit floats (4bytes each)
//          2 * 4 + // offset is 2 32bit floats (4bytes each)
            2 * 4;  // padding
//          2 * 4;  // padding
        dynamicUniformBufferSize =
//      dynamicUniformBufferSize =
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
        for (let i = 0; i < kNumObjects; ++i)
//      for (let i = 0; i < kNumObjects; ++i)
        {
            const staticUniformBuffer: GPUBuffer = gpuDevice.createBuffer({
//          const staticUniformBuffer: GPUBuffer = gpuDevice.createBuffer({
                label: `static uniforms for obj: ${i}`,
//              label: `static uniforms for obj: ${i}`,
                size: staticUniformBufferSize,
//              size: staticUniformBufferSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
//              usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });

            {
                const staticUniformValues: Float32Array = new Float32Array(staticUniformBufferSize / 4);
//              const staticUniformValues: Float32Array = new Float32Array(staticUniformBufferSize / 4);
                staticUniformValues.set([rand(), rand(), rand(), 1], kColorOffset);
//              staticUniformValues.set([rand(), rand(), rand(), 1], kColorOffset);
                staticUniformValues.set([rand(-0.9, 0.9), rand(-0.9, 0.9)], kOffsetOffset);
//              staticUniformValues.set([rand(-0.9, 0.9), rand(-0.9, 0.9)], kOffsetOffset);
                gpuDevice.queue.writeBuffer(staticUniformBuffer, 0, staticUniformValues as GPUAllowSharedBufferSource);
//              gpuDevice.queue.writeBuffer(staticUniformBuffer, 0, staticUniformValues as GPUAllowSharedBufferSource);
            }

            const dynamicUniformValues: Float32Array = new Float32Array(dynamicUniformBufferSize / 4);
//          const dynamicUniformValues: Float32Array = new Float32Array(dynamicUniformBufferSize / 4);
            const dynamicUniformBuffer: GPUBuffer = gpuDevice.createBuffer({
//          const dynamicUniformBuffer: GPUBuffer = gpuDevice.createBuffer({
                label: `changing uniforms for obj: ${i}`,
//              label: `changing uniforms for obj: ${i}`,
                size: dynamicUniformBufferSize,
//              size: dynamicUniformBufferSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
//              usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });

            const bindGroup: GPUBindGroup = gpuDevice.createBindGroup({
//          const bindGroup: GPUBindGroup = gpuDevice.createBindGroup({
                label: `bind group for obj: ${i}`,
//              label: `bind group for obj: ${i}`,
                layout: gpuRenderPipeline.getBindGroupLayout(0),
//              layout: gpuRenderPipeline.getBindGroupLayout(0),
                entries:
//              entries:
                [
                    { binding: 0, resource: { buffer:  staticUniformBuffer, }, },
//                  { binding: 0, resource: { buffer:  staticUniformBuffer, }, },
                    { binding: 1, resource: { buffer: dynamicUniformBuffer, }, },
//                  { binding: 1, resource: { buffer: dynamicUniformBuffer, }, },
                ]
                ,
            });

            objectInfos.push({
//          objectInfos.push({
                scale: rand(0.2, 0.5),
//              scale: rand(0.2, 0.5),
                dynamicUniformBuffer: dynamicUniformBuffer,
//              dynamicUniformBuffer: dynamicUniformBuffer,
                dynamicUniformValues: dynamicUniformValues,
//              dynamicUniformValues: dynamicUniformValues,
                bindGroup: bindGroup,
//              bindGroup: bindGroup,
            });
        }

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
        for (const { scale, dynamicUniformBuffer, dynamicUniformValues, bindGroup, } of objectInfos)
//      for (const { scale, dynamicUniformBuffer, dynamicUniformValues, bindGroup, } of objectInfos)
        {
            dynamicUniformValues.set([scale / aspect, scale], kScaleOffset);
//          dynamicUniformValues.set([scale / aspect, scale], kScaleOffset);
            gpuDevice.queue.writeBuffer(dynamicUniformBuffer, 0, dynamicUniformValues as GPUAllowSharedBufferSource);
//          gpuDevice.queue.writeBuffer(dynamicUniformBuffer, 0, dynamicUniformValues as GPUAllowSharedBufferSource);
            gpuRenderPassEncoder.setBindGroup(0, bindGroup);
//          gpuRenderPassEncoder.setBindGroup(0, bindGroup);
            gpuRenderPassEncoder.draw(3); // Call our vertex shader 3 times.
//          gpuRenderPassEncoder.draw(3); // Call our vertex shader 3 times.
        }
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


</script>

<canvas bind:this={canvas} style:width="100%" style:height="100%" style:display="block"></canvas>
