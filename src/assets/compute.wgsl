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

    const TEXTURE_TYPE_COLOR: u32 = 0u;
//  const TEXTURE_TYPE_COLOR: u32 = 0u;
    const TEXTURE_TYPE_IMAGE: u32 = 1u;
//  const TEXTURE_TYPE_IMAGE: u32 = 1u;
    const TEXTURE_TYPE_CHECKER_STYLE_A: u32 = 2u;
//  const TEXTURE_TYPE_CHECKER_STYLE_A: u32 = 2u;
    const TEXTURE_TYPE_CHECKER_STYLE_B: u32 = 3u;
//  const TEXTURE_TYPE_CHECKER_STYLE_B: u32 = 3u;

    struct Ray
//  struct Ray
{
    origin: vec3<f32>,
//  origin: vec3<f32>,
    direction: vec3<f32>,
//  direction: vec3<f32>,
}

    struct Sphere
//  struct Sphere
{
    center: vec3<f32>,
//  center: vec3<f32>,
    radius: f32,
//  radius: f32,
    materialIndex: u32,
//  materialIndex: u32,
}

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
}

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
}

    struct Material
//  struct Material
{
    layer1Roughness: f32,
//  layer1Roughness: f32,
    layer0IOR: f32,
//  layer0IOR: f32,
    layer1IOR: f32,
//  layer1IOR: f32,
    textureIndex: u32,
//  textureIndex: u32,
    materialType: u32,
//  materialType: u32,
}

    struct Interval
//  struct Interval
{
    min: f32,
//  min: f32,
    max: f32,
//  max: f32,
}

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
    scale: f32,
//  scale: f32,
    oTileTextureIndex: u32,
//  oTileTextureIndex: u32,
    eTileTextureIndex: u32,
//  eTileTextureIndex: u32,
}

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
}

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
}

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
}

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
            materialLightScatteringResult.scatteredRay.origin = recentRayHitResult.at;
//          materialLightScatteringResult.scatteredRay.origin = recentRayHitResult.at;
            materialLightScatteringResult.scatteredRay.direction = normalize(recentRayHitResult.hittedSideNormal + _generateRandomUnitVector(rng));
//          materialLightScatteringResult.scatteredRay.direction = normalize(recentRayHitResult.hittedSideNormal + _generateRandomUnitVector(rng));
            materialLightScatteringResult.attenuation = _textureSample(material.textureIndex, recentRayHitResult.uvSurfaceCoordinate, recentRayHitResult.at);
//          materialLightScatteringResult.attenuation = _textureSample(material.textureIndex, recentRayHitResult.uvSurfaceCoordinate, recentRayHitResult.at);
            materialLightScatteringResult.emission = vec3<f32>(0.0, 0.0, 0.0);
//          materialLightScatteringResult.emission = vec3<f32>(0.0, 0.0, 0.0);
            materialLightScatteringResult.isScattered = true;
//          materialLightScatteringResult.isScattered = true;
        }
        case MATERIAL_TYPE_METAL:
//      case MATERIAL_TYPE_METAL:
        {
            materialLightScatteringResult.scatteredRay.origin = recentRayHitResult.at;
//          materialLightScatteringResult.scatteredRay.origin = recentRayHitResult.at;
            materialLightScatteringResult.scatteredRay.direction = _reflect(incomingRay.direction, recentRayHitResult.hittedSideNormal);
//          materialLightScatteringResult.scatteredRay.direction = _reflect(incomingRay.direction, recentRayHitResult.hittedSideNormal);
            materialLightScatteringResult.attenuation = _textureSample(material.textureIndex, recentRayHitResult.uvSurfaceCoordinate, recentRayHitResult.at);
//          materialLightScatteringResult.attenuation = _textureSample(material.textureIndex, recentRayHitResult.uvSurfaceCoordinate, recentRayHitResult.at);
            materialLightScatteringResult.emission = vec3<f32>(0.0, 0.0, 0.0);
//          materialLightScatteringResult.emission = vec3<f32>(0.0, 0.0, 0.0);
            materialLightScatteringResult.isScattered = true;
//          materialLightScatteringResult.isScattered = true;
        }
        case MATERIAL_TYPE_GLOSS:
//      case MATERIAL_TYPE_GLOSS:
        {
            var ratioOfEtaiOverEtat: f32 = material.layer1IOR / material.layer0IOR;
//          var ratioOfEtaiOverEtat: f32 = material.layer1IOR / material.layer0IOR;

            let cosThetaIncident: f32 = min(dot(-incomingRay.direction, recentRayHitResult.hittedSideNormal), 1.0);
//          let cosThetaIncident: f32 = min(dot(-incomingRay.direction, recentRayHitResult.hittedSideNormal), 1.0);

            if (recentRayHitResult.isFrontFaceHitted)
//          if (recentRayHitResult.isFrontFaceHitted)
            {
                ratioOfEtaiOverEtat = 1.0 / ratioOfEtaiOverEtat;
//              ratioOfEtaiOverEtat = 1.0 / ratioOfEtaiOverEtat;
            }
        
            let reflectanceProbability: f32 = _reflectance(cosThetaIncident, ratioOfEtaiOverEtat);
//          let reflectanceProbability: f32 = _reflectance(cosThetaIncident, ratioOfEtaiOverEtat);

            var scatteredDirection: vec3<f32>; var attenuationColor: vec3<f32>;
//          var scatteredDirection: vec3<f32>; var attenuationColor: vec3<f32>;

            materialLightScatteringResult.isScattered = true;
//          materialLightScatteringResult.isScattered = true;

            if (_pcg32Next(rng) < reflectanceProbability)
//          if (_pcg32Next(rng) < reflectanceProbability)
            {
                scatteredDirection = normalize(_reflect(incomingRay.direction, recentRayHitResult.hittedSideNormal) + material.layer1Roughness * _generateRandomUnitVector(rng));
//              scatteredDirection = normalize(_reflect(incomingRay.direction, recentRayHitResult.hittedSideNormal) + material.layer1Roughness * _generateRandomUnitVector(rng));
                if (dot(scatteredDirection, recentRayHitResult.hittedSideNormal) <= 0.0)
//              if (dot(scatteredDirection, recentRayHitResult.hittedSideNormal) <= 0.0)
                {
                    materialLightScatteringResult.isScattered = false;
//                  materialLightScatteringResult.isScattered = false;
                }
                attenuationColor = vec3<f32>(1.0, 1.0, 1.0);
//              attenuationColor = vec3<f32>(1.0, 1.0, 1.0);
            }
            else
//          else
            {
                scatteredDirection = normalize(recentRayHitResult.hittedSideNormal + _generateRandomUnitVector(rng));
//              scatteredDirection = normalize(recentRayHitResult.hittedSideNormal + _generateRandomUnitVector(rng));
                attenuationColor = _textureSample(material.textureIndex, recentRayHitResult.uvSurfaceCoordinate, recentRayHitResult.at);
//              attenuationColor = _textureSample(material.textureIndex, recentRayHitResult.uvSurfaceCoordinate, recentRayHitResult.at);
            }

            if (materialLightScatteringResult.isScattered)
//          if (materialLightScatteringResult.isScattered)
            {
                materialLightScatteringResult.scatteredRay.origin = recentRayHitResult.at;
//              materialLightScatteringResult.scatteredRay.origin = recentRayHitResult.at;
                materialLightScatteringResult.scatteredRay.direction = scatteredDirection;
//              materialLightScatteringResult.scatteredRay.direction = scatteredDirection;
                materialLightScatteringResult.attenuation = attenuationColor;
//              materialLightScatteringResult.attenuation = attenuationColor;
            }
            else
//          else
            {
                materialLightScatteringResult.attenuation = vec3<f32>(0.0, 0.0, 0.0);
//              materialLightScatteringResult.attenuation = vec3<f32>(0.0, 0.0, 0.0);
            }
            materialLightScatteringResult.emission = vec3<f32>(0.0, 0.0, 0.0);
//          materialLightScatteringResult.emission = vec3<f32>(0.0, 0.0, 0.0);
        }
        case MATERIAL_TYPE_DIELECTRIC:
