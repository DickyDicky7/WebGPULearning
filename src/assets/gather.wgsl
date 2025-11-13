//  [0]=canvasWidth&Height:vec2<f32>+stratifiedSamplesPerPixel:f32+inverseStratifiedSamplesPerPixel:f32,
//  [0]=canvasWidth&Height:vec2<f32>+stratifiedSamplesPerPixel:f32+inverseStratifiedSamplesPerPixel:f32,
//  [1]=cameraCenter:vec3<f32>+pixelSamplesScale:f32,
//  [1]=cameraCenter:vec3<f32>+pixelSamplesScale:f32,
//  [2]=fromPixelToPixelDeltaU:vec3<f32>+stratifiedSampleX:f32,
//  [2]=fromPixelToPixelDeltaU:vec3<f32>+stratifiedSampleX:f32,
//  [3]=fromPixelToPixelDeltaV:vec3<f32>+stratifiedSampleY:f32,
//  [3]=fromPixelToPixelDeltaV:vec3<f32>+stratifiedSampleY:f32,
//  [4]=pixel00Coordinates:vec3<f32>+backgroundType:f32,
//  [4]=pixel00Coordinates:vec3<f32>+backgroundType:f32,
    @group(0) @binding(0) var<uniform> data: array<vec4<f32>, 5>;
//  @group(0) @binding(0) var<uniform> data: array<vec4<f32>, 5>;
    @group(0) @binding(1) var<storage, read_write> outputStorage: array<vec4<f32>>;
//  @group(0) @binding(1) var<storage, read_write> outputStorage: array<vec4<f32>>;
    @group(0) @binding(2) var outputTexture: texture_storage_2d<rgba32float, write>;
//  @group(0) @binding(2) var outputTexture: texture_storage_2d<rgba32float, write>;

    @compute @workgroup_size(32, 32) fn main(@builtin(global_invocation_id) gid: vec3<u32>)
//  @compute @workgroup_size(32, 32) fn main(@builtin(global_invocation_id) gid: vec3<u32>)
{
    let canvasSize: vec2<u32> = vec2<u32>(data[0].xy);
//  let canvasSize: vec2<u32> = vec2<u32>(data[0].xy);
    let stratifiedSamplesPerPixel: f32 = data[0].z;
//  let stratifiedSamplesPerPixel: f32 = data[0].z;
    let stratifiedSampleX: f32 = data[2].w;
//  let stratifiedSampleX: f32 = data[2].w;
    let stratifiedSampleY: f32 = data[3].w;
//  let stratifiedSampleY: f32 = data[3].w;
    let progressivePixelSamplesScale: f32 = 1.0 / (stratifiedSampleY * stratifiedSamplesPerPixel + stratifiedSampleX + 1.0); // 1.0 / frameCount
//  let progressivePixelSamplesScale: f32 = 1.0 / (stratifiedSampleY * stratifiedSamplesPerPixel + stratifiedSampleX + 1.0); // 1.0 / frameCount
    textureStore(outputTexture, vec2<u32>(gid.xy), outputStorage[gid.y * canvasSize.x + gid.x] * progressivePixelSamplesScale);
//  textureStore(outputTexture, vec2<u32>(gid.xy), outputStorage[gid.y * canvasSize.x + gid.x] * progressivePixelSamplesScale);
}
