// 2015.03.08   courtesy Alex Ayerdi
// 2016.02.22		J. Tumblin revised comments & return value names
// 2016.03.01		J. Tumblin added K_name member; added data members to hold
//							GPU's 'uniform' locations for its MatlT struct members;
//							added 'setMaterial()' function to allow change of materials without
//							calling constructor (it discards GPU locations kept in uLoc_XX).
//------------------------------------------------------------------------------
// These emissive, ambient, diffuse, specular components were chosen for
// least-squares best-fit to measured BRDFs of actual material samples.
// (values copied from pg. 51, "Advanced Graphics Programming"
// Tom McReynolds, David Blythe Morgan-Kaufmann Publishers (c)2005).
//
// They demonstrate both the strengths and the weaknesses of Phong lighting:
// if their appearance makes you ask "how could we do better than this?"
// then look into 'Cook-Torrance' shading methods, texture maps, bump maps,
// and beyond.
//
// For each of our Phong Material Types, define names
// that each get assigned a unique integer identifier:
//
//		2019.12.03 Alex Liu

var MATL_RED_PLASTIC = 1;
var MATL_GREEN_PLASTIC = 2;
var MATL_BLUE_PLASTIC = 3;
var MATL_BLACK_PLASTIC = 4;
var MATL_BLACK_RUBBER = 5;
var MATL_BRASS = 6;
var MATL_BRONZE_DULL = 7;
var MATL_BRONZE_SHINY = 8;
var MATL_CHROME = 9;
var MATL_COPPER_DULL = 10;
var MATL_COPPER_SHINY = 11;
var MATL_GOLD_DULL = 12;
var MATL_GOLD_SHINY = 13;
var MATL_PEWTER = 14;
var MATL_SILVER_DULL = 15;
var MATL_SILVER_SHINY = 16;
var MATL_EMERALD = 17;
var MATL_JADE = 18;
var MATL_OBSIDIAN = 19;
var MATL_PEARL = 20;
var MATL_RUBY = 21;
var MATL_TURQUOISE = 22;
var MATL_BLACK_EYE = 23;
var MATL_BLACK_BODY = 24;
var MATL_BROWN_BODY = 25;
var MATL_DEFAULT = -1; // (used for unrecognized material names)

function Material() {
  //==============================================================================
  // Constructor:  use these defaults:

  this.emissive = []; // JS arrays that hold 4 (not 3!) reflectance values:
  // r,g,b,a where 'a'==alpha== opacity; usually 1.0.
  // (Opacity is part of this set of measured materials)
  this.ambient = []; // ambient illumination: r,g,b
  this.diffuse = []; // diffuse illumination: r,g,b.
  this.specular = []; // specular illumination: r,g,b.
  this.shiny = 0.0;

  // GPU location values for GLSL struct-member uniforms (LampT struct) needed
  // to transfer K values above to the GPU. Get these values using the
  // webGL fcn 'gl.getUniformLocation()'.  False for 'not initialized'.
  this.u_KeLoc = false;
  this.u_KaLoc = false;
  this.u_KdLoc = false;
  this.u_KsLoc = false;
  this.u_KshinyLoc = false;
}

Material.prototype.init = function(
  u_KeStr,
  u_KaStr,
  u_KdStr,
  u_KsStr,
  u_KshinyStr
) {
  this.u_KeLoc = gl.getUniformLocation(gl.program, u_KeStr);
  this.u_KaLoc = gl.getUniformLocation(gl.program, u_KaStr);
  this.u_KdLoc = gl.getUniformLocation(gl.program, u_KdStr);
  this.u_KsLoc = gl.getUniformLocation(gl.program, u_KsStr);
  this.u_KshinyLoc = gl.getUniformLocation(gl.program, u_KshinyStr);
  if (
    !this.u_KeLoc ||
    !this.u_KaLoc ||
    !this.u_KdLoc ||
    !this.u_KsLoc ||
    !this.u_KshinyLoc
  ) {
    console.log("Failed to get the Phong Reflectance storage locations");
    return;
  }
};

Material.prototype.push = function() {
  gl.uniform3fv(this.u_KeLoc, this.emissive.slice(0, 3)); // Ke emissive
  gl.uniform3fv(this.u_KaLoc, this.ambient.slice(0, 3)); // Ka ambient
  gl.uniform3fv(this.u_KdLoc, this.diffuse.slice(0, 3)); // Kd diffuse
  gl.uniform3fv(this.u_KsLoc, this.specular.slice(0, 3)); // Ks specular
  gl.uniform1f(this.u_KshinyLoc, 90.0); // Kshiny shinyness exponent
};