//      case MATERIAL_TYPE_DIELECTRIC:
        {
            let diffuseRayDirection: vec3<f32> = normalize(recentRayHitResult.hittedSideNormal + _generateRandomUnitVector(rng));
//          let diffuseRayDirection: vec3<f32> = normalize(recentRayHitResult.hittedSideNormal + _generateRandomUnitVector(rng));

            var ratioOfEtaiOverEtat: f32 = material.layer1IOR / material.layer0IOR;
//          var ratioOfEtaiOverEtat: f32 = material.layer1IOR / material.layer0IOR;
            if (recentRayHitResult.isFrontFaceHitted) { ratioOfEtaiOverEtat = material.layer0IOR / material.layer1IOR; }
//          if (recentRayHitResult.isFrontFaceHitted) { ratioOfEtaiOverEtat = material.layer0IOR / material.layer1IOR; }

            let cosTheta: f32 = min(dot(-incomingRay.direction, recentRayHitResult.hittedSideNormal), 1.0);
//          let cosTheta: f32 = min(dot(-incomingRay.direction, recentRayHitResult.hittedSideNormal), 1.0);
            let sinTheta: f32 = sqrt(1.0 - cosTheta * cosTheta);
//          let sinTheta: f32 = sqrt(1.0 - cosTheta * cosTheta);
            let notAbleToRefract: bool = sinTheta * ratioOfEtaiOverEtat > 1.0 || _reflectance(cosTheta, ratioOfEtaiOverEtat) > _pcg32Next(rng);
//          let notAbleToRefract: bool = sinTheta * ratioOfEtaiOverEtat > 1.0 || _reflectance(cosTheta, ratioOfEtaiOverEtat) > _pcg32Next(rng);
            var scatteredRayDirection: vec3<f32>;
//          var scatteredRayDirection: vec3<f32>;

            if (notAbleToRefract)
//          if (notAbleToRefract)
            {
                 scatteredRayDirection = mix(_reflect(incomingRay.direction, recentRayHitResult.hittedSideNormal), diffuseRayDirection, material.layer1Roughness);
//               scatteredRayDirection = mix(_reflect(incomingRay.direction, recentRayHitResult.hittedSideNormal), diffuseRayDirection, material.layer1Roughness);
            }
            else
//          else
            {
                 scatteredRayDirection = mix(_refract(incomingRay.direction, recentRayHitResult.hittedSideNormal, ratioOfEtaiOverEtat), -diffuseRayDirection, material.layer1Roughness);
//               scatteredRayDirection = mix(_refract(incomingRay.direction, recentRayHitResult.hittedSideNormal, ratioOfEtaiOverEtat), -diffuseRayDirection, material.layer1Roughness);
            }

            materialLightScatteringResult.scatteredRay.origin = recentRayHitResult.at;
//          materialLightScatteringResult.scatteredRay.origin = recentRayHitResult.at;
            materialLightScatteringResult.scatteredRay.direction = normalize(scatteredRayDirection);
//          materialLightScatteringResult.scatteredRay.direction = normalize(scatteredRayDirection);
            materialLightScatteringResult.attenuation = _textureSample(material.textureIndex, recentRayHitResult.uvSurfaceCoordinate, recentRayHitResult.at);
//          materialLightScatteringResult.attenuation = _textureSample(material.textureIndex, recentRayHitResult.uvSurfaceCoordinate, recentRayHitResult.at);
            materialLightScatteringResult.emission = vec3<f32>(0.0, 0.0, 0.0);
//          materialLightScatteringResult.emission = vec3<f32>(0.0, 0.0, 0.0);
            materialLightScatteringResult.isScattered = true;
//          materialLightScatteringResult.isScattered = true;

/*
            // Absorption
            // Absorption
            if (!recentRayHitResult.isFrontFaceHitted)
//          if (!recentRayHitResult.isFrontFaceHitted)
            {
                materialLightScatteringResult.attenuation *= vec3<f32>
//              materialLightScatteringResult.attenuation *= vec3<f32>
                (
                    exp(-recentRayHitResult.minDistance * 1.0),
                    exp(-recentRayHitResult.minDistance * 1.0),
                    exp(-recentRayHitResult.minDistance * 1.0),
                );
            }
*/
        }
        case MATERIAL_TYPE_LIGHT:
//      case MATERIAL_TYPE_LIGHT:
        {
            materialLightScatteringResult.scatteredRay.origin = vec3<f32>(0.0, 0.0, 0.0);
//          materialLightScatteringResult.scatteredRay.origin = vec3<f32>(0.0, 0.0, 0.0);
            materialLightScatteringResult.scatteredRay.direction = vec3<f32>(0.0, 0.0, 0.0);
//          materialLightScatteringResult.scatteredRay.direction = vec3<f32>(0.0, 0.0, 0.0);
            materialLightScatteringResult.attenuation = vec3<f32>(0.0, 0.0, 0.0);
//          materialLightScatteringResult.attenuation = vec3<f32>(0.0, 0.0, 0.0);
            materialLightScatteringResult.emission = _textureSample(material.textureIndex, recentRayHitResult.uvSurfaceCoordinate, recentRayHitResult.at);
//          materialLightScatteringResult.emission = _textureSample(material.textureIndex, recentRayHitResult.uvSurfaceCoordinate, recentRayHitResult.at);
            materialLightScatteringResult.isScattered = false;
//          materialLightScatteringResult.isScattered = false;
        }
        default:
