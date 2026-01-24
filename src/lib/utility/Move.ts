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
    function moveSphere(sphere: Sphere, translation: Vec3): void {
//  function moveSphere(sphere: Sphere, translation: Vec3): void {
        sphere.center = m.chain(sphere.center).add(translation).done();
//      sphere.center = m.chain(sphere.center).add(translation).done();
    };
//  };
    function moveTriangle(triangle: Triangle, translation: Vec3): void {
//  function moveTriangle(triangle: Triangle, translation: Vec3): void {
        triangle.vertex0 = m.chain(triangle.vertex0).add(translation).done();
//      triangle.vertex0 = m.chain(triangle.vertex0).add(translation).done();
        triangle.vertex1 = m.chain(triangle.vertex1).add(translation).done();
//      triangle.vertex1 = m.chain(triangle.vertex1).add(translation).done();
        triangle.vertex2 = m.chain(triangle.vertex2).add(translation).done();
//      triangle.vertex2 = m.chain(triangle.vertex2).add(translation).done();
    };
//  };
