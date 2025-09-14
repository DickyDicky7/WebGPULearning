    const BACKGROUND_TYPE_SKY_BOX_BLUE: u32 = 0u;
//  const BACKGROUND_TYPE_SKY_BOX_BLUE: u32 = 0u;
    const BACKGROUND_TYPE_SKY_BOX_DARK: u32 = 1u;
//  const BACKGROUND_TYPE_SKY_BOX_DARK: u32 = 1u;
    const BACKGROUND_TYPE_SKY_BOX_HDRI: u32 = 2u;
//  const BACKGROUND_TYPE_SKY_BOX_HDRI: u32 = 2u;

    const MATERIAL_TYPE_DIFFUSE   : u32 = 0u;
//  const MATERIAL_TYPE_DIFFUSE   : u32 = 0u;
    const MATERIAL_TYPE_METAL     : u32 = 1u;
//  const MATERIAL_TYPE_METAL     : u32 = 1u;
    const MATERIAL_TYPE_GLOSS     : u32 = 2u;
//  const MATERIAL_TYPE_GLOSS     : u32 = 2u;
    const MATERIAL_TYPE_DIELECTRIC: u32 = 3u;
//  const MATERIAL_TYPE_DIELECTRIC: u32 = 3u;
    const MATERIAL_TYPE_LIGHT     : u32 = 4u;
//  const MATERIAL_TYPE_LIGHT     : u32 = 4u;

    const REFRACTIVE_INDEX_DEFAULT: u32 = 0u;
//  const REFRACTIVE_INDEX_DEFAULT: u32 = 0u;
    const REFRACTIVE_INDEX_NOTHING: u32 = 1u;
//  const REFRACTIVE_INDEX_NOTHING: u32 = 1u;
    const REFRACTIVE_INDEX_AIR    : u32 = 2u;
//  const REFRACTIVE_INDEX_AIR    : u32 = 2u;
    const REFRACTIVE_INDEX_WATER  : u32 = 3u;
//  const REFRACTIVE_INDEX_WATER  : u32 = 3u;
    const REFRACTIVE_INDEX_SKIN   : u32 = 4u;
//  const REFRACTIVE_INDEX_SKIN   : u32 = 4u;
    const REFRACTIVE_INDEX_GLASS  : u32 = 5u;
//  const REFRACTIVE_INDEX_GLASS  : u32 = 5u;
    const REFRACTIVE_INDEX_MARBLE : u32 = 6u;
//  const REFRACTIVE_INDEX_MARBLE : u32 = 6u;
    const REFRACTIVE_INDEX_DIAMOND: u32 = 7u;
//  const REFRACTIVE_INDEX_DIAMOND: u32 = 7u;

    const TEXTURE_TYPE_COLOR: u32 = 0u;
//  const TEXTURE_TYPE_COLOR: u32 = 0u;
    const TEXTURE_TYPE_IMAGE: u32 = 1u;
//  const TEXTURE_TYPE_IMAGE: u32 = 1u;

    const refractiveIndices: array<f32, 8> = array<f32, 8>(
//  const refractiveIndices: array<f32, 8> = array<f32, 8>(
        0.000000,
//      0.000000,
        1.000000,
//      1.000000,
        1.000293,
//      1.000293,
        1.333000,
//      1.333000,
        1.400000,
//      1.400000,
        1.500000,
//      1.500000,
        1.550000,
//      1.550000,
        2.400000,
//      2.400000,
    );

    struct Ray
//  struct Ray
{
    origin: vec3<f32>,
//  origin: vec3<f32>,
    direction: vec3<f32>,
//  direction: vec3<f32>,
};

    struct Sphere
//  struct Sphere
{
    center: vec3<f32>,
//  center: vec3<f32>,
    radius: f32,
//  radius: f32,
    materialIndex: u32,
//  materialIndex: u32,
    _pad: vec2<u32>,
//  _pad: vec2<u32>,
};

    struct RayHitResult
//  struct RayHitResult
{
    at: vec3<f32>,
//  at: vec3<f32>,
    hittedSideNormal: vec3<f32>,
//  hittedSideNormal: vec3<f32>,
    uvSurfaceCoordinate: vec2<f32>,
//  uvSurfaceCoordinate: vec2<f32>,
    minDistance: f32,
//  minDistance: f32,
    isHitted: bool,
//  isHitted: bool,
    isFrontFaceHitted: bool,
//  isFrontFaceHitted: bool,
    materialIndex: u32,
//  materialIndex: u32,
};

    struct MaterialLightScatteringResult
