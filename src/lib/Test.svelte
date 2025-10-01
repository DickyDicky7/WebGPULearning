<script lang="ts">
    import { onMount } from "svelte";
//  import { onMount } from "svelte";
    import shaderStringRender from "../assets/render.wgsl?raw";
//  import shaderStringRender from "../assets/render.wgsl?raw";
    import shaderStringCompute from "../assets/compute.wgsl?raw";
//  import shaderStringCompute from "../assets/compute.wgsl?raw";
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
    let _spheresStorageValuesDataView: DataView;
//  let _spheresStorageValuesDataView: DataView;
    let _spheresStorageValues: ArrayBuffer;
//  let _spheresStorageValues: ArrayBuffer;
    let _spheresStorageBuffer: GPUBuffer;
//  let _spheresStorageBuffer: GPUBuffer;
    let _spheres: Sphere[] = $state(null!);
//  let _spheres: Sphere[] = $state(null!);
    let _materialsStorageValuesDataView: DataView;
//  let _materialsStorageValuesDataView: DataView;
    let _materialsStorageValues: ArrayBuffer;
//  let _materialsStorageValues: ArrayBuffer;
    let _materialsStorageBuffer: GPUBuffer;
//  let _materialsStorageBuffer: GPUBuffer;
    let _materials: Material[] = $state(null!);
//  let _materials: Material[] = $state(null!);
    let _hdriSampler: GPUSampler;
//  let _hdriSampler: GPUSampler;
    let _hdriTexture: GPUTexture;
//  let _hdriTexture: GPUTexture;
    let _texturesStorageValuesDataView: DataView;
//  let _texturesStorageValuesDataView: DataView;
    let _texturesStorageValues: ArrayBuffer;
//  let _texturesStorageValues: ArrayBuffer;
    let _texturesStorageBuffer: GPUBuffer;
//  let _texturesStorageBuffer: GPUBuffer;
    let _textures: Texture[] = $state(null!);
//  let _textures: Texture[] = $state(null!);
    let _atlasSampler: GPUSampler;
//  let _atlasSampler: GPUSampler;
    let _atlasTexture: GPUTexture;
//  let _atlasTexture: GPUTexture;
    let _renderBindGroup0: GPUBindGroup;
//  let _renderBindGroup0: GPUBindGroup;
    let _computeBindGroup0: GPUBindGroup;
//  let _computeBindGroup0: GPUBindGroup;
    let _texture: GPUTexture;
//  let _texture: GPUTexture;
    let _sampler: GPUSampler;
//  let _sampler: GPUSampler;
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
    let _isRunning: boolean;
//  let _isRunning: boolean;
    let _frameHandle: number;
//  let _frameHandle: number;



