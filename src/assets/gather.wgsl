    struct GeneralData
//  struct GeneralData
{
    canvasSize: vec2<u32>,
//  canvasSize: vec2<u32>,
    stratifiedSamplesPerPixel: f32,
//  stratifiedSamplesPerPixel: f32,
    inverseStratifiedSamplesPerPixel: f32,
//  inverseStratifiedSamplesPerPixel: f32,
    cameraCenter: vec3<f32>,
//  cameraCenter: vec3<f32>,
    pixelSamplesScale: f32,
//  pixelSamplesScale: f32,
    fromPixelToPixelDeltaU: vec3<f32>,
//  fromPixelToPixelDeltaU: vec3<f32>,
    stratifiedSampleX: f32,
//  stratifiedSampleX: f32,
    fromPixelToPixelDeltaV: vec3<f32>,
//  fromPixelToPixelDeltaV: vec3<f32>,
    stratifiedSampleY: f32,
//  stratifiedSampleY: f32,
    pixel00Coordinates: vec3<f32>,
//  pixel00Coordinates: vec3<f32>,
    backgroundType: u32,
//  backgroundType: u32,
    numberOfImages: u32,
//  numberOfImages: u32,
    timeInSeconds: f32,
//  timeInSeconds: f32,
    accumulatedSampleCount: u32,
//  accumulatedSampleCount: u32,
    defocusDiskRadiusU: vec3<f32>,
//  defocusDiskRadiusU: vec3<f32>,
    defocusDiskRadiusV: vec3<f32>,
//  defocusDiskRadiusV: vec3<f32>,
}

    @group(0) @binding(0) var<uniform> generalData: GeneralData;
//  @group(0) @binding(0) var<uniform> generalData: GeneralData;
    @group(0) @binding(1) var<storage, read_write> outputStorage: array<vec4<f32>>;
//  @group(0) @binding(1) var<storage, read_write> outputStorage: array<vec4<f32>>;
    @group(0) @binding(2) var outputTexture: texture_storage_2d<rgba32float, write>;
//  @group(0) @binding(2) var outputTexture: texture_storage_2d<rgba32float, write>;
    @group(0) @binding(3) var   blurTexture: texture_storage_2d<rgba32float, write>;
//  @group(0) @binding(3) var   blurTexture: texture_storage_2d<rgba32float, write>;

    @compute @workgroup_size(32, 32) fn main(@builtin(global_invocation_id) gid: vec3<u32>)
//  @compute @workgroup_size(32, 32) fn main(@builtin(global_invocation_id) gid: vec3<u32>)
{
    let pixelIndex: u32 = gid.y * generalData.canvasSize.x + gid.x;
//  let pixelIndex: u32 = gid.y * generalData.canvasSize.x + gid.x;
    /*
    let frameIndex: f32 = generalData.stratifiedSampleY * generalData.stratifiedSamplesPerPixel + generalData.stratifiedSampleX;
//  let frameIndex: f32 = generalData.stratifiedSampleY * generalData.stratifiedSamplesPerPixel + generalData.stratifiedSampleX;
    let frameCount: f32 = frameIndex + 1.0;
//  let frameCount: f32 = frameIndex + 1.0;
    let progressivePixelSamplesScale: f32 = 1.0 / frameCount;
//  let progressivePixelSamplesScale: f32 = 1.0 / frameCount;
    let pixelColor: vec4<f32> = outputStorage[pixelIndex] * progressivePixelSamplesScale;
//  let pixelColor: vec4<f32> = outputStorage[pixelIndex] * progressivePixelSamplesScale;
    textureStore(outputTexture, gid.xy, pixelColor);
//  textureStore(outputTexture, gid.xy, pixelColor);
    textureStore(  blurTexture, gid.xy, pixelColor);
//  textureStore(  blurTexture, gid.xy, pixelColor);
    */
    let pixelColor: vec4<f32> = outputStorage[pixelIndex];
//  let pixelColor: vec4<f32> = outputStorage[pixelIndex];
    textureStore(outputTexture, gid.xy, pixelColor);
//  textureStore(outputTexture, gid.xy, pixelColor);
    textureStore(  blurTexture, gid.xy, pixelColor);
//  textureStore(  blurTexture, gid.xy, pixelColor);
}
