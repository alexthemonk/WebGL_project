// Shape library with 3 floats per vertex.

function makeSphere3() {
  var slices = 30; // # of slices of the sphere along the z axis
  var sliceVerts = 29; // # of vertices around the top edge of the slice
  var sliceAngle = Math.PI / slices; // One slice spans this fraction of the

  // Create a (global) array to hold this sphere's vertices:
  var sphereVertAry = new Float32Array((slices * 2 * sliceVerts - 2) * 3);

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
    for (v = isFirstSlice; v < 2 * sliceVerts - isLastSlice; v++, j += 3) {
      // for each vertex of this slice,
      if (v % 2 == 0) {
        sphereVertAry[j] = cosBot * Math.cos((Math.PI * v) / sliceVerts); // x
        sphereVertAry[j + 1] = cosBot * Math.sin((Math.PI * v) / sliceVerts); // y
        sphereVertAry[j + 2] = sinBot; // z
      } else {
        sphereVertAry[j] = cosTop * Math.cos((Math.PI * (v - 1)) / sliceVerts); // x
        sphereVertAry[j + 1] =
          cosTop * Math.sin((Math.PI * (v - 1)) / sliceVerts); // y
        sphereVertAry[j + 2] = sinTop; // z
      }
    }
  }

  return sphereVertAry;
}

function makeCone3() {
  var capVerts = 20; // # of vertices around the topmost 'cap' of the shape

  // Create a (global) array to hold all of this cylinder's vertices;
  coneVertAry = new Float32Array((capVerts * 4 + 2) * 3);

  // v counts vertices: j counts array elements (vertices * elements per vertex)
  for (v = 0, j = 0; v < 2 * capVerts + 1; v++, j += 3) {
    // bottom
    if (v % 2 == 0) {
      coneVertAry[j] = Math.cos((Math.PI * v) / capVerts); // x
      coneVertAry[j + 1] = Math.sin((Math.PI * v) / capVerts); // y
      coneVertAry[j + 2] = 0.0; // z
    } else {
      // put odd# vertices at center of cylinder's bottom cap:
      coneVertAry[j] = 0.0; // x,y,z,w == 0,0,-1,1; centered on z axis at -1.
      coneVertAry[j + 1] = 0.0;
      coneVertAry[j + 2] = 0.0;
    }
  }

  for (v = 0; v < 2 * capVerts + 1; v++, j += 3) {
    if (v % 2 == 0) {
      coneVertAry[j] = Math.cos((Math.PI * v) / capVerts); // x
      coneVertAry[j + 1] = Math.sin((Math.PI * v) / capVerts); // y
      coneVertAry[j + 2] = 0.0; // BOTTOM cap,
    } else {
      // position all odd# vertices along the top cap (not yet created)
      coneVertAry[j] = 0.0; // x
      coneVertAry[j + 1] = 0.0; // y
      coneVertAry[j + 2] = 2.0; // == z TOP cap
    }
  }
  return coneVertAry;
}

function makeCylinder3() {
  var capVerts = 20; // # of vertices around the topmost 'cap' of the shape

  // Create a (global) array to hold all of this cylinder's vertices;
  cylinderVertAry = new Float32Array((capVerts * 6 - 2) * 3);

  // v counts vertices: j counts array elements (vertices * elements per vertex)
  for (v = 0, j = 0; v < 2 * capVerts - 1; v++, j += 3) {
    if (v % 2 == 0) {
      cylinderVertAry[j] = Math.cos((Math.PI * v) / capVerts); // x
      cylinderVertAry[j + 1] = Math.sin((Math.PI * v) / capVerts); // y
      cylinderVertAry[j + 2] = 0.0; // z
    } else {
      // put odd# vertices at center of cylinder's bottom cap:
      cylinderVertAry[j] = 0.0; // x,y,z,w == 0,0,-1,1; centered on z axis at -1.
      cylinderVertAry[j + 1] = 0.0;
      cylinderVertAry[j + 2] = 0.0;
    }
  }

  for (v = 0; v < 2 * capVerts; v++, j += 3) {
    if (v % 2 == 0) {
      cylinderVertAry[j] = Math.cos((Math.PI * v) / capVerts); // x
      cylinderVertAry[j + 1] = Math.sin((Math.PI * v) / capVerts); // y
      cylinderVertAry[j + 2] = 0.0; // ==z  BOTTOM cap
    } else {
      // position all odd# vertices along the top cap (not yet created)
      cylinderVertAry[j] = Math.cos((Math.PI * (v - 1)) / capVerts); // x
      cylinderVertAry[j + 1] = Math.sin((Math.PI * (v - 1)) / capVerts); // y
      cylinderVertAry[j + 2] = 2.0; // == z TOP cap
    }
  }
  // Complete the cylinder with its top cap, made of 2*capVerts -1 vertices.
  // v counts the vertices in the cap; j continues to count array elements.
  for (v = 0; v < 2 * capVerts - 1; v++, j += 3) {
    // count vertices from zero again, and
    if (v % 2 == 0) {
      // position even #'d vertices around top cap's outer edge.
      cylinderVertAry[j] = Math.cos((Math.PI * v) / capVerts); // x
      cylinderVertAry[j + 1] = Math.sin((Math.PI * v) / capVerts); // y
      cylinderVertAry[j + 2] = 2.0; // z
    } else {
      // position odd#'d vertices at center of the top cap:
      cylinderVertAry[j] = 0.0; // x,y,z,w == 0,0,-1,1
      cylinderVertAry[j + 1] = 0.0;
      cylinderVertAry[j + 2] = 2.0;
    }
  }
  return cylinderVertAry;
}

function makeCube3() {
  var cubeVerts = new Float32Array((4 * 6 + 10 * 2 + 2) * 3);
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
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z

  // -2
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z

  // 3
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z

  // 2
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z

  // -1
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z

  // for position correction
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = 0.0; // z

  // -3
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = -1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  i += 3;
  cubeVerts[i] = -1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z
  i += 3;
  cubeVerts[i] = 1.0; // x
  cubeVerts[i + 1] = 1.0; // y
  cubeVerts[i + 2] = -2.0; // z

  return cubeVerts;
}

function makeCurve3() {
  var slices = 20;

  var parabolaVertAry = new Float32Array(slices * 2 * 3);

  for (i = 1; i <= slices; i++) {
    j = 2 * i * 3;
    // upperline
    // position
    x = i / slices - 0.5;
    y = 0.25 - 1 * (x * x);
    z = 0.5 * x * x;
    parabolaVertAry[j] = x;
    parabolaVertAry[j + 1] = y;
    parabolaVertAry[j + 2] = z;

    // baseline
    // position
    x = i / slices - 0.5;
    y = 0 - 0.5 * (x * x);
    z = 0.5 * x * x;
    parabolaVertAry[j + 7] = x;
    parabolaVertAry[j + 8] = y;
    parabolaVertAry[j + 9] = z;
  }
  return parabolaVertAry;
}