//  struct MaterialLightScatteringResult
{
    scatteredRay: Ray,
//  scatteredRay: Ray,
    attenuation: vec3<f32>,
//  attenuation: vec3<f32>,
    emission: vec3<f32>,
//  emission: vec3<f32>,
    isScattered: bool,
//  isScattered: bool,
};

    struct Material
//  struct Material
{
    layer1Roughness: f32,
//  layer1Roughness: f32,
    layer1Thickness: f32,
//  layer1Thickness: f32,
    layer0IOR: f32,
//  layer0IOR: f32,
    layer1IOR: f32,
//  layer1IOR: f32,
    textureIndex: u32,
//  textureIndex: u32,
    materialType: u32,
//  materialType: u32,
    _pad: vec2<u32>,
//  _pad: vec2<u32>,
};

    @group(0) @binding(3) var<storage, read> materials: array<Material>;
//  @group(0) @binding(3) var<storage, read> materials: array<Material>;

    struct Interval
//  struct Interval
{
    min: f32,
//  min: f32,
    max: f32,
//  max: f32,
};

    fn _intervalContain (interval: Interval, value: f32) -> bool { return interval.min <= value && value <= interval.max; }
//  fn _intervalContain (interval: Interval, value: f32) -> bool { return interval.min <= value && value <= interval.max; }
    fn _intervalSurround(interval: Interval, value: f32) -> bool { return interval.min <  value && value <  interval.max; }
//  fn _intervalSurround(interval: Interval, value: f32) -> bool { return interval.min <  value && value <  interval.max; }

    struct Texture
//  struct Texture
{
    albedo: vec3<f32>,
//  albedo: vec3<f32>,
    imageIndex: u32,
//  imageIndex: u32,
    textureType: u32,
//  textureType: u32,
    _pad: vec2<u32>,
//  _pad: vec2<u32>,
};

    const      PI: f32 = 3.1415926535897930; // 1*π
//  const      PI: f32 = 3.1415926535897930; // 1*π
    const TAU    : f32 = 6.2831853071795860; // 2*π
//  const TAU    : f32 = 6.2831853071795860; // 2*π
    const HALF_PI: f32 = 1.5707963267948966; // π/2
//  const HALF_PI: f32 = 1.5707963267948966; // π/2

    fn _lengthSquared(value: vec3<f32>) -> f32
//  fn _lengthSquared(value: vec3<f32>) -> f32
{
    return dot(value, value);
//  return dot(value, value);
};

    @group(0) @binding(2) var<storage, read> spheres: array<Sphere>;
//  @group(0) @binding(2) var<storage, read> spheres: array<Sphere>;

    fn _rayHitSphere(ray: Ray, sphere: Sphere, rayDistanceLimit: Interval) -> RayHitResult
