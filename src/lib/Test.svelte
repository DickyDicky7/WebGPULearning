<script lang="ts">
    import { onMount } from "svelte";
//  import { onMount } from "svelte";
    import { onDestroy } from "svelte";
//  import { onDestroy } from "svelte";
    import shaderStringCompute from "../assets/compute.wgsl?raw";
//  import shaderStringCompute from "../assets/compute.wgsl?raw";
    import shaderStringGather from "../assets/gather.wgsl?raw";
//  import shaderStringGather from "../assets/gather.wgsl?raw";
    import shaderStringRender from "../assets/render.wgsl?raw";
//  import shaderStringRender from "../assets/render.wgsl?raw";
    import * as m from "mathjs";
//  import * as m from "mathjs";



    type Vec2 = [number, number];
//  type Vec2 = [number, number];
    type Vec3 = [number, number, number];
//  type Vec3 = [number, number, number];
    type Vec4 = [number, number, number, number];
//  type Vec4 = [number, number, number, number];



    const BackgroundType = {
//  const BackgroundType = {
        SKY_BOX_BLUE: 0,
//      SKY_BOX_BLUE: 0,
        SKY_BOX_DARK: 1,
//      SKY_BOX_DARK: 1,
        SKY_BOX_HDRI: 2,
//      SKY_BOX_HDRI: 2,
    } as const;
//  } as const;
    type BackgroundType = typeof BackgroundType[keyof typeof BackgroundType];
//  type BackgroundType = typeof BackgroundType[keyof typeof BackgroundType];
    const RefractiveIndex = {
//  const RefractiveIndex = {
        DEFAULT: 0.000000,
//      DEFAULT: 0.000000,
        NOTHING: 1.000000,
//      NOTHING: 1.000000,
        AIR    : 1.000293,
//      AIR    : 1.000293,
        WATER  : 1.333000,
//      WATER  : 1.333000,
        SKIN   : 1.400000,
//      SKIN   : 1.400000,
        GLASS  : 1.500000,
//      GLASS  : 1.500000,
        MARBLE : 1.550000,
//      MARBLE : 1.550000,
        DIAMOND: 2.400000,
//      DIAMOND: 2.400000,
    } as const;
//  } as const;
    type RefractiveIndex = typeof RefractiveIndex[keyof typeof RefractiveIndex];
//  type RefractiveIndex = typeof RefractiveIndex[keyof typeof RefractiveIndex];
    type Sphere = {
//  type Sphere = {
        center: Vec3,
//      center: Vec3,
        radius: number,
//      radius: number,
        materialIndex: number,
//      materialIndex: number,
    };
//  };
    const MaterialType = {
//  const MaterialType = {
        DIFFUSE   : 0,
//      DIFFUSE   : 0,
        METAL     : 1,
//      METAL     : 1,
        GLOSS     : 2,
//      GLOSS     : 2,
        DIELECTRIC: 3,
//      DIELECTRIC: 3,
        LIGHT     : 4,
//      LIGHT     : 4,
    } as const;
//  } as const;
    type MaterialType = typeof MaterialType[keyof typeof MaterialType];
//  type MaterialType = typeof MaterialType[keyof typeof MaterialType];
    type Material = {
//  type Material = {
        layer1Roughness: number,
//      layer1Roughness: number,
        layer0IOR: RefractiveIndex,
//      layer0IOR: RefractiveIndex,
        layer1IOR: RefractiveIndex,
//      layer1IOR: RefractiveIndex,
        textureIndex: number,
//      textureIndex: number,
        materialType: MaterialType,
//      materialType: MaterialType,
    };
//  };
    const TextureType = {
//  const TextureType = {
        COLOR: 0,
//      COLOR: 0,
        IMAGE: 1,
//      IMAGE: 1,
    } as const;
//  } as const;
    type TextureType = typeof TextureType[keyof typeof TextureType];
//  type TextureType = typeof TextureType[keyof typeof TextureType];
    type Texture = {
//  type Texture = {
        albedo: Vec3,
//      albedo: Vec3,
        imageIndex: number,
//      imageIndex: number,
        textureType: TextureType,
//      textureType: TextureType,
    };
//  };



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
    let _computeShaderModule: GPUShaderModule;
//  let _computeShaderModule: GPUShaderModule;
    let _gatherShaderModule: GPUShaderModule;
//  let _gatherShaderModule: GPUShaderModule;
    let _renderShaderModule: GPUShaderModule;
//  let _renderShaderModule: GPUShaderModule;
    let _computeBindGroupLayout0: GPUBindGroupLayout | null;
//  let _computeBindGroupLayout0: GPUBindGroupLayout | null;
    let _gatherBindGroupLayout0: GPUBindGroupLayout | null;
//  let _gatherBindGroupLayout0: GPUBindGroupLayout | null;
    let _renderBindGroupLayout0: GPUBindGroupLayout | null;
//  let _renderBindGroupLayout0: GPUBindGroupLayout | null;
    let _computePipelineLayout: GPUPipelineLayout | "auto";
//  let _computePipelineLayout: GPUPipelineLayout | "auto";
    let _gatherPipelineLayout: GPUPipelineLayout | "auto";
//  let _gatherPipelineLayout: GPUPipelineLayout | "auto";
    let _renderPipelineLayout: GPUPipelineLayout | "auto";
//  let _renderPipelineLayout: GPUPipelineLayout | "auto";
    let _computePipeline: GPUComputePipeline;
//  let _computePipeline: GPUComputePipeline;
    let _gatherPipeline: GPUComputePipeline;
//  let _gatherPipeline: GPUComputePipeline;
    let _renderPipeline: GPURenderPipeline;
//  let _renderPipeline: GPURenderPipeline;
    let _commandEncoderDescriptor: GPUCommandEncoderDescriptor;
//  let _commandEncoderDescriptor: GPUCommandEncoderDescriptor;
    let _computePassDescriptor: GPUComputePassDescriptor;
//  let _computePassDescriptor: GPUComputePassDescriptor;
    let _gatherPassDescriptor: GPUComputePassDescriptor;
//  let _gatherPassDescriptor: GPUComputePassDescriptor;
    let _renderPassDescriptor: GPURenderPassDescriptor;
//  let _renderPassDescriptor: GPURenderPassDescriptor;
    let _commandEncoder: GPUCommandEncoder;
//  let _commandEncoder: GPUCommandEncoder;
    let _computePass: GPUComputePassEncoder;
//  let _computePass: GPUComputePassEncoder;
    let _gatherPass: GPUComputePassEncoder;
