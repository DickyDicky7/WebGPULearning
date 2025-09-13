    struct Ray
//  struct Ray
{
    origin: vec3<f32>,
//  origin: vec3<f32>,
    direction: vec3<f32>,
//  direction: vec3<f32>,
};

    fn _rayMarch(ray: Ray, distance: f32) -> vec3<f32>
//  fn _rayMarch(ray: Ray, distance: f32) -> vec3<f32>
{
    return ray.origin + ray.direction * distance;
//  return ray.origin + ray.direction * distance;
};

    fn _rayColor(ray: Ray) -> vec3<f32>
//  fn _rayColor(ray: Ray) -> vec3<f32>
{
    let unitDirection: vec3<f32> = normalize(ray.direction);
//  let unitDirection: vec3<f32> = normalize(ray.direction);
    let ratio: f32 = 0.5 * (unitDirection.y + 1.0);
//  let ratio: f32 = 0.5 * (unitDirection.y + 1.0);
    return (1.0 - ratio) * vec3<f32>(1.0, 1.0, 1.0) + ratio * vec3<f32>(0.5, 0.7, 1.0);
//  return (1.0 - ratio) * vec3<f32>(1.0, 1.0, 1.0) + ratio * vec3<f32>(0.5, 0.7, 1.0);
};

//  cameraCenter:vec3<f32>+padding<f32>, pixelDeltaU:vec3<f32>+padding<f32>, pixelDeltaV:vec3<f32>+padding<f32>, pixel00Loc:vec3<f32>+padding<f32>, canvasWidth&Height:vec2<f32>+padding<f32>+padding<f32>
//  cameraCenter:vec3<f32>+padding<f32>, pixelDeltaU:vec3<f32>+padding<f32>, pixelDeltaV:vec3<f32>+padding<f32>, pixel00Loc:vec3<f32>+padding<f32>, canvasWidth&Height:vec2<f32>+padding<f32>+padding<f32>
    @group(0) @binding(0) var<storage, read> data: array<vec4<f32>, 5>;
//  @group(0) @binding(0) var<storage, read> data: array<vec4<f32>, 5>;
    @group(0) @binding(1) var outputTexture: texture_storage_2d<rgba8unorm, write>;
//  @group(0) @binding(1) var outputTexture: texture_storage_2d<rgba8unorm, write>;

    @compute @workgroup_size(16, 16) fn main(@builtin(global_invocation_id) gid: vec3<u32>)
//  @compute @workgroup_size(16, 16) fn main(@builtin(global_invocation_id) gid: vec3<u32>)
{
    let canvasSize: vec2<u32> = vec2<u32>(data[4].xy);
//  let canvasSize: vec2<u32> = vec2<u32>(data[4].xy);

    if (gid.x >= canvasSize.x || gid.y >= canvasSize.y)
//  if (gid.x >= canvasSize.x || gid.y >= canvasSize.y)
    {
        return;
//      return;
    }

    let cameraCenter: vec3<f32> = data[0].xyz;
//  let cameraCenter: vec3<f32> = data[0].xyz;
    let pixelDeltaU : vec3<f32> = data[1].xyz;
//  let pixelDeltaU : vec3<f32> = data[1].xyz;
    let pixelDeltaV : vec3<f32> = data[2].xyz;
//  let pixelDeltaV : vec3<f32> = data[2].xyz;
    let pixel00Loc  : vec3<f32> = data[3].xyz;
//  let pixel00Loc  : vec3<f32> = data[3].xyz;

    let pixelCenter : vec3<f32> = pixel00Loc + (f32(gid.x) * pixelDeltaU) + (f32(gid.y) * pixelDeltaV);
//  let pixelCenter : vec3<f32> = pixel00Loc + (f32(gid.x) * pixelDeltaU) + (f32(gid.y) * pixelDeltaV);
    let rayDirection: vec3<f32> = normalize(pixelCenter - cameraCenter);
//  let rayDirection: vec3<f32> = normalize(pixelCenter - cameraCenter);

    let ray: Ray = Ray(cameraCenter, rayDirection);
//  let ray: Ray = Ray(cameraCenter, rayDirection);
    let pixelColor: vec4<f32> = vec4<f32>(_rayColor(ray), 1.0);
//  let pixelColor: vec4<f32> = vec4<f32>(_rayColor(ray), 1.0);

    textureStore(outputTexture, vec2<u32>(gid.xy), pixelColor);
//  textureStore(outputTexture, vec2<u32>(gid.xy), pixelColor);
};