//      default:
        {

        }
    }
    return materialLightScatteringResult;
//  return materialLightScatteringResult;
}

    fn _rayMarch(ray: Ray, distance: f32) -> vec3<f32>
//  fn _rayMarch(ray: Ray, distance: f32) -> vec3<f32>
{
    return ray.origin + ray.direction * distance;
//  return ray.origin + ray.direction * distance;
}

    fn _rayColor(ray: Ray) -> vec3<f32>
//  fn _rayColor(ray: Ray) -> vec3<f32>
{
    let unitDirection: vec3<f32> = normalize(ray.direction);
//  let unitDirection: vec3<f32> = normalize(ray.direction);
    let ratio: f32 = 0.5 * (unitDirection.y + 1.0);
//  let ratio: f32 = 0.5 * (unitDirection.y + 1.0);
    return (1.0 - ratio) * vec3<f32>(1.0, 0.5, 0.0) + ratio * vec3<f32>(0.0, 0.5, 1.0);
//  return (1.0 - ratio) * vec3<f32>(1.0, 0.5, 0.0) + ratio * vec3<f32>(0.0, 0.5, 1.0);
}

    fn _rayColorMain(initialRay: Ray, maxDepth: u32, backgroundType: u32, rng: ptr<function, RNG>) -> vec3<f32>
//  fn _rayColorMain(initialRay: Ray, maxDepth: u32, backgroundType: u32, rng: ptr<function, RNG>) -> vec3<f32>
{
        var accumulatedColor: vec3<f32> = vec3<f32>(0.00, 0.00, 0.00);
//      var accumulatedColor: vec3<f32> = vec3<f32>(0.00, 0.00, 0.00);
        var attenuation     : vec3<f32> = vec3<f32>(1.00, 1.00, 1.00);
//      var attenuation     : vec3<f32> = vec3<f32>(1.00, 1.00, 1.00);
        var currentRay: Ray = initialRay;
//      var currentRay: Ray = initialRay;


        for (var depth: u32 = 0u; depth < maxDepth; depth++)
//      for (var depth: u32 = 0u; depth < maxDepth; depth++)
        {
            let rayHitResult: RayHitResult = _rayHitSpheres(currentRay, Interval(1.0e-2, 1.0e+4));
//          let rayHitResult: RayHitResult = _rayHitSpheres(currentRay, Interval(1.0e-2, 1.0e+4));


            if (!rayHitResult.isHitted)
//          if (!rayHitResult.isHitted)
            {
                var backgroundColor: vec3<f32>;
//              var backgroundColor: vec3<f32>;
                switch (backgroundType)
//              switch (backgroundType)
                {
                    case BACKGROUND_TYPE_SKY_BOX_BLUE:
//                  case BACKGROUND_TYPE_SKY_BOX_BLUE:
                    {
                        let normalizedRayDirection: vec3<f32> = normalize(currentRay.direction);
//                      let normalizedRayDirection: vec3<f32> = normalize(currentRay.direction);
                        let ratio: f32 = 0.5 * (normalizedRayDirection.y + 1.0);
//                      let ratio: f32 = 0.5 * (normalizedRayDirection.y + 1.0);
                        backgroundColor = mix(vec3<f32>(1.00, 1.00, 1.00), vec3<f32>(0.50, 0.70, 1.00), ratio);
//                      backgroundColor = mix(vec3<f32>(1.00, 1.00, 1.00), vec3<f32>(0.50, 0.70, 1.00), ratio);
                    }


                    case BACKGROUND_TYPE_SKY_BOX_DARK:
//                  case BACKGROUND_TYPE_SKY_BOX_DARK:
                    {
                        backgroundColor = vec3<f32>(0.00, 0.00, 0.00);
//                      backgroundColor = vec3<f32>(0.00, 0.00, 0.00);
                    }


                    case BACKGROUND_TYPE_SKY_BOX_HDRI:
//                  case BACKGROUND_TYPE_SKY_BOX_HDRI:
                    {
                        let theta: f32 = acos (-currentRay.direction.y); // latitude
//                      let theta: f32 = acos (-currentRay.direction.y); // latitude
                        let phi  : f32 = atan2(-currentRay.direction.z, currentRay.direction.x) + PI; // longitude
//                      let phi  : f32 = atan2(-currentRay.direction.z, currentRay.direction.x) + PI; // longitude

                        var u: f32 = phi   / (2.0 * PI);
//                      var u: f32 = phi   / (2.0 * PI);
                        var v: f32 = theta /        PI ;
//                      var v: f32 = theta /        PI ;

                        u =       clamp(u, 0.0, 1.0);
//                      u =       clamp(u, 0.0, 1.0);
                        v = 1.0 - clamp(v, 0.0, 1.0);
//                      v = 1.0 - clamp(v, 0.0, 1.0);


                        backgroundColor = textureSampleLevel(hdriTexture, hdriSampler, vec2<f32>(u, v), 0.0).rgb;
//                      backgroundColor = textureSampleLevel(hdriTexture, hdriSampler, vec2<f32>(u, v), 0.0).rgb;          
                    }


                    default:
//                  default:
                    {
                        backgroundColor = vec3<f32>(1.00, 1.00, 1.00);
//                      backgroundColor = vec3<f32>(1.00, 1.00, 1.00);
                    }
                }

                accumulatedColor += attenuation * backgroundColor;
//              accumulatedColor += attenuation * backgroundColor;
                break;
//              break;
            }

            let materialLightScatteringResult: MaterialLightScatteringResult = _rayScatter(currentRay, rayHitResult, rng);
//          let materialLightScatteringResult: MaterialLightScatteringResult = _rayScatter(currentRay, rayHitResult, rng);

            accumulatedColor += attenuation * materialLightScatteringResult.emission;
//          accumulatedColor += attenuation * materialLightScatteringResult.emission;

            if (!materialLightScatteringResult.isScattered)
//          if (!materialLightScatteringResult.isScattered)
            {
                break;
//              break;
            }

            attenuation *= materialLightScatteringResult.attenuation ;
//          attenuation *= materialLightScatteringResult.attenuation ;
            currentRay   = materialLightScatteringResult.scatteredRay;
//          currentRay   = materialLightScatteringResult.scatteredRay;
        }

        return accumulatedColor;
//      return accumulatedColor;

}

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
    @group(0) @binding(0) var<storage, read> data: array<vec4<f32>, 5>;
