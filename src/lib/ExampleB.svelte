<script lang="ts">
    import { onMount } from "svelte";
//  import { onMount } from "svelte";
    import shaderString from "../assets/2.wgsl?raw";
//  import shaderString from "../assets/2.wgsl?raw";



    let gpuAdapter: GPUAdapter;
//  let gpuAdapter: GPUAdapter;
    let gpuDevice: GPUDevice;
//  let gpuDevice: GPUDevice;
    let gpuShaderModule: GPUShaderModule;
//  let gpuShaderModule: GPUShaderModule;
    let gpuComputePipeline: GPUComputePipeline;
//  let gpuComputePipeline: GPUComputePipeline;
    let input: Float32Array;
//  let input: Float32Array;
    let result: Float32Array;
//  let result: Float32Array;
    let workBuffer: GPUBuffer;
//  let workBuffer: GPUBuffer;
    let resultBuffer: GPUBuffer;
//  let resultBuffer: GPUBuffer;
    let gpuBindGroup0: GPUBindGroup;
//  let gpuBindGroup0: GPUBindGroup;
    let gpuCommandEncoder: GPUCommandEncoder;
//  let gpuCommandEncoder: GPUCommandEncoder;
    let gpuComputePassEncoder: GPUComputePassEncoder;
//  let gpuComputePassEncoder: GPUComputePassEncoder;
    let gpuCommandBuffer: GPUCommandBuffer;
//  let gpuCommandBuffer: GPUCommandBuffer;



    onMount(async () =>
//  onMount(async () =>
    {
        gpuAdapter = (await navigator.gpu.requestAdapter())!;
//      gpuAdapter = (await navigator.gpu.requestAdapter())!;

        gpuDevice = await gpuAdapter.requestDevice();
//      gpuDevice = await gpuAdapter.requestDevice();
        
        gpuShaderModule = gpuDevice.createShaderModule({
//      gpuShaderModule = gpuDevice.createShaderModule({
            label: "doubling compute module",
//          label: "doubling compute module",
            code: shaderString,
//          code: shaderString,
        });
        
        gpuComputePipeline = gpuDevice.createComputePipeline({
//      gpuComputePipeline = gpuDevice.createComputePipeline({
            label: "doubling compute pipeline",
//          label: "doubling compute pipeline",
            layout: "auto",
//          layout: "auto",
            compute:
//          compute:
            {
                module: gpuShaderModule,
//              module: gpuShaderModule,
            }
            ,
        });
        
        input = new Float32Array([1, 3, 5]);
//      input = new Float32Array([1, 3, 5]);
        workBuffer = gpuDevice.createBuffer({
//      workBuffer = gpuDevice.createBuffer({
            label: "work buffer",
//          label: "work buffer",
            size: input.byteLength,
//          size: input.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
//          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        gpuDevice.queue.writeBuffer(workBuffer, 0, input as GPUAllowSharedBufferSource,);
//      gpuDevice.queue.writeBuffer(workBuffer, 0, input as GPUAllowSharedBufferSource,);
        resultBuffer = gpuDevice.createBuffer({
//      resultBuffer = gpuDevice.createBuffer({
            label: "result buffer",
//          label: "result buffer",
            size: input.byteLength,
//          size: input.byteLength,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
//          usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });

        gpuBindGroup0 = gpuDevice.createBindGroup({
//      gpuBindGroup0 = gpuDevice.createBindGroup({
            label: "bindGroup for work buffer",
//          label: "bindGroup for work buffer",
            layout: gpuComputePipeline.getBindGroupLayout(0),
//          layout: gpuComputePipeline.getBindGroupLayout(0),
            entries:
//          entries:
            [
                {
                    binding: 0,
//                  binding: 0,
                    resource: { buffer: workBuffer },
//                  resource: { buffer: workBuffer },
                }
                ,
            ]
            ,
        });

        gpuCommandEncoder = gpuDevice.createCommandEncoder({
//      gpuCommandEncoder = gpuDevice.createCommandEncoder({
            label: "doubling encoder",
//          label: "doubling encoder",
        });
        gpuComputePassEncoder = gpuCommandEncoder.beginComputePass({
//      gpuComputePassEncoder = gpuCommandEncoder.beginComputePass({
            label: "doubling compute pass",
//          label: "doubling compute pass",
        });
        gpuComputePassEncoder.setPipeline(gpuComputePipeline);
//      gpuComputePassEncoder.setPipeline(gpuComputePipeline);
        gpuComputePassEncoder.setBindGroup(0, gpuBindGroup0);
//      gpuComputePassEncoder.setBindGroup(0, gpuBindGroup0);
        gpuComputePassEncoder.dispatchWorkgroups(input.length);
//      gpuComputePassEncoder.dispatchWorkgroups(input.length);
        gpuComputePassEncoder.end();
//      gpuComputePassEncoder.end();
        gpuCommandEncoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size,);
//      gpuCommandEncoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size,);
        gpuCommandBuffer = gpuCommandEncoder.finish();
//      gpuCommandBuffer = gpuCommandEncoder.finish();
        gpuDevice.queue.submit([gpuCommandBuffer]);
//      gpuDevice.queue.submit([gpuCommandBuffer]);

        await resultBuffer.mapAsync(GPUMapMode.READ);
//      await resultBuffer.mapAsync(GPUMapMode.READ);
        result = new Float32Array(resultBuffer.getMappedRange());
//      result = new Float32Array(resultBuffer.getMappedRange());
        console.log("input", input);
//      console.log("input", input);
        console.log("result", result);
//      console.log("result", result);
        resultBuffer.unmap();
//      resultBuffer.unmap();
    });
</script>
