    import {
//  import {
        type TextureType,
//      type TextureType,
        type Vec3,
//      type Vec3,
    } from "../type";
//  } from "../type";
    export type Texture = {
//  export type Texture = {
        albedo: Vec3,
//      albedo: Vec3,
        albedoImageIndex: number,
//      albedoImageIndex: number,
        albedoTextureType: TextureType,
//      albedoTextureType: TextureType,
        albedoScale: number,
//      albedoScale: number,
        albedoOTileTextureIndex: number,
//      albedoOTileTextureIndex: number,
        albedoETileTextureIndex: number,
//      albedoETileTextureIndex: number,
    };
//  };