//  let _gatherPass: GPUComputePassEncoder;
    let _renderPass: GPURenderPassEncoder;
//  let _renderPass: GPURenderPassEncoder;
    let _commandBuffer: GPUCommandBuffer;
//  let _commandBuffer: GPUCommandBuffer;
    let _resizeObserver: ResizeObserver;
//  let _resizeObserver: ResizeObserver;
    let _dataStorageValues: Float32Array;
//  let _dataStorageValues: Float32Array;
    let _dataStorageBuffer: GPUBuffer;
//  let _dataStorageBuffer: GPUBuffer;
    let _spheresStorageValuesDataView: DataView;
//  let _spheresStorageValuesDataView: DataView;
    let _spheresStorageValues: ArrayBuffer;
//  let _spheresStorageValues: ArrayBuffer;
    let _spheresStorageBuffer: GPUBuffer;
//  let _spheresStorageBuffer: GPUBuffer;
    let _spheres: Sphere[] = $state([]);
//  let _spheres: Sphere[] = $state([]);
    let _materialsStorageValuesDataView: DataView;
//  let _materialsStorageValuesDataView: DataView;
    let _materialsStorageValues: ArrayBuffer;
//  let _materialsStorageValues: ArrayBuffer;
    let _materialsStorageBuffer: GPUBuffer;
//  let _materialsStorageBuffer: GPUBuffer;
    let _materials: Material[] = $state([]);
//  let _materials: Material[] = $state([]);
    let _texturesStorageValuesDataView: DataView;
//  let _texturesStorageValuesDataView: DataView;
    let _texturesStorageValues: ArrayBuffer;
//  let _texturesStorageValues: ArrayBuffer;
    let _texturesStorageBuffer: GPUBuffer;
//  let _texturesStorageBuffer: GPUBuffer;
    let _textures: Texture[] = $state([]);
//  let _textures: Texture[] = $state([]);
    let _atlasSampler: GPUSampler;
//  let _atlasSampler: GPUSampler;
    let _atlasTexture: GPUTexture;
//  let _atlasTexture: GPUTexture;
    let _hdriSampler: GPUSampler;
//  let _hdriSampler: GPUSampler;
    let _hdriTexture: GPUTexture;
//  let _hdriTexture: GPUTexture;
    let _computeBindGroup0: GPUBindGroup;
//  let _computeBindGroup0: GPUBindGroup;
    let _gatherBindGroup0: GPUBindGroup;
//  let _gatherBindGroup0: GPUBindGroup;
    let _renderBindGroup0: GPUBindGroup;
//  let _renderBindGroup0: GPUBindGroup;
    let _outputStorage: GPUBuffer;
//  let _outputStorage: GPUBuffer;
    let _outputTexture: GPUTexture;
//  let _outputTexture: GPUTexture;
    let _outputSampler: GPUSampler;
//  let _outputSampler: GPUSampler;
    let _samplesPerPixel: number = $state(100.0);
//  let _samplesPerPixel: number = $state(100.0);
    let _pixelSamplesScale: number = $derived(1.0 / _samplesPerPixel);
//  let _pixelSamplesScale: number = $derived(1.0 / _samplesPerPixel);
    let _stratifiedSamplesPerPixel: number = $derived(Math.sqrt(_samplesPerPixel));
//  let _stratifiedSamplesPerPixel: number = $derived(Math.sqrt(_samplesPerPixel));
    let _inverseStratifiedSamplesPerPixel: number = $derived(1.0 / _stratifiedSamplesPerPixel);
//  let _inverseStratifiedSamplesPerPixel: number = $derived(1.0 / _stratifiedSamplesPerPixel);
    let _stratifiedSampleX: number;
//  let _stratifiedSampleX: number;
    let _stratifiedSampleY: number;
//  let _stratifiedSampleY: number;
    let _lookFrom: Vec3 = $state([-28.284, 0.0, -28.284]);
//  let _lookFrom: Vec3 = $state([-28.284, 0.0, -28.284]);
    let _lookAt: Vec3 = $state([0.0, 0.0, 0.0]);
//  let _lookAt: Vec3 = $state([0.0, 0.0, 0.0]);
    let _viewUp: Vec3 = $state([0.0, 1.0, 0.0]);
//  let _viewUp: Vec3 = $state([0.0, 1.0, 0.0]);
    let _lookAtSubtractLookFrom: Vec3 = $derived(m.subtract(_lookAt, _lookFrom));
//  let _lookAtSubtractLookFrom: Vec3 = $derived(m.subtract(_lookAt, _lookFrom));
    let _lengthLookAtSubtractLookFrom: number = $derived(m.norm(_lookAtSubtractLookFrom) as number);
//  let _lengthLookAtSubtractLookFrom: number = $derived(m.norm(_lookAtSubtractLookFrom) as number);
    let _lookFromSubtractLookAt: Vec3 = $derived(m.subtract(_lookFrom, _lookAt));
//  let _lookFromSubtractLookAt: Vec3 = $derived(m.subtract(_lookFrom, _lookAt));
    let _focusDistance: number = $derived(_lengthLookAtSubtractLookFrom);
//  let _focusDistance: number = $derived(_lengthLookAtSubtractLookFrom);
    let _vFOV: number = $state(m.pi / 2.5);
//  let _vFOV: number = $state(m.pi / 2.5);
    let _hFOV: number = $state(m.pi / 2.5);
//  let _hFOV: number = $state(m.pi / 2.5);
    let _h: number = $derived(m.tan(_vFOV / 2.0));
//  let _h: number = $derived(m.tan(_vFOV / 2.0));
    let _w: number = $derived(m.tan(_hFOV / 2.0));
//  let _w: number = $derived(m.tan(_hFOV / 2.0));
    let _focalLength: number = $derived(_lengthLookAtSubtractLookFrom);
//  let _focalLength: number = $derived(_lengthLookAtSubtractLookFrom);
    let _cameraW: Vec3 = $derived(m.divide(_lookFromSubtractLookAt, m.norm(_lookFromSubtractLookAt)) as Vec3);
//  let _cameraW: Vec3 = $derived(m.divide(_lookFromSubtractLookAt, m.norm(_lookFromSubtractLookAt)) as Vec3);
    let _viewUpCrossCameraW: Vec3 = $derived(m.cross(_viewUp, _cameraW) as Vec3);
//  let _viewUpCrossCameraW: Vec3 = $derived(m.cross(_viewUp, _cameraW) as Vec3);
    let _cameraU: Vec3 = $derived(m.divide(_viewUpCrossCameraW, m.norm(_viewUpCrossCameraW)) as Vec3);
