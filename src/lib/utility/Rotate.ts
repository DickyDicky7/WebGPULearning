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
    export function rotateAroundPivotAndAxisPoint(point: Vec3, pivot: Vec3, axis: Vec3, angleRadians: number): Vec3 {
//  export function rotateAroundPivotAndAxisPoint(point: Vec3, pivot: Vec3, axis: Vec3, angleRadians: number): Vec3 {
        const p: Vec3 = m.chain(point).subtract(pivot).done();
//      const p: Vec3 = m.chain(point).subtract(pivot).done();
        const k: Vec3 = m.chain(axis).divide(m.norm(axis)).done() as Vec3;
//      const k: Vec3 = m.chain(axis).divide(m.norm(axis)).done() as Vec3;
        const cosTheta: number = m.cos(angleRadians);
//      const cosTheta: number = m.cos(angleRadians);
        const sinTheta: number = m.sin(angleRadians);
//      const sinTheta: number = m.sin(angleRadians);
        const rotatedVertex: Vec3 = m.chain(m.multiply(p, cosTheta)).add(m.multiply(m.cross(k, p), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, p)), (1.0 - cosTheta))).done() as Vec3;
//      const rotatedVertex: Vec3 = m.chain(m.multiply(p, cosTheta)).add(m.multiply(m.cross(k, p), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, p)), (1.0 - cosTheta))).done() as Vec3;
        return m.add(rotatedVertex, pivot);
//      return m.add(rotatedVertex, pivot);
    };
//  };
    export function rotateAroundPivotAndAxisSphere(sphere: Sphere, pivot: Vec3, axis: Vec3, angleRadians: number): void {
//  export function rotateAroundPivotAndAxisSphere(sphere: Sphere, pivot: Vec3, axis: Vec3, angleRadians: number): void {
        const p: Vec3 = m.chain(sphere.center).subtract(pivot).done();
//      const p: Vec3 = m.chain(sphere.center).subtract(pivot).done();
        const k: Vec3 = m.chain(axis).divide(m.norm(axis)).done() as Vec3;
//      const k: Vec3 = m.chain(axis).divide(m.norm(axis)).done() as Vec3;
        const cosTheta: number = m.cos(angleRadians);
//      const cosTheta: number = m.cos(angleRadians);
        const sinTheta: number = m.sin(angleRadians);
//      const sinTheta: number = m.sin(angleRadians);
        const rotatedVertex: Vec3 = m.chain(m.multiply(p, cosTheta)).add(m.multiply(m.cross(k, p), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, p)), (1.0 - cosTheta))).done() as Vec3;
//      const rotatedVertex: Vec3 = m.chain(m.multiply(p, cosTheta)).add(m.multiply(m.cross(k, p), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, p)), (1.0 - cosTheta))).done() as Vec3;
        sphere.center = m.add(rotatedVertex, pivot);
//      sphere.center = m.add(rotatedVertex, pivot);
    };
//  };
    export function rotateAroundPivotAndAxisTriangle(triangle: Triangle, pivot: Vec3, axis: Vec3, angleRadians: number): void {
//  export function rotateAroundPivotAndAxisTriangle(triangle: Triangle, pivot: Vec3, axis: Vec3, angleRadians: number): void {
        const p0: Vec3 = m.subtract(triangle.vertex0, pivot);
//      const p0: Vec3 = m.subtract(triangle.vertex0, pivot);
        const p1: Vec3 = m.subtract(triangle.vertex1, pivot);
//      const p1: Vec3 = m.subtract(triangle.vertex1, pivot);
        const p2: Vec3 = m.subtract(triangle.vertex2, pivot);
//      const p2: Vec3 = m.subtract(triangle.vertex2, pivot);
        const k: Vec3 = m.divide(axis, m.norm(axis)) as Vec3;
//      const k: Vec3 = m.divide(axis, m.norm(axis)) as Vec3;
        const cosTheta: number = m.cos(angleRadians);
//      const cosTheta: number = m.cos(angleRadians);
        const sinTheta: number = m.sin(angleRadians);
//      const sinTheta: number = m.sin(angleRadians);
        const oneMinusCosTheta: number = 1.0 - cosTheta;
//      const oneMinusCosTheta: number = 1.0 - cosTheta;
        const rotatedVertex0: Vec3 = m.chain(m.multiply(p0, cosTheta)).add(m.multiply(m.cross(k, p0), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, p0)), oneMinusCosTheta)).done() as Vec3;
