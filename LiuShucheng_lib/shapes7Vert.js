// Shape library with 7 floats per vertex.

// Color
var LIGHT_GREY = new Float32Array([0.8, 0.8, 0.8]);
var DARK_GREY = new Float32Array([0.3, 0.3, 0.3]);
var BLUE = new Float32Array([0.2, 0.2, 0.8]);
var BLUE = new Float32Array([0.3, 0.3, 0.6]);
var GREEN = new Float32Array([0.2, 0.8, 0.2]);
var LIGHT_GREEN = new Float32Array([0.3, 0.6, 0.3]);
var BLACK = new Float32Array([0.1, 0.1, 0.1]);
var PINK = new Float32Array([1.0, 0.71, 0.75]);
var RED = new Float32Array([0.8, 0.2, 0.2]);
var BROWN = new Float32Array([0.6, 0.3, 0.0]);
var DARK_BROWN = new Float32Array([0.3, 0.15, 0.0]);
var WHITE = new Float32Array([1.0, 1.0, 1.0]);

function makeCone7(walColr, botColr) {
  var capVerts = 17; // # of vertices around the topmost 'cap' of the shape

  // Create a (global) array to hold all of this cylinder's vertices;
  coneVertAry = new Float32Array((capVerts * 4 + 2) * 7);

  // v counts vertices: j counts array elements (vertices * elements per vertex)
  for (v = 0, j = 0; v < 2 * capVerts + 1; v++, j += 7) {
    // bottom
    if (v % 2 == 0) {
      coneVertAry[j] = Math.cos((Math.PI * v) / capVerts); // x
      coneVertAry[j + 1] = Math.sin((Math.PI * v) / capVerts); // y
      coneVertAry[j + 2] = 0.0; // z
      coneVertAry[j + 3] = 1.0; // w
      coneVertAry[j + 4] = botColr[0];
      coneVertAry[j + 5] = botColr[1];
      coneVertAry[j + 6] = botColr[2];
    } else {
      // put odd# vertices at center of cylinder's bottom cap:
      coneVertAry[j] = 0.0; // x,y,z,w == 0,0,-1,1; centered on z axis at -1.
      coneVertAry[j + 1] = 0.0;
      coneVertAry[j + 2] = 0.0;
      coneVertAry[j + 3] = 1.0;
      coneVertAry[j + 4] = botColr[0];
      coneVertAry[j + 5] = botColr[1];
      coneVertAry[j + 6] = botColr[2];
    }
  }

  for (v = 0; v < 2 * capVerts + 1; v++, j += 7) {
    if (v % 2 == 0) {
      coneVertAry[j] = Math.cos((Math.PI * v) / capVerts); // x
      coneVertAry[j + 1] = Math.sin((Math.PI * v) / capVerts); // y
      coneVertAry[j + 2] = 0.0; // BOTTOM cap,
      coneVertAry[j + 3] = 1.0; // w
      coneVertAry[j + 4] = walColr[0];
      coneVertAry[j + 5] = walColr[1];
      coneVertAry[j + 6] = walColr[2];
    } else {
      // position all odd# vertices along the top cap (not yet created)
      coneVertAry[j] = 0.0; // x
      coneVertAry[j + 1] = 0.0; // y
      coneVertAry[j + 2] = 2.0; // == z TOP cap,
      coneVertAry[j + 3] = 1.0; // w
      coneVertAry[j + 4] = walColr[0];
      coneVertAry[j + 5] = walColr[1];
      coneVertAry[j + 6] = walColr[2];
    }
  }
  return coneVertAry;
}

