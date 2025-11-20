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




    import { parseEXRWithWorker } from "./parse-exr-worker-wrapper";
//  import { parseEXRWithWorker } from "./parse-exr-worker-wrapper";
    import * as t from "@tweenjs/tween.js";
//  import * as t from "@tweenjs/tween.js";
    import type { EasingFunction } from "svelte/transition";
//  import type { EasingFunction } from "svelte/transition";
    import { compareArrays, isEqual } from "./Helper.svelte";
//  import { compareArrays, isEqual } from "./Helper.svelte";
    import { encodeOctahedralNormal, decodeOctahedralNormal, encodeQuantizedUV, decodeQuantizedUV } from "./Helper.svelte";
//  import { encodeOctahedralNormal, decodeOctahedralNormal, encodeQuantizedUV, decodeQuantizedUV } from "./Helper.svelte";
    import * as assimp from "./assimp-worker-wrapper";
//  import * as assimp from "./assimp-worker-wrapper";



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
        CHECKER_STYLE_A: 2,
//      CHECKER_STYLE_A: 2,
        CHECKER_STYLE_B: 3,
//      CHECKER_STYLE_B: 3,
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
        scale: number,
//      scale: number,
        oTileTextureIndex: number,
//      oTileTextureIndex: number,
        eTileTextureIndex: number,
//      eTileTextureIndex: number,
    };
//  };
    type Triangle = {
//  type Triangle = {
        aabb3d: AABB3D,
//      aabb3d: AABB3D,
        vertex0: Vec3,
//      vertex0: Vec3,
        vertex1: Vec3,
//      vertex1: Vec3,
        vertex2: Vec3,
//      vertex2: Vec3,
        vertex0FrontFaceNormal: Vec3,
//      vertex0FrontFaceNormal: Vec3,
        vertex1FrontFaceNormal: Vec3,
//      vertex1FrontFaceNormal: Vec3,
        vertex2FrontFaceNormal: Vec3,
//      vertex2FrontFaceNormal: Vec3,
        vertex0UV: Vec2,
//      vertex0UV: Vec2,
        vertex1UV: Vec2,
//      vertex1UV: Vec2,
        vertex2UV: Vec2,
//      vertex2UV: Vec2,
        materialIndex: number,
//      materialIndex: number,
        perVertexFrontFaceNormalAvailable: boolean,
//      perVertexFrontFaceNormalAvailable: boolean,
    };
//  };
    type AABB3D = {
//  type AABB3D = {
        minCornersLimit: Vec3,
//      minCornersLimit: Vec3,
        maxCornersLimit: Vec3,
//      maxCornersLimit: Vec3,
    };
//  };
    type BVHNode = {
//  type BVHNode = {
        aabb3d: AABB3D,
//      aabb3d: AABB3D,
        triangleIndex: number,
//      triangleIndex: number,
        childIndexL: number,
//      childIndexL: number,
        childIndexR: number,
//      childIndexR: number,
    };
