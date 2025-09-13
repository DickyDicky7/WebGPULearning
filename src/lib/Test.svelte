<script lang="ts">
    import { onMount } from "svelte";
//  import { onMount } from "svelte";
    import shaderStringRender from "../assets/render.wgsl?raw";
//  import shaderStringRender from "../assets/render.wgsl?raw";
    import shaderStringCompute from "../assets/compute.wgsl?raw";
//  import shaderStringCompute from "../assets/compute.wgsl?raw";
    import * as m from "mathjs";
//  import * as m from "mathjs";



    let _adapter: GPUAdapter;
//  let _adapter: GPUAdapter;
    let _device: GPUDevice;
//  let _device: GPUDevice;
    let _canvas: HTMLCanvasElement;
//  let _canvas: HTMLCanvasElement;
    let _canvasContext: GPUCanvasContext;
//  let _canvasContext: GPUCanvasContext;
    let _presentationFormat: GPUTextureFormat;
//  let _presentationFormat: GPUTextureFormat;
    let _renderShaderModule: GPUShaderModule;
//  let _renderShaderModule: GPUShaderModule;
    let _computeShaderModule: GPUShaderModule;
//  let _computeShaderModule: GPUShaderModule;
    let _renderPipeline: GPURenderPipeline;
//  let _renderPipeline: GPURenderPipeline;
    let _computePipeline: GPUComputePipeline;
//  let _computePipeline: GPUComputePipeline;
    let _commandEncoderDescriptor: GPUCommandEncoderDescriptor;
//  let _commandEncoderDescriptor: GPUCommandEncoderDescriptor;
    let _renderPassDescriptor: GPURenderPassDescriptor;
//  let _renderPassDescriptor: GPURenderPassDescriptor;
    let _computePassDescriptor: GPUComputePassDescriptor;
//  let _computePassDescriptor: GPUComputePassDescriptor;
    let _commandEncoder: GPUCommandEncoder;
//  let _commandEncoder: GPUCommandEncoder;
    let _renderPass: GPURenderPassEncoder;
//  let _renderPass: GPURenderPassEncoder;
    let _computePass: GPUComputePassEncoder;
//  let _computePass: GPUComputePassEncoder;
    let _commandBuffer: GPUCommandBuffer;
//  let _commandBuffer: GPUCommandBuffer;
    let _resizeObserver: ResizeObserver;
//  let _resizeObserver: ResizeObserver;
    let _dataStorageValues: Float32Array;
//  let _dataStorageValues: Float32Array;
    let _dataStorageBuffer: GPUBuffer;
//  let _dataStorageBuffer: GPUBuffer;
    let _renderBindGroup0: GPUBindGroup;
//  let _renderBindGroup0: GPUBindGroup;
    let _computeBindGroup0: GPUBindGroup;
//  let _computeBindGroup0: GPUBindGroup;
    let _texture: GPUTexture;
//  let _texture: GPUTexture;
    let _sampler: GPUSampler;
//  let _sampler: GPUSampler;
    let _focalLength: number;
//  let _focalLength: number;
    let _viewportW: number;
//  let _viewportW: number;
    let _viewportH: number;
//  let _viewportH: number;
    let _cameraCenter: number[];
//  let _cameraCenter: number[];
    let _viewportU: number[];
//  let _viewportU: number[];
    let _viewportV: number[];
//  let _viewportV: number[];
    let _pixelDeltaU: number[];
//  let _pixelDeltaU: number[];
    let _pixelDeltaV: number[];
//  let _pixelDeltaV: number[];
    let _viewportTL: number[];
//  let _viewportTL: number[];
    let _pixel00Loc: number[];
//  let _pixel00Loc: number[];
    let _isRunning: boolean;
//  let _isRunning: boolean;
    let _frameHandle: number;
