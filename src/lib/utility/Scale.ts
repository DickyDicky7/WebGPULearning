    import {
//  import {
        type Sphere,
//      type Sphere,
        type Triangle,
//      type Triangle,
        type Vec3,
//      type Vec3,
    } from "../type";
//  } from "../type";
    import * as m from "mathjs";
//  import * as m from "mathjs";
    export function scaleSphere(sphere: Sphere, scaleFactor: number): void {
//  export function scaleSphere(sphere: Sphere, scaleFactor: number): void {
        sphere.radius *= scaleFactor;
//      sphere.radius *= scaleFactor;
    };
//  };
    export function scaleTriangle(triangle: Triangle, scaleFactor: Vec3): void {
//  export function scaleTriangle(triangle: Triangle, scaleFactor: Vec3): void {
        triangle.vertex0 = m.chain(triangle.vertex0).multiply(scaleFactor).done();
//      triangle.vertex0 = m.chain(triangle.vertex0).multiply(scaleFactor).done();
        triangle.vertex1 = m.chain(triangle.vertex1).multiply(scaleFactor).done();
//      triangle.vertex1 = m.chain(triangle.vertex1).multiply(scaleFactor).done();
        triangle.vertex2 = m.chain(triangle.vertex2).multiply(scaleFactor).done();
//      triangle.vertex2 = m.chain(triangle.vertex2).multiply(scaleFactor).done();
    };
//  };