//      const rotatedVertex0: Vec3 = m.chain(m.multiply(p0, cosTheta)).add(m.multiply(m.cross(k, p0), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, p0)), oneMinusCosTheta)).done() as Vec3;
        const rotatedVertex1: Vec3 = m.chain(m.multiply(p1, cosTheta)).add(m.multiply(m.cross(k, p1), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, p1)), oneMinusCosTheta)).done() as Vec3;
//      const rotatedVertex1: Vec3 = m.chain(m.multiply(p1, cosTheta)).add(m.multiply(m.cross(k, p1), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, p1)), oneMinusCosTheta)).done() as Vec3;
        const rotatedVertex2: Vec3 = m.chain(m.multiply(p2, cosTheta)).add(m.multiply(m.cross(k, p2), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, p2)), oneMinusCosTheta)).done() as Vec3;
//      const rotatedVertex2: Vec3 = m.chain(m.multiply(p2, cosTheta)).add(m.multiply(m.cross(k, p2), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, p2)), oneMinusCosTheta)).done() as Vec3;
        triangle.vertex0 = m.add(rotatedVertex0, pivot);
//      triangle.vertex0 = m.add(rotatedVertex0, pivot);
        triangle.vertex1 = m.add(rotatedVertex1, pivot);
//      triangle.vertex1 = m.add(rotatedVertex1, pivot);
        triangle.vertex2 = m.add(rotatedVertex2, pivot);
//      triangle.vertex2 = m.add(rotatedVertex2, pivot);
        const rotatedNormal0: Vec3 = m.chain(m.multiply(triangle.vertex0FrontFaceNormal, cosTheta)).add(m.multiply(m.cross(k, triangle.vertex0FrontFaceNormal), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, triangle.vertex0FrontFaceNormal)), oneMinusCosTheta)).done() as Vec3;
//      const rotatedNormal0: Vec3 = m.chain(m.multiply(triangle.vertex0FrontFaceNormal, cosTheta)).add(m.multiply(m.cross(k, triangle.vertex0FrontFaceNormal), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, triangle.vertex0FrontFaceNormal)), oneMinusCosTheta)).done() as Vec3;
        const rotatedNormal1: Vec3 = m.chain(m.multiply(triangle.vertex1FrontFaceNormal, cosTheta)).add(m.multiply(m.cross(k, triangle.vertex1FrontFaceNormal), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, triangle.vertex1FrontFaceNormal)), oneMinusCosTheta)).done() as Vec3;
//      const rotatedNormal1: Vec3 = m.chain(m.multiply(triangle.vertex1FrontFaceNormal, cosTheta)).add(m.multiply(m.cross(k, triangle.vertex1FrontFaceNormal), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, triangle.vertex1FrontFaceNormal)), oneMinusCosTheta)).done() as Vec3;
        const rotatedNormal2: Vec3 = m.chain(m.multiply(triangle.vertex2FrontFaceNormal, cosTheta)).add(m.multiply(m.cross(k, triangle.vertex2FrontFaceNormal), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, triangle.vertex2FrontFaceNormal)), oneMinusCosTheta)).done() as Vec3;
//      const rotatedNormal2: Vec3 = m.chain(m.multiply(triangle.vertex2FrontFaceNormal, cosTheta)).add(m.multiply(m.cross(k, triangle.vertex2FrontFaceNormal), sinTheta)).add(m.multiply(m.multiply(k, m.dot(k, triangle.vertex2FrontFaceNormal)), oneMinusCosTheta)).done() as Vec3;
        triangle.vertex0FrontFaceNormal = m.divide(rotatedNormal0, m.norm(rotatedNormal0)) as Vec3;
//      triangle.vertex0FrontFaceNormal = m.divide(rotatedNormal0, m.norm(rotatedNormal0)) as Vec3;
        triangle.vertex1FrontFaceNormal = m.divide(rotatedNormal1, m.norm(rotatedNormal1)) as Vec3;
//      triangle.vertex1FrontFaceNormal = m.divide(rotatedNormal1, m.norm(rotatedNormal1)) as Vec3;
        triangle.vertex2FrontFaceNormal = m.divide(rotatedNormal2, m.norm(rotatedNormal2)) as Vec3;
//      triangle.vertex2FrontFaceNormal = m.divide(rotatedNormal2, m.norm(rotatedNormal2)) as Vec3;
    };
//  };