//  fn _rayHitSphere(ray: Ray, sphere: Sphere, rayDistanceLimit: Interval) -> RayHitResult
{
    let fromSphereCenterToRayOrigin: vec3<f32> = sphere.center - ray.origin;
//  let fromSphereCenterToRayOrigin: vec3<f32> = sphere.center - ray.origin;
    let a: f32 = _lengthSquared(ray.direction);
//  let a: f32 = _lengthSquared(ray.direction);
    let h: f32 = dot(ray.direction, fromSphereCenterToRayOrigin);
//  let h: f32 = dot(ray.direction, fromSphereCenterToRayOrigin);
    let c: f32 = _lengthSquared(fromSphereCenterToRayOrigin) - sphere.radius * sphere.radius;
//  let c: f32 = _lengthSquared(fromSphereCenterToRayOrigin) - sphere.radius * sphere.radius;
    let discriminant: f32 = h * h - a * c;
//  let discriminant: f32 = h * h - a * c;
    var rayHitResult: RayHitResult;
//  var rayHitResult: RayHitResult;
    rayHitResult.materialIndex = sphere.materialIndex;
//  rayHitResult.materialIndex = sphere.materialIndex;
    if (discriminant < 0.0)
//  if (discriminant < 0.0)
    {
        rayHitResult.isHitted = false;
//      rayHitResult.isHitted = false;
    }
    else
//  else
    {
        let sqrtDiscriminant: f32 = sqrt(discriminant);
//      let sqrtDiscriminant: f32 = sqrt(discriminant);

        var t: f32 = (h - sqrtDiscriminant) / a;
//      var t: f32 = (h - sqrtDiscriminant) / a;

        if (!_intervalSurround(rayDistanceLimit, t))
//      if (!_intervalSurround(rayDistanceLimit, t))
        {
            t = (h + sqrtDiscriminant) / a;
//          t = (h + sqrtDiscriminant) / a;

            if (!_intervalSurround(rayDistanceLimit, t))
//          if (!_intervalSurround(rayDistanceLimit, t))
            {
                rayHitResult.isHitted = false;
//              rayHitResult.isHitted = false;
                return rayHitResult;
//              return rayHitResult;
            }
        }

        rayHitResult.isHitted = true;
//      rayHitResult.isHitted = true;

        rayHitResult.minDistance = t;
//      rayHitResult.minDistance = t;

        rayHitResult.at = _rayMarch(ray, rayHitResult.minDistance);
//      rayHitResult.at = _rayMarch(ray, rayHitResult.minDistance);

        let outwardNormal: vec3<f32> = (rayHitResult.at - sphere.center) / sphere.radius;
//      let outwardNormal: vec3<f32> = (rayHitResult.at - sphere.center) / sphere.radius;

        rayHitResult.isFrontFaceHitted = dot(ray.direction, outwardNormal) < 0.0;
//      rayHitResult.isFrontFaceHitted = dot(ray.direction, outwardNormal) < 0.0;
        if (rayHitResult.isFrontFaceHitted)
//      if (rayHitResult.isFrontFaceHitted)
        {
            rayHitResult.hittedSideNormal =  outwardNormal;
//          rayHitResult.hittedSideNormal =  outwardNormal;
        }
        else
//      else
        {
            rayHitResult.hittedSideNormal = -outwardNormal;
//          rayHitResult.hittedSideNormal = -outwardNormal;
        }

        let theta: f32 = acos (-outwardNormal.y); // latitude
//      let theta: f32 = acos (-outwardNormal.y); // latitude
        let phi  : f32 = atan2(-outwardNormal.z, outwardNormal.x) + PI; // longitude
//      let phi  : f32 = atan2(-outwardNormal.z, outwardNormal.x) + PI; // longitude

        rayHitResult.uvSurfaceCoordinate = vec2<f32>(phi / (2.0 * PI), theta / PI);
//      rayHitResult.uvSurfaceCoordinate = vec2<f32>(phi / (2.0 * PI), theta / PI);    
    }

    return rayHitResult;
//  return rayHitResult;
};

    fn _rayHitSpheres(ray: Ray, rayDistanceLimit: Interval) -> RayHitResult
//  fn _rayHitSpheres(ray: Ray, rayDistanceLimit: Interval) -> RayHitResult
{
    let numberOfSpheres: u32 = arrayLength(&spheres);
//  let numberOfSpheres: u32 = arrayLength(&spheres);
    var finalRayHitResult: RayHitResult;
//  var finalRayHitResult: RayHitResult;
    var closestRayDistanceSoFar: f32 = rayDistanceLimit.max;
//  var closestRayDistanceSoFar: f32 = rayDistanceLimit.max;
    for (var sphereIndex: u32 = 0u; sphereIndex < numberOfSpheres; sphereIndex++)
//  for (var sphereIndex: u32 = 0u; sphereIndex < numberOfSpheres; sphereIndex++)
    {
        let sphere: Sphere = spheres[sphereIndex];
//      let sphere: Sphere = spheres[sphereIndex];
        let temporaryRayHitResult: RayHitResult = _rayHitSphere(ray, sphere, Interval(rayDistanceLimit.min, closestRayDistanceSoFar));
//      let temporaryRayHitResult: RayHitResult = _rayHitSphere(ray, sphere, Interval(rayDistanceLimit.min, closestRayDistanceSoFar));
        if (temporaryRayHitResult.isHitted)
//      if (temporaryRayHitResult.isHitted)
        {
            finalRayHitResult = temporaryRayHitResult;
//          finalRayHitResult = temporaryRayHitResult;
            closestRayDistanceSoFar = temporaryRayHitResult.minDistance;
//          closestRayDistanceSoFar = temporaryRayHitResult.minDistance;
        }
    }
    return finalRayHitResult;
//  return finalRayHitResult;
};

    fn _rayScatter(incomingRay: Ray, recentRayHitResult: RayHitResult, rng: ptr<function, RNG>) -> MaterialLightScatteringResult