function makeCylinder7(topColr, walColr, botColr, ctrColr) {
  var capVerts = 17; // # of vertices around the topmost 'cap' of the shape

  // Create a (global) array to hold all of this cylinder's vertices;
  cylinderVertAry = new Float32Array((capVerts * 6 - 2) * 7);

  // v counts vertices: j counts array elements (vertices * elements per vertex)
  for (v = 0, j = 0; v < 2 * capVerts - 1; v++, j += 7) {
    if (v % 2 == 0) {
      cylinderVertAry[j] = Math.cos((Math.PI * v) / capVerts); // x
      cylinderVertAry[j + 1] = Math.sin((Math.PI * v) / capVerts); // y
      cylinderVertAry[j + 2] = 0.0; // z
      cylinderVertAry[j + 3] = 1.0; // w
      cylinderVertAry[j + 4] = botColr[0];
      cylinderVertAry[j + 5] = botColr[1];
      cylinderVertAry[j + 6] = botColr[2];
    } else {
      // put odd# vertices at center of cylinder's bottom cap:
      cylinderVertAry[j] = 0.0; // x,y,z,w == 0,0,-1,1; centered on z axis at -1.
      cylinderVertAry[j + 1] = 0.0;
      cylinderVertAry[j + 2] = 0.0;
      cylinderVertAry[j + 3] = 1.0;
      cylinderVertAry[j + 4] = ctrColr[0];
      cylinderVertAry[j + 5] = ctrColr[1];
      cylinderVertAry[j + 6] = ctrColr[2];
    }
  }

  for (v = 0; v < 2 * capVerts; v++, j += 7) {
    if (v % 2 == 0) {
      cylinderVertAry[j] = Math.cos((Math.PI * v) / capVerts); // x
      cylinderVertAry[j + 1] = Math.sin((Math.PI * v) / capVerts); // y
      cylinderVertAry[j + 2] = 0.0; // ==z  BOTTOM cap,
      cylinderVertAry[j + 3] = 1.0; // w
      cylinderVertAry[j + 4] = walColr[0];
      cylinderVertAry[j + 5] = walColr[1];
      cylinderVertAry[j + 6] = walColr[2];
      if (v == 0) {
        cylinderVertAry[j + 4] = walColr[0];
        cylinderVertAry[j + 5] = walColr[1];
        cylinderVertAry[j + 6] = walColr[2];
      }
    } else {
      // position all odd# vertices along the top cap (not yet created)
      cylinderVertAry[j] = Math.cos((Math.PI * (v - 1)) / capVerts); // x
      cylinderVertAry[j + 1] = Math.sin((Math.PI * (v - 1)) / capVerts); // y
      cylinderVertAry[j + 2] = 2.0; // == z TOP cap,
      cylinderVertAry[j + 3] = 1.0; // w
      cylinderVertAry[j + 4] = walColr[0];
      cylinderVertAry[j + 5] = walColr[1];
      cylinderVertAry[j + 6] = walColr[2];
    }
  }
  // Complete the cylinder with its top cap, made of 2*capVerts -1 vertices.
  // v counts the vertices in the cap; j continues to count array elements.
  for (v = 0; v < 2 * capVerts - 1; v++, j += 7) {
    // count vertices from zero again, and
    if (v % 2 == 0) {
      // position even #'d vertices around top cap's outer edge.
      cylinderVertAry[j] = Math.cos((Math.PI * v) / capVerts); // x
      cylinderVertAry[j + 1] = Math.sin((Math.PI * v) / capVerts); // y
      cylinderVertAry[j + 2] = 2.0; // z
      cylinderVertAry[j + 3] = 1.0; // w
      cylinderVertAry[j + 4] = topColr[0];
      cylinderVertAry[j + 5] = topColr[1];
      cylinderVertAry[j + 6] = topColr[2];
      if (v == 0) {
        cylinderVertAry[j + 4] = walColr[0];
        cylinderVertAry[j + 5] = walColr[1];
        cylinderVertAry[j + 6] = walColr[2]; // (make it red; see lecture notes)
      }
    } else {
      // position odd#'d vertices at center of the top cap:
      cylinderVertAry[j] = 0.0; // x,y,z,w == 0,0,-1,1
      cylinderVertAry[j + 1] = 0.0;
      cylinderVertAry[j + 2] = 2.0;
      cylinderVertAry[j + 3] = 1.0;
      cylinderVertAry[j + 4] = ctrColr[0];
      cylinderVertAry[j + 5] = ctrColr[1];
      cylinderVertAry[j + 6] = ctrColr[2];
    }
  }
  return cylinderVertAry;
}

