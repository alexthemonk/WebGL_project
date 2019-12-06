//
//		lights_JT.js
//
//	A JavaScript library for objects that describe point-light sources suitable
// for 3D rendering with Phong lighting (ambient, diffuse, specular).Its light
// emanates either from a local position (x,y,z,w=1), or arrives at all points
// in the 3D scene from the same direction (x,y,z,w=0) as if emanating from a
// very distant source such as the sun.
//
//	Later you may wish to expand this kind of object to describe a point-light
// source with a directional beam; just add a 'look-at' point and a beam-width
// exponent (similar to specular exponent: see Lengyel Chapter 7).  You may also
// wish to add attenuation parameters for lights whose illumination decreases
// with distance, etc.
//
//		2016.02.29 J. Tumblin, Northwestern University EECS Dept.
//		Created; relies on cuon-matrix.js supplied with our textbook.
//
//		2019.12.03 Alex Liu

var SUN_LIGHT = 1;
var NO_LIGHT = 0;
var LIGHT_DEFAULT = -1;

function Light() {
  //===============================================================================
  // Constructor function:
  this.position; // x,y,z,w:
  // w==1 for local 3D position,
  // w==0 for light at infinity in direction (x,y,z)
  this.ambient; // ambient illumination: r,g,b
  this.diffuse; // diffuse illumination: r,g,b.
  this.specular; // specular illumination: r,g,b.

  this.isLit = true; // true/false for ON/OFF

  this.u_PosLoc = false; //
  this.u_AmbiLoc = false; //
  this.u_DiffLoc = false; //
  this.u_SpecLoc = false; //
}

Light.prototype.init = function(u_PosStr, u_AmbiStr, u_DiffStr, u_SpecStr) {
  this.u_PosLoc = gl.getUniformLocation(gl.program, u_PosStr);
  this.u_AmbiLoc = gl.getUniformLocation(gl.program, u_AmbiStr);
  this.u_DiffLoc = gl.getUniformLocation(gl.program, u_DiffStr);
  this.u_SpecLoc = gl.getUniformLocation(gl.program, u_SpecStr);
  if (!this.u_PosLoc || !this.u_AmbiLoc || !this.u_DiffLoc || !this.u_SpecLoc) {
    console.log("Failed to get the Light storage locations");
    return -1;
  }
  return 0;
};

Light.prototype.translate = function(posVec) {
  this.position = posVec; // x,y,z,w:
};

Light.prototype.push = function() {
  gl.uniform3fv(this.u_PosLoc, this.position.slice(0, 3));
  gl.uniform3fv(this.u_AmbiLoc, this.ambient.slice(0, 3)); // ambient
  gl.uniform3fv(this.u_DiffLoc, this.diffuse.slice(0, 3)); // diffuse
  gl.uniform3fv(this.u_SpecLoc, this.specular.slice(0, 3)); // Specular
};

Light.prototype.setLight = function(light) {
  switch (light) {
    case SUN_LIGHT:
      this.ambient = [1.0, 1.0, 1.0, 1.0]; // ambient illumination: r,g,b
      this.diffuse = [1.0, 1.0, 1.0, 1.0]; // diffuse illumination: r,g,b.
      this.specular = [0.2, 0.2, 0.2, 1.0]; // specular illumination: r,g,b.
      break;
    case NO_LIGHT:
      this.ambient = [0.1, 0.1, 0.1, 1.0]; // ambient illumination: r,g,b
      this.diffuse = [0.1, 0.1, 0.1, 1.0]; // diffuse illumination: r,g,b.
      this.specular = [0.0, 0.0, 0.0, 1.0]; // specular illumination: r,g,b.
      break;
    default:
      this.ambient = [0.5, 0.5, 0.5, 1.0]; // ambient illumination: r,g,b
      this.diffuse = [1.0, 1.0, 1.0, 1.0]; // diffuse illumination: r,g,b.
      this.specular = [1.0, 1.0, 1.0, 1.0]; // specular illumination: r,g,b.
  }
};

Light.prototype.switch = function() {
  this.isLit = !this.isLit;
  this.setLight(NO_LIGHT);
  this.push();
};
