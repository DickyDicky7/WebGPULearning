    import {
//  import {
        type AABB3D,
//      type AABB3D,
        type Vec2,
//      type Vec2,
        type Vec3,
//      type Vec3,
    } from "../type";
//  } from "../type";
    export type Triangle = {
//  export type Triangle = {
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
