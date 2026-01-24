    import {
//  import {
        type AABB3D,
//      type AABB3D,
    } from "../type";
//  } from "../type";
    export type BVHNode = {
//  export type BVHNode = {
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