//  let _cameraU: Vec3 = $derived(m.divide(_viewUpCrossCameraW, m.norm(_viewUpCrossCameraW)) as Vec3);
    let _cameraV: Vec3 = $derived(m.cross(_cameraW, _cameraU) as Vec3);
//  let _cameraV: Vec3 = $derived(m.cross(_cameraW, _cameraU) as Vec3);
    let _viewportH: number = $derived(2.0 * _h * _focalLength);
//  let _viewportH: number = $derived(2.0 * _h * _focalLength);
    let _viewportW: number = $state(1.0);
//  let _viewportW: number = $state(1.0);
    let _cameraCenter: Vec3 = $derived(_lookFrom);
//  let _cameraCenter: Vec3 = $derived(_lookFrom);
    let _viewportU: Vec3 = $derived(m.multiply( _viewportW, _cameraU) as Vec3);
//  let _viewportU: Vec3 = $derived(m.multiply( _viewportW, _cameraU) as Vec3);
    let _viewportV: Vec3 = $derived(m.multiply(-_viewportH, _cameraV) as Vec3);
//  let _viewportV: Vec3 = $derived(m.multiply(-_viewportH, _cameraV) as Vec3);
    let _fromPixelToPixelDeltaU: Vec3 = $state([1.0, 1.0, 1.0]);
//  let _fromPixelToPixelDeltaU: Vec3 = $state([1.0, 1.0, 1.0]);
    let _fromPixelToPixelDeltaV: Vec3 = $state([1.0, 1.0, 1.0]);
//  let _fromPixelToPixelDeltaV: Vec3 = $state([1.0, 1.0, 1.0]);
    let _viewportTL: Vec3 = $derived(m.chain(_cameraCenter).subtract(m.multiply(_cameraW, _focalLength)).subtract(m.divide(_viewportU, 2)).subtract(m.divide(_viewportV, 2)).done() as Vec3);
//  let _viewportTL: Vec3 = $derived(m.chain(_cameraCenter).subtract(m.multiply(_cameraW, _focalLength)).subtract(m.divide(_viewportU, 2)).subtract(m.divide(_viewportV, 2)).done() as Vec3);
    let _pixel00Coordinates: Vec3 = $derived(m.chain(_viewportTL).add(m.multiply(0.5, m.add(_fromPixelToPixelDeltaU, _fromPixelToPixelDeltaV))).done() as Vec3);
//  let _pixel00Coordinates: Vec3 = $derived(m.chain(_viewportTL).add(m.multiply(0.5, m.add(_fromPixelToPixelDeltaU, _fromPixelToPixelDeltaV))).done() as Vec3);
    let _backgroundType: BackgroundType = $state(BackgroundType.SKY_BOX_BLUE);
//  let _backgroundType: BackgroundType = $state(BackgroundType.SKY_BOX_BLUE);
    let _isRunning: boolean;
//  let _isRunning: boolean;
    let _frameHandle: number;
//  let _frameHandle: number;