//  let _frameHandle: number;



    const initOnce = async (): Promise<void> => {
//  const initOnce = async (): Promise<void> => {
        _adapter = (await navigator.gpu.requestAdapter())!;
//      _adapter = (await navigator.gpu.requestAdapter())!;
        _device = await _adapter.requestDevice();
//      _device = await _adapter.requestDevice();
        _canvasContext = _canvas.getContext("webgpu")!;
//      _canvasContext = _canvas.getContext("webgpu")!;
        _presentationFormat = navigator.gpu.getPreferredCanvasFormat();
//      _presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        _canvasContext.configure({ device: _device, format: _presentationFormat, });
//      _canvasContext.configure({ device: _device, format: _presentationFormat, });
        _renderShaderModule = _device.createShaderModule({
//      _renderShaderModule = _device.createShaderModule({
            label: "GPU_SHADER_MODULE_RENDER",
//          label: "GPU_SHADER_MODULE_RENDER",
            code: shaderStringRender,
//          code: shaderStringRender,
        });
        _computeShaderModule = _device.createShaderModule({
//      _computeShaderModule = _device.createShaderModule({
            label: "GPU_SHADER_MODULE_COMPUTE",
//          label: "GPU_SHADER_MODULE_COMPUTE",
            code: shaderStringCompute,
//          code: shaderStringCompute,
        });
        _renderPipeline = await _device.createRenderPipelineAsync({
//      _renderPipeline = await _device.createRenderPipelineAsync({
            label: "GPU_RENDER_PIPELINE",
//          label: "GPU_RENDER_PIPELINE",
            layout: "auto",
//          layout: "auto",
            vertex: {
//          vertex: {
                module: _renderShaderModule,
//              module: _renderShaderModule,
            },
            fragment: {
//          fragment: {
                module: _renderShaderModule,
//              module: _renderShaderModule,
                targets: [{ format: _presentationFormat }],
//              targets: [{ format: _presentationFormat }],
            },
        });
        _computePipeline = await _device.createComputePipelineAsync({
//      _computePipeline = await _device.createComputePipelineAsync({
            label: "GPU_COMPUTE_PIPELINE",
//          label: "GPU_COMPUTE_PIPELINE",
            layout: "auto",
//          layout: "auto",
            compute: {
//          compute: {
                module: _computeShaderModule,
//              module: _computeShaderModule,
            },
        });
        _commandEncoderDescriptor = { label: "GPU_COMMAND_ENCODER", };
//      _commandEncoderDescriptor = { label: "GPU_COMMAND_ENCODER", };
        _renderPassDescriptor = {
//      _renderPassDescriptor = {
            label: "GPU_RENDER_PASS_DESCRIPTOR",
//          label: "GPU_RENDER_PASS_DESCRIPTOR",
            colorAttachments: [
//          colorAttachments: [
                {
                    view: undefined as any,
//                  view: undefined as any,
                    clearValue: [0.3, 0.3, 0.3, 1],
//                  clearValue: [0.3, 0.3, 0.3, 1],
                    loadOp: "clear",
//                  loadOp: "clear",
                    storeOp: "store",
//                  storeOp: "store",
                },
            ] as GPURenderPassColorAttachment[],
//          ] as GPURenderPassColorAttachment[],
        };
        _computePassDescriptor = { label: "GPU_COMPUTE_PASS_DESCRIPTOR", };
//      _computePassDescriptor = { label: "GPU_COMPUTE_PASS_DESCRIPTOR", };
        _dataStorageValues = new Float32Array(5 * 4); // 5 * vec4<f32>
//      _dataStorageValues = new Float32Array(5 * 4); // 5 * vec4<f32>
        _dataStorageBuffer = _device.createBuffer({
//      _dataStorageBuffer = _device.createBuffer({
            label: "DATA_STORAGE_BUFFER",
//          label: "DATA_STORAGE_BUFFER",
            size: _dataStorageValues.byteLength,
//          size: _dataStorageValues.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
//          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        _sampler = _device.createSampler({
//      _sampler = _device.createSampler({
            magFilter: "linear",
//          magFilter: "linear",
            minFilter: "linear",
//          minFilter: "linear",
        });
        _isRunning = false;
//      _isRunning = false;
        _frameHandle = null!;
//      _frameHandle = null!;
    };



    const renderLoop = (time: number): void => {
//  const renderLoop = (time: number): void => {
        if (!_isRunning) {
//      if (!_isRunning) {
            return;
//          return;
        }
        prepare();
//      prepare();
        render();
//      render();
//      console.info("loop");
//      console.info("loop");
        _frameHandle = requestAnimationFrame(renderLoop);
//      _frameHandle = requestAnimationFrame(renderLoop);
    };
    const startLoop = (): void => {
//  const startLoop = (): void => {
        if (!_isRunning) {
//      if (!_isRunning) {
            _isRunning = true;
//          _isRunning = true;
//          console.info("start loop");
//          console.info("start loop");
            _frameHandle = requestAnimationFrame(renderLoop);
//          _frameHandle = requestAnimationFrame(renderLoop);
        }
    };
    const stopLoop = (): void => {
//  const stopLoop = (): void => {
        _isRunning = false;
//      _isRunning = false;
        if (_frameHandle) {
//      if (_frameHandle) {
//          console.info("stop loop");
//          console.info("stop loop");
            cancelAnimationFrame(_frameHandle);
//          cancelAnimationFrame(_frameHandle);
            _frameHandle = null!;
//          _frameHandle = null!;
        }
    };



    onMount(async () => {
//  onMount(async () => {
        // console.log(mathjs.chain([2, 4, 6]).divide(2).done());
        // console.log(mathjs.chain([2, 4, 6]).divide(2).done());
        // return;
        // return;

        await initOnce();
//      await initOnce();

        _resizeObserver = new ResizeObserver(
//      _resizeObserver = new ResizeObserver(
            (entries: ResizeObserverEntry[]) => {
//          (entries: ResizeObserverEntry[]) => {
                stopLoop();
//              stopLoop();
                for (const entry of entries) {
//              for (const entry of entries) {
                    const entryAsCanvas: HTMLCanvasElement = entry.target as HTMLCanvasElement;
//                  const entryAsCanvas: HTMLCanvasElement = entry.target as HTMLCanvasElement;
                    if (!entryAsCanvas) {
//                  if (!entryAsCanvas) {
                        return;
//                      return;
                    }
                    const width : number = entry.contentBoxSize[0].inlineSize;
//                  const width : number = entry.contentBoxSize[0].inlineSize;
                    const height: number = entry.contentBoxSize[0]. blockSize;
//                  const height: number = entry.contentBoxSize[0]. blockSize;
                    entryAsCanvas.width  = Math.max(
//                  entryAsCanvas.width  = Math.max(
                        1,
//                      1,
                        Math.min(width, _device.limits.maxTextureDimension2D),
//                      Math.min(width, _device.limits.maxTextureDimension2D),
                    );
                    entryAsCanvas.height = Math.max(
//                  entryAsCanvas.height = Math.max(
                        1,
//                      1,
                        Math.min(height, _device.limits.maxTextureDimension2D),
//                      Math.min(height, _device.limits.maxTextureDimension2D),
                    );
//                  console.log(entryAsCanvas.width, entryAsCanvas.height, _canvas.width, _canvas.height,);
//                  console.log(entryAsCanvas.width, entryAsCanvas.height, _canvas.width, _canvas.height,);
                }
                // prepare();
                // prepare();
                // render();
                // render();
                startLoop();
//              startLoop();
            },
//          },
        );

        _resizeObserver.observe(_canvas);
//      _resizeObserver.observe(_canvas);
    });


    
    const render = (): void => {
//  const render = (): void => {
        (_renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = _canvasContext.getCurrentTexture().createView();
//      (_renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = _canvasContext.getCurrentTexture().createView();
        _commandEncoder = _device.createCommandEncoder(_commandEncoderDescriptor,);
//      _commandEncoder = _device.createCommandEncoder(_commandEncoderDescriptor,);

        
        _computePass = _commandEncoder.beginComputePass(_computePassDescriptor);
//      _computePass = _commandEncoder.beginComputePass(_computePassDescriptor);
        _computePass.setPipeline(_computePipeline);
//      _computePass.setPipeline(_computePipeline);
        _computePass.setBindGroup(0, _computeBindGroup0);
//      _computePass.setBindGroup(0, _computeBindGroup0);
        _computePass.dispatchWorkgroups(Math.ceil(_canvas.width / 16), Math.ceil(_canvas.height / 16),);
//      _computePass.dispatchWorkgroups(Math.ceil(_canvas.width / 16), Math.ceil(_canvas.height / 16),);
        _computePass.end();
//      _computePass.end();


        _renderPass = _commandEncoder.beginRenderPass(_renderPassDescriptor);
//      _renderPass = _commandEncoder.beginRenderPass(_renderPassDescriptor);
        _renderPass.setPipeline(_renderPipeline);
//      _renderPass.setPipeline(_renderPipeline);
        _renderPass.setBindGroup(0, _renderBindGroup0);
//      _renderPass.setBindGroup(0, _renderBindGroup0);
        _renderPass.draw(6);
//      _renderPass.draw(6);
        _renderPass.end();
//      _renderPass.end();


        _commandBuffer = _commandEncoder.finish();
//      _commandBuffer = _commandEncoder.finish();
        _device.queue.submit([_commandBuffer]);
//      _device.queue.submit([_commandBuffer]);
    };



    const prepare = (): void => {
//  const prepare = (): void => {
        _focalLength = 1.0;
//      _focalLength = 1.0;
        _viewportH = 2.0;
//      _viewportH = 2.0;
        _viewportW = (_viewportH * _canvas.width) / _canvas.height;
//      _viewportW = (_viewportH * _canvas.width) / _canvas.height;
        _cameraCenter = [0.0, 0.0, 0.0];
//      _cameraCenter = [0.0, 0.0, 0.0];


        _viewportU = [ _viewportW,         0.0, 0.0];
//      _viewportU = [ _viewportW,         0.0, 0.0];
        _viewportV = [        0.0, -_viewportH, 0.0];
//      _viewportV = [        0.0, -_viewportH, 0.0];


        _pixelDeltaU = m.chain(_viewportU).divide(_canvas.width ).done() as number[];
//      _pixelDeltaU = m.chain(_viewportU).divide(_canvas.width ).done() as number[];
        _pixelDeltaV = m.chain(_viewportV).divide(_canvas.height).done() as number[];
//      _pixelDeltaV = m.chain(_viewportV).divide(_canvas.height).done() as number[];


        _viewportTL = m.chain(_cameraCenter).subtract([0.0, 0.0, _focalLength]).subtract(m.chain(_viewportU).divide(2).done()).subtract(m.chain(_viewportV).divide(2).done()).done() as number[];
//      _viewportTL = m.chain(_cameraCenter).subtract([0.0, 0.0, _focalLength]).subtract(m.chain(_viewportU).divide(2).done()).subtract(m.chain(_viewportV).divide(2).done()).done() as number[];
        _pixel00Loc = m.chain(_viewportTL).add(m.chain(0.5).multiply(m.chain(_pixelDeltaU).add(_pixelDeltaV).done()).done()).done() as number[];
//      _pixel00Loc = m.chain(_viewportTL).add(m.chain(0.5).multiply(m.chain(_pixelDeltaU).add(_pixelDeltaV).done()).done()).done() as number[];


        //------------------------------|------------------------------|------------------------------//
        //------------------------------|------------------------------|------------------------------//

        
        _dataStorageValues.set(
//      _dataStorageValues.set(
            [
                ..._cameraCenter, 0.0,
//              ..._cameraCenter, 0.0,
                ..._pixelDeltaU , 0.0,
//              ..._pixelDeltaU , 0.0,
                ..._pixelDeltaV , 0.0,
//              ..._pixelDeltaV , 0.0,
                ..._pixel00Loc  , 0.0,
//              ..._pixel00Loc  , 0.0,
                _canvas.width, _canvas.height, 0.0, 0.0,
//              _canvas.width, _canvas.height, 0.0, 0.0,
            ],
            0,
        );
        _device.queue.writeBuffer(_dataStorageBuffer, 0, _dataStorageValues as GPUAllowSharedBufferSource,);
//      _device.queue.writeBuffer(_dataStorageBuffer, 0, _dataStorageValues as GPUAllowSharedBufferSource,);
        _texture = _device.createTexture({
//      _texture = _device.createTexture({
            label: "OUTPUT_TEXTURE",
//          label: "OUTPUT_TEXTURE",
            size: [ _canvas.width, _canvas.height, ],
//          size: [ _canvas.width, _canvas.height, ],
            format: "rgba8unorm",
//          format: "rgba8unorm",
            usage: GPUTextureUsage.STORAGE_BINDING /* compute shader writes */ | GPUTextureUsage.TEXTURE_BINDING, /* fragment shader samples */
//          usage: GPUTextureUsage.STORAGE_BINDING /* compute shader writes */ | GPUTextureUsage.TEXTURE_BINDING, /* fragment shader samples */
        });
        const textureView: GPUTextureView = _texture.createView();
//      const textureView: GPUTextureView = _texture.createView();
        _renderBindGroup0 = _device.createBindGroup({
//      _renderBindGroup0 = _device.createBindGroup({
            label: "GPU_BIND_GROUP_0_RENDER",
//          label: "GPU_BIND_GROUP_0_RENDER",
            layout: _renderPipeline.getBindGroupLayout(0),
//          layout: _renderPipeline.getBindGroupLayout(0),
            entries: [
//          entries: [
                {
                    binding: 0,
//                  binding: 0,
                    resource: _sampler,
//                  resource: _sampler,
                },
                {
                    binding: 1,
//                  binding: 1,
                    resource: textureView,
//                  resource: textureView,
                },
            ],
        });
        _computeBindGroup0 = _device.createBindGroup({
//      _computeBindGroup0 = _device.createBindGroup({
            label: "GPU_BIND_GROUP_0_COMPUTE",
//          label: "GPU_BIND_GROUP_0_COMPUTE",
            layout: _computePipeline.getBindGroupLayout(0),
//          layout: _computePipeline.getBindGroupLayout(0),
            entries: [
//          entries: [
                {
                    binding: 0,
//                  binding: 0,
                    resource: _dataStorageBuffer,
//                  resource: _dataStorageBuffer,
                },
                {
                    binding: 1,
//                  binding: 1,
                    resource: textureView,
//                  resource: textureView,
                },
            ],
        });
    };


    
</script>

<canvas bind:this={_canvas} style:width="100%" style:height="100%" style:display="block"></canvas>