//  };
    type CPUTimeMeasurement = {
//  type CPUTimeMeasurement = {
        thenInSeconds: number,
//      thenInSeconds: number,
        nowInSeconds: number,
//      nowInSeconds: number,
        deltaTimeInSeconds: number,
//      deltaTimeInSeconds: number,
        startInMilliseconds: number,
//      startInMilliseconds: number,
        ceaseInMilliseconds: number,
//      ceaseInMilliseconds: number,
        fps: string,
//      fps: string,
        eachCycleExecutionInMilliseconds: string,
//      eachCycleExecutionInMilliseconds: string,
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
    let _dataUniformValues: Float32Array;
//  let _dataUniformValues: Float32Array;
    let _dataUniformBuffer: GPUBuffer;
//  let _dataUniformBuffer: GPUBuffer;
    let _spheresStorageValuesDataView: DataView;
//  let _spheresStorageValuesDataView: DataView;
    let _spheresStorageValues: ArrayBuffer;
//  let _spheresStorageValues: ArrayBuffer;
    let _spheresStorageBuffer: GPUBuffer;
//  let _spheresStorageBuffer: GPUBuffer;
    let _spheres: Sphere[] = [];
//  let _spheres: Sphere[] = [];
    let _materialsStorageValuesDataView: DataView;
//  let _materialsStorageValuesDataView: DataView;
    let _materialsStorageValues: ArrayBuffer;
//  let _materialsStorageValues: ArrayBuffer;
    let _materialsStorageBuffer: GPUBuffer;
//  let _materialsStorageBuffer: GPUBuffer;
    let _materials: Material[] = [];
//  let _materials: Material[] = [];
    let _texturesStorageValuesDataView: DataView;
//  let _texturesStorageValuesDataView: DataView;
    let _texturesStorageValues: ArrayBuffer;
//  let _texturesStorageValues: ArrayBuffer;
    let _texturesStorageBuffer: GPUBuffer;
//  let _texturesStorageBuffer: GPUBuffer;
    let _textures: Texture[] = [];
//  let _textures: Texture[] = [];
    let _atlasSampler: GPUSampler;
//  let _atlasSampler: GPUSampler;
    let _atlasTexture: GPUTexture;
//  let _atlasTexture: GPUTexture;
    let _hdriSampler: GPUSampler;
//  let _hdriSampler: GPUSampler;
    let _hdriTexture: GPUTexture;
//  let _hdriTexture: GPUTexture;
    let _trianglesStorageValuesDataView: DataView;
//  let _trianglesStorageValuesDataView: DataView;
    let _trianglesStorageValues: ArrayBuffer;
//  let _trianglesStorageValues: ArrayBuffer;
    let _trianglesStorageBuffer: GPUBuffer;
//  let _trianglesStorageBuffer: GPUBuffer;
    let _triangles: Triangle[] = [];
//  let _triangles: Triangle[] = [];
    let _bvhNodesStorageValuesDataView: DataView;
//  let _bvhNodesStorageValuesDataView: DataView;
    let _bvhNodesStorageValues: ArrayBuffer;
//  let _bvhNodesStorageValues: ArrayBuffer;
    let _bvhNodesStorageBuffer: GPUBuffer;
//  let _bvhNodesStorageBuffer: GPUBuffer;
    let _bvhNodes: BVHNode[] = [];
//  let _bvhNodes: BVHNode[] = [];
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
    let _samplesPerPixel: number = $state(64.0);
//  let _samplesPerPixel: number = $state(64.0);
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
    let _backgroundType: BackgroundType = $state(BackgroundType.SKY_BOX_HDRI);
//  let _backgroundType: BackgroundType = $state(BackgroundType.SKY_BOX_HDRI);
    let _isRunningRenderLoop: boolean;
//  let _isRunningRenderLoop: boolean;
    let _frameHandleRenderLoop: number;
//  let _frameHandleRenderLoop: number;
//     let _isRunningGeneralLoop: boolean;
// //  let _isRunningGeneralLoop: boolean;
//     let _frameHandleGeneralLoop: number;
// //  let _frameHandleGeneralLoop: number;
    let _tweenCameraLookFrom: t.Tween<Vec3> = null!;
//  let _tweenCameraLookFrom: t.Tween<Vec3> = null!;
    let _tweenCameraLookAt: t.Tween<Vec3> = null!;
//  let _tweenCameraLookAt: t.Tween<Vec3> = null!;
    let _tweenCameraViewUp: t.Tween<Vec3> = null!;
//  let _tweenCameraViewUp: t.Tween<Vec3> = null!;
    let _tweenCameraLookFromIsBusy: boolean = false;
//  let _tweenCameraLookFromIsBusy: boolean = false;
    let _tweenCameraLookAtIsBusy: boolean = false;
//  let _tweenCameraLookAtIsBusy: boolean = false;
    let _tweenCameraViewUpIsBusy: boolean = false;
//  let _tweenCameraViewUpIsBusy: boolean = false;
    let _cpuTimeMeasurementRenderLoop: CPUTimeMeasurement = $state({
//  let _cpuTimeMeasurementRenderLoop: CPUTimeMeasurement = $state({
        thenInSeconds: 0,
//      thenInSeconds: 0,
        nowInSeconds: 0,
//      nowInSeconds: 0,
        deltaTimeInSeconds: 0,
//      deltaTimeInSeconds: 0,
        startInMilliseconds: 0,
//      startInMilliseconds: 0,
        ceaseInMilliseconds: 0,
//      ceaseInMilliseconds: 0,
        fps: "",
//      fps: "",
        eachCycleExecutionInMilliseconds: "",
//      eachCycleExecutionInMilliseconds: "",
    });
//  });
    let _cpuTimeMeasurementGeneralLoop: CPUTimeMeasurement = $state({
//  let _cpuTimeMeasurementGeneralLoop: CPUTimeMeasurement = $state({
        thenInSeconds: 0,
//      thenInSeconds: 0,
        nowInSeconds: 0,
//      nowInSeconds: 0,
        deltaTimeInSeconds: 0,
//      deltaTimeInSeconds: 0,
        startInMilliseconds: 0,
//      startInMilliseconds: 0,
        ceaseInMilliseconds: 0,
//      ceaseInMilliseconds: 0,
        fps: "",
//      fps: "",
        eachCycleExecutionInMilliseconds: "",
//      eachCycleExecutionInMilliseconds: "",
    });
//  });



//  $inspect(_viewportU, _viewportTL, _pixel00Coordinates, );
//  $inspect(_viewportU, _viewportTL, _pixel00Coordinates, );



    function startCPUTimeMeasurement(cpuTimeMeasurement: CPUTimeMeasurement, cpuTimeInMilliseconds: number): void {
//  function startCPUTimeMeasurement(cpuTimeMeasurement: CPUTimeMeasurement, cpuTimeInMilliseconds: number): void {
        cpuTimeMeasurement.nowInSeconds = cpuTimeInMilliseconds * 0.001; // convert to seconds
//      cpuTimeMeasurement.nowInSeconds = cpuTimeInMilliseconds * 0.001; // convert to seconds
        cpuTimeMeasurement.deltaTimeInSeconds = cpuTimeMeasurement.nowInSeconds - cpuTimeMeasurement.thenInSeconds;
//      cpuTimeMeasurement.deltaTimeInSeconds = cpuTimeMeasurement.nowInSeconds - cpuTimeMeasurement.thenInSeconds;
        cpuTimeMeasurement.thenInSeconds = cpuTimeMeasurement.nowInSeconds;
//      cpuTimeMeasurement.thenInSeconds = cpuTimeMeasurement.nowInSeconds;
        cpuTimeMeasurement.startInMilliseconds = performance.now();
//      cpuTimeMeasurement.startInMilliseconds = performance.now();
    };
//  };
    function ceaseCPUTimeMeasurement(cpuTimeMeasurement: CPUTimeMeasurement): void {
//  function ceaseCPUTimeMeasurement(cpuTimeMeasurement: CPUTimeMeasurement): void {
        cpuTimeMeasurement.ceaseInMilliseconds = performance.now();
//      cpuTimeMeasurement.ceaseInMilliseconds = performance.now();
        cpuTimeMeasurement.fps = `${(1 / cpuTimeMeasurement.deltaTimeInSeconds).toFixed(1)}fps`;
//      cpuTimeMeasurement.fps = `${(1 / cpuTimeMeasurement.deltaTimeInSeconds).toFixed(1)}fps`;
        cpuTimeMeasurement.eachCycleExecutionInMilliseconds = `${(cpuTimeMeasurement.ceaseInMilliseconds - cpuTimeMeasurement.startInMilliseconds).toFixed(1)}ms`;
//      cpuTimeMeasurement.eachCycleExecutionInMilliseconds = `${(cpuTimeMeasurement.ceaseInMilliseconds - cpuTimeMeasurement.startInMilliseconds).toFixed(1)}ms`;
    };
//  };



    function calculateAABB3D(triangle: Triangle): AABB3D {
//  function calculateAABB3D(triangle: Triangle): AABB3D {
        const padding: number = 1.0e-4;
//      const padding: number = 1.0e-4;
        const aabb3d: AABB3D = {
//      const aabb3d: AABB3D = {
            minCornersLimit: [ 0.0, 0.0, 0.0, ],
//          minCornersLimit: [ 0.0, 0.0, 0.0, ],
            maxCornersLimit: [ 0.0, 0.0, 0.0, ],
//          maxCornersLimit: [ 0.0, 0.0, 0.0, ],
        };
//      };
        aabb3d.minCornersLimit[0] = Math.min(triangle.vertex0[0], Math.min(triangle.vertex1[0], triangle.vertex2[0])) - padding;
//      aabb3d.minCornersLimit[0] = Math.min(triangle.vertex0[0], Math.min(triangle.vertex1[0], triangle.vertex2[0])) - padding;
        aabb3d.minCornersLimit[1] = Math.min(triangle.vertex0[1], Math.min(triangle.vertex1[1], triangle.vertex2[1])) - padding;
//      aabb3d.minCornersLimit[1] = Math.min(triangle.vertex0[1], Math.min(triangle.vertex1[1], triangle.vertex2[1])) - padding;
        aabb3d.minCornersLimit[2] = Math.min(triangle.vertex0[2], Math.min(triangle.vertex1[2], triangle.vertex2[2])) - padding;
//      aabb3d.minCornersLimit[2] = Math.min(triangle.vertex0[2], Math.min(triangle.vertex1[2], triangle.vertex2[2])) - padding;
        aabb3d.maxCornersLimit[0] = Math.max(triangle.vertex0[0], Math.max(triangle.vertex1[0], triangle.vertex2[0])) + padding;
//      aabb3d.maxCornersLimit[0] = Math.max(triangle.vertex0[0], Math.max(triangle.vertex1[0], triangle.vertex2[0])) + padding;
        aabb3d.maxCornersLimit[1] = Math.max(triangle.vertex0[1], Math.max(triangle.vertex1[1], triangle.vertex2[1])) + padding;
//      aabb3d.maxCornersLimit[1] = Math.max(triangle.vertex0[1], Math.max(triangle.vertex1[1], triangle.vertex2[1])) + padding;
        aabb3d.maxCornersLimit[2] = Math.max(triangle.vertex0[2], Math.max(triangle.vertex1[2], triangle.vertex2[2])) + padding;
//      aabb3d.maxCornersLimit[2] = Math.max(triangle.vertex0[2], Math.max(triangle.vertex1[2], triangle.vertex2[2])) + padding;
        return aabb3d;
//      return aabb3d;
    };
//  };
    // Helper: expands a 10-bit integer into 30 bits by inserting 2 zeros after each bit.
    // Helper: expands a 10-bit integer into 30 bits by inserting 2 zeros after each bit.
    // Used for Morton code generation.
    // Used for Morton code generation.
    function expandBits(v: number): number {
//  function expandBits(v: number): number {
        v = (v * 0x00010001) & 0xFF0000FF;
//      v = (v * 0x00010001) & 0xFF0000FF;
        v = (v * 0x00000101) & 0x0F00F00F;
//      v = (v * 0x00000101) & 0x0F00F00F;
        v = (v * 0x00000011) & 0xC30C30C3;
//      v = (v * 0x00000011) & 0xC30C30C3;
        v = (v * 0x00000005) & 0x49249249;
//      v = (v * 0x00000005) & 0x49249249;
        return v;
//      return v;
    };
//  };
    // Calculates a 30-bit Morton code for a 3D point within a unit box [0,1].
    // Calculates a 30-bit Morton code for a 3D point within a unit box [0,1].
    function morton3D(x: number, y: number, z: number): number {
//  function morton3D(x: number, y: number, z: number): number {
        x = Math.min(Math.max(x * 1024.0, 0.0), 1023.0);
//      x = Math.min(Math.max(x * 1024.0, 0.0), 1023.0);
        y = Math.min(Math.max(y * 1024.0, 0.0), 1023.0);
//      y = Math.min(Math.max(y * 1024.0, 0.0), 1023.0);
        z = Math.min(Math.max(z * 1024.0, 0.0), 1023.0);
//      z = Math.min(Math.max(z * 1024.0, 0.0), 1023.0);
        return expandBits(Math.floor(x)) | (expandBits(Math.floor(y)) << 1) | (expandBits(Math.floor(z)) << 2);
//      return expandBits(Math.floor(x)) | (expandBits(Math.floor(y)) << 1) | (expandBits(Math.floor(z)) << 2);
    };
//  };
    // Unions two AABB3Ds.
    // Unions two AABB3Ds.
    function unionAABB(a: AABB3D, b: AABB3D): AABB3D {
//  function unionAABB(a: AABB3D, b: AABB3D): AABB3D {
        return {
//      return {
            minCornersLimit: [
//          minCornersLimit: [
                Math.min(a.minCornersLimit[0], b.minCornersLimit[0]),
//              Math.min(a.minCornersLimit[0], b.minCornersLimit[0]),
                Math.min(a.minCornersLimit[1], b.minCornersLimit[1]),
//              Math.min(a.minCornersLimit[1], b.minCornersLimit[1]),
                Math.min(a.minCornersLimit[2], b.minCornersLimit[2]),
//              Math.min(a.minCornersLimit[2], b.minCornersLimit[2]),
            ],
//          ],
            maxCornersLimit: [
//          maxCornersLimit: [
                Math.max(a.maxCornersLimit[0], b.maxCornersLimit[0]),
//              Math.max(a.maxCornersLimit[0], b.maxCornersLimit[0]),
                Math.max(a.maxCornersLimit[1], b.maxCornersLimit[1]),
//              Math.max(a.maxCornersLimit[1], b.maxCornersLimit[1]),
                Math.max(a.maxCornersLimit[2], b.maxCornersLimit[2]),
//              Math.max(a.maxCornersLimit[2], b.maxCornersLimit[2]),
            ],
//          ],
        };
//      };
    };
//  };
    // Internal structure to hold sorting data
    // Internal structure to hold sorting data
    type PrimitiveInfo = {
        index: number; // Original index in _triangles
//      index: number; // Original index in _triangles
        code: number; // Morton code
//      code: number; // Morton code
        centroid: Vec3; // Centroid for verification
//      centroid: Vec3; // Centroid for verification
        aabb: AABB3D; // Cached AABB
//      aabb: AABB3D; // Cached AABB
    };
//  };
    function buildLBVH(triangles: Triangle[]): BVHNode[] {
//  function buildLBVH(triangles: Triangle[]): BVHNode[] {
        if (triangles.length === 0) {
//      if (triangles.length === 0) {
            return [];
//          return [];
        }
//      }
        // 1. Calculate Global Bounds and Triangle Centroids
        // 1. Calculate Global Bounds and Triangle Centroids
        let globalMin: Vec3 = [ +Infinity, +Infinity, +Infinity ];
//      let globalMin: Vec3 = [ +Infinity, +Infinity, +Infinity ];
        let globalMax: Vec3 = [ -Infinity, -Infinity, -Infinity ];
//      let globalMax: Vec3 = [ -Infinity, -Infinity, -Infinity ];
        const primitives: PrimitiveInfo[] = triangles.map(
//      const primitives: PrimitiveInfo[] = triangles.map(
            (triangle: Triangle, triangleIndex: number): PrimitiveInfo => {
//          (triangle: Triangle, triangleIndex: number): PrimitiveInfo => {
                // Centroid = (min + max) * 0.5
                // Centroid = (min + max) * 0.5
                const cx: number = (triangle.aabb3d.minCornersLimit[0] + triangle.aabb3d.maxCornersLimit[0]) * 0.5;
//              const cx: number = (triangle.aabb3d.minCornersLimit[0] + triangle.aabb3d.maxCornersLimit[0]) * 0.5;
                const cy: number = (triangle.aabb3d.minCornersLimit[1] + triangle.aabb3d.maxCornersLimit[1]) * 0.5;
//              const cy: number = (triangle.aabb3d.minCornersLimit[1] + triangle.aabb3d.maxCornersLimit[1]) * 0.5;
                const cz: number = (triangle.aabb3d.minCornersLimit[2] + triangle.aabb3d.maxCornersLimit[2]) * 0.5;
//              const cz: number = (triangle.aabb3d.minCornersLimit[2] + triangle.aabb3d.maxCornersLimit[2]) * 0.5;
                // Update global bounds
                // Update global bounds
                globalMin[0] = Math.min(globalMin[0], cx);
//              globalMin[0] = Math.min(globalMin[0], cx);
                globalMin[1] = Math.min(globalMin[1], cy);
//              globalMin[1] = Math.min(globalMin[1], cy);
                globalMin[2] = Math.min(globalMin[2], cz);
//              globalMin[2] = Math.min(globalMin[2], cz);
                globalMax[0] = Math.max(globalMax[0], cx);
//              globalMax[0] = Math.max(globalMax[0], cx);
                globalMax[1] = Math.max(globalMax[1], cy);
//              globalMax[1] = Math.max(globalMax[1], cy);
                globalMax[2] = Math.max(globalMax[2], cz);
//              globalMax[2] = Math.max(globalMax[2], cz);
                return {
//              return {
                    index: triangleIndex,
//                  index: triangleIndex,
                    code: 0,
//                  code: 0,
                    centroid: [ cx, cy, cz ],
//                  centroid: [ cx, cy, cz ],
                    aabb: triangle.aabb3d,
//                  aabb: triangle.aabb3d,
                };
//              };
            }
//          }
        );
//      );
        // Prevent divide by zero if scene is flat or single point
        // Prevent divide by zero if scene is flat or single point
        const extent: Vec3 = [
//      const extent: Vec3 = [
            Math.max(globalMax[0] - globalMin[0], 1e-6),
//          Math.max(globalMax[0] - globalMin[0], 1e-6),
            Math.max(globalMax[1] - globalMin[1], 1e-6),
//          Math.max(globalMax[1] - globalMin[1], 1e-6),
            Math.max(globalMax[2] - globalMin[2], 1e-6),
//          Math.max(globalMax[2] - globalMin[2], 1e-6),
        ];
//      ];
        // 2. Calculate Morton Codes
        // 2. Calculate Morton Codes
        for (let i = 0; i < primitives.length; i++) {
//      for (let i = 0; i < primitives.length; i++) {
            const p: PrimitiveInfo = primitives[i];
//          const p: PrimitiveInfo = primitives[i];
            const nx: number = (p.centroid[0] - globalMin[0]) / extent[0];
//          const nx: number = (p.centroid[0] - globalMin[0]) / extent[0];
            const ny: number = (p.centroid[1] - globalMin[1]) / extent[1];
//          const ny: number = (p.centroid[1] - globalMin[1]) / extent[1];
            const nz: number = (p.centroid[2] - globalMin[2]) / extent[2];
//          const nz: number = (p.centroid[2] - globalMin[2]) / extent[2];
            p.code = morton3D(nx, ny, nz);
//          p.code = morton3D(nx, ny, nz);
        }
//      }
        // 3. Sort Primitives by Morton Code
        // 3. Sort Primitives by Morton Code
        primitives.sort((a: PrimitiveInfo, b: PrimitiveInfo): number => a.code - b.code);
//      primitives.sort((a: PrimitiveInfo, b: PrimitiveInfo): number => a.code - b.code);
        // 4. Build Hierarchy
        // 4. Build Hierarchy
        const bvhNodes: BVHNode[] = [];
//      const bvhNodes: BVHNode[] = [];
        // Recursive builder function
        // Recursive builder function
        // Returns the index of the node created in bvhNodes array
        // Returns the index of the node created in bvhNodes array
        function buildRecursive(first: number, last: number): number {
//      function buildRecursive(first: number, last: number): number {
            // Create a new node placeholder
            // Create a new node placeholder
            const nodeIndex: number = bvhNodes.length;
//          const nodeIndex: number = bvhNodes.length;
            bvhNodes.push({ // Temporary init, will be overwritten
//          bvhNodes.push({ // Temporary init, will be overwritten
                aabb3d: {
//              aabb3d: {
                    minCornersLimit: [ 0, 0, 0 ],
//                  minCornersLimit: [ 0, 0, 0 ],
                    maxCornersLimit: [ 0, 0, 0 ],
//                  maxCornersLimit: [ 0, 0, 0 ],
                },
//              },
                triangleIndex: -1,
//              triangleIndex: -1,
                childIndexL: -1,
//              childIndexL: -1,
                childIndexR: -1,
//              childIndexR: -1,
            });
//          });
            // CASE: Leaf Node
            // CASE: Leaf Node
            if (first === last) {
//          if (first === last) {
                const p: PrimitiveInfo = primitives[first];
//              const p: PrimitiveInfo = primitives[first];
                bvhNodes[nodeIndex].aabb3d = p.aabb;
//              bvhNodes[nodeIndex].aabb3d = p.aabb;
                bvhNodes[nodeIndex].triangleIndex = p.index;
//              bvhNodes[nodeIndex].triangleIndex = p.index;
                return nodeIndex;
//              return nodeIndex;
            }
//          }
            // CASE: Internal Node
            // CASE: Internal Node
            // Determine split position
            // Determine split position
            const splitIndex: number = findSplit(primitives, first, last);
//          const splitIndex: number = findSplit(primitives, first, last);
            // Process Children
            // Process Children
            const childL: number = buildRecursive(first, splitIndex);
//          const childL: number = buildRecursive(first, splitIndex);
            const childR: number = buildRecursive(splitIndex + 1, last);
//          const childR: number = buildRecursive(splitIndex + 1, last);
            // Link children
            // Link children
            bvhNodes[nodeIndex].childIndexL = childL;
//          bvhNodes[nodeIndex].childIndexL = childL;
            bvhNodes[nodeIndex].childIndexR = childR;
//          bvhNodes[nodeIndex].childIndexR = childR;
            // Refit AABB (Union of children)
            // Refit AABB (Union of children)
            bvhNodes[nodeIndex].aabb3d = unionAABB(
//          bvhNodes[nodeIndex].aabb3d = unionAABB(
                bvhNodes[childL].aabb3d,
//              bvhNodes[childL].aabb3d,
                bvhNodes[childR].aabb3d,
//              bvhNodes[childR].aabb3d,
            );
//          );
            return nodeIndex;
//          return nodeIndex;
        };
//      };
        // Start the build
        // Start the build
        buildRecursive(0, primitives.length - 1);
//      buildRecursive(0, primitives.length - 1);
        return bvhNodes;
//      return bvhNodes;
    };
//  };
    // Finds the split index for the range [first, last] using Morton codes.
    // Finds the split index for the range [first, last] using Morton codes.
    // It finds the highest bit that differs between the first and last keys,
    // It finds the highest bit that differs between the first and last keys,
    // and finds the position where that bit flips.
    // and finds the position where that bit flips.
    function findSplit(primitives: PrimitiveInfo[], first: number, last: number): number {
//  function findSplit(primitives: PrimitiveInfo[], first: number, last: number): number {
        const firstCode: number = primitives[first].code;
//      const firstCode: number = primitives[first].code;
        const lastCode: number = primitives[last].code;
//      const lastCode: number = primitives[last].code;
        // If all primitives in this range have the same Morton code,
        // If all primitives in this range have the same Morton code,
        // we cannot split by bit. Split exactly in the middle.
        // we cannot split by bit. Split exactly in the middle.
        if (firstCode === lastCode) {
//      if (firstCode === lastCode) {
            return (first + last) >> 1;
//          return (first + last) >> 1;
        }
//      }
        // Find the highest differing bit between the first and last code
        // Find the highest differing bit between the first and last code
        // XOR results in 1s where bits differ.
        // XOR results in 1s where bits differ.
        // clz32 (Count Leading Zeros) gives us the most significant differing bit.
        // clz32 (Count Leading Zeros) gives us the most significant differing bit.
        const commonPrefix: number = Math.clz32(firstCode ^ lastCode);
//      const commonPrefix: number = Math.clz32(firstCode ^ lastCode);
        // Use binary search to find the index where the bit at 'commonPrefix' flips
        // Use binary search to find the index where the bit at 'commonPrefix' flips
        let split: number = first; // Initialize split
//      let split: number = first; // Initialize split
        let step: number = last - first;
//      let step: number = last - first;
        // Standard binary search to find the boundary
        // Standard binary search to find the boundary
        // We look for the largest index 'i' such that primitives[i] shares the
        // We look for the largest index 'i' such that primitives[i] shares the
        // same bit at 'commonPrefix' as primitives[first].
        // same bit at 'commonPrefix' as primitives[first].
        do {
//      do {
            step = (step + 1) >> 1;
//          step = (step + 1) >> 1;
            const newSplit: number = split + step;
//          const newSplit: number = split + step;
            if (newSplit < last) {
//          if (newSplit < last) {
                const splitCode: number = primitives[newSplit].code;
//              const splitCode: number = primitives[newSplit].code;
                // Compare the most significant differing bit
                // Compare the most significant differing bit
                const splitPrefix: number = Math.clz32(firstCode ^ splitCode);
//              const splitPrefix: number = Math.clz32(firstCode ^ splitCode);
                // If the prefix is larger (more leading zeros), it means the differing bit
                // If the prefix is larger (more leading zeros), it means the differing bit
                // hasn't been encountered yet, so this code is on the "Left" side.
                // hasn't been encountered yet, so this code is on the "Left" side.
                if (splitPrefix > commonPrefix) {
//              if (splitPrefix > commonPrefix) {
                    split = newSplit;
//                  split = newSplit;
                }
//              }
            }
//          }
        } while (step > 1);
//      } while (step > 1);
        return split;
//      return split;
    };
//  };


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
                scale,
//              scale,
                oTileTextureIndex,
//              oTileTextureIndex,
                eTileTextureIndex,
//              eTileTextureIndex,
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
                _texturesStorageValuesDataView.setFloat32(base + 20, scale, true);
//              _texturesStorageValuesDataView.setFloat32(base + 20, scale, true);
                _texturesStorageValuesDataView.setUint32(base + 24, oTileTextureIndex, true);
//              _texturesStorageValuesDataView.setUint32(base + 24, oTileTextureIndex, true);
                _texturesStorageValuesDataView.setUint32(base + 28, eTileTextureIndex, true);
//              _texturesStorageValuesDataView.setUint32(base + 28, eTileTextureIndex, true);
        });
