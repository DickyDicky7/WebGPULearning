<script lang="ts">
    import { onMount } from "svelte";
//  import { onMount } from "svelte";
    import shaderString from "../assets/1.wgsl?raw";
//  import shaderString from "../assets/1.wgsl?raw";



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
        gpuRenderPassEncoder.draw(6); // Call our vertex shader 6 times.
//      gpuRenderPassEncoder.draw(6); // Call our vertex shader 6 times.
        gpuRenderPassEncoder.end();
//      gpuRenderPassEncoder.end();
        gpuCommandBuffer = gpuCommandEncoder.finish();
//      gpuCommandBuffer = gpuCommandEncoder.finish();
        gpuDevice.queue.submit([gpuCommandBuffer]);
//      gpuDevice.queue.submit([gpuCommandBuffer]);
    };
</script>

<canvas bind:this={canvas} style:width="100%" style:height="100%" style:display="block"></canvas>