//  fn _rayScatter(incomingRay: Ray, recentRayHitResult: RayHitResult, rng: ptr<function, RNG>) -> MaterialLightScatteringResult
{
    var materialLightScatteringResult: MaterialLightScatteringResult;
//  var materialLightScatteringResult: MaterialLightScatteringResult;
    let material: Material = materials[recentRayHitResult.materialIndex];
//  let material: Material = materials[recentRayHitResult.materialIndex];
    switch (material.materialType)
//  switch (material.materialType)
    {
        case MATERIAL_TYPE_DIFFUSE:
//      case MATERIAL_TYPE_DIFFUSE:
        {

        }
        case MATERIAL_TYPE_METAL:
//      case MATERIAL_TYPE_METAL:
        {

        }
        case MATERIAL_TYPE_GLOSS:
//      case MATERIAL_TYPE_GLOSS:
        {

        }
        case MATERIAL_TYPE_DIELECTRIC:
//      case MATERIAL_TYPE_DIELECTRIC:
        {

        }
        case MATERIAL_TYPE_LIGHT:
//      case MATERIAL_TYPE_LIGHT:
        {

        }
        default:
//      default:
        {

        }
    }
    return materialLightScatteringResult;
//  return materialLightScatteringResult;
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

    struct RNG
//  struct RNG
{
    state: u32,
//  state: u32,
};

    fn _pcg32Next(rng: ptr<function, RNG>) -> f32
//  fn _pcg32Next(rng: ptr<function, RNG>) -> f32
{
    // Advance LCG state (PCG parameters)
    // Advance LCG state (PCG parameters)
    let old: u32 = (*rng).state;
//  let old: u32 = (*rng).state;
    (*rng).state = old * 747796405u + 2891336453u;
//  (*rng).state = old * 747796405u + 2891336453u;

    // Output permutation (PCG XSH RR)
    // Output permutation (PCG XSH RR)
    var x: u32 = ((old >> ((old >> 28u) + 4u)) ^ old) * 277803737u;
//  var x: u32 = ((old >> ((old >> 28u) + 4u)) ^ old) * 277803737u;
    x = (x >> 22u) ^ x;
//  x = (x >> 22u) ^ x;

    // Convert to float in [0,1)
    // Convert to float in [0,1)
    return f32(x) / 4294967296.0; // divide by 2^32
//  return f32(x) / 4294967296.0; // divide by 2^32
}

    fn _reflect(incomingVector: vec3<f32>, normal: vec3<f32>) -> vec3<f32> { return incomingVector - 2.0 * dot(incomingVector, normal) * normal; }
//  fn _reflect(incomingVector: vec3<f32>, normal: vec3<f32>) -> vec3<f32> { return incomingVector - 2.0 * dot(incomingVector, normal) * normal; }

    fn _refract(incomingVector: vec3<f32>, normal: vec3<f32>, ratioOfEtaiOverEtat: f32) -> vec3<f32>
//  fn _refract(incomingVector: vec3<f32>, normal: vec3<f32>, ratioOfEtaiOverEtat: f32) -> vec3<f32>
    {
        let cosTheta: f32 = min(dot(-incomingVector, normal), 1.0);
//      let cosTheta: f32 = min(dot(-incomingVector, normal), 1.0);
        let refractedRayPerpendicular: vec3<f32> = ratioOfEtaiOverEtat * (incomingVector + cosTheta * normal);
//      let refractedRayPerpendicular: vec3<f32> = ratioOfEtaiOverEtat * (incomingVector + cosTheta * normal);
        let refractedRayParallel: vec3<f32> = -sqrt(abs(1.0 - _lengthSquared(refractedRayPerpendicular))) * normal;
//      let refractedRayParallel: vec3<f32> = -sqrt(abs(1.0 - _lengthSquared(refractedRayPerpendicular))) * normal;
        return refractedRayPerpendicular + refractedRayParallel;
//      return refractedRayPerpendicular + refractedRayParallel;
    }