//  @group(0) @binding(0) var<storage, read> data: array<vec4<f32>, 5>;
    @group(0) @binding(1) var<storage, read_write> outputStorage: array<vec4<f32>>;
//  @group(0) @binding(1) var<storage, read_write> outputStorage: array<vec4<f32>>;
    @group(0) @binding(2) var<storage, read> spheres: array<Sphere>;
//  @group(0) @binding(2) var<storage, read> spheres: array<Sphere>;
    @group(0) @binding(3) var<storage, read> materials: array<Material>;
//  @group(0) @binding(3) var<storage, read> materials: array<Material>;
    @group(0) @binding(4) var<storage, read> textures: array<Texture>;
//  @group(0) @binding(4) var<storage, read> textures: array<Texture>;
    @group(0) @binding(5) var atlasSampler: sampler;
//  @group(0) @binding(5) var atlasSampler: sampler;
    @group(0) @binding(6) var atlasTexture: texture_2d<f32>;
//  @group(0) @binding(6) var atlasTexture: texture_2d<f32>;
    @group(0) @binding(7) var hdriSampler: sampler;
//  @group(0) @binding(7) var hdriSampler: sampler;
    @group(0) @binding(8) var hdriTexture: texture_2d<f32>;
//  @group(0) @binding(8) var hdriTexture: texture_2d<f32>;

    @compute @workgroup_size(32, 32) fn main(@builtin(global_invocation_id) gid: vec3<u32>)
//  @compute @workgroup_size(32, 32) fn main(@builtin(global_invocation_id) gid: vec3<u32>)
{
    let canvasSize: vec2<u32> = vec2<u32>(data[0].xy);
//  let canvasSize: vec2<u32> = vec2<u32>(data[0].xy);

    if (gid.x >= canvasSize.x || gid.y >= canvasSize.y)
//  if (gid.x >= canvasSize.x || gid.y >= canvasSize.y)
    {
        return;
//      return;
    }

    let stratifiedSamplesPerPixel: f32 = data[0].z;
//  let stratifiedSamplesPerPixel: f32 = data[0].z;
    let inverseStratifiedSamplesPerPixel: f32 = data[0].w;
//  let inverseStratifiedSamplesPerPixel: f32 = data[0].w;
    let cameraCenter: vec3<f32> = data[1].xyz;
//  let cameraCenter: vec3<f32> = data[1].xyz;
    let pixelSamplesScale: f32 = data[1].w;
//  let pixelSamplesScale: f32 = data[1].w;
    let fromPixelToPixelDeltaU: vec3<f32> = data[2].xyz;
//  let fromPixelToPixelDeltaU: vec3<f32> = data[2].xyz;
    let stratifiedSampleX: f32 = data[2].w;
//  let stratifiedSampleX: f32 = data[2].w;
    let fromPixelToPixelDeltaV: vec3<f32> = data[3].xyz;
//  let fromPixelToPixelDeltaV: vec3<f32> = data[3].xyz;
    let stratifiedSampleY: f32 = data[3].w;
//  let stratifiedSampleY: f32 = data[3].w;
    let pixel00Coordinates: vec3<f32> = data[4].xyz;
//  let pixel00Coordinates: vec3<f32> = data[4].xyz;
    let backgroundType: u32 = u32(data[4].w);
//  let backgroundType: u32 = u32(data[4].w);

    let frameIndexForSeed: u32 = u32((stratifiedSampleY * stratifiedSamplesPerPixel + stratifiedSampleX) * 10000.0);
//  let frameIndexForSeed: u32 = u32((stratifiedSampleY * stratifiedSamplesPerPixel + stratifiedSampleX) * 10000.0);
    var rng: RNG = _rngInit(gid.x, gid.y, canvasSize.x, frameIndexForSeed);
//  var rng: RNG = _rngInit(gid.x, gid.y, canvasSize.x, frameIndexForSeed);
    _ = _pcg32Next(&rng);
//  _ = _pcg32Next(&rng);
    let ray: Ray = _generatePrimaryRay(
//  let ray: Ray = _generatePrimaryRay(
        stratifiedSampleX,
//      stratifiedSampleX,
        stratifiedSampleY,
//      stratifiedSampleY,
        inverseStratifiedSamplesPerPixel,
//      inverseStratifiedSamplesPerPixel,
        pixel00Coordinates,
//      pixel00Coordinates,
        fromPixelToPixelDeltaU,
//      fromPixelToPixelDeltaU,
        fromPixelToPixelDeltaV,
//      fromPixelToPixelDeltaV,
        f32(gid.x),
//      f32(gid.x),
        f32(gid.y),
//      f32(gid.y),
        cameraCenter,
//      cameraCenter,
        &rng,
//      &rng,
    );
//  );
    let pixelColor: vec4<f32> = vec4<f32>(_rayColorMain(ray, 100, backgroundType, &rng), 1.0);
//  let pixelColor: vec4<f32> = vec4<f32>(_rayColorMain(ray, 100, backgroundType, &rng), 1.0);

    outputStorage[gid.y * canvasSize.x + gid.x] += pixelColor;
//  outputStorage[gid.y * canvasSize.x + gid.x] += pixelColor;
}

    fn _generatePrimaryRay(
//  fn _generatePrimaryRay(
        stratifiedSampleX: f32,
//      stratifiedSampleX: f32,
        stratifiedSampleY: f32,
//      stratifiedSampleY: f32,
        inverseStratifiedSamplesPerPixel: f32,
//      inverseStratifiedSamplesPerPixel: f32,
        pixel00Coordinates: vec3<f32>,
//      pixel00Coordinates: vec3<f32>,
        fromPixelToPixelDeltaU: vec3<f32>,
//      fromPixelToPixelDeltaU: vec3<f32>,
        fromPixelToPixelDeltaV: vec3<f32>,
//      fromPixelToPixelDeltaV: vec3<f32>,
        pixelX: f32,
//      pixelX: f32,
        pixelY: f32,
//      pixelY: f32,
        cameraCenter: vec3<f32>,
//      cameraCenter: vec3<f32>,
        rng: ptr<function, RNG>,
//      rng: ptr<function, RNG>,
    ) -> Ray