function makeCube7(topColr, walColr, fntColr) {
  var cubeVerts = new Float32Array(7 * (4 * 6 + 10 * 2 + 2));
  //     ____
  //   / 3  /|
  //  /____/ |
  //  | 1  |2/
  //  |____|/

  // 1
  i = 0;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = fntColr[0]; // r
  cubeVerts[i + 5] = fntColr[1]; // g
  cubeVerts[i + 6] = fntColr[2]; // b
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = fntColr[0]; // r
  cubeVerts[i + 5] = fntColr[1]; // g
  cubeVerts[i + 6] = fntColr[2]; // b
  for (var z = -0.1; z >= -1.9; z -= 0.2) {
    i += 7;
    cubeVerts[i] = 1.0; // x
    cubeVerts[i + 1] = 1.0; // y
    cubeVerts[i + 2] = z; // z
    cubeVerts[i + 3] = 1.0; // w
    cubeVerts[i + 4] = fntColr[0] + Math.random(1 - fntColr[0]) / 4 - 0.5; // r
    cubeVerts[i + 5] = fntColr[1] + Math.random(1 - fntColr[1]) / 4 - 0.5; // g
    cubeVerts[i + 6] = fntColr[2] + Math.random(1 - fntColr[2]) / 4 - 0.5; // b
    i += 7;
    cubeVerts[i] = -1.0; // x
    cubeVerts[i + 1] = 1.0; // y
    cubeVerts[i + 2] = z; // z
    cubeVerts[i + 3] = 1.0; // w
    cubeVerts[i + 4] = fntColr[0] + Math.random(1 - fntColr[0]) / 4 - 0.5; // r
    cubeVerts[i + 5] = fntColr[1] + Math.random(1 - fntColr[1]) / 4 - 0.5; // g
    cubeVerts[i + 6] = fntColr[2] + Math.random(1 - fntColr[2]) / 4 - 0.5; // b
  }
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = fntColr[0]; // r
  cubeVerts[i + 5] = fntColr[1]; // g
  cubeVerts[i + 6] = fntColr[2]; // b
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = fntColr[0]; // r
  cubeVerts[i + 5] = fntColr[1]; // g
  cubeVerts[i + 6] = fntColr[2]; // b

  // -2
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = walColr[0]; // r
  cubeVerts[i + 5] = walColr[1]; // g
  cubeVerts[i + 6] = walColr[2]; // b
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = walColr[0]; // r
  cubeVerts[i + 5] = walColr[1]; // g
  cubeVerts[i + 6] = walColr[2]; // b
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = walColr[0]; // r
  cubeVerts[i + 5] = walColr[1]; // g
  cubeVerts[i + 6] = walColr[2]; // b
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = walColr[0]; // r
  cubeVerts[i + 5] = walColr[1]; // g
  cubeVerts[i + 6] = walColr[2]; // b

  // 3
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = topColr[0]; // r
  cubeVerts[i + 5] = topColr[1]; // g
  cubeVerts[i + 6] = topColr[2]; // b
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = topColr[0]; // r
  cubeVerts[i + 5] = topColr[1]; // g
  cubeVerts[i + 6] = topColr[2]; // b
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = topColr[0]; // r
  cubeVerts[i + 5] = topColr[1]; // g
  cubeVerts[i + 6] = topColr[2]; // b
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = topColr[0]; // r
  cubeVerts[i + 5] = topColr[1]; // g
  cubeVerts[i + 6] = topColr[2]; // b

  // 2
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = walColr[0]; // r
  cubeVerts[i + 5] = walColr[1]; // g
  cubeVerts[i + 6] = walColr[2]; // b
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = walColr[0]; // r
  cubeVerts[i + 5] = walColr[1]; // g
  cubeVerts[i + 6] = walColr[2]; // b
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = walColr[0]; // r
  cubeVerts[i + 5] = walColr[1]; // g
  cubeVerts[i + 6] = walColr[2]; // b
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = walColr[0]; // r
  cubeVerts[i + 5] = walColr[1]; // g
  cubeVerts[i + 6] = walColr[2]; // b

  // -1
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = fntColr[0]; // r
  cubeVerts[i + 5] = fntColr[1]; // g
  cubeVerts[i + 6] = fntColr[2]; // b
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = fntColr[0]; // r
  cubeVerts[i + 5] = fntColr[1]; // g
  cubeVerts[i + 6] = fntColr[2]; // b
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = fntColr[0]; // r
  cubeVerts[i + 5] = fntColr[1]; // g
  cubeVerts[i + 6] = fntColr[2]; // b
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = fntColr[0]; // r
  cubeVerts[i + 5] = fntColr[1]; // g
  cubeVerts[i + 6] = fntColr[2]; // b

  // for position correction
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = 0.0; // r
  cubeVerts[i + 5] = 0.0; // g
  cubeVerts[i + 6] = 0.0; // b
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = 0.0; // r
  cubeVerts[i + 5] = 0.0; // g
  cubeVerts[i + 6] = 0.0; // b

  // -3
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = topColr[0]; // r
  cubeVerts[i + 5] = topColr[1]; // g
  cubeVerts[i + 6] = topColr[2]; // b
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = topColr[0]; // r
  cubeVerts[i + 5] = topColr[1]; // g
  cubeVerts[i + 6] = topColr[2]; // b
  i += 7;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = topColr[0]; // r
  cubeVerts[i + 5] = topColr[1]; // g
  cubeVerts[i + 6] = topColr[2]; // b
  i += 7;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  cubeVerts[i + 3] = 1.0; // w
  cubeVerts[i + 4] = topColr[0]; // r
  cubeVerts[i + 5] = topColr[1]; // g
  cubeVerts[i + 6] = topColr[2]; // b

  return cubeVerts;
}