//  $inspect(_viewportU, _viewportTL, _pixel00Coordinates, );
//  $inspect(_viewportU, _viewportTL, _pixel00Coordinates, );



    const packSpheres = (): void => {
//  const packSpheres = (): void => {
        if (!_spheres) {
//      if (!_spheres) {
            _spheresStorageValues = new ArrayBuffer(0);
//          _spheresStorageValues = new ArrayBuffer(0);
            _spheresStorageValuesDataView = new DataView(_spheresStorageValues);
//          _spheresStorageValuesDataView = new DataView(_spheresStorageValues);
            return;
//          return;
        }
//      }
        if (_spheres.length === 0) {
//      if (_spheres.length === 0) {
            _spheresStorageValues = new ArrayBuffer(0);
//          _spheresStorageValues = new ArrayBuffer(0);
            _spheresStorageValuesDataView = new DataView(_spheresStorageValues);
//          _spheresStorageValuesDataView = new DataView(_spheresStorageValues);
            return;
//          return;
        }
//      }
        if (!_spheresStorageValues || _spheres.length !== _spheresStorageValues.byteLength / 32) {
//      if (!_spheresStorageValues || _spheres.length !== _spheresStorageValues.byteLength / 32) {
            _spheresStorageValues = new ArrayBuffer(_spheres.length * 32);
//          _spheresStorageValues = new ArrayBuffer(_spheres.length * 32);
            _spheresStorageValuesDataView = new DataView(_spheresStorageValues);
//          _spheresStorageValuesDataView = new DataView(_spheresStorageValues);
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
                // [ center:12-bytes       | radius:4-bytes   ] alignment@16-bytes
                // [ center:12-bytes       | radius:4-bytes   ] alignment@16-bytes
                // [ materialIndex:4-bytes | padding:12-bytes ] alignment@16-bytes
                // [ materialIndex:4-bytes | padding:12-bytes ] alignment@16-bytes
                // --> total@32-bytes
                // --> total@32-bytes
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
    };
//  };
    const packMaterials = (): void => {
//  const packMaterials = (): void => {
        if (!_materials) {
//      if (!_materials) {
            _materialsStorageValues = new ArrayBuffer(0);
//          _materialsStorageValues = new ArrayBuffer(0);
            _materialsStorageValuesDataView = new DataView(_materialsStorageValues);
//          _materialsStorageValuesDataView = new DataView(_materialsStorageValues);
            return;
//          return;
        }
//      }
        if (_materials.length === 0) {
//      if (_materials.length === 0) {
            _materialsStorageValues = new ArrayBuffer(0);
//          _materialsStorageValues = new ArrayBuffer(0);
            _materialsStorageValuesDataView = new DataView(_materialsStorageValues);
//          _materialsStorageValuesDataView = new DataView(_materialsStorageValues);
            return;
//          return;
        }
//      }
        if (!_materialsStorageValues || _materials.length !== _materialsStorageValues.byteLength / 32) {
//      if (!_materialsStorageValues || _materials.length !== _materialsStorageValues.byteLength / 32) {
            _materialsStorageValues = new ArrayBuffer(_materials.length * 32);
//          _materialsStorageValues = new ArrayBuffer(_materials.length * 32);
            _materialsStorageValuesDataView = new DataView(_materialsStorageValues);
//          _materialsStorageValuesDataView = new DataView(_materialsStorageValues);
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
                // [ layer1Roughness:4-bytes | layer0IOR:4-bytes | layer1IOR:4-bytes | textureIndex:4-bytes ] alignment@16-bytes
                // [ layer1Roughness:4-bytes | layer0IOR:4-bytes | layer1IOR:4-bytes | textureIndex:4-bytes ] alignment@16-bytes
                // [ materialType:4-bytes    | padding:12-bytes                                             ] alignment@16-bytes
                // [ materialType:4-bytes    | padding:12-bytes                                             ] alignment@16-bytes
                // --> total@32-bytes
                // --> total@32-bytes
                const base: number = materialIndex * 32;
//              const base: number = materialIndex * 32;
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
    };
//  };
    const packTextures = (): void => {
//  const packTextures = (): void => {
        if (!_textures) {
//      if (!_textures) {
            _texturesStorageValues = new ArrayBuffer(0);
//          _texturesStorageValues = new ArrayBuffer(0);
            _texturesStorageValuesDataView = new DataView(_texturesStorageValues);
//          _texturesStorageValuesDataView = new DataView(_texturesStorageValues);
            return;
//          return;
        }
//      }
        if (_textures.length === 0) {
//      if (_textures.length === 0) {
            _texturesStorageValues = new ArrayBuffer(0);
//          _texturesStorageValues = new ArrayBuffer(0);
            _texturesStorageValuesDataView = new DataView(_texturesStorageValues);
//          _texturesStorageValuesDataView = new DataView(_texturesStorageValues);
            return;
//          return;
        }
//      }
        if (!_texturesStorageValues || _textures.length !== _texturesStorageValues.byteLength / 32) {
//      if (!_texturesStorageValues || _textures.length !== _texturesStorageValues.byteLength / 32) {
            _texturesStorageValues = new ArrayBuffer(_textures.length * 32);
//          _texturesStorageValues = new ArrayBuffer(_textures.length * 32);
            _texturesStorageValuesDataView = new DataView(_texturesStorageValues);
//          _texturesStorageValuesDataView = new DataView(_texturesStorageValues);
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
                // [ albedo:12-bytes     | imageIndex:4-bytes ] alignment@16-bytes
                // [ albedo:12-bytes     | imageIndex:4-bytes ] alignment@16-bytes
                // [ textureType:4-bytes | padding:12-bytes   ] alignment@16-bytes
                // [ textureType:4-bytes | padding:12-bytes   ] alignment@16-bytes
                // --> total@32-bytes
                // --> total@32-bytes
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
                    _viewportW = _viewportH * _canvas.width / _canvas.height;
//                  _viewportW = _viewportH * _canvas.width / _canvas.height;
                    _fromPixelToPixelDeltaU = m.divide(_viewportU, _canvas.width ) as Vec3;
//                  _fromPixelToPixelDeltaU = m.divide(_viewportU, _canvas.width ) as Vec3;
                    _fromPixelToPixelDeltaV = m.divide(_viewportV, _canvas.height) as Vec3;
//                  _fromPixelToPixelDeltaV = m.divide(_viewportV, _canvas.height) as Vec3;
                    if (_texture) {
//                  if (_texture) {
                        _texture.destroy();
//                      _texture.destroy();
                    }
                    _texture = _device.createTexture({
//                  _texture = _device.createTexture({
                        label: "OUTPUT_TEXTURE",
//                      label: "OUTPUT_TEXTURE",
                        size: [ _canvas.width, _canvas.height, ],
//                      size: [ _canvas.width, _canvas.height, ],
                        format: "rgba8unorm",
//                      format: "rgba8unorm",
                        usage: GPUTextureUsage.STORAGE_BINDING /* compute shader writes */ | GPUTextureUsage.TEXTURE_BINDING, /* fragment shader samples */
//                      usage: GPUTextureUsage.STORAGE_BINDING /* compute shader writes */ | GPUTextureUsage.TEXTURE_BINDING, /* fragment shader samples */
                    });
                    const textureView: GPUTextureView = _texture.createView();
//                  const textureView: GPUTextureView = _texture.createView();
                    _renderBindGroup0 = _device.createBindGroup({
//                  _renderBindGroup0 = _device.createBindGroup({
                        label: "GPU_BIND_GROUP_0_RENDER",
//                      label: "GPU_BIND_GROUP_0_RENDER",
                        layout: _renderPipeline.getBindGroupLayout(0),
//                      layout: _renderPipeline.getBindGroupLayout(0),
                        entries: [
//                      entries: [
                            {
                                binding: 0,
//                              binding: 0,
                                resource: _sampler,
//                              resource: _sampler,
                            },
                            {
                                binding: 1,
//                              binding: 1,
                                resource: textureView,
//                              resource: textureView,
                            },
                        ],
                    });
                    _computeBindGroup0 = _device.createBindGroup({
//                  _computeBindGroup0 = _device.createBindGroup({
                        label: "GPU_BIND_GROUP_0_COMPUTE",
//                      label: "GPU_BIND_GROUP_0_COMPUTE",
                        layout: _computePipeline.getBindGroupLayout(0),
//                      layout: _computePipeline.getBindGroupLayout(0),
                        entries: [
//                      entries: [
                            {
                                binding: 0,
//                              binding: 0,
                                resource: _dataStorageBuffer,
//                              resource: _dataStorageBuffer,
                            },
                            {
                                binding: 1,
//                              binding: 1,
                                resource: textureView,
//                              resource: textureView,
                            },
                        ],
                    });
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
//  };



    const prepare = (): void => {
//  const prepare = (): void => {
//      console.log("_stratifiedSampleX:", _stratifiedSampleX, "_stratifiedSampleY:", _stratifiedSampleY);
//      console.log("_stratifiedSampleX:", _stratifiedSampleX, "_stratifiedSampleY:", _stratifiedSampleY);
        _dataStorageValues.set(
//      _dataStorageValues.set(
            [
//          [
                ..._cameraCenter, _pixelSamplesScale,
//              ..._cameraCenter, _pixelSamplesScale,
                ..._fromPixelToPixelDeltaU, _stratifiedSampleX,
//              ..._fromPixelToPixelDeltaU, _stratifiedSampleX,
                ..._fromPixelToPixelDeltaV, _stratifiedSampleY,
//              ..._fromPixelToPixelDeltaV, _stratifiedSampleY,
                ..._pixel00Coordinates, _inverseStratifiedSamplesPerPixel,
//              ..._pixel00Coordinates, _inverseStratifiedSamplesPerPixel,
                _canvas.width, _canvas.height, 0.0, 0.0,
//              _canvas.width, _canvas.height, 0.0, 0.0,
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


    
</script>

<canvas bind:this={_canvas} style:width="960px" style:height="540px" style:display="block"></canvas>
