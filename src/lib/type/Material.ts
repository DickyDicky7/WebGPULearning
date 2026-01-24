    import {
//  import {
        type MaterialType,
//      type MaterialType,
        type RefractiveIndex,
//      type RefractiveIndex,
    } from "../type";
//  } from "../type";
    export type Material = {
//  export type Material = {
        layer1Roughness: number,    // 0.0=smooth     1.0=rough
//      layer1Roughness: number,    // 0.0=smooth     1.0=rough
        layer1Metallic: number,     // 0.0=dielectric 1.0=metal
//      layer1Metallic: number,     // 0.0=dielectric 1.0=metal
        layer1Transmission: number, // 0.0=opaque     1.0=glass
//      layer1Transmission: number, // 0.0=opaque     1.0=glass
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