function makeAxis7() {
  var xColr = new Float32Array([0.3, 1.0, 0.3]); // G
  var yColr = new Float32Array([0.3, 0.3, 1.0]); // B
  var zColr = new Float32Array([1.0, 0.3, 0.3]); // R

  var axisVerts = new Float32Array(7 * 2 * 3);

  axisVerts[0] = 0.0; // x
  axisVerts[1] = 0.0; // y
  axisVerts[2] = 0.0; // z
  axisVerts[3] = 1.0; // w
  axisVerts[4] = xColr[0]; // r
  axisVerts[5] = xColr[1]; // g
  axisVerts[6] = xColr[2]; // b

  axisVerts[7] = 10.0; // x
  axisVerts[8] = 0.0; // y
  axisVerts[9] = 0.0; // z
  axisVerts[10] = 1.0; // w
  axisVerts[11] = xColr[0]; // r
  axisVerts[12] = xColr[1]; // g
  axisVerts[13] = xColr[2]; // b

  axisVerts[14] = 0.0; // x
  axisVerts[15] = 0.0; // y
  axisVerts[16] = 0.0; // z
  axisVerts[17] = 1.0; // w
  axisVerts[18] = yColr[0]; // r
  axisVerts[19] = yColr[1]; // g
  axisVerts[20] = yColr[2]; // b

  axisVerts[21] = 0.0; // x
  axisVerts[22] = 10.0; // y
  axisVerts[23] = 0.0; // z
  axisVerts[24] = 1.0; // w
  axisVerts[25] = yColr[0]; // r
  axisVerts[26] = yColr[1]; // g
  axisVerts[27] = yColr[2]; // b

  axisVerts[28] = 0.0; // x
  axisVerts[29] = 0.0; // y
  axisVerts[30] = 0.0; // z
  axisVerts[31] = 1.0; // w
  axisVerts[32] = zColr[0]; // r
  axisVerts[33] = zColr[1]; // g
  axisVerts[34] = zColr[2]; // b

  axisVerts[35] = 0.0; // x
  axisVerts[36] = 0.0; // y
  axisVerts[37] = 10.0; // z
  axisVerts[38] = 1.0; // w
  axisVerts[39] = zColr[0]; // r
  axisVerts[40] = zColr[1]; // g
  axisVerts[41] = zColr[2]; // b

  return axisVerts;
}