//  ) -> Ray
    {
        let sampleOffset: vec3<f32> = vec3<f32>(((stratifiedSampleX + _pcg32Next(rng)) * inverseStratifiedSamplesPerPixel) - 0.5, ((stratifiedSampleY + _pcg32Next(rng)) * inverseStratifiedSamplesPerPixel) - 0.5, 0.0);
//      let sampleOffset: vec3<f32> = vec3<f32>(((stratifiedSampleX + _pcg32Next(rng)) * inverseStratifiedSamplesPerPixel) - 0.5, ((stratifiedSampleY + _pcg32Next(rng)) * inverseStratifiedSamplesPerPixel) - 0.5, 0.0);
        let pixelSampleCenter: vec3<f32> = pixel00Coordinates + fromPixelToPixelDeltaU * (pixelX + sampleOffset.x) + fromPixelToPixelDeltaV * (pixelY + sampleOffset.y);
//      let pixelSampleCenter: vec3<f32> = pixel00Coordinates + fromPixelToPixelDeltaU * (pixelX + sampleOffset.x) + fromPixelToPixelDeltaV * (pixelY + sampleOffset.y);
        let rayOrigin: vec3<f32> = cameraCenter;
//      let rayOrigin: vec3<f32> = cameraCenter;
        let rayDirection: vec3<f32> = pixelSampleCenter - rayOrigin;
//      let rayDirection: vec3<f32> = pixelSampleCenter - rayOrigin;
        let ray: Ray = Ray(rayOrigin, normalize(rayDirection));
//      let ray: Ray = Ray(rayOrigin, normalize(rayDirection));
        return ray;
//      return ray;
    }

    struct RNG
//  struct RNG
{
    state: u32,
//  state: u32,
}

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

    fn _pcg32NextRangeU32(rng: ptr<function, RNG>, min: u32, max: u32) -> u32
//  fn _pcg32NextRangeU32(rng: ptr<function, RNG>, min: u32, max: u32) -> u32
{
    return min + u32(_pcg32Next(rng) * f32(max - min));
//  return min + u32(_pcg32Next(rng) * f32(max - min));
}

    fn _pcg32NextRangeF32(rng: ptr<function, RNG>, min: f32, max: f32) -> f32
//  fn _pcg32NextRangeF32(rng: ptr<function, RNG>, min: f32, max: f32) -> f32
{
    return min +    (_pcg32Next(rng) *    (max - min));
//  return min +    (_pcg32Next(rng) *    (max - min));
}

// A helper "constructor" to build a highly randomized RNG state from specific inputs.
// A helper "constructor" to build a highly randomized RNG state from specific inputs.
    fn _rngInit(pixelX: u32, pixelY: u32, canvasWidth: u32, frameIndex: u32) -> RNG