Material.prototype.setMaterial = function(material) {
  //==============================================================================
  // Call this member function to change the Ke,Ka,Kd,Ks members of this object
  // to describe the material whose identifying number is 'material' (see list of
  // these numbers and material names at the top of this file).
  // This function DOES NOT CHANGE values of any of its uLoc_XX member variables.
  this.emissive = []; // DISCARD any current material reflectance values.
  this.ambient = [];
  this.diffuse = [];
  this.specular = [];
  this.shiny = 0.0;
  //  Set new values ONLY for material reflectances:
  switch (material) {
    case MATL_RED_PLASTIC: // 1
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.1, 0.1, 0.1, 1.0];
      this.diffuse = [0.6, 0.0, 0.0, 1.0];
      this.specular = [0.6, 0.6, 0.6, 1.0];
      this.shiny = 100.0;
      break;
    case MATL_GREEN_PLASTIC: // 2
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.05, 0.05, 0.05, 1.0];
      this.diffuse = [0.0, 0.6, 0.0, 1.0];
      this.specular = [0.2, 0.2, 0.2, 1.0];
      this.shiny = 60.0;
      break;
    case MATL_BLUE_PLASTIC: // 3
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.05, 0.05, 0.05, 1.0);
      this.diffuse.push(0.0, 0.2, 0.6, 1.0);
      this.specular.push(0.1, 0.2, 0.3, 1.0);
      this.shiny = 5.0;
      break;
    case MATL_BLACK_PLASTIC:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.0, 0.0, 0.0, 1.0];
      this.diffuse = [0.01, 0.01, 0.01, 1.0];
      this.specular = [0.5, 0.5, 0.5, 1.0];
      this.shiny = 32.0;
      break;
    case MATL_BLACK_RUBBER:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.02, 0.02, 0.02, 1.0);
      this.diffuse.push(0.01, 0.01, 0.01, 1.0);
      this.specular.push(0.4, 0.4, 0.4, 1.0);
      this.shiny = 10.0;
      break;
    case MATL_BRASS:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.329412, 0.223529, 0.027451, 1.0);
      this.diffuse.push(0.780392, 0.568627, 0.113725, 1.0);
      this.specular.push(0.992157, 0.941176, 0.807843, 1.0);
      this.shiny = 27.8974;
      break;
    case MATL_BRONZE_DULL:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.2125, 0.1275, 0.054, 1.0];
      this.diffuse = [0.714, 0.4284, 0.18144, 1.0];
      this.specular = [0.393548, 0.271906, 0.166721, 1.0];
      this.shiny = 25.6;
      break;
    case MATL_BRONZE_SHINY:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.25, 0.148, 0.06475, 1.0];
      this.diffuse = [0.4, 0.2368, 0.1036, 1.0];
      this.specular = [0.774597, 0.458561, 0.200621, 1.0];
      this.shiny = 76.8;
      break;
    case MATL_CHROME:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.25, 0.25, 0.25, 1.0);
      this.diffuse.push(0.4, 0.4, 0.4, 1.0);
      this.specular.push(0.774597, 0.774597, 0.774597, 1.0);
      this.shiny = 76.8;
      break;
    case MATL_COPPER_DULL:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.19125, 0.0735, 0.0225, 1.0);
      this.diffuse.push(0.7038, 0.27048, 0.0828, 1.0);
      this.specular.push(0.256777, 0.137622, 0.086014, 1.0);
      this.shiny = 12.8;
      break;
    case MATL_COPPER_SHINY:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.2295, 0.08825, 0.0275, 1.0];
      this.diffuse = [0.5508, 0.2118, 0.066, 1.0];
      this.specular = [0.580594, 0.223257, 0.0695701, 1.0];
      this.shiny = 51.2;
      break;
    case MATL_GOLD_DULL:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.24725, 0.1995, 0.0745, 1.0);
      this.diffuse.push(0.75164, 0.60648, 0.22648, 1.0);
      this.specular.push(0.628281, 0.555802, 0.366065, 1.0);
      this.shiny = 51.2;
      break;
    case MATL_GOLD_SHINY:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.24725, 0.2245, 0.0645, 1.0);
      this.diffuse.push(0.34615, 0.3143, 0.0903, 1.0);
      this.specular.push(0.797357, 0.723991, 0.208006, 1.0);
      this.shiny = 83.2;
      break;
    case MATL_PEWTER:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.105882, 0.058824, 0.113725, 1.0];
      this.diffuse = [0.427451, 0.470588, 0.541176, 1.0];
      this.specular = [0.333333, 0.333333, 0.521569, 1.0];
      this.shiny = 9.84615;
      break;
    case MATL_SILVER_DULL:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.19225, 0.19225, 0.19225, 1.0];
      this.diffuse = [0.50754, 0.50754, 0.50754, 1.0];
      this.specular = [0.508273, 0.508273, 0.508273, 1.0];
      this.shiny = 51.2;
      break;
    case MATL_SILVER_SHINY:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.23125, 0.23125, 0.23125, 1.0);
      this.diffuse.push(0.2775, 0.2775, 0.2775, 1.0);
      this.specular.push(0.773911, 0.773911, 0.773911, 1.0);
      this.shiny = 89.6;
      break;
    case MATL_EMERALD:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.0215, 0.1745, 0.0215, 0.55];
      this.diffuse = [0.07568, 0.61424, 0.07568, 0.55];
      this.specular = [0.633, 0.727811, 0.633, 0.55];
      this.shiny = 76.8;
      break;
    case MATL_JADE:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.135, 0.2225, 0.1575, 0.95);
      this.diffuse.push(0.54, 0.89, 0.63, 0.95);
      this.specular.push(0.316228, 0.316228, 0.316228, 0.95);
      this.shiny = 12.8;
      break;
    case MATL_OBSIDIAN:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.05375, 0.05, 0.06625, 0.82);
      this.diffuse.push(0.18275, 0.17, 0.22525, 0.82);
      this.specular.push(0.332741, 0.328634, 0.346435, 0.82);
      this.shiny = 38.4;
      break;
    case MATL_PEARL:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.25, 0.20725, 0.20725, 0.922);
      this.diffuse.push(1.0, 0.829, 0.829, 0.922);
      this.specular.push(0.296648, 0.296648, 0.296648, 0.922);
      this.shiny = 11.264;
      break;
    case MATL_RUBY:
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.1745, 0.01175, 0.01175, 0.55);
      this.diffuse.push(0.61424, 0.04136, 0.04136, 0.55);
      this.specular.push(0.727811, 0.626959, 0.626959, 0.55);
      this.shiny = 76.8;
      break;
    case MATL_TURQUOISE: // 22
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient.push(0.1, 0.18725, 0.1745, 0.8);
      this.diffuse.push(0.396, 0.74151, 0.69102, 0.8);
      this.specular.push(0.297254, 0.30829, 0.306678, 0.8);
      this.shiny = 12.8;
      break;
    case MATL_BLACK_EYE: // 23
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.0, 0.0, 0.0, 1.0];
      this.diffuse = [0.01, 0.01, 0.01, 1.0];
      this.specular = [0.1, 0.1, 0.1, 1.0];
      this.shiny = 100.0;
      break;
    case MATL_BLACK_BODY: // 24
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.1, 0.1, 0.1, 1.0];
      this.diffuse = [0.01, 0.01, 0.01, 1.0];
      this.specular = [0.1, 0.1, 0.1, 1.0];
      this.shiny = 10.0;
      break;
    case MATL_BROWN_BODY: // 25
      this.emissive = [0.0, 0.0, 0.0, 1.0];
      this.ambient = [0.2125, 0.1275, 0.054, 1.0];
      this.diffuse = [0.714, 0.4284, 0.18144, 1.0];
      this.specular = [0.2, 0.15, 0.1, 1.0];
      this.shiny = 10.0;
      break;
    default:
      // ugly featureless (emissive-only) red:
      this.emissive.push(0.5, 0.0, 0.0, 1.0); // DEFAULT: ugly RED emissive light only
      this.ambient = [0.0, 0.0, 0.0, 1.0]; // r,g,b,alpha  ambient reflectance
      this.diffuse = [0.0, 0.0, 0.0, 1.0]; //              diffuse reflectance
      this.specular = [0.0, 0.0, 0.0, 1.0]; //              specular reflectance
      this.shiny = 1.0; // Default (don't set specular exponent to zero!)
      break;
  }
};