function makeSphere7(topColr, botColr, color) {
  var slices = 17; // # of slices of the sphere along the z axis
  var sliceVerts = 19; // # of vertices around the top edge of the slice
  var sliceAngle = Math.PI / slices; // One slice spans this fraction of the

  // Create a (global) array to hold this sphere's vertices:
  var sphereVertAry = new Float32Array((slices * 2 * sliceVerts - 2) * 7);

  // INITIALIZE:
  var cosBot = 0.0;
  var sinBot = 0.0;
  // (NOTE: Lattitude = 0 @equator; -90deg @south pole; +90deg at north pole)
  var cosTop = 0.0;
  var sinTop = 0.0;
  var j = 0;
  var isFirstSlice = 1;
  var isLastSlice = 0;
  for (s = 0; s < slices; s++) {
    // for each slice of the sphere
    // For current slice's top & bottom edges, find lattitude angle sin,cos:
    if (s == 0) {
      isFirstSlice = 1;
      cosBot = 0.0;
      sinBot = -1.0;
    } else {
      // otherwise, set new bottom edge == old top edge
      isFirstSlice = 0;
      cosBot = cosTop;
      sinBot = sinTop;
    } // then compute sine,cosine of lattitude of new top edge.
    cosTop = Math.cos(-Math.PI / 2 + (s + 1) * sliceAngle);
    sinTop = Math.sin(-Math.PI / 2 + (s + 1) * sliceAngle);

    if (s == slices - 1) isLastSlice = 1; // (flag: skip last vertex of the last slice).
    for (v = isFirstSlice; v < 2 * sliceVerts - isLastSlice; v++, j += 7) {
      // for each vertex of this slice,
      if (v % 2 == 0) {
        sphereVertAry[j] = cosBot * Math.cos((Math.PI * v) / sliceVerts); // x
        sphereVertAry[j + 1] = cosBot * Math.sin((Math.PI * v) / sliceVerts); // y
        sphereVertAry[j + 2] = sinBot; // z
        sphereVertAry[j + 3] = 1.0; // w.
      } else {
        sphereVertAry[j] = cosTop * Math.cos((Math.PI * (v - 1)) / sliceVerts); // x
        sphereVertAry[j + 1] =
          cosTop * Math.sin((Math.PI * (v - 1)) / sliceVerts); // y
        sphereVertAry[j + 2] = sinTop; // z
        sphereVertAry[j + 3] = 1.0;
      }
      if (isFirstSlice == 1) {
        sphereVertAry[j + 4] = botColr[0];
        sphereVertAry[j + 5] = botColr[1];
        sphereVertAry[j + 6] = botColr[2];
      } else if (isLastSlice == 1) {
        sphereVertAry[j + 4] = topColr[0];
        sphereVertAry[j + 5] = topColr[1];
        sphereVertAry[j + 6] = topColr[2];
      } else {
        // for all non-top, not-bottom slices, set vertex colors randomly
        sphereVertAry[j + 4] = color[0]; // 0.0 <= red <= 0.5
        sphereVertAry[j + 5] = color[1]; // 0.0 <= grn <= 0.5
        sphereVertAry[j + 6] = color[2]; // 0.0 <= blu <= 0.5
      }
    }
  }

  return sphereVertAry;
}