//      });
        _device.queue.writeBuffer(_texturesStorageBuffer, 0, _texturesStorageValues as GPUAllowSharedBufferSource);
//      _device.queue.writeBuffer(_texturesStorageBuffer, 0, _texturesStorageValues as GPUAllowSharedBufferSource);
    };
//  };
    const prepareTriangles = (): void => {
//  const prepareTriangles = (): void => {
        console.log("triangles count:", _triangles.length);
//      console.log("triangles count:", _triangles.length);
        if (!_trianglesStorageValues || _triangles.length !== _trianglesStorageValues.byteLength / 64) {
//      if (!_trianglesStorageValues || _triangles.length !== _trianglesStorageValues.byteLength / 64) {
            _trianglesStorageValues = new ArrayBuffer(_triangles.length * 64);
//          _trianglesStorageValues = new ArrayBuffer(_triangles.length * 64);
            _trianglesStorageValuesDataView = new DataView(_trianglesStorageValues);
//          _trianglesStorageValuesDataView = new DataView(_trianglesStorageValues);
            if (_trianglesStorageBuffer) {
//          if (_trianglesStorageBuffer) {
                _trianglesStorageBuffer.destroy();
//              _trianglesStorageBuffer.destroy();
            }
//          }
            _trianglesStorageBuffer = _device.createBuffer({
//          _trianglesStorageBuffer = _device.createBuffer({
                label: "GPU_STORAGE_BUFFER_TRIANGLES",
//              label: "GPU_STORAGE_BUFFER_TRIANGLES",
                size: _trianglesStorageValues.byteLength,
//              size: _trianglesStorageValues.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
//              usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            });
//          });
        }
//      }
        _triangles.forEach((
//      _triangles.forEach((
            triangle: Triangle, triangleIndex: number): void => {
//          triangle: Triangle, triangleIndex: number): void => {
                triangle.aabb3d = calculateAABB3D(triangle);
//              triangle.aabb3d = calculateAABB3D(triangle);
                if (!triangle.perVertexFrontFaceNormalAvailable) {
//              if (!triangle.perVertexFrontFaceNormalAvailable) {
                    const vertex1SubtractVertex0: Vec3 = m.subtract(triangle.vertex1, triangle.vertex0);
//                  const vertex1SubtractVertex0: Vec3 = m.subtract(triangle.vertex1, triangle.vertex0);
                    const vertex2SubtractVertex0: Vec3 = m.subtract(triangle.vertex2, triangle.vertex0);
//                  const vertex2SubtractVertex0: Vec3 = m.subtract(triangle.vertex2, triangle.vertex0);
                    const crossVector: Vec3 = m.cross(vertex1SubtractVertex0, vertex2SubtractVertex0) as Vec3;
//                  const crossVector: Vec3 = m.cross(vertex1SubtractVertex0, vertex2SubtractVertex0) as Vec3;
                    const normal: Vec3 = m.divide(crossVector, m.norm(crossVector)) as Vec3;
//                  const normal: Vec3 = m.divide(crossVector, m.norm(crossVector)) as Vec3;
                    triangle.vertex0FrontFaceNormal = [...normal];
//                  triangle.vertex0FrontFaceNormal = [...normal];
                    triangle.vertex1FrontFaceNormal = [...normal];
//                  triangle.vertex1FrontFaceNormal = [...normal];
                    triangle.vertex2FrontFaceNormal = [...normal];
//                  triangle.vertex2FrontFaceNormal = [...normal];
                    triangle.perVertexFrontFaceNormalAvailable = true;
//                  triangle.perVertexFrontFaceNormalAvailable = true;
                }
//              }
                const base: number = triangleIndex * 64;
//              const base: number = triangleIndex * 64;
                _trianglesStorageValuesDataView.setFloat32(base + 0, triangle.vertex0[0], true);
//              _trianglesStorageValuesDataView.setFloat32(base + 0, triangle.vertex0[0], true);
                _trianglesStorageValuesDataView.setFloat32(base + 4, triangle.vertex0[1], true);
//              _trianglesStorageValuesDataView.setFloat32(base + 4, triangle.vertex0[1], true);
                _trianglesStorageValuesDataView.setFloat32(base + 8, triangle.vertex0[2], true);
//              _trianglesStorageValuesDataView.setFloat32(base + 8, triangle.vertex0[2], true);
                _trianglesStorageValuesDataView.setUint32(base + 12, encodeOctahedralNormal(triangle.vertex0FrontFaceNormal), true);
//              _trianglesStorageValuesDataView.setUint32(base + 12, encodeOctahedralNormal(triangle.vertex0FrontFaceNormal), true);
                _trianglesStorageValuesDataView.setFloat32(base + 16, triangle.vertex1[0], true);
//              _trianglesStorageValuesDataView.setFloat32(base + 16, triangle.vertex1[0], true);
                _trianglesStorageValuesDataView.setFloat32(base + 20, triangle.vertex1[1], true);
//              _trianglesStorageValuesDataView.setFloat32(base + 20, triangle.vertex1[1], true);
                _trianglesStorageValuesDataView.setFloat32(base + 24, triangle.vertex1[2], true);
//              _trianglesStorageValuesDataView.setFloat32(base + 24, triangle.vertex1[2], true);
                _trianglesStorageValuesDataView.setUint32(base + 28, encodeOctahedralNormal(triangle.vertex1FrontFaceNormal), true);
//              _trianglesStorageValuesDataView.setUint32(base + 28, encodeOctahedralNormal(triangle.vertex1FrontFaceNormal), true);
                _trianglesStorageValuesDataView.setFloat32(base + 32, triangle.vertex2[0], true);
//              _trianglesStorageValuesDataView.setFloat32(base + 32, triangle.vertex2[0], true);
                _trianglesStorageValuesDataView.setFloat32(base + 36, triangle.vertex2[1], true);
//              _trianglesStorageValuesDataView.setFloat32(base + 36, triangle.vertex2[1], true);
                _trianglesStorageValuesDataView.setFloat32(base + 40, triangle.vertex2[2], true);
//              _trianglesStorageValuesDataView.setFloat32(base + 40, triangle.vertex2[2], true);
                _trianglesStorageValuesDataView.setUint32(base + 44, encodeOctahedralNormal(triangle.vertex2FrontFaceNormal), true);
//              _trianglesStorageValuesDataView.setUint32(base + 44, encodeOctahedralNormal(triangle.vertex2FrontFaceNormal), true);
                _trianglesStorageValuesDataView.setUint32(base + 48, encodeQuantizedUV(triangle.vertex0UV), true);
//              _trianglesStorageValuesDataView.setUint32(base + 48, encodeQuantizedUV(triangle.vertex0UV), true);
                _trianglesStorageValuesDataView.setUint32(base + 52, encodeQuantizedUV(triangle.vertex1UV), true);
//              _trianglesStorageValuesDataView.setUint32(base + 52, encodeQuantizedUV(triangle.vertex1UV), true);
                _trianglesStorageValuesDataView.setUint32(base + 56, encodeQuantizedUV(triangle.vertex2UV), true);
//              _trianglesStorageValuesDataView.setUint32(base + 56, encodeQuantizedUV(triangle.vertex2UV), true);
                _trianglesStorageValuesDataView.setUint32(base + 60, triangle.materialIndex, true);
//              _trianglesStorageValuesDataView.setUint32(base + 60, triangle.materialIndex, true);
        });
//      });
        _device.queue.writeBuffer(_trianglesStorageBuffer, 0, _trianglesStorageValues as GPUAllowSharedBufferSource);
//      _device.queue.writeBuffer(_trianglesStorageBuffer, 0, _trianglesStorageValues as GPUAllowSharedBufferSource);
        _bvhNodes = buildLBVH(_triangles);
//      _bvhNodes = buildLBVH(_triangles);
        if (!_bvhNodesStorageValues || _bvhNodes.length !== _bvhNodesStorageValues.byteLength / 36) {
//      if (!_bvhNodesStorageValues || _bvhNodes.length !== _bvhNodesStorageValues.byteLength / 36) {
            _bvhNodesStorageValues = new ArrayBuffer(_bvhNodes.length * 36);
//          _bvhNodesStorageValues = new ArrayBuffer(_bvhNodes.length * 36);
            _bvhNodesStorageValuesDataView = new DataView(_bvhNodesStorageValues);
//          _bvhNodesStorageValuesDataView = new DataView(_bvhNodesStorageValues);
            if (_bvhNodesStorageBuffer) {
//          if (_bvhNodesStorageBuffer) {
                _bvhNodesStorageBuffer.destroy();
//              _bvhNodesStorageBuffer.destroy();
            }
//          }
            _bvhNodesStorageBuffer = _device.createBuffer({
//          _bvhNodesStorageBuffer = _device.createBuffer({
                label: "GPU_STORAGE_BUFFER_BVH_NODES",
//              label: "GPU_STORAGE_BUFFER_BVH_NODES",
                size: _bvhNodesStorageValues.byteLength,
//              size: _bvhNodesStorageValues.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
//              usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            });
//          });
        }
//      }
        _bvhNodes.forEach(
//      _bvhNodes.forEach(
            (bvhNode: BVHNode, bvhNodeIndex: number): void => {
//          (bvhNode: BVHNode, bvhNodeIndex: number): void => {
                const base: number = bvhNodeIndex * 36;
//              const base: number = bvhNodeIndex * 36;
                _bvhNodesStorageValuesDataView.setFloat32(base + 0 , bvhNode.aabb3d.minCornersLimit[0], true);
//              _bvhNodesStorageValuesDataView.setFloat32(base + 0 , bvhNode.aabb3d.minCornersLimit[0], true);
                _bvhNodesStorageValuesDataView.setFloat32(base + 4 , bvhNode.aabb3d.maxCornersLimit[0], true);
//              _bvhNodesStorageValuesDataView.setFloat32(base + 4 , bvhNode.aabb3d.maxCornersLimit[0], true);
                _bvhNodesStorageValuesDataView.setFloat32(base + 8 , bvhNode.aabb3d.minCornersLimit[1], true);
//              _bvhNodesStorageValuesDataView.setFloat32(base + 8 , bvhNode.aabb3d.minCornersLimit[1], true);
                _bvhNodesStorageValuesDataView.setFloat32(base + 12, bvhNode.aabb3d.maxCornersLimit[1], true);
//              _bvhNodesStorageValuesDataView.setFloat32(base + 12, bvhNode.aabb3d.maxCornersLimit[1], true);
                _bvhNodesStorageValuesDataView.setFloat32(base + 16, bvhNode.aabb3d.minCornersLimit[2], true);
//              _bvhNodesStorageValuesDataView.setFloat32(base + 16, bvhNode.aabb3d.minCornersLimit[2], true);
                _bvhNodesStorageValuesDataView.setFloat32(base + 20, bvhNode.aabb3d.maxCornersLimit[2], true);
//              _bvhNodesStorageValuesDataView.setFloat32(base + 20, bvhNode.aabb3d.maxCornersLimit[2], true);
                _bvhNodesStorageValuesDataView.setInt32(base + 24, bvhNode.triangleIndex, true);
//              _bvhNodesStorageValuesDataView.setInt32(base + 24, bvhNode.triangleIndex, true);
                _bvhNodesStorageValuesDataView.setInt32(base + 28, bvhNode.childIndexL, true);
//              _bvhNodesStorageValuesDataView.setInt32(base + 28, bvhNode.childIndexL, true);
                _bvhNodesStorageValuesDataView.setInt32(base + 32, bvhNode.childIndexR, true);
//              _bvhNodesStorageValuesDataView.setInt32(base + 32, bvhNode.childIndexR, true);
            }
//          }
        );
//      );
        _device.queue.writeBuffer(_bvhNodesStorageBuffer, 0, _bvhNodesStorageValues as GPUAllowSharedBufferSource);
//      _device.queue.writeBuffer(_bvhNodesStorageBuffer, 0, _bvhNodesStorageValues as GPUAllowSharedBufferSource);
    };
//  };



    const initOnce = async (): Promise<void> => {
//  const initOnce = async (): Promise<void> => {
        _adapter = (await navigator.gpu.requestAdapter())!;
//      _adapter = (await navigator.gpu.requestAdapter())!;
        _device = await _adapter.requestDevice({
//      _device = await _adapter.requestDevice({
            requiredFeatures: [
//          requiredFeatures: [
                "shader-f16",
//              "shader-f16",
                "float32-filterable",
//              "float32-filterable",
            ] as Iterable<GPUFeatureName>,
//          ] as Iterable<GPUFeatureName>,
            requiredLimits: {
//          requiredLimits: {
                maxStorageBuffersPerShaderStage: 10,
//              maxStorageBuffersPerShaderStage: 10,
                maxComputeInvocationsPerWorkgroup: 1024,
//              maxComputeInvocationsPerWorkgroup: 1024,
            },
//          },
        });
//      });
        _canvasContext = _canvas.getContext("webgpu")!;
//      _canvasContext = _canvas.getContext("webgpu")!;
        _presentationFormat = "rgba16float"; // navigator.gpu.getPreferredCanvasFormat();
//      _presentationFormat = "rgba16float"; // navigator.gpu.getPreferredCanvasFormat();
        _canvasContext.configure({ alphaMode: "opaque", colorSpace: "display-p3", device: _device, format: _presentationFormat, toneMapping: { mode: "extended", }, usage: GPUTextureUsage.RENDER_ATTACHMENT, viewFormats: [ "rgba16float", ], });
//      _canvasContext.configure({ alphaMode: "opaque", colorSpace: "display-p3", device: _device, format: _presentationFormat, toneMapping: { mode: "extended", }, usage: GPUTextureUsage.RENDER_ATTACHMENT, viewFormats: [ "rgba16float", ], });
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
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform", }, },
//              { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform", }, },
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
                { binding: 9, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
//              { binding: 9, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
                { binding: 10, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
//              { binding: 10, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage", }, },
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
        _dataUniformValues = new Float32Array(5 * 4); // 5 * vec4<f32>
//      _dataUniformValues = new Float32Array(5 * 4); // 5 * vec4<f32>
        _dataUniformBuffer = _device.createBuffer({
//      _dataUniformBuffer = _device.createBuffer({
            label: "GPU_UNIFORM_BUFFER_DATA",
//          label: "GPU_UNIFORM_BUFFER_DATA",
            size: _dataUniformValues.byteLength,
//          size: _dataUniformValues.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
//          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
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
            format: "rgba32float",
//          format: "rgba32float",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
//          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
//      });
        const skyboxImage: ArrayBuffer = await (await fetch("/skyboxes/kloppenheim_03_puresky_4k.exr")).arrayBuffer();
//      const skyboxImage: ArrayBuffer = await (await fetch("/skyboxes/kloppenheim_03_puresky_4k.exr")).arrayBuffer();
        const { data, width, height } = await parseEXRWithWorker(skyboxImage, 1015);
//      const { data, width, height } = await parseEXRWithWorker(skyboxImage, 1015);
        _hdriTexture = _device.createTexture({
//      _hdriTexture = _device.createTexture({
            label: "GPU_TEXTURE_HDRI",
//          label: "GPU_TEXTURE_HDRI",
            size: [ width, height, ],
//          size: [ width, height, ],
            format: "rgba32float",
//          format: "rgba32float",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
//          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
//      });
/*
        // Corrected bytesPerPixel for rgba16float
        // Corrected bytesPerPixel for rgba16float
        const bytesPerPixel: number =  8; // 4 channels * 2 bytes per channel (16-bit float)
//      const bytesPerPixel: number =  8; // 4 channels * 2 bytes per channel (16-bit float)
*/
        // Corrected bytesPerPixel for rgba32float
        const bytesPerPixel: number = 16; // 4 channels * 4 bytes per channel (32-bit float)
//      const bytesPerPixel: number = 16; // 4 channels * 4 bytes per channel (32-bit float)
        const unaligned: number = width * bytesPerPixel;
//      const unaligned: number = width * bytesPerPixel;
        const alignedBytesPerRow: number = Math.ceil(unaligned / 256) * 256;
//      const alignedBytesPerRow: number = Math.ceil(unaligned / 256) * 256;
        _device.queue.writeTexture(
//      _device.queue.writeTexture(
            {
//          {
                aspect: "all",
//              aspect: "all",
                mipLevel: 0,
//              mipLevel: 0,
                origin: undefined,
//              origin: undefined,
                texture: _hdriTexture,
//              texture: _hdriTexture,
            },
//          },
            data as GPUAllowSharedBufferSource,
//          data as GPUAllowSharedBufferSource,
            {
//          {
                bytesPerRow: alignedBytesPerRow,
//              bytesPerRow: alignedBytesPerRow,
                offset: undefined,
//              offset: undefined,
                rowsPerImage: height,
//              rowsPerImage: height,
            },
//          },
            {
//          {
                depthOrArrayLayers: undefined,
//              depthOrArrayLayers: undefined,
                height: height,
//              height: height,
                width: width,
//              width: width,
                depth: undefined,
//              depth: undefined,
            },
//          },
        );
//      );
        _spheres.push(
//      _spheres.push(
/*
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
*/
            {
//          {
                center: [ +20.0, -12.0, -20.0 ],
//              center: [ +20.0, -12.0, -20.0 ],
                radius: 8.0,
//              radius: 8.0,
                materialIndex: 1,
//              materialIndex: 1,

            },
//          },
            {
//          {
                center: [ -20.0, -12.0, +20.0 ],
//              center: [ -20.0, -12.0, +20.0 ],
                radius: 8.0,
//              radius: 8.0,
                materialIndex: 2,
//              materialIndex: 2,
            },
//          },
            {
//          {
                center: [ +20.0, -12.0, +20.0 ],
//              center: [ +20.0, -12.0, +20.0 ],
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
                materialType: MaterialType.METAL,
//              materialType: MaterialType.METAL,
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
                textureIndex: 6,
//              textureIndex: 6,
            },
//          },
        );
//      );
        _textures.push(
//      _textures.push(
            {
//          {
                albedo: [ 1.0, 1.0, 1.0 ],
//              albedo: [ 1.0, 1.0, 1.0 ],
                imageIndex: 0,
//              imageIndex: 0,
                textureType: TextureType.CHECKER_STYLE_B, // TextureType.CHECKER_STYLE_A,
//              textureType: TextureType.CHECKER_STYLE_B, // TextureType.CHECKER_STYLE_A,
                scale: 30.0, // 0.1,
//              scale: 30.0, // 0.1,
                oTileTextureIndex: 4,
//              oTileTextureIndex: 4,
                eTileTextureIndex: 5,
//              eTileTextureIndex: 5,
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
                scale: 1.0,
//              scale: 1.0,
                oTileTextureIndex: 0,
//              oTileTextureIndex: 0,
                eTileTextureIndex: 0,
//              eTileTextureIndex: 0,
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
                scale: 1.0,
//              scale: 1.0,
                oTileTextureIndex: 0,
//              oTileTextureIndex: 0,
                eTileTextureIndex: 0,
//              eTileTextureIndex: 0,
            },
//          },
            {
//          {
                albedo: [ 1.0, 0.5, 0.5 ],
//              albedo: [ 1.0, 0.5, 0.5 ],
                imageIndex: 3,
//              imageIndex: 3,
                textureType: TextureType.COLOR,
//              textureType: TextureType.COLOR,
                scale: 1.0,
//              scale: 1.0,
                oTileTextureIndex: 0,
//              oTileTextureIndex: 0,
                eTileTextureIndex: 0,
//              eTileTextureIndex: 0,
            },
//          },
            {
//          {
                albedo: [ 0.2, 0.2, 0.2 ],
//              albedo: [ 0.2, 0.2, 0.2 ],
                imageIndex: 4,
//              imageIndex: 4,
                textureType: TextureType.COLOR,
//              textureType: TextureType.COLOR,
                scale: 1.0,
//              scale: 1.0,
                oTileTextureIndex: 0,
//              oTileTextureIndex: 0,
                eTileTextureIndex: 0,
//              eTileTextureIndex: 0,
            },
//          },
            {
//          {
                albedo: [ 0.5, 0.5, 0.5 ],
//              albedo: [ 0.5, 0.5, 0.5 ],
                imageIndex: 5,
//              imageIndex: 5,
                textureType: TextureType.COLOR,
//              textureType: TextureType.COLOR,
                scale: 1.0,
//              scale: 1.0,
                oTileTextureIndex: 0,
//              oTileTextureIndex: 0,
                eTileTextureIndex: 0,
//              eTileTextureIndex: 0,
            },
//          },
            {
//          {
                albedo: [ 0.3, 0.5, 0.5 ],
//              albedo: [ 0.3, 0.5, 0.5 ],
                imageIndex: 6,
//              imageIndex: 6,
                textureType: TextureType.COLOR,
//              textureType: TextureType.COLOR,
                scale: 1.0,
//              scale: 1.0,
                oTileTextureIndex: 0,
//              oTileTextureIndex: 0,
                eTileTextureIndex: 0,
//              eTileTextureIndex: 0,
            },
//          },
        );
//      );
        _triangles.push(
//      _triangles.push(
            {
//          {
                aabb3d: undefined!,
//              aabb3d: undefined!,
                vertex0: [ -50.00, -20.00, -50.00 ],
//              vertex0: [ -50.00, -20.00, -50.00 ],
                vertex1: [ -50.00, -20.00, +50.00 ],
//              vertex1: [ -50.00, -20.00, +50.00 ],
                vertex2: [ +50.00, -20.00, +50.00 ],
//              vertex2: [ +50.00, -20.00, +50.00 ],
                vertex0FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
//              vertex0FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
                vertex1FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
//              vertex1FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
                vertex2FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
//              vertex2FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
                vertex0UV: [ 0.0, 0.0 ],
//              vertex0UV: [ 0.0, 0.0 ],
                vertex1UV: [ 0.0, 1.0 ],
//              vertex1UV: [ 0.0, 1.0 ],
                vertex2UV: [ 1.0, 1.0 ],
//              vertex2UV: [ 1.0, 1.0 ],
                materialIndex: 0,
//              materialIndex: 0,
                perVertexFrontFaceNormalAvailable: false,
//              perVertexFrontFaceNormalAvailable: false,
            },
//          },
            {
//          {
                aabb3d: undefined!,
//              aabb3d: undefined!,
                vertex0: [ +50.00, -20.00, +50.00 ],
//              vertex0: [ +50.00, -20.00, +50.00 ],
                vertex1: [ +50.00, -20.00, -50.00 ],
//              vertex1: [ +50.00, -20.00, -50.00 ],
                vertex2: [ -50.00, -20.00, -50.00 ],
//              vertex2: [ -50.00, -20.00, -50.00 ],
                vertex0FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
//              vertex0FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
                vertex1FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
//              vertex1FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
                vertex2FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
//              vertex2FrontFaceNormal: [ 0.0, 0.0, 0.0 ],
                vertex0UV: [ 1.0, 1.0 ],
//              vertex0UV: [ 1.0, 1.0 ],
                vertex1UV: [ 1.0, 0.0 ],
//              vertex1UV: [ 1.0, 0.0 ],
                vertex2UV: [ 0.0, 0.0 ],
//              vertex2UV: [ 0.0, 0.0 ],
                materialIndex: 0,
//              materialIndex: 0,
                perVertexFrontFaceNormalAvailable: false,
//              perVertexFrontFaceNormalAvailable: false,
            },
//          },
        );
//      );
        _isRunningRenderLoop = false;
//      _isRunningRenderLoop = false;
        _frameHandleRenderLoop = null!;
//      _frameHandleRenderLoop = null!;
    };
//  };



    const renderLoop = (cpuTimeInMilliseconds: number): void => {
//  const renderLoop = (cpuTimeInMilliseconds: number): void => {
        if (!_isRunningRenderLoop) {
//      if (!_isRunningRenderLoop) {
            return;
//          return;
        }
//      }
        startCPUTimeMeasurement(_cpuTimeMeasurementRenderLoop, cpuTimeInMilliseconds);
//      startCPUTimeMeasurement(_cpuTimeMeasurementRenderLoop, cpuTimeInMilliseconds);
        prepare();
//      prepare();
        render();
//      render();
        ceaseCPUTimeMeasurement(_cpuTimeMeasurementRenderLoop);
//      ceaseCPUTimeMeasurement(_cpuTimeMeasurementRenderLoop);
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
                stopRenderLoop();
//              stopRenderLoop();
                return;
//              return;
            }
//          }
        } else {
//      } else {
            stopRenderLoop();
//          stopRenderLoop();
            return;
//          return;
        }
//      }
        _frameHandleRenderLoop = requestAnimationFrame(renderLoop);
//      _frameHandleRenderLoop = requestAnimationFrame(renderLoop);
    };
//  };
    const startRenderLoop = (): void => {
//  const startRenderLoop = (): void => {
        if (!_isRunningRenderLoop) {
//      if (!_isRunningRenderLoop) {
            _isRunningRenderLoop = true;
//          _isRunningRenderLoop = true;
//          console.info("start loop");
//          console.info("start loop");
            _stratifiedSampleX = 0.0;
//          _stratifiedSampleX = 0.0;
            _stratifiedSampleY = 0.0;
//          _stratifiedSampleY = 0.0;
            _frameHandleRenderLoop = requestAnimationFrame(renderLoop);
//          _frameHandleRenderLoop = requestAnimationFrame(renderLoop);
        }
//      }
    };
//  };
    const stopRenderLoop = (): void => {
//  const stopRenderLoop = (): void => {
        _isRunningRenderLoop = false;
//      _isRunningRenderLoop = false;
        if (_frameHandleRenderLoop) {
//      if (_frameHandleRenderLoop) {
//          console.info("stop loop");
//          console.info("stop loop");
            cancelAnimationFrame(_frameHandleRenderLoop);
//          cancelAnimationFrame(_frameHandleRenderLoop);
            _frameHandleRenderLoop = null!;
//          _frameHandleRenderLoop = null!;
        }
//      }
    };
//  };



    async function loadModels(): Promise<void> {
//  async function loadModels(): Promise<void> {
        const models = await assimp.customLoadFileObj(
//      const models = await assimp.customLoadFileObj(
            [
//          [
                {
//              {
                    name: "Antonius_C.obj",
//                  name: "Antonius_C.obj",
                    publicURL: "/Antonius_C.obj",
//                  publicURL: "/Antonius_C.obj",
                },
//              },
            ]
//          ]
        );
//      );
        const model = models[0];
//      const model = models[0];
        console.log(model);
//      console.log(model);
        if (model) {
//      if (model) {
            const floorY: number = -20.0;
//          const floorY: number = -20.0;
            let minModelY: number = Infinity;
//          let minModelY: number = Infinity;
            const scaleX: number = 2.0;
//          const scaleX: number = 2.0;
            const scaleY: number = 2.0;
//          const scaleY: number = 2.0;
            const scaleZ: number = 2.0;
//          const scaleZ: number = 2.0;
            for (let mesh of model["meshes"]) {
//          for (let mesh of model["meshes"]) {
                const l: number = (mesh["vertices"] as number[]).length;
//              const l: number = (mesh["vertices"] as number[]).length;
                for (let i: number = 0; i < l; i += 3) {
//              for (let i: number = 0; i < l; i += 3) {
                    mesh["vertices"][i + 0] *= scaleX;
//                  mesh["vertices"][i + 0] *= scaleX;
                    mesh["vertices"][i + 1] *= scaleY;
//                  mesh["vertices"][i + 1] *= scaleY;
                    mesh["vertices"][i + 2] *= scaleZ;
//                  mesh["vertices"][i + 2] *= scaleZ;
                }
//              }
            }
//          }
            for (let mesh of model["meshes"]) {
//          for (let mesh of model["meshes"]) {
                const l: number = (mesh["vertices"] as number[]).length;
//              const l: number = (mesh["vertices"] as number[]).length;
                for (let i: number = 0; i < l; i += 3) {
//              for (let i: number = 0; i < l; i += 3) {
                    let y: number = mesh["vertices"][i + 1];
//                  let y: number = mesh["vertices"][i + 1];
                    minModelY = Math.min(minModelY, y);
//                  minModelY = Math.min(minModelY, y);
                }
//              }
            }
//          }
            const offsetY: number = minModelY - floorY;
//          const offsetY: number = minModelY - floorY;
            for (let mesh of model["meshes"]) {
//          for (let mesh of model["meshes"]) {
                const meshVertices: number[] = mesh["vertices"];
//              const meshVertices: number[] = mesh["vertices"];
                const meshNormals: number[] = mesh["normals"];
//              const meshNormals: number[] = mesh["normals"];
                const meshTextureCoords: number[] = mesh["texturecoords"][0];
//              const meshTextureCoords: number[] = mesh["texturecoords"][0];
                for (let face of mesh["faces"]) {
//              for (let face of mesh["faces"]) {

                    const vertex0Index: number = face[0];
//                  const vertex0Index: number = face[0];
                    const vertex1Index: number = face[1];
//                  const vertex1Index: number = face[1];
                    const vertex2Index: number = face[2];
//                  const vertex2Index: number = face[2];

                    const vertex0IndexBase3: number = vertex0Index * 3; const vertex0ComponentX: number = vertex0IndexBase3 + 0; const vertex0ComponentY: number = vertex0IndexBase3 + 1; const vertex0ComponentZ: number = vertex0IndexBase3 + 2;
//                  const vertex0IndexBase3: number = vertex0Index * 3; const vertex0ComponentX: number = vertex0IndexBase3 + 0; const vertex0ComponentY: number = vertex0IndexBase3 + 1; const vertex0ComponentZ: number = vertex0IndexBase3 + 2;
                    const vertex1IndexBase3: number = vertex1Index * 3; const vertex1ComponentX: number = vertex1IndexBase3 + 0; const vertex1ComponentY: number = vertex1IndexBase3 + 1; const vertex1ComponentZ: number = vertex1IndexBase3 + 2;
//                  const vertex1IndexBase3: number = vertex1Index * 3; const vertex1ComponentX: number = vertex1IndexBase3 + 0; const vertex1ComponentY: number = vertex1IndexBase3 + 1; const vertex1ComponentZ: number = vertex1IndexBase3 + 2;
                    const vertex2IndexBase3: number = vertex2Index * 3; const vertex2ComponentX: number = vertex2IndexBase3 + 0; const vertex2ComponentY: number = vertex2IndexBase3 + 1; const vertex2ComponentZ: number = vertex2IndexBase3 + 2;
//                  const vertex2IndexBase3: number = vertex2Index * 3; const vertex2ComponentX: number = vertex2IndexBase3 + 0; const vertex2ComponentY: number = vertex2IndexBase3 + 1; const vertex2ComponentZ: number = vertex2IndexBase3 + 2;

                    const vertex0IndexBase2: number = vertex0Index * 2; const vertex0ComponentU: number = vertex0IndexBase2 + 0; const vertex0ComponentV: number = vertex0IndexBase2 + 1;
//                  const vertex0IndexBase2: number = vertex0Index * 2; const vertex0ComponentU: number = vertex0IndexBase2 + 0; const vertex0ComponentV: number = vertex0IndexBase2 + 1;
                    const vertex1IndexBase2: number = vertex1Index * 2; const vertex1ComponentU: number = vertex1IndexBase2 + 0; const vertex1ComponentV: number = vertex1IndexBase2 + 1;
//                  const vertex1IndexBase2: number = vertex1Index * 2; const vertex1ComponentU: number = vertex1IndexBase2 + 0; const vertex1ComponentV: number = vertex1IndexBase2 + 1;
                    const vertex2IndexBase2: number = vertex2Index * 2; const vertex2ComponentU: number = vertex2IndexBase2 + 0; const vertex2ComponentV: number = vertex2IndexBase2 + 1;
//                  const vertex2IndexBase2: number = vertex2Index * 2; const vertex2ComponentU: number = vertex2IndexBase2 + 0; const vertex2ComponentV: number = vertex2IndexBase2 + 1;

                    const vertex0Base3ComponentIndices: Vec3 = [ vertex0ComponentX, vertex0ComponentY, vertex0ComponentZ, ];
//                  const vertex0Base3ComponentIndices: Vec3 = [ vertex0ComponentX, vertex0ComponentY, vertex0ComponentZ, ];
                    const vertex1Base3ComponentIndices: Vec3 = [ vertex1ComponentX, vertex1ComponentY, vertex1ComponentZ, ];
//                  const vertex1Base3ComponentIndices: Vec3 = [ vertex1ComponentX, vertex1ComponentY, vertex1ComponentZ, ];
                    const vertex2Base3ComponentIndices: Vec3 = [ vertex2ComponentX, vertex2ComponentY, vertex2ComponentZ, ];
//                  const vertex2Base3ComponentIndices: Vec3 = [ vertex2ComponentX, vertex2ComponentY, vertex2ComponentZ, ];

                    const vertex0Base2ComponentIndices: Vec2 = [ vertex0ComponentU, vertex0ComponentV, ];
//                  const vertex0Base2ComponentIndices: Vec2 = [ vertex0ComponentU, vertex0ComponentV, ];
                    const vertex1Base2ComponentIndices: Vec2 = [ vertex1ComponentU, vertex1ComponentV, ];
//                  const vertex1Base2ComponentIndices: Vec2 = [ vertex1ComponentU, vertex1ComponentV, ];
                    const vertex2Base2ComponentIndices: Vec2 = [ vertex2ComponentU, vertex2ComponentV, ];
//                  const vertex2Base2ComponentIndices: Vec2 = [ vertex2ComponentU, vertex2ComponentV, ];

                    const vpo0: Vec3 = vertex0Base3ComponentIndices.map((componentIndex: number): number => meshVertices[componentIndex]) as Vec3;
//                  const vpo0: Vec3 = vertex0Base3ComponentIndices.map((componentIndex: number): number => meshVertices[componentIndex]) as Vec3;
                    const vpo1: Vec3 = vertex1Base3ComponentIndices.map((componentIndex: number): number => meshVertices[componentIndex]) as Vec3;
//                  const vpo1: Vec3 = vertex1Base3ComponentIndices.map((componentIndex: number): number => meshVertices[componentIndex]) as Vec3;
                    const vpo2: Vec3 = vertex2Base3ComponentIndices.map((componentIndex: number): number => meshVertices[componentIndex]) as Vec3;
//                  const vpo2: Vec3 = vertex2Base3ComponentIndices.map((componentIndex: number): number => meshVertices[componentIndex]) as Vec3;
                    const vno0: Vec3 = vertex0Base3ComponentIndices.map((componentIndex: number): number => meshNormals[componentIndex]) as Vec3;
//                  const vno0: Vec3 = vertex0Base3ComponentIndices.map((componentIndex: number): number => meshNormals[componentIndex]) as Vec3;
                    const vno1: Vec3 = vertex1Base3ComponentIndices.map((componentIndex: number): number => meshNormals[componentIndex]) as Vec3;
//                  const vno1: Vec3 = vertex1Base3ComponentIndices.map((componentIndex: number): number => meshNormals[componentIndex]) as Vec3;
                    const vno2: Vec3 = vertex2Base3ComponentIndices.map((componentIndex: number): number => meshNormals[componentIndex]) as Vec3;
//                  const vno2: Vec3 = vertex2Base3ComponentIndices.map((componentIndex: number): number => meshNormals[componentIndex]) as Vec3;
                    const vuv0: Vec2 = vertex0Base2ComponentIndices.map((componentIndex: number): number => meshTextureCoords[componentIndex]) as Vec2;
//                  const vuv0: Vec2 = vertex0Base2ComponentIndices.map((componentIndex: number): number => meshTextureCoords[componentIndex]) as Vec2;
                    const vuv1: Vec2 = vertex1Base2ComponentIndices.map((componentIndex: number): number => meshTextureCoords[componentIndex]) as Vec2;
//                  const vuv1: Vec2 = vertex1Base2ComponentIndices.map((componentIndex: number): number => meshTextureCoords[componentIndex]) as Vec2;
                    const vuv2: Vec2 = vertex2Base2ComponentIndices.map((componentIndex: number): number => meshTextureCoords[componentIndex]) as Vec2;
//                  const vuv2: Vec2 = vertex2Base2ComponentIndices.map((componentIndex: number): number => meshTextureCoords[componentIndex]) as Vec2;

                    vpo0[1] = vpo0[1] - offsetY;
//                  vpo0[1] = vpo0[1] - offsetY;
                    vpo1[1] = vpo1[1] - offsetY;
//                  vpo1[1] = vpo1[1] - offsetY;
                    vpo2[1] = vpo2[1] - offsetY;
//                  vpo2[1] = vpo2[1] - offsetY;

                    _triangles.push(
//                  _triangles.push(
                        {
//                      {
                            aabb3d: undefined!,
//                          aabb3d: undefined!,
                            vertex0: vpo0,
//                          vertex0: vpo0,
                            vertex1: vpo1,
//                          vertex1: vpo1,
                            vertex2: vpo2,
//                          vertex2: vpo2,
                            vertex0FrontFaceNormal: vno0,
//                          vertex0FrontFaceNormal: vno0,
                            vertex1FrontFaceNormal: vno1,
//                          vertex1FrontFaceNormal: vno1,
                            vertex2FrontFaceNormal: vno2,
//                          vertex2FrontFaceNormal: vno2,
                            vertex0UV: vuv0,
//                          vertex0UV: vuv0,
                            vertex1UV: vuv1,
//                          vertex1UV: vuv1,
                            vertex2UV: vuv2,
//                          vertex2UV: vuv2,
                            materialIndex: 4,
//                          materialIndex: 4,
                            perVertexFrontFaceNormalAvailable: true,
//                          perVertexFrontFaceNormalAvailable: true,
                        },
//                      },
                    );
//                  );
                }
//              }
            }
//          }
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


        await loadModels();
//      await loadModels();


        await initOnce();
//      await initOnce();


        prepareSpheres();
//      prepareSpheres();
        prepareMaterials();
//      prepareMaterials();
        prepareTextures();
//      prepareTextures();
        prepareTriangles();
//      prepareTriangles();


        _resizeObserver = new ResizeObserver(
//      _resizeObserver = new ResizeObserver(
            (entries: ResizeObserverEntry[]) => {
//          (entries: ResizeObserverEntry[]) => {
                stopRenderLoop();
//              stopRenderLoop();
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
                        format: "rgba32float",
//                      format: "rgba32float",
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
                                resource: _dataUniformBuffer,
//                              resource: _dataUniformBuffer,
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
                            {
//                          {
                                binding: 9,
//                              binding: 9,
                                resource: _trianglesStorageBuffer,
//                              resource: _trianglesStorageBuffer,
                            },
//                          },
                            {
//                          {
                                binding: 10,
//                              binding: 10,
                                resource: _bvhNodesStorageBuffer,
//                              resource: _bvhNodesStorageBuffer,
                            },
//                          },
                        ] as Iterable<GPUBindGroupEntry>,
//                      ] as Iterable<GPUBindGroupEntry>,
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
                                resource: _dataUniformBuffer,
//                              resource: _dataUniformBuffer,
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
                        ] as Iterable<GPUBindGroupEntry>,
//                      ] as Iterable<GPUBindGroupEntry>,
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
                        ] as Iterable<GPUBindGroupEntry>,
//                      ] as Iterable<GPUBindGroupEntry>,
                    });
//                  });
                }
//              }
                // prepare();
                // prepare();
                // render();
                // render();
                startRenderLoop();
//              startRenderLoop();
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
        if (_dataUniformBuffer) {
//      if (_dataUniformBuffer) {
            _dataUniformBuffer.destroy();
//          _dataUniformBuffer.destroy();
        }
//      }
        if (_device) {
//      if (_device) {
            _device.destroy();
//          _device.destroy();
        }
//      }
        _resizeObserver.unobserve(_canvas);
//      _resizeObserver.unobserve(_canvas);
        _canvas = null!;
//      _canvas = null!;
    });
//  });



    const render = (): void => {
//  const render = (): void => {
//      (_renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = _canvasContext.getCurrentTexture().createView();
//      (_renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = _canvasContext.getCurrentTexture().createView();
        (_renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = _canvasContext.getCurrentTexture();
//      (_renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = _canvasContext.getCurrentTexture();
        _commandEncoder = _device.createCommandEncoder(_commandEncoderDescriptor,);
//      _commandEncoder = _device.createCommandEncoder(_commandEncoderDescriptor,);


        _computePass = _commandEncoder.beginComputePass(_computePassDescriptor);
//      _computePass = _commandEncoder.beginComputePass(_computePassDescriptor);
        _computePass.setPipeline(_computePipeline);
//      _computePass.setPipeline(_computePipeline);
        _computePass.setBindGroup(0, _computeBindGroup0);
//      _computePass.setBindGroup(0, _computeBindGroup0);
        _computePass.dispatchWorkgroups(Math.ceil(_canvas.width / 32), Math.ceil(_canvas.height / 32),);
//      _computePass.dispatchWorkgroups(Math.ceil(_canvas.width / 32), Math.ceil(_canvas.height / 32),);
        _computePass.end();
//      _computePass.end();


        _gatherPass = _commandEncoder.beginComputePass(_gatherPassDescriptor);
//      _gatherPass = _commandEncoder.beginComputePass(_gatherPassDescriptor);
        _gatherPass.setPipeline(_gatherPipeline);
//      _gatherPass.setPipeline(_gatherPipeline);
        _gatherPass.setBindGroup(0, _gatherBindGroup0);
//      _gatherPass.setBindGroup(0, _gatherBindGroup0);
        _gatherPass.dispatchWorkgroups(Math.ceil(_canvas.width / 32), Math.ceil(_canvas.height / 32),);
//      _gatherPass.dispatchWorkgroups(Math.ceil(_canvas.width / 32), Math.ceil(_canvas.height / 32),);
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
        _dataUniformValues.set(
//      _dataUniformValues.set(
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
        _device.queue.writeBuffer(_dataUniformBuffer, 0, _dataUniformValues as GPUAllowSharedBufferSource,);
//      _device.queue.writeBuffer(_dataUniformBuffer, 0, _dataUniformValues as GPUAllowSharedBufferSource,);
    };
//  };



    function moveCamera(newLookFrom: Vec3, newLookAt: Vec3, newViewUp: Vec3): void {
//  function moveCamera(newLookFrom: Vec3, newLookAt: Vec3, newViewUp: Vec3): void {
        stopRenderLoop();
//      stopRenderLoop();
        _lookFrom = newLookFrom;
//      _lookFrom = newLookFrom;
        _lookAt = newLookAt;
//      _lookAt = newLookAt;
        _viewUp = newViewUp;
//      _viewUp = newViewUp;
        _viewportW = _viewportH * _canvas.width / _canvas.height;
//      _viewportW = _viewportH * _canvas.width / _canvas.height;
        _fromPixelToPixelDeltaU = m.divide(_viewportU, _canvas.width ) as Vec3;
//      _fromPixelToPixelDeltaU = m.divide(_viewportU, _canvas.width ) as Vec3;
        _fromPixelToPixelDeltaV = m.divide(_viewportV, _canvas.height) as Vec3;
//      _fromPixelToPixelDeltaV = m.divide(_viewportV, _canvas.height) as Vec3;
        _device.queue.writeBuffer(_outputStorage, 0, new Float32Array(_canvas.width * _canvas.height * 4)); // image width * image height * 4 channels
//      _device.queue.writeBuffer(_outputStorage, 0, new Float32Array(_canvas.width * _canvas.height * 4)); // image width * image height * 4 channels
        startRenderLoop();
//      startRenderLoop();
    };
//  };



    const OnKeydown = async (keyboardEvent: KeyboardEvent): Promise<void> => {
//  const OnKeydown = async (keyboardEvent: KeyboardEvent): Promise<void> => {
        if (keyboardEvent.key === "1") {
//      if (keyboardEvent.key === "1") {
            tweenCamera([0.0, 0.0, +40.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
//          tweenCamera([0.0, 0.0, +40.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
        } else if (keyboardEvent.key === "2") {
//      } else if (keyboardEvent.key === "2") {
            tweenCamera([+28.284, 0.0, +28.284], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
//          tweenCamera([+28.284, 0.0, +28.284], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
        } else if (keyboardEvent.key === "3") {
//      } else if (keyboardEvent.key === "3") {
            tweenCamera([+40.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
//          tweenCamera([+40.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
        } else if (keyboardEvent.key === "4") {
//      } else if (keyboardEvent.key === "4") {
            tweenCamera([+28.284, 0.0, -28.284], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
//          tweenCamera([+28.284, 0.0, -28.284], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
        } else if (keyboardEvent.key === "5") {
//      } else if (keyboardEvent.key === "5") {
            tweenCamera([0.0, 0.0, -40.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
//          tweenCamera([0.0, 0.0, -40.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
        } else if (keyboardEvent.key === "6") {
//      } else if (keyboardEvent.key === "6") {
            tweenCamera([-28.284, 0.0, -28.284], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
//          tweenCamera([-28.284, 0.0, -28.284], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
        } else if (keyboardEvent.key === "7") {
//      } else if (keyboardEvent.key === "7") {
            tweenCamera([-40.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
//          tweenCamera([-40.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
        } else if (keyboardEvent.key === "8") {
//      } else if (keyboardEvent.key === "8") {
            tweenCamera([-28.284, 0.0, +28.284], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
//          tweenCamera([-28.284, 0.0, +28.284], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut);
        } else if (keyboardEvent.key === "9") {
//      } else if (keyboardEvent.key === "9") {
            tweenCamera([0.0, +40.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 1.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Sinusoidal.Out);
//          tweenCamera([0.0, +40.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 1.0], 1000, 1000, 1000, t.Easing.Quartic.InOut, t.Easing.Quartic.InOut, t.Easing.Sinusoidal.Out);
        }
//      }
    };
//  };



    function generalLoop(cpuTimeInMilliseconds: number): void {
//  function generalLoop(cpuTimeInMilliseconds: number): void {
        startCPUTimeMeasurement(_cpuTimeMeasurementGeneralLoop, cpuTimeInMilliseconds);
//      startCPUTimeMeasurement(_cpuTimeMeasurementGeneralLoop, cpuTimeInMilliseconds);
        if (_tweenCameraLookFrom) {
//      if (_tweenCameraLookFrom) {
            _tweenCameraLookFrom.update(cpuTimeInMilliseconds);
//          _tweenCameraLookFrom.update(cpuTimeInMilliseconds);
        }
//      }
        if (_tweenCameraLookAt) {
//      if (_tweenCameraLookAt) {
            _tweenCameraLookAt.update(cpuTimeInMilliseconds);
//          _tweenCameraLookAt.update(cpuTimeInMilliseconds);
        }
//      }
        if (_tweenCameraViewUp) {
//      if (_tweenCameraViewUp) {
            _tweenCameraViewUp.update(cpuTimeInMilliseconds);
//          _tweenCameraViewUp.update(cpuTimeInMilliseconds);
        }
//      }
        ceaseCPUTimeMeasurement(_cpuTimeMeasurementGeneralLoop);
//      ceaseCPUTimeMeasurement(_cpuTimeMeasurementGeneralLoop);
        requestAnimationFrame(generalLoop);
//      requestAnimationFrame(generalLoop);
    }
//  }
    requestAnimationFrame(generalLoop);
//  requestAnimationFrame(generalLoop);



    function tweenCamera(newLookFrom: Vec3, newLookAt: Vec3, newViewUp: Vec3, durationTweenLookFrom: number, durationTweenLookAt: number, durationTweenViewUp: number, easingFunctionTweenLookFrom: EasingFunction, easingFunctionTweenLookAt: EasingFunction, easingFunctionTweenViewUp: EasingFunction): void {
//  function tweenCamera(newLookFrom: Vec3, newLookAt: Vec3, newViewUp: Vec3, durationTweenLookFrom: number, durationTweenLookAt: number, durationTweenViewUp: number, easingFunctionTweenLookFrom: EasingFunction, easingFunctionTweenLookAt: EasingFunction, easingFunctionTweenViewUp: EasingFunction): void {
        if (!compareArrays(newLookFrom, _lookFrom, isEqual) && (!_tweenCameraLookFrom || !_tweenCameraLookFromIsBusy)) {
//      if (!compareArrays(newLookFrom, _lookFrom, isEqual) && (!_tweenCameraLookFrom || !_tweenCameraLookFromIsBusy)) {
            const lookFrom: Vec3 = _lookFrom;
//          const lookFrom: Vec3 = _lookFrom;
            _tweenCameraLookFrom = new t.Tween(lookFrom)
//          _tweenCameraLookFrom = new t.Tween(lookFrom)
                .to(newLookFrom, durationTweenLookFrom)
//              .to(newLookFrom, durationTweenLookFrom)
                .easing(easingFunctionTweenLookFrom)
//              .easing(easingFunctionTweenLookFrom)
                .onStart((object: Vec3): void => {
//              .onStart((object: Vec3): void => {
                    _tweenCameraLookFromIsBusy = true;
//                  _tweenCameraLookFromIsBusy = true;
                })
//              })
                .onUpdate((object: Vec3, elapsed: number): void => {
//              .onUpdate((object: Vec3, elapsed: number): void => {
                    moveCamera(object, _lookAt, _viewUp);
//                  moveCamera(object, _lookAt, _viewUp);
                })
//              })
                .onStop((object: Vec3): void => {
//              .onStop((object: Vec3): void => {
                    _tweenCameraLookFromIsBusy = false;
//                  _tweenCameraLookFromIsBusy = false;
                })
//              })
                .onComplete((object: Vec3): void => {
//              .onComplete((object: Vec3): void => {
                    _tweenCameraLookFromIsBusy = false;
//                  _tweenCameraLookFromIsBusy = false;
                })
//              })
                .start();
//              .start();
        }
//      }
        if (!compareArrays(newLookAt, _lookAt, isEqual) && (!_tweenCameraLookAt || !_tweenCameraLookAtIsBusy)) {
//      if (!compareArrays(newLookAt, _lookAt, isEqual) && (!_tweenCameraLookAt || !_tweenCameraLookAtIsBusy)) {
            const lookAt: Vec3 = _lookAt;
//          const lookAt: Vec3 = _lookAt;
            _tweenCameraLookAt = new t.Tween(lookAt)
//          _tweenCameraLookAt = new t.Tween(lookAt)
                .to(newLookAt, durationTweenLookAt)
//              .to(newLookAt, durationTweenLookAt)
                .easing(easingFunctionTweenLookAt)
//              .easing(easingFunctionTweenLookAt)
                .onStart((object: Vec3): void => {
//              .onStart((object: Vec3): void => {
                    _tweenCameraLookAtIsBusy = true;
//                  _tweenCameraLookAtIsBusy = true;
                })
//              })
                .onUpdate((object: Vec3, elapsed: number): void => {
//              .onUpdate((object: Vec3, elapsed: number): void => {
                    moveCamera(_lookFrom, object, _viewUp);
//                  moveCamera(_lookFrom, object, _viewUp);
                })
//              })
                .onStop((object: Vec3): void => {
//              .onStop((object: Vec3): void => {
                    _tweenCameraLookAtIsBusy = false;
//                  _tweenCameraLookAtIsBusy = false;
                })
//              })
                .onComplete((object: Vec3): void => {
//              .onComplete((object: Vec3): void => {
                    _tweenCameraLookAtIsBusy = false;
//                  _tweenCameraLookAtIsBusy = false;
                })
//              })
                .start();
//              .start();
        }
//      }
        if (!compareArrays(newViewUp, _viewUp, isEqual) && (!_tweenCameraViewUp || !_tweenCameraViewUpIsBusy)) {
//      if (!compareArrays(newViewUp, _viewUp, isEqual) && (!_tweenCameraViewUp || !_tweenCameraViewUpIsBusy)) {
            const viewUp: Vec3 = _viewUp;
//          const viewUp: Vec3 = _viewUp;
            _tweenCameraViewUp = new t.Tween(viewUp)
//          _tweenCameraViewUp = new t.Tween(viewUp)
                .to(newViewUp, durationTweenViewUp)
//              .to(newViewUp, durationTweenViewUp)
                .easing(easingFunctionTweenViewUp)
//              .easing(easingFunctionTweenViewUp)
                .onStart((object: Vec3): void => {
//              .onStart((object: Vec3): void => {
                    _tweenCameraViewUpIsBusy = true;
//                  _tweenCameraViewUpIsBusy = true;
                })
//              })
                .onUpdate((object: Vec3, elapsed: number): void => {
//              .onUpdate((object: Vec3, elapsed: number): void => {
                    moveCamera(_lookFrom, _lookAt, object);
//                  moveCamera(_lookFrom, _lookAt, object);
                })
//              })
                .onStop((object: Vec3): void => {
//              .onStop((object: Vec3): void => {
                    _tweenCameraViewUpIsBusy = false;
//                  _tweenCameraViewUpIsBusy = false;
                })
//              })
                .onComplete((object: Vec3): void => {
//              .onComplete((object: Vec3): void => {
                    _tweenCameraViewUpIsBusy = false;
//                  _tweenCameraViewUpIsBusy = false;
                })
//              })
                .start();
//              .start();
        }
//      }
    }
//  }



</script>

<!--<svelte:window on:keydown={OnKeydown} />-->
    <svelte:window on:keydown={OnKeydown} />
<!--<svelte:window on:keydown={OnKeydown} />-->

<!--<canvas class="large-elevate" bind:this={_canvas} width="860px" height="440px" style:width="860px" style:height="440px" style:display="block"></canvas>-->
    <canvas class="large-elevate" bind:this={_canvas} width="860px" height="440px" style:width="860px" style:height="440px" style:display="block"></canvas>
<!--<canvas class="large-elevate" bind:this={_canvas} width="860px" height="440px" style:width="860px" style:height="440px" style:display="block"></canvas>-->

<!--<span>{_cpuTimeMeasurementRenderLoop.fps}</span>-->
<!--<span>{_cpuTimeMeasurementRenderLoop.fps}</span>-->
<!--<span>{_cpuTimeMeasurementRenderLoop.fps}</span>-->

<!--<svelte:options runes={true}></svelte:options>-->
    <svelte:options runes={true}></svelte:options>
<!--<svelte:options runes={true}></svelte:options>-->