//  fn _rngInit(pixelX: u32, pixelY: u32, canvasWidth: u32, frameIndex: u32) -> RNG
{
    // 1. Create a unique linear index for this pixel.
    // 1. Create a unique linear index for this pixel.
    let pixelId: u32 = pixelY * canvasWidth + pixelX;
//  let pixelId: u32 = pixelY * canvasWidth + pixelX;

    // 2. We need to mix the pixelId and the frameIndex together securely.
    // 2. We need to mix the pixelId and the frameIndex together securely.
    // A simple addition (pixelId + frameIndex) creates diagonal artifacts.
    // A simple addition (pixelId + frameIndex) creates diagonal artifacts.
    // We use a hashing step (borrowing PCG's own math) to scramble the bits.
    // We use a hashing step (borrowing PCG's own math) to scramble the bits.

    // Initialize state with pixel ID and scramble
    // Initialize state with pixel ID and scramble
    var state: u32 = pixelId;
//  var state: u32 = pixelId;
    state = state * 747796405u + 2891336453u;
//  state = state * 747796405u + 2891336453u;
    state = (state >> 22u) ^ state;
//  state = (state >> 22u) ^ state;

    // Mix in the frame index (using XOR to avoid carrying patterns)
    // Mix in the frame index (using XOR to avoid carrying patterns)
    state = state ^ frameIndex;
//  state = state ^ frameIndex;

    // Scramble again to ensure the frame bits are thoroughly mixed
    // Scramble again to ensure the frame bits are thoroughly mixed
    state = state * 747796405u + 2891336453u;
//  state = state * 747796405u + 2891336453u;
    state = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
//  state = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    state = (state >> 22u) ^ state;
//  state = (state >> 22u) ^ state;

    return RNG(state);
//  return RNG(state);
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

    fn _reflectance(cosine: f32, ratioOfEtaiOverEtat: f32) -> f32
//  fn _reflectance(cosine: f32, ratioOfEtaiOverEtat: f32) -> f32
    {
        // Use Schlick's approximation for reflectance.
        // Use Schlick's approximation for reflectance.
        var r0: f32 = (1.0 - ratioOfEtaiOverEtat) / (1.0 + ratioOfEtaiOverEtat);
//      var r0: f32 = (1.0 - ratioOfEtaiOverEtat) / (1.0 + ratioOfEtaiOverEtat);
        r0 = r0 * r0;
//      r0 = r0 * r0;
        let temp: f32 = 1.0 - cosine;
//      let temp: f32 = 1.0 - cosine;
        return r0 + (1.0 - r0) * temp * temp * temp * temp * temp;
//      return r0 + (1.0 - r0) * temp * temp * temp * temp * temp;
    }

    fn _generateRandomUnitVector(rng: ptr<function, RNG>) -> vec3<f32>
//  fn _generateRandomUnitVector(rng: ptr<function, RNG>) -> vec3<f32>
    {
//  Archimedes' Method
//  Archimedes' Method

        let theta: f32 = _pcg32NextRangeF32(rng,  0.0,  2.0 * PI); // Longitude          (uniform)
//      let theta: f32 = _pcg32NextRangeF32(rng,  0.0,  2.0 * PI); // Longitude          (uniform)
        let z    : f32 = _pcg32NextRangeF32(rng, -1.0,  1.0     ); // Height on cylinder (uniform)
//      let z    : f32 = _pcg32NextRangeF32(rng, -1.0,  1.0     ); // Height on cylinder (uniform)

        let r: f32 = sqrt(1.0 - z * z); // Radius of the circle at this height
//      let r: f32 = sqrt(1.0 - z * z); // Radius of the circle at this height

        let x: f32 = r * cos(theta);
//      let x: f32 = r * cos(theta);
        let y: f32 = r * sin(theta);
//      let y: f32 = r * sin(theta);

        return vec3<f32>(x, y, z);
//      return vec3<f32>(x, y, z);

    }

    fn _vec4LinearToGamma(value: vec4<f32>) -> vec4<f32> { return sqrt(value); };
//  fn _vec4LinearToGamma(value: vec4<f32>) -> vec4<f32> { return sqrt(value); };
    fn _vec4GammaToLinear(value: vec4<f32>) -> vec4<f32> { return value * value; };
//  fn _vec4GammaToLinear(value: vec4<f32>) -> vec4<f32> { return value * value; };
    fn _vec3LinearToGamma(value: vec3<f32>) -> vec3<f32> { return sqrt(value); };
//  fn _vec3LinearToGamma(value: vec3<f32>) -> vec3<f32> { return sqrt(value); };
    fn _vec3GammaToLinear(value: vec3<f32>) -> vec3<f32> { return value * value; };
//  fn _vec3GammaToLinear(value: vec3<f32>) -> vec3<f32> { return value * value; };
    fn _vec2LinearToGamma(value: vec2<f32>) -> vec2<f32> { return sqrt(value); };
//  fn _vec2LinearToGamma(value: vec2<f32>) -> vec2<f32> { return sqrt(value); };
    fn _vec2GammaToLinear(value: vec2<f32>) -> vec2<f32> { return value * value; };
//  fn _vec2GammaToLinear(value: vec2<f32>) -> vec2<f32> { return value * value; };
    fn _f32LinearToGamma(value: f32) -> f32 { return sqrt(value); };
//  fn _f32LinearToGamma(value: f32) -> f32 { return sqrt(value); };
    fn _f32GammaToLinear(value: f32) -> f32 { return value * value; };
//  fn _f32GammaToLinear(value: f32) -> f32 { return value * value; };

    fn _textureSample(textureIndex: u32, uvSurfaceCoordinate: vec2<f32>, surfaceCoordinate: vec3<f32>) -> vec3<f32>
//  fn _textureSample(textureIndex: u32, uvSurfaceCoordinate: vec2<f32>, surfaceCoordinate: vec3<f32>) -> vec3<f32>
{
    var textureSampleValue: vec3<f32>;
//  var textureSampleValue: vec3<f32>;
    let texture: Texture = textures[textureIndex];
//  let texture: Texture = textures[textureIndex];
    switch (texture.textureType)
//  switch (texture.textureType)
    {
        case TEXTURE_TYPE_COLOR:
//      case TEXTURE_TYPE_COLOR:
        {
            textureSampleValue = texture.albedo;
//          textureSampleValue = texture.albedo;
        }
        case TEXTURE_TYPE_IMAGE:
//      case TEXTURE_TYPE_IMAGE:
        {
            var uvTextureCoordinate: vec2<f32> = clamp(uvSurfaceCoordinate, vec2<f32>(0.0), vec2<f32>(1.0));
//          var uvTextureCoordinate: vec2<f32> = clamp(uvSurfaceCoordinate, vec2<f32>(0.0), vec2<f32>(1.0));
            uvTextureCoordinate.y = 1.0 - uvTextureCoordinate.y;
//          uvTextureCoordinate.y = 1.0 - uvTextureCoordinate.y;
            textureSampleValue = _sampleAtlas(uvTextureCoordinate, texture.imageIndex);
//          textureSampleValue = _sampleAtlas(uvTextureCoordinate, texture.imageIndex);
        }
        case TEXTURE_TYPE_CHECKER_STYLE_A:
//      case TEXTURE_TYPE_CHECKER_STYLE_A:
        {
            let oTileTexture: Texture = textures[texture.oTileTextureIndex];
//          let oTileTexture: Texture = textures[texture.oTileTextureIndex];
            let eTileTexture: Texture = textures[texture.eTileTextureIndex];
//          let eTileTexture: Texture = textures[texture.eTileTextureIndex];
            let textureCoordinate: vec3<i32> = vec3<i32>(floor(texture.scale * surfaceCoordinate));
//          let textureCoordinate: vec3<i32> = vec3<i32>(floor(texture.scale * surfaceCoordinate));
            textureSampleValue = select(oTileTexture.albedo, eTileTexture.albedo, ((textureCoordinate.x + textureCoordinate.y + textureCoordinate.z) & 1) == 0);
//          textureSampleValue = select(oTileTexture.albedo, eTileTexture.albedo, ((textureCoordinate.x + textureCoordinate.y + textureCoordinate.z) & 1) == 0);
        }
        case TEXTURE_TYPE_CHECKER_STYLE_B:
//      case TEXTURE_TYPE_CHECKER_STYLE_B:
        {
            let oTileTexture: Texture = textures[texture.oTileTextureIndex];
//          let oTileTexture: Texture = textures[texture.oTileTextureIndex];
            let eTileTexture: Texture = textures[texture.eTileTextureIndex];
//          let eTileTexture: Texture = textures[texture.eTileTextureIndex];
            let uvTextureCoordinate: vec2<i32> = vec2<i32>(floor(texture.scale * uvSurfaceCoordinate));
//          let uvTextureCoordinate: vec2<i32> = vec2<i32>(floor(texture.scale * uvSurfaceCoordinate));
            textureSampleValue = select(oTileTexture.albedo, eTileTexture.albedo, ((uvTextureCoordinate.x + uvTextureCoordinate.y) & 1) == 0);
//          textureSampleValue = select(oTileTexture.albedo, eTileTexture.albedo, ((uvTextureCoordinate.x + uvTextureCoordinate.y) & 1) == 0);
        }
        case default:
//      case default:
        {
            textureSampleValue = vec3<f32>(0.0, 0.0, 0.0);
//          textureSampleValue = vec3<f32>(0.0, 0.0, 0.0);
        }
    }
    return textureSampleValue;
//  return textureSampleValue;
}

    const atlasGridSize: vec2<f32> = vec2<f32>(4.0, 4.0); // 4x4 grid
//  const atlasGridSize: vec2<f32> = vec2<f32>(4.0, 4.0); // 4x4 grid

    fn _sampleAtlas(uvTextureCoordinate: vec2<f32>, imageIndex: u32) -> vec3<f32>
//  fn _sampleAtlas(uvTextureCoordinate: vec2<f32>, imageIndex: u32) -> vec3<f32>
{
    let cell : vec2<f32> = vec2<f32>(f32(imageIndex % 4u), f32(imageIndex / 4u));
//  let cell : vec2<f32> = vec2<f32>(f32(imageIndex % 4u), f32(imageIndex / 4u));
    let scale: vec2<f32> = 1.0 / atlasGridSize;
//  let scale: vec2<f32> = 1.0 / atlasGridSize;
    let atlasUVTextureCoordinate: vec2<f32> = (uvTextureCoordinate * scale) + (cell * scale);
//  let atlasUVTextureCoordinate: vec2<f32> = (uvTextureCoordinate * scale) + (cell * scale);
    return textureSampleLevel(atlasTexture, atlasSampler, atlasUVTextureCoordinate, 0.0).rgb;
//  return textureSampleLevel(atlasTexture, atlasSampler, atlasUVTextureCoordinate, 0.0).rgb;
}

    fn _f32Saturate(value: f32) -> f32 { return clamp(value, 0.0, 1.0); }
//  fn _f32Saturate(value: f32) -> f32 { return clamp(value, 0.0, 1.0); }
    fn _vec2Saturate(value: vec2<f32>) -> vec2<f32> { return clamp(value, vec2<f32>(0.0), vec2<f32>(1.0)); }
//  fn _vec2Saturate(value: vec2<f32>) -> vec2<f32> { return clamp(value, vec2<f32>(0.0), vec2<f32>(1.0)); }
    fn _vec3Saturate(value: vec3<f32>) -> vec3<f32> { return clamp(value, vec3<f32>(0.0), vec3<f32>(1.0)); }
//  fn _vec3Saturate(value: vec3<f32>) -> vec3<f32> { return clamp(value, vec3<f32>(0.0), vec3<f32>(1.0)); }
    fn _vec4Saturate(value: vec4<f32>) -> vec4<f32> { return clamp(value, vec4<f32>(0.0), vec4<f32>(1.0)); }
//  fn _vec4Saturate(value: vec4<f32>) -> vec4<f32> { return clamp(value, vec4<f32>(0.0), vec4<f32>(1.0)); }

    fn _tonemapACES(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapACES(value: vec3<f32>) -> vec3<f32>
    {
        return _vec3Saturate((value * (2.51 * value + vec3<f32>(0.03, 0.03, 0.03))) / (value * (2.43 * value + vec3<f32>(0.59, 0.59, 0.59)) + vec3<f32>(0.14, 0.14, 0.14)));
//      return _vec3Saturate((value * (2.51 * value + vec3<f32>(0.03, 0.03, 0.03))) / (value * (2.43 * value + vec3<f32>(0.59, 0.59, 0.59)) + vec3<f32>(0.14, 0.14, 0.14)));
    }
    fn _tonemapFilmic(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapFilmic(value: vec3<f32>) -> vec3<f32>
    {
        let m: vec3<f32> = vec3<f32>(max(0.0, value.x - 0.004), max(0.0, value.y - 0.004), max(0.0, value.z - 0.004));
//      let m: vec3<f32> = vec3<f32>(max(0.0, value.x - 0.004), max(0.0, value.y - 0.004), max(0.0, value.z - 0.004));
        return (m * (6.2 * m + vec3<f32>(0.5, 0.5, 0.5))) / (m * (6.2 * m + vec3<f32>(1.7, 1.7, 1.7)) + vec3<f32>(0.06, 0.06, 0.06));
//      return (m * (6.2 * m + vec3<f32>(0.5, 0.5, 0.5))) / (m * (6.2 * m + vec3<f32>(1.7, 1.7, 1.7)) + vec3<f32>(0.06, 0.06, 0.06));
    }
    fn _tonemapReinhard(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapReinhard(value: vec3<f32>) -> vec3<f32>
    {
        return value / (1.0 + dot(value, vec3<f32>(0.21250175, 0.71537574, 0.07212251)));
//      return value / (1.0 + dot(value, vec3<f32>(0.21250175, 0.71537574, 0.07212251)));
    }
    fn _tonemapReinhardJodie(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapReinhardJodie(value: vec3<f32>) -> vec3<f32>
    {
        let l: f32 = dot(value, vec3<f32>(0.21250175, 0.71537574, 0.07212251)); let tc: vec3<f32> = value / (value + vec3<f32>(1.0, 1.0, 1.0)); return mix(value / (l + 1.0), tc, tc);
//      let l: f32 = dot(value, vec3<f32>(0.21250175, 0.71537574, 0.07212251)); let tc: vec3<f32> = value / (value + vec3<f32>(1.0, 1.0, 1.0)); return mix(value / (l + 1.0), tc, tc);
    }
    fn _tonemapUncharted2(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapUncharted2(value: vec3<f32>) -> vec3<f32>
    {
        const A: f32 = 0.15;
//      const A: f32 = 0.15;
        const B: f32 = 0.50;
//      const B: f32 = 0.50;
        const C: f32 = 0.10;
//      const C: f32 = 0.10;
        const D: f32 = 0.20;
//      const D: f32 = 0.20;
        const E: f32 = 0.02;
//      const E: f32 = 0.02;
        const F: f32 = 0.30;
//      const F: f32 = 0.30;
        const VCB: vec3<f32> = vec3<f32>(C * B, C * B, C * B);
//      const VCB: vec3<f32> = vec3<f32>(C * B, C * B, C * B);
        const VB : vec3<f32> = vec3<f32>(    B,     B,     B);
//      const VB : vec3<f32> = vec3<f32>(    B,     B,     B);
        const VDE: vec3<f32> = vec3<f32>(D * E, D * E, D * E);
//      const VDE: vec3<f32> = vec3<f32>(D * E, D * E, D * E);
        const VDF: vec3<f32> = vec3<f32>(D * F, D * F, D * F);
//      const VDF: vec3<f32> = vec3<f32>(D * F, D * F, D * F);
        const VEF: vec3<f32> = vec3<f32>(E / F, E / F, E / F);
//      const VEF: vec3<f32> = vec3<f32>(E / F, E / F, E / F);
        return ((value * (A * value + VCB) + VDE) / (value * (A * value + VB) + VDF)) - VEF;
//      return ((value * (A * value + VCB) + VDE) / (value * (A * value + VB) + VDF)) - VEF;
    }
    fn _tonemapUncharted1(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapUncharted1(value: vec3<f32>) -> vec3<f32>
    {
        const W: f32 = 11.2;
//      const W: f32 = 11.2;
        const exposureBias: f32 = 2.0;
//      const exposureBias: f32 = 2.0;
        let curr: vec3<f32> = _tonemapUncharted2(exposureBias * value);
//      let curr: vec3<f32> = _tonemapUncharted2(exposureBias * value);
        let whiteScale: vec3<f32> = 1.0 / _tonemapUncharted2(vec3<f32>(W, W, W));
//      let whiteScale: vec3<f32> = 1.0 / _tonemapUncharted2(vec3<f32>(W, W, W));
        return curr * whiteScale;
//      return curr * whiteScale;
    }
    fn _tonemapUnreal(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapUnreal(value: vec3<f32>) -> vec3<f32>
    {
        return value / (value + vec3<f32>(0.155, 0.155, 0.155)) * 1.019;
//      return value / (value + vec3<f32>(0.155, 0.155, 0.155)) * 1.019;
    }
    fn _tonemapLinear(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapLinear(value: vec3<f32>) -> vec3<f32>
    {
        return value;
//      return value;
    }
    fn _tonemapDrago(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapDrago(value: vec3<f32>) -> vec3<f32>
    {
        let lum: f32 = dot(value, vec3<f32>(0.2126, 0.7152, 0.0722));
//      let lum: f32 = dot(value, vec3<f32>(0.2126, 0.7152, 0.0722));
        let logLum: f32 = log2(1.0 + lum);
//      let logLum: f32 = log2(1.0 + lum);
        let bias: f32 = log2(0.85);
//      let bias: f32 = log2(0.85);
        let exponent: f32 = logLum / bias;
//      let exponent: f32 = logLum / bias;
        let scale: f32 = pow(0.96, exponent);
//      let scale: f32 = pow(0.96, exponent);
        return value * scale;
//      return value * scale;
    }
    fn _tonemapExponential(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapExponential(value: vec3<f32>) -> vec3<f32>
    {
        const exposure: f32 = 1.0;
//      const exposure: f32 = 1.0;
        return 1.0 - exp(-value * exposure);
//      return 1.0 - exp(-value * exposure);
    }
    fn _tonemapLogarithmic(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapLogarithmic(value: vec3<f32>) -> vec3<f32>
    {
        return value / (value + 1.0);
//      return value / (value + 1.0);
    }
    fn _tonemapExtendedReinhard(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapExtendedReinhard(value: vec3<f32>) -> vec3<f32>
    {
        const whitePoint: f32 = 4.0; // This can be adjusted, or calculated from the scene's max brightness.
//      const whitePoint: f32 = 4.0; // This can be adjusted, or calculated from the scene's max brightness.
        let numerator: vec3<f32> = value * (1.0 + (value / (whitePoint * whitePoint)));
//      let numerator: vec3<f32> = value * (1.0 + (value / (whitePoint * whitePoint)));
        return numerator / (1.0 + value);
//      return numerator / (1.0 + value);
    }
    fn _tonemapHableFilmic(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapHableFilmic(value: vec3<f32>) -> vec3<f32>
    {
        const A: f32 = 0.22; // Shoulder Strength
//      const A: f32 = 0.22; // Shoulder Strength
        const B: f32 = 0.30; // Linear   Strength
//      const B: f32 = 0.30; // Linear   Strength
        const C: f32 = 0.10; // Linear   Angle
//      const C: f32 = 0.10; // Linear   Angle
        const D: f32 = 0.20; // Toe      Strength
//      const D: f32 = 0.20; // Toe      Strength
        const E: f32 = 0.01; // Toe        Numerator
//      const E: f32 = 0.01; // Toe        Numerator
        const F: f32 = 0.30; // Toe      Denominator
//      const F: f32 = 0.30; // Toe      Denominator
        const exposure: f32 = 2.0;
//      const exposure: f32 = 2.0;

        let curr: vec3<f32> = ((value * (A * value + C * B) + D * E) / (value * (A * value + B) + D * F)) - E / F;
//      let curr: vec3<f32> = ((value * (A * value + C * B) + D * E) / (value * (A * value + B) + D * F)) - E / F;
        const whitePoint: vec3<f32> = ((vec3<f32>(11.2, 11.2, 11.2) * (A * vec3<f32>(11.2, 11.2, 11.2) + C * B) + D * E) / (vec3<f32>(11.2, 11.2, 11.2) * (A * vec3<f32>(11.2, 11.2, 11.2) + B) + D * F)) - E / F;
//      const whitePoint: vec3<f32> = ((vec3<f32>(11.2, 11.2, 11.2) * (A * vec3<f32>(11.2, 11.2, 11.2) + C * B) + D * E) / (vec3<f32>(11.2, 11.2, 11.2) * (A * vec3<f32>(11.2, 11.2, 11.2) + B) + D * F)) - E / F;

        return curr * (1.0 / whitePoint);
//      return curr * (1.0 / whitePoint);
    }
    fn _tonemapACESFitted(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapACESFitted(value: vec3<f32>) -> vec3<f32>
    {
        // Narkowicz 2015, "ACES Filmic Tone Mapping Curve"
        // Narkowicz 2015, "ACES Filmic Tone Mapping Curve"
        const a: f32 = 2.51;
//      const a: f32 = 2.51;
        const b: f32 = 0.03;
//      const b: f32 = 0.03;
        const c: f32 = 2.43;
//      const c: f32 = 2.43;
        const d: f32 = 0.59;
//      const d: f32 = 0.59;
        const e: f32 = 0.14;
//      const e: f32 = 0.14;

        let clamped: vec3<f32> = _vec3Saturate((value * (a * value + b)) / (value * (c * value + d) + e));
//      let clamped: vec3<f32> = _vec3Saturate((value * (a * value + b)) / (value * (c * value + d) + e));
        return clamped;
//      return clamped;
    }
    fn _tonemapLottes(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapLottes(value: vec3<f32>) -> vec3<f32>
    {
        // A simpler, more robust curve inspired by Lottes' GDC talks
        // A simpler, more robust curve inspired by Lottes' GDC talks
        const contrast: f32 = 1.60;
//      const contrast: f32 = 1.60;
        const shoulder: f32 = 0.98;
//      const shoulder: f32 = 0.98;

        // Apply contrast
        // Apply contrast
        let contrasted: vec3<f32> = vec3<f32>
//      let contrasted: vec3<f32> = vec3<f32>
        (
            pow(value.x, contrast),
            pow(value.y, contrast),
            pow(value.z, contrast),
        );

        // Apply shoulder curve to compress highlights
        // Apply shoulder curve to compress highlights
        let tonemapped: vec3<f32> = vec3<f32>
//      let tonemapped: vec3<f32> = vec3<f32>
        (
            (1.0 - shoulder) * contrasted.x + shoulder * contrasted.x / (1.0 + contrasted.x),
            (1.0 - shoulder) * contrasted.y + shoulder * contrasted.y / (1.0 + contrasted.y),
            (1.0 - shoulder) * contrasted.z + shoulder * contrasted.z / (1.0 + contrasted.z),
        );

        return tonemapped;
//      return tonemapped;
    }
    fn _tonemapHejlFilmic(value: vec3<f32>) -> vec3<f32>
//  fn _tonemapHejlFilmic(value: vec3<f32>) -> vec3<f32>
    {
        let temp: vec3<f32> = vec3<f32>
//      let temp: vec3<f32> = vec3<f32>
        (
            max(0.0, value.x - 0.004),
            max(0.0, value.y - 0.004),
            max(0.0, value.z - 0.004),
        );

        let   numerator: vec3<f32> = (temp * (6.2 * temp + 0.5));
//      let   numerator: vec3<f32> = (temp * (6.2 * temp + 0.5));
        let denominator: vec3<f32> = (temp * (6.2 * temp + 1.7)) + 0.06;
//      let denominator: vec3<f32> = (temp * (6.2 * temp + 1.7)) + 0.06;

        return vec3<f32>
//      return vec3<f32>
        (
            numerator.x / denominator.x,
            numerator.y / denominator.y,
            numerator.z / denominator.z,
        );
    }