//  $inspect(_viewportU, _viewportTL, _pixel00Coordinates, );
//  $inspect(_viewportU, _viewportTL, _pixel00Coordinates, );



    const prepareSpheres = (): void => {
//  const prepareSpheres = (): void => {
        if (!_spheresStorageValues || _spheres.length !== _spheresStorageValues.byteLength / 32) {
//      if (!_spheresStorageValues || _spheres.length !== _spheresStorageValues.byteLength / 32) {
            _spheresStorageValues = new ArrayBuffer(_spheres.length * 32);
//          _spheresStorageValues = new ArrayBuffer(_spheres.length * 32);
            _spheresStorageValuesDataView = new DataView(_spheresStorageValues);
//          _spheresStorageValuesDataView = new DataView(_spheresStorageValues);
            if (_spheresStorageBuffer) {
//          if (_spheresStorageBuffer) {
                _spheresStorageBuffer.destroy();
//              _spheresStorageBuffer.destroy();
            }
//          }
            _spheresStorageBuffer = _device.createBuffer({
//          _spheresStorageBuffer = _device.createBuffer({
                label: "GPU_STORAGE_BUFFER_SPHERES",
//              label: "GPU_STORAGE_BUFFER_SPHERES",
                size: _spheresStorageValues.byteLength,
//              size: _spheresStorageValues.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
//              usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            });
//          });
        }
//      }
        _spheres.forEach((
//      _spheres.forEach((
            {
                center,
//              center,
                radius,
//              radius,
                materialIndex,
//              materialIndex,
            }
            : Sphere, sphereIndex: number): void => {
//          : Sphere, sphereIndex: number): void => {
                const base: number = sphereIndex * 32;
//              const base: number = sphereIndex * 32;
                _spheresStorageValuesDataView.setFloat32(base + 0, center[0], true);
//              _spheresStorageValuesDataView.setFloat32(base + 0, center[0], true);
                _spheresStorageValuesDataView.setFloat32(base + 4, center[1], true);
//              _spheresStorageValuesDataView.setFloat32(base + 4, center[1], true);
                _spheresStorageValuesDataView.setFloat32(base + 8, center[2], true);
//              _spheresStorageValuesDataView.setFloat32(base + 8, center[2], true);
                _spheresStorageValuesDataView.setFloat32(base + 12, radius, true);
//              _spheresStorageValuesDataView.setFloat32(base + 12, radius, true);
                _spheresStorageValuesDataView.setUint32(base + 16, materialIndex, true);
//              _spheresStorageValuesDataView.setUint32(base + 16, materialIndex, true);
        });
//      });
        _device.queue.writeBuffer(_spheresStorageBuffer, 0, _spheresStorageValues as GPUAllowSharedBufferSource);
//      _device.queue.writeBuffer(_spheresStorageBuffer, 0, _spheresStorageValues as GPUAllowSharedBufferSource);
    };
//  };
    const prepareMaterials = (): void => {
//  const prepareMaterials = (): void => {
        if (!_materialsStorageValues || _materials.length !== _materialsStorageValues.byteLength / 20) {
//      if (!_materialsStorageValues || _materials.length !== _materialsStorageValues.byteLength / 20) {
            _materialsStorageValues = new ArrayBuffer(_materials.length * 20);
//          _materialsStorageValues = new ArrayBuffer(_materials.length * 20);
            _materialsStorageValuesDataView = new DataView(_materialsStorageValues);
//          _materialsStorageValuesDataView = new DataView(_materialsStorageValues);
            if (_materialsStorageBuffer) {
//          if (_materialsStorageBuffer) {
                _materialsStorageBuffer.destroy();
//              _materialsStorageBuffer.destroy();
            }
//          }
            _materialsStorageBuffer = _device.createBuffer({
//          _materialsStorageBuffer = _device.createBuffer({
                label: "GPU_STORAGE_BUFFER_MATERIALS",
//              label: "GPU_STORAGE_BUFFER_MATERIALS",
                size: _materialsStorageValues.byteLength,
//              size: _materialsStorageValues.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
//              usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            });
//          });
        }
//      }
        _materials.forEach((
//      _materials.forEach((
            {
                layer1Roughness,
//              layer1Roughness,
                layer0IOR,
//              layer0IOR,
                layer1IOR,
//              layer1IOR,
                textureIndex,
//              textureIndex,
                materialType,
//              materialType,
            }
            : Material, materialIndex: number): void => {
//          : Material, materialIndex: number): void => {
                const base: number = materialIndex * 20;
//              const base: number = materialIndex * 20;
                _materialsStorageValuesDataView.setFloat32(base + 0, layer1Roughness, true);
//              _materialsStorageValuesDataView.setFloat32(base + 0, layer1Roughness, true);
                _materialsStorageValuesDataView.setFloat32(base + 4, layer0IOR, true);
//              _materialsStorageValuesDataView.setFloat32(base + 4, layer0IOR, true);
                _materialsStorageValuesDataView.setFloat32(base + 8, layer1IOR, true);
//              _materialsStorageValuesDataView.setFloat32(base + 8, layer1IOR, true);
                _materialsStorageValuesDataView.setUint32(base + 12, textureIndex, true);
//              _materialsStorageValuesDataView.setUint32(base + 12, textureIndex, true);
                _materialsStorageValuesDataView.setUint32(base + 16, materialType, true);
//              _materialsStorageValuesDataView.setUint32(base + 16, materialType, true);
        });
//      });
        _device.queue.writeBuffer(_materialsStorageBuffer, 0, _materialsStorageValues as GPUAllowSharedBufferSource);
//      _device.queue.writeBuffer(_materialsStorageBuffer, 0, _materialsStorageValues as GPUAllowSharedBufferSource);
    };
//  };
    const prepareTextures = (): void => {
//  const prepareTextures = (): void => {
        if (!_texturesStorageValues || _textures.length !== _texturesStorageValues.byteLength / 32) {
//      if (!_texturesStorageValues || _textures.length !== _texturesStorageValues.byteLength / 32) {
            _texturesStorageValues = new ArrayBuffer(_textures.length * 32);
//          _texturesStorageValues = new ArrayBuffer(_textures.length * 32);
            _texturesStorageValuesDataView = new DataView(_texturesStorageValues);
//          _texturesStorageValuesDataView = new DataView(_texturesStorageValues);
            if (_texturesStorageBuffer) {
//          if (_texturesStorageBuffer) {
                _texturesStorageBuffer.destroy();
//              _texturesStorageBuffer.destroy();
            }
//          }
            _texturesStorageBuffer = _device.createBuffer({
//          _texturesStorageBuffer = _device.createBuffer({
                label: "GPU_STORAGE_BUFFER_TEXTURES",
//              label: "GPU_STORAGE_BUFFER_TEXTURES",
                size: _texturesStorageValues.byteLength,
//              size: _texturesStorageValues.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
//              usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            });
//          });
        }
//      }
        _textures.forEach((
//      _textures.forEach((
            {
                albedo,
//              albedo,
                imageIndex,
//              imageIndex,
                textureType,
//              textureType,
            }
            : Texture, textureIndex: number): void => {
//          : Texture, textureIndex: number): void => {
                const base: number = textureIndex * 32;
//              const base: number = textureIndex * 32;
                _texturesStorageValuesDataView.setFloat32(base + 0, albedo[0], true);
//              _texturesStorageValuesDataView.setFloat32(base + 0, albedo[0], true);
                _texturesStorageValuesDataView.setFloat32(base + 4, albedo[1], true);
//              _texturesStorageValuesDataView.setFloat32(base + 4, albedo[1], true);
                _texturesStorageValuesDataView.setFloat32(base + 8, albedo[2], true);
//              _texturesStorageValuesDataView.setFloat32(base + 8, albedo[2], true);
                _texturesStorageValuesDataView.setUint32(base + 12, imageIndex, true);
//              _texturesStorageValuesDataView.setUint32(base + 12, imageIndex, true);
                _texturesStorageValuesDataView.setUint32(base + 16, textureType, true);
//              _texturesStorageValuesDataView.setUint32(base + 16, textureType, true);
        });
//      });
        _device.queue.writeBuffer(_texturesStorageBuffer, 0, _texturesStorageValues as GPUAllowSharedBufferSource);
//      _device.queue.writeBuffer(_texturesStorageBuffer, 0, _texturesStorageValues as GPUAllowSharedBufferSource);
    };
//  };



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
        _computeShaderModule = _device.createShaderModule({
//      _computeShaderModule = _device.createShaderModule({
            label: "GPU_SHADER_MODULE_COMPUTE",
//          label: "GPU_SHADER_MODULE_COMPUTE",
            code: shaderStringCompute,
//          code: shaderStringCompute,
        });
//      });
        _gatherShaderModule = _device.createShaderModule({
//      _gatherShaderModule = _device.createShaderModule({
            label: "GPU_SHADER_MODULE_GATHER",
//          label: "GPU_SHADER_MODULE_GATHER",
            code: shaderStringGather,
//          code: shaderStringGather,
        });
//      });
        _renderShaderModule = _device.createShaderModule({
//      _renderShaderModule = _device.createShaderModule({
            label: "GPU_SHADER_MODULE_RENDER",
//          label: "GPU_SHADER_MODULE_RENDER",
            code: shaderStringRender,
//          code: shaderStringRender,
        });
//      });
        _computeBindGroupLayout0 = _device.createBindGroupLayout({
//      _computeBindGroupLayout0 = _device.createBindGroupLayout({
            label: "GPU_BIND_GROUP_LAYOUT_0_COMPUTE",
//          label: "GPU_BIND_GROUP_LAYOUT_0_COMPUTE",
            entries: [
//          entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
//              { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage", }, },
//              { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage", }, },
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
//              { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
                { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
//              { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
                { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
//              { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
                { binding: 5, visibility: GPUShaderStage.COMPUTE, sampler: {}, },
//              { binding: 5, visibility: GPUShaderStage.COMPUTE, sampler: {}, },
                { binding: 6, visibility: GPUShaderStage.COMPUTE, texture: {}, },
//              { binding: 6, visibility: GPUShaderStage.COMPUTE, texture: {}, },
                { binding: 7, visibility: GPUShaderStage.COMPUTE, sampler: {}, },
//              { binding: 7, visibility: GPUShaderStage.COMPUTE, sampler: {}, },
                { binding: 8, visibility: GPUShaderStage.COMPUTE, texture: {}, },
//              { binding: 8, visibility: GPUShaderStage.COMPUTE, texture: {}, },
            ],
//          ],
        });
//      });
        _gatherBindGroupLayout0 = null;
//      _gatherBindGroupLayout0 = null;
        _renderBindGroupLayout0 = null;
//      _renderBindGroupLayout0 = null;
        _computePipelineLayout = _device.createPipelineLayout({
//      _computePipelineLayout = _device.createPipelineLayout({
            label: "GPU_PIPELINE_LAYOUT_COMPUTE",
//          label: "GPU_PIPELINE_LAYOUT_COMPUTE",
            bindGroupLayouts: [
//          bindGroupLayouts: [
                _computeBindGroupLayout0,
//              _computeBindGroupLayout0,
            ],
//          ],
        });
//      });
        _gatherPipelineLayout = "auto";
//      _gatherPipelineLayout = "auto";
        _renderPipelineLayout = "auto";
//      _renderPipelineLayout = "auto";
        _computePipeline = await _device.createComputePipelineAsync({
//      _computePipeline = await _device.createComputePipelineAsync({
            label: "GPU_PIPELINE_COMPUTE",
//          label: "GPU_PIPELINE_COMPUTE",
            layout: _computePipelineLayout,
//          layout: _computePipelineLayout,
            compute: {
//          compute: {
                module: _computeShaderModule,
//              module: _computeShaderModule,
                entryPoint: "main",
//              entryPoint: "main",
            },
//          },
        });
//      });
        _gatherPipeline = await _device.createComputePipelineAsync({
//      _gatherPipeline = await _device.createComputePipelineAsync({
            label: "GPU_PIPELINE_GATHER",
//          label: "GPU_PIPELINE_GATHER",
            layout: _gatherPipelineLayout,
//          layout: _gatherPipelineLayout,
            compute: {
//          compute: {
                module: _gatherShaderModule,
//              module: _gatherShaderModule,
                entryPoint: "main",
//              entryPoint: "main",
            },
//          },
        });
//      });
        _renderPipeline = await _device.createRenderPipelineAsync({
//      _renderPipeline = await _device.createRenderPipelineAsync({
            label: "GPU_PIPELINE_RENDER",
//          label: "GPU_PIPELINE_RENDER",
            layout: _renderPipelineLayout,
//          layout: _renderPipelineLayout,
            vertex: {
//          vertex: {
                module: _renderShaderModule,
//              module: _renderShaderModule,
                entryPoint: "vertexShader",
//              entryPoint: "vertexShader",
            },
//          },
            fragment: {
//          fragment: {
                module: _renderShaderModule,
//              module: _renderShaderModule,
                entryPoint: "fragmentShader",
//              entryPoint: "fragmentShader",
                targets: [{ format: _presentationFormat }],
//              targets: [{ format: _presentationFormat }],
            },
//          },
        });
//      });
        _commandEncoderDescriptor = { label: "GPU_COMMAND_ENCODER_DESCRIPTOR", };
//      _commandEncoderDescriptor = { label: "GPU_COMMAND_ENCODER_DESCRIPTOR", };
        _computePassDescriptor = { label: "GPU_PASS_DESCRIPTOR_COMPUTE", };
//      _computePassDescriptor = { label: "GPU_PASS_DESCRIPTOR_COMPUTE", };
        _gatherPassDescriptor = { label: "GPU_PASS_DESCRIPTOR_GATHER", };
//      _gatherPassDescriptor = { label: "GPU_PASS_DESCRIPTOR_GATHER", };
        _renderPassDescriptor = {
//      _renderPassDescriptor = {
            label: "GPU_PASS_DESCRIPTOR_RENDER",
//          label: "GPU_PASS_DESCRIPTOR_RENDER",
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
                }
            ] as GPURenderPassColorAttachment[],
//          ] as GPURenderPassColorAttachment[],
        };
//      };
        _dataStorageValues = new Float32Array(5 * 4); // 5 * vec4<f32>
//      _dataStorageValues = new Float32Array(5 * 4); // 5 * vec4<f32>
        _dataStorageBuffer = _device.createBuffer({
//      _dataStorageBuffer = _device.createBuffer({
            label: "GPU_STORAGE_BUFFER_DATA",
//          label: "GPU_STORAGE_BUFFER_DATA",
            size: _dataStorageValues.byteLength,
//          size: _dataStorageValues.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
//          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
//      });
        _atlasSampler = _device.createSampler({
//      _atlasSampler = _device.createSampler({
            magFilter: "linear",
//          magFilter: "linear",
            minFilter: "linear",
//          minFilter: "linear",
        });
//      });
        _hdriSampler = _device.createSampler({
//      _hdriSampler = _device.createSampler({
            magFilter: "linear",
//          magFilter: "linear",
            minFilter: "linear",
//          minFilter: "linear",
        });
//      });
        _outputSampler = _device.createSampler({
//      _outputSampler = _device.createSampler({
            magFilter: "linear",
//          magFilter: "linear",
            minFilter: "linear",
//          minFilter: "linear",
        });
//      });
        _atlasTexture = _device.createTexture({
//      _atlasTexture = _device.createTexture({
            label: "GPU_TEXTURE_ATLAS",
//          label: "GPU_TEXTURE_ATLAS",
            size: [ 1, 1, ],
//          size: [ 1, 1, ],
            format: "rgba8unorm",
//          format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING,
//          usage: GPUTextureUsage.TEXTURE_BINDING,
        });
//      });
        _hdriTexture = _device.createTexture({
//      _hdriTexture = _device.createTexture({
            label: "GPU_TEXTURE_HDRI",
//          label: "GPU_TEXTURE_HDRI",
            size: [ 1, 1, ],
//          size: [ 1, 1, ],
            format: "rgba8unorm",
//          format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING,
//          usage: GPUTextureUsage.TEXTURE_BINDING,
        });
//      });
        _spheres.push(
//      _spheres.push(
            {
//          {
                center: [ +0.0, -1020.0, +0.0 ],
//              center: [ +0.0, -1020.0, +0.0 ],
                radius: 1000.0,
//              radius: 1000.0,
                materialIndex: 0,
//              materialIndex: 0,
            },
//          },
            {
//          {
                center: [ +10.0, -12.0, -10.0 ],
//              center: [ +10.0, -12.0, -10.0 ],
                radius: 8.0,
//              radius: 8.0,
                materialIndex: 1,
//              materialIndex: 1,

            },
//          },
            {
//          {
                center: [ -10.0, -12.0, +10.0 ],
//              center: [ -10.0, -12.0, +10.0 ],
                radius: 8.0,
//              radius: 8.0,
                materialIndex: 2,
//              materialIndex: 2,
            },
//          },
            {
//          {
                center: [ +10.0, -12.0, +10.0 ],
//              center: [ +10.0, -12.0, +10.0 ],
                radius: 8.0,
//              radius: 8.0,
                materialIndex: 3,
//              materialIndex: 3,
            },
//          },
        );
//      );
        _materials.push(
//      _materials.push(
            {
//          {
                layer0IOR: RefractiveIndex.AIR,
//              layer0IOR: RefractiveIndex.AIR,
                layer1IOR: RefractiveIndex.MARBLE,
//              layer1IOR: RefractiveIndex.MARBLE,
                layer1Roughness: 0.1,
//              layer1Roughness: 0.1,
                materialType: MaterialType.DIFFUSE,
//              materialType: MaterialType.DIFFUSE,
                textureIndex: 0,
//              textureIndex: 0,
            },
//          },
            {
//          {
                layer0IOR: RefractiveIndex.AIR,
//              layer0IOR: RefractiveIndex.AIR,
                layer1IOR: RefractiveIndex.MARBLE,
//              layer1IOR: RefractiveIndex.MARBLE,
                layer1Roughness: 0.1,
//              layer1Roughness: 0.1,
                materialType: MaterialType.METAL,
//              materialType: MaterialType.METAL,
                textureIndex: 1,
//              textureIndex: 1,
            },
//          },
            {
//          {
                layer0IOR: RefractiveIndex.AIR,
//              layer0IOR: RefractiveIndex.AIR,
                layer1IOR: RefractiveIndex.MARBLE,
//              layer1IOR: RefractiveIndex.MARBLE,
                layer1Roughness: 0.1,
//              layer1Roughness: 0.1,
                materialType: MaterialType.METAL,
//              materialType: MaterialType.METAL,
                textureIndex: 2,
//              textureIndex: 2,
            },
//          },
            {
//          {
                layer0IOR: RefractiveIndex.AIR,
//              layer0IOR: RefractiveIndex.AIR,
                layer1IOR: RefractiveIndex.MARBLE,
//              layer1IOR: RefractiveIndex.MARBLE,
                layer1Roughness: 0.1,
//              layer1Roughness: 0.1,
                materialType: MaterialType.METAL,
//              materialType: MaterialType.METAL,
                textureIndex: 3,
//              textureIndex: 3,
            },
//          },
        );
//      );
        _textures.push(
//      _textures.push(
            {
//          {
                albedo: [ 0.5, 0.5, 0.5 ],
//              albedo: [ 0.5, 0.5, 0.5 ],
                imageIndex: 0,
//              imageIndex: 0,
                textureType: TextureType.COLOR,
//              textureType: TextureType.COLOR,
            },
//          },
            {
//          {
                albedo: [ 0.5, 0.5, 1.0 ],
//              albedo: [ 0.5, 0.5, 1.0 ],
                imageIndex: 1,
//              imageIndex: 1,
                textureType: TextureType.COLOR,
//              textureType: TextureType.COLOR,
            },
//          },
            {
//          {
                albedo: [ 1.0, 0.5, 0.0 ],
//              albedo: [ 1.0, 0.5, 0.0 ],
                imageIndex: 2,
//              imageIndex: 2,
                textureType: TextureType.COLOR,
//              textureType: TextureType.COLOR,
            },
//          },
            {
//          {
                albedo: [ 0.0, 1.0, 0.5 ],
//              albedo: [ 0.0, 1.0, 0.5 ],
                imageIndex: 3,
//              imageIndex: 3,
                textureType: TextureType.COLOR,
//              textureType: TextureType.COLOR,
            },
//          },
        );
//      );
        _isRunning = false;
//      _isRunning = false;
        _frameHandle = null!;
//      _frameHandle = null!;
    };
//  };



    const renderLoop = (time: number): void => {
//  const renderLoop = (time: number): void => {
        if (!_isRunning) {
//      if (!_isRunning) {
            return;
//          return;
        }
//      }
        prepare();
//      prepare();
        render();
//      render();
//      console.info("loop");
//      console.info("loop");
        if (_stratifiedSampleY < _stratifiedSamplesPerPixel) {
//      if (_stratifiedSampleY < _stratifiedSamplesPerPixel) {
            _stratifiedSampleX++;
//          _stratifiedSampleX++;
            if (_stratifiedSampleX === _stratifiedSamplesPerPixel) {
//          if (_stratifiedSampleX === _stratifiedSamplesPerPixel) {
                _stratifiedSampleX = 0;
//              _stratifiedSampleX = 0;
                _stratifiedSampleY++;
//              _stratifiedSampleY++;
            }
//          }
            if (_stratifiedSampleY === _stratifiedSamplesPerPixel) {
//          if (_stratifiedSampleY === _stratifiedSamplesPerPixel) {
                stopLoop();
//              stopLoop();
                return;
//              return;
            }
//          }
        } else {
//      } else {
            stopLoop();
//          stopLoop();
            return;
//          return;
        }
//      }
        _frameHandle = requestAnimationFrame(renderLoop);
//      _frameHandle = requestAnimationFrame(renderLoop);
    };
//  };
    const startLoop = (): void => {
//  const startLoop = (): void => {
        if (!_isRunning) {
//      if (!_isRunning) {
            _isRunning = true;
//          _isRunning = true;
//          console.info("start loop");
//          console.info("start loop");
            _stratifiedSampleX = 0.0;
//          _stratifiedSampleX = 0.0;
            _stratifiedSampleY = 0.0;
//          _stratifiedSampleY = 0.0;
            _frameHandle = requestAnimationFrame(renderLoop);
//          _frameHandle = requestAnimationFrame(renderLoop);
        }
//      }
    };
//  };
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
//      }
    };
//  };



    onMount(async (): Promise<void> => {
//  onMount(async (): Promise<void> => {
        // console.log(mathjs.chain([2, 4, 6]).divide(2).done());
        // console.log(mathjs.chain([2, 4, 6]).divide(2).done());
        // return;
        // return;


        await initOnce();
//      await initOnce();

        prepareSpheres();
//      prepareSpheres();
        prepareMaterials();
//      prepareMaterials();
        prepareTextures();
//      prepareTextures();

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
//                  }
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
//                  );
                    entryAsCanvas.height = Math.max(
//                  entryAsCanvas.height = Math.max(
                        1,
//                      1,
                        Math.min(height, _device.limits.maxTextureDimension2D),
//                      Math.min(height, _device.limits.maxTextureDimension2D),
                    );
//                  );
//                  console.log(entryAsCanvas.width, entryAsCanvas.height, _canvas.width, _canvas.height,);
//                  console.log(entryAsCanvas.width, entryAsCanvas.height, _canvas.width, _canvas.height,);
                    _viewportW = _viewportH * _canvas.width / _canvas.height;
//                  _viewportW = _viewportH * _canvas.width / _canvas.height;
                    _fromPixelToPixelDeltaU = m.divide(_viewportU, _canvas.width ) as Vec3;
//                  _fromPixelToPixelDeltaU = m.divide(_viewportU, _canvas.width ) as Vec3;
                    _fromPixelToPixelDeltaV = m.divide(_viewportV, _canvas.height) as Vec3;
//                  _fromPixelToPixelDeltaV = m.divide(_viewportV, _canvas.height) as Vec3;
                    if (_outputStorage) {
//                  if (_outputStorage) {
                        _outputStorage.destroy();
//                      _outputStorage.destroy();
                    }
//                  }
                    _outputStorage = _device.createBuffer({
//                  _outputStorage = _device.createBuffer({
                        label: "GPU_STORAGE_OUTPUT",
//                      label: "GPU_STORAGE_OUTPUT",
                        size: _canvas.width * _canvas.height * 16, // image width * image height * 16 bytes (a.k.a vec4<f32>)
//                      size: _canvas.width * _canvas.height * 16, // image width * image height * 16 bytes (a.k.a vec4<f32>)
                        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
//                      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
                    });
//                  });
                    _device.queue.writeBuffer(_outputStorage, 0, new Float32Array(_canvas.width * _canvas.height * 4)); // image width * image height * 4 channels
//                  _device.queue.writeBuffer(_outputStorage, 0, new Float32Array(_canvas.width * _canvas.height * 4)); // image width * image height * 4 channels
                    if (_outputTexture) {
//                  if (_outputTexture) {
                        _outputTexture.destroy();
//                      _outputTexture.destroy();
                    }
//                  }
                    _outputTexture = _device.createTexture({
//                  _outputTexture = _device.createTexture({
                        label: "GPU_TEXTURE_OUTPUT",
//                      label: "GPU_TEXTURE_OUTPUT",
                        size: [ _canvas.width, _canvas.height, ],
//                      size: [ _canvas.width, _canvas.height, ],
                        format: "rgba8unorm",
//                      format: "rgba8unorm",
                        usage: GPUTextureUsage.STORAGE_BINDING /* compute shader writes */ | GPUTextureUsage.TEXTURE_BINDING /* fragment shader samples */ ,
//                      usage: GPUTextureUsage.STORAGE_BINDING /* compute shader writes */ | GPUTextureUsage.TEXTURE_BINDING /* fragment shader samples */ ,
                    });
//                  });
//                  const atlasTextureView: GPUTextureView = _atlasTexture.createView();
//                  const atlasTextureView: GPUTextureView = _atlasTexture.createView();
//                  const hdriTextureView: GPUTextureView = _hdriTexture.createView();
//                  const hdriTextureView: GPUTextureView = _hdriTexture.createView();
//                  const outputTextureView: GPUTextureView = _outputTexture.createView();
//                  const outputTextureView: GPUTextureView = _outputTexture.createView();
                    _computeBindGroup0 = _device.createBindGroup({
//                  _computeBindGroup0 = _device.createBindGroup({
                        label: "GPU_BIND_GROUP_0_COMPUTE",
//                      label: "GPU_BIND_GROUP_0_COMPUTE",
                        layout: _computePipeline.getBindGroupLayout(0),
//                      layout: _computePipeline.getBindGroupLayout(0),
                        entries: [
//                      entries: [
                            {
//                          {
                                binding: 0,
//                              binding: 0,
                                resource: _dataStorageBuffer,
//                              resource: _dataStorageBuffer,
                            },
//                          },
                            {
//                          {
                                binding: 1,
//                              binding: 1,
                                resource: _outputStorage,
//                              resource: _outputStorage,
                            },
//                          },
                            {
//                          {
                                binding: 2,
//                              binding: 2,
                                resource: _spheresStorageBuffer,
//                              resource: _spheresStorageBuffer,
                            },
//                          },
                            {
//                          {
                                binding: 3,
//                              binding: 3,
                                resource: _materialsStorageBuffer,
//                              resource: _materialsStorageBuffer,
                            },
//                          },
                            {
//                          {
                                binding: 4,
//                              binding: 4,
                                resource: _texturesStorageBuffer,
//                              resource: _texturesStorageBuffer,
                            },
//                          },
                            {
//                          {
                                binding: 5,
//                              binding: 5,
                                resource: _atlasSampler,
//                              resource: _atlasSampler,
                            },
//                          },
                            {
//                          {
                                binding: 6,
//                              binding: 6,
                                resource: _atlasTexture,
//                              resource: _atlasTexture,
//                              resource:  atlasTextureView,
//                              resource:  atlasTextureView,
                            },
//                          },
                            {
//                          {
                                binding: 7,
//                              binding: 7,
                                resource: _hdriSampler,
//                              resource: _hdriSampler,
                            },
//                          },
                            {
//                          {
                                binding: 8,
//                              binding: 8,
                                resource: _hdriTexture,
//                              resource: _hdriTexture,
//                              resource:  hdriTextureView,
//                              resource:  hdriTextureView,
                            },
//                          },
                        ],
//                      ],
                    });
//                  });
                    _gatherBindGroup0 = _device.createBindGroup({
//                  _gatherBindGroup0 = _device.createBindGroup({
                        label: "GPU_BIND_GROUP_0_GATHER",
//                      label: "GPU_BIND_GROUP_0_GATHER",
                        layout: _gatherPipeline.getBindGroupLayout(0),
//                      layout: _gatherPipeline.getBindGroupLayout(0),
                        entries: [
//                      entries: [
                            {
//                          {
                                binding: 0,
//                              binding: 0,
                                resource: _dataStorageBuffer,
//                              resource: _dataStorageBuffer,
                            },
//                          },
                            {
//                          {
                                binding: 1,
//                              binding: 1,
                                resource: _outputStorage,
//                              resource: _outputStorage,
                            },
//                          },
                            {
//                          {
                                binding: 2,
//                              binding: 2,
                                resource: _outputTexture,
//                              resource: _outputTexture,
//                              resource:  outputTextureView,
//                              resource:  outputTextureView,
                            },
//                          },
                        ],
//                      ],
                    });
//                  });
                    _renderBindGroup0 = _device.createBindGroup({
//                  _renderBindGroup0 = _device.createBindGroup({
                        label: "GPU_BIND_GROUP_0_RENDER",
//                      label: "GPU_BIND_GROUP_0_RENDER",
                        layout: _renderPipeline.getBindGroupLayout(0),
//                      layout: _renderPipeline.getBindGroupLayout(0),
                        entries: [
//                      entries: [
                            {
//                          {
                                binding: 0,
//                              binding: 0,
                                resource: _outputSampler,
//                              resource: _outputSampler,
                            },
//                          },
                            {
//                          {
                                binding: 1,
//                              binding: 1,
                                resource: _outputTexture,
//                              resource: _outputTexture,
//                              resource:  outputTextureView,
//                              resource:  outputTextureView,
                            },
//                          },
                        ],
//                      ],
                    });
//                  });
                }
//              }
                // prepare();
                // prepare();
                // render();
                // render();
                startLoop();
//              startLoop();
            },
//          },
        );
//      );


        _resizeObserver.observe(_canvas);
//      _resizeObserver.observe(_canvas);
    });
//  });



    onDestroy(async (): Promise<void> => {
//  onDestroy(async (): Promise<void> => {
        if (_outputTexture) {
//      if (_outputTexture) {
            _outputTexture.destroy();
//          _outputTexture.destroy();
        }
//      }
        if (_outputStorage) {
//      if (_outputStorage) {
            _outputStorage.destroy();
//          _outputStorage.destroy();
        }
//      }
        if (_hdriTexture) {
//      if (_hdriTexture) {
            _hdriTexture.destroy();
//          _hdriTexture.destroy();
        }
//      }
        if (_atlasTexture) {
//      if (_atlasTexture) {
            _atlasTexture.destroy();
//          _atlasTexture.destroy();
        }
//      }
        if (_texturesStorageBuffer) {
//      if (_texturesStorageBuffer) {
            _texturesStorageBuffer.destroy();
//          _texturesStorageBuffer.destroy();
        }
//      }
        if (_materialsStorageBuffer) {
//      if (_materialsStorageBuffer) {
            _materialsStorageBuffer.destroy();
//          _materialsStorageBuffer.destroy();
        }
//      }
        if (_spheresStorageBuffer) {
//      if (_spheresStorageBuffer) {
            _spheresStorageBuffer.destroy();
//          _spheresStorageBuffer.destroy();
        }
//      }
        if (_dataStorageBuffer) {
//      if (_dataStorageBuffer) {
            _dataStorageBuffer.destroy();
//          _dataStorageBuffer.destroy();
        }
//      }
        if (_device) {
//      if (_device) {
            _device.destroy();
//          _device.destroy();
        }
//      }
    });
//  });



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


        _gatherPass = _commandEncoder.beginComputePass(_gatherPassDescriptor);
//      _gatherPass = _commandEncoder.beginComputePass(_gatherPassDescriptor);
        _gatherPass.setPipeline(_gatherPipeline);
//      _gatherPass.setPipeline(_gatherPipeline);
        _gatherPass.setBindGroup(0, _gatherBindGroup0);
//      _gatherPass.setBindGroup(0, _gatherBindGroup0);
        _gatherPass.dispatchWorkgroups(Math.ceil(_canvas.width / 16), Math.ceil(_canvas.height / 16),);
//      _gatherPass.dispatchWorkgroups(Math.ceil(_canvas.width / 16), Math.ceil(_canvas.height / 16),);
        _gatherPass.end();
//      _gatherPass.end();


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
//  };



    const prepare = (): void => {
//  const prepare = (): void => {
//      console.log("_stratifiedSampleX:", _stratifiedSampleX, "_stratifiedSampleY:", _stratifiedSampleY);
//      console.log("_stratifiedSampleX:", _stratifiedSampleX, "_stratifiedSampleY:", _stratifiedSampleY);
        _dataStorageValues.set(
//      _dataStorageValues.set(
            [
//          [
                _canvas.width, _canvas.height, _stratifiedSamplesPerPixel, _inverseStratifiedSamplesPerPixel,
//              _canvas.width, _canvas.height, _stratifiedSamplesPerPixel, _inverseStratifiedSamplesPerPixel,
                ..._cameraCenter, _pixelSamplesScale,
//              ..._cameraCenter, _pixelSamplesScale,
                ..._fromPixelToPixelDeltaU, _stratifiedSampleX,
//              ..._fromPixelToPixelDeltaU, _stratifiedSampleX,
                ..._fromPixelToPixelDeltaV, _stratifiedSampleY,
//              ..._fromPixelToPixelDeltaV, _stratifiedSampleY,
                ..._pixel00Coordinates, _backgroundType,
//              ..._pixel00Coordinates, _backgroundType,
            ],
//          ],
            0,
//          0,
        );
//      );
        _device.queue.writeBuffer(_dataStorageBuffer, 0, _dataStorageValues as GPUAllowSharedBufferSource,);
//      _device.queue.writeBuffer(_dataStorageBuffer, 0, _dataStorageValues as GPUAllowSharedBufferSource,);
    };
//  };


    
    const OnKeydown = async (keyboardEvent: KeyboardEvent): Promise<void> => {
//  const OnKeydown = async (keyboardEvent: KeyboardEvent): Promise<void> => {

    };
//  };



</script>

<!--<svelte:window on:keydown={OnKeydown} />-->
    <svelte:window on:keydown={OnKeydown} />
<!--<svelte:window on:keydown={OnKeydown} />-->

<!--<canvas class="large-elevate" bind:this={_canvas} width="960px" height="540px" style:width="960px" style:height="540px" style:display="block"></canvas>-->
    <canvas class="large-elevate" bind:this={_canvas} width="960px" height="540px" style:width="960px" style:height="540px" style:display="block"></canvas>
<!--<canvas class="large-elevate" bind:this={_canvas} width="960px" height="540px" style:width="960px" style:height="540px" style:display="block"></canvas>-->
<!--<svelte:options runes={true}></svelte:options>-->
    <svelte:options runes={true}></svelte:options>
<!--<svelte:options runes={true}></svelte:options>-->