function makeCurve7(color) {
  var slices = 17;

  var parabolaVertAry = new Float32Array(slices * 2 * 7);

  for (i = 1; i <= slices; i++) {
    j = 2 * i * 7;
    // upperline
    // position
    x = i / slices - 0.5;
    y = 0.25 - 1 * (x * x);
    z = 0.5 * x * x;
    parabolaVertAry[j] = x;
    parabolaVertAry[j + 1] = y;
    parabolaVertAry[j + 2] = z;
    parabolaVertAry[j + 3] = 1.0;
    // color
    parabolaVertAry[j + 4] = color[0];
    parabolaVertAry[j + 5] = color[1];
    parabolaVertAry[j + 6] = color[2];

    // baseline
    // position
    x = i / slices - 0.5;
    y = 0 - 0.5 * (x * x);
    z = 0.5 * x * x;
    parabolaVertAry[j + 7] = x;
    parabolaVertAry[j + 8] = y;
    parabolaVertAry[j + 9] = z;
    parabolaVertAry[j + 10] = 1.0;
    // color
    parabolaVertAry[j + 11] = color[0];
    parabolaVertAry[j + 12] = color[1];
    parabolaVertAry[j + 13] = color[2];
  }
  return parabolaVertAry;
}

function makeGroundGrid7() {
  var xcount = 100; // # of lines to draw in x,y to make the grid.
  var ycount = 100;
  var xymax = 5; // grid size; extends to cover +/-xymax in x and y.
  var xColr = new Float32Array([0.5, 0.5, 1.0]); // bright yellow
  var yColr = new Float32Array([0.5, 1.0, 0.5]); // bright green.

  // Create an (global) array to hold this ground-plane's vertices:
  var gndVerts = new Float32Array(7 * 2 * (xcount + ycount));
  // draw a grid made of xcount+ycount lines; 2 vertices per line.

  var xgap = xymax / (xcount - 1); // HALF-spacing between lines in x,y;
  var ygap = xymax / (ycount - 1); // (why half? because v==(0line number/2))

  // First, step thru x values as we make vertical lines of constant-x:
  for (v = 0, j = 0; v < 2 * xcount; v++, j += 7) {
    if (v % 2 == 0) {
      // put even-numbered vertices at (xnow, -xymax, 0)
      gndVerts[j] = -xymax + v * xgap; // x
      gndVerts[j + 1] = -xymax; // y
      gndVerts[j + 2] = 0.0; // z
      gndVerts[j + 3] = 1.0; // w.
    } else {
      // put odd-numbered vertices at (xnow, +xymax, 0).
      gndVerts[j] = -xymax + (v - 1) * xgap; // x
      gndVerts[j + 1] = xymax; // y
      gndVerts[j + 2] = 0.0; // z
      gndVerts[j + 3] = 1.0; // w.
    }
    gndVerts[j + 4] = xColr[0]; // red
    gndVerts[j + 5] = xColr[1]; // grn
    gndVerts[j + 6] = xColr[2]; // blu
  }
  // Second, step thru y values as wqe make horizontal lines of constant-y:
  // (don't re-initialize j--we're adding more vertices to the array)
  for (v = 0; v < 2 * ycount; v++, j += 7) {
    if (v % 2 == 0) {
      // put even-numbered vertices at (-xymax, ynow, 0)
      gndVerts[j] = -xymax; // x
      gndVerts[j + 1] = -xymax + v * ygap; // y
      gndVerts[j + 2] = 0.0; // z
      gndVerts[j + 3] = 1.0; // w.
    } else {
      // put odd-numbered vertices at (+xymax, ynow, 0).
      gndVerts[j] = xymax; // x
      gndVerts[j + 1] = -xymax + (v - 1) * ygap; // y
      gndVerts[j + 2] = 0.0; // z
      gndVerts[j + 3] = 1.0; // w.
    }
    gndVerts[j + 4] = yColr[0]; // red
    gndVerts[j + 5] = yColr[1]; // grn
    gndVerts[j + 6] = yColr[2]; // blu
  }
  return gndVerts;
}
