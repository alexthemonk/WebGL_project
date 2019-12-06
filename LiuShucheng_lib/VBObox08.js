function VBObox0() {
  this.VERT_SRC = //--------------------- VERTEX SHADER source code
    "precision highp float;\n" +
    //
    "uniform mat4 u_ModelMatrix;\n" +
    "attribute vec4 a_Position;\n" +
    "attribute vec3 a_Color;\n" +
    "varying vec3 v_Color;\n" +
    //
    "void main() {\n" +
    "  gl_Position = u_ModelMatrix * a_Position;\n" +
    "	 v_Color = a_Color;\n" +
    " }\n";

  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code
    "precision mediump float;\n" +
    //
    "varying vec3 v_Color;\n" +
    "void main() {\n" +
    "  gl_FragColor = vec4(v_Color, 1.0);\n" +
    "}\n";

  // vertex array
  this.vboContents = makeGroundGrid7();

  // number of floats per vertex
  this.floatsPerVertex = 7;

  // # of vertices held in 'vboContents' array
  this.vboVerts = this.vboContents.length / this.floatsPerVertex;

  // size of each element (bytes per float)
  this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;

  // total number of bytes stored in vboContents
  this.vboBytes = this.vboContents.length * this.FSIZE;

  // number of bytes to store one complete vertex
  this.vboStride = this.vboBytes / this.vboVerts;

  // # of floats for a_Position. (x,y,z,w values)
  this.vboFcount_a_Position = 4;

  // # of floats for a_Color (r,g,b values)
  this.vboFcount_a_Color = 3;

  console.assert(
    (this.vboFcount_a_Position + // check the size of each and
      this.vboFcount_a_Color) * // every attribute in our VBO
      this.FSIZE ==
      this.vboStride, // for agreeement with'stride'
    "Uh oh! VBObox0.vboStride disagrees with attribute-size values!"
  );

  //----------------------Attribute offsets
  this.vboOffset_a_Position = 0;
  this.vboOffset_a_Color = this.vboFcount_a_Position * this.FSIZE;
  this.vboLoc;
  this.shaderLoc;
  this.a_PositionLoc; // GPU location for 'a_Position' attribute
  this.a_ColorLoc; // GPU location for 'a_Color' attribute

  //---------------------- Uniform locations &values in our shaders
  this.ModelMatrix = new Matrix4();
  this.u_ModelMatrixLoc;
}

VBObox0.prototype.init = function() {
  // Compile,link,upload shaders
  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to create executable Shaders on the GPU. Bye!"
    );
    return;
  }

  gl.program = this.shaderLoc;

  // Create VBO on GPU
  this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log(
      this.constructor.name + ".init() failed to create VBO in GPU. Bye!"
    );
    return;
  }

  // Specify the purpose of our newly-created VBO on the GPU.
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

  // Fill the GPU's newly-created VBO object with the vertex data
  gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);

  // Find All Attributes
  this.a_PositionLoc = gl.getAttribLocation(this.shaderLoc, "a_Position");
  if (this.a_PositionLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() Failed to get GPU location of attribute a_Position"
    );
    return -1; // error exit.
  }
  this.a_ColorLoc = gl.getAttribLocation(this.shaderLoc, "a_Color");
  if (this.a_ColorLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() failed to get the GPU location of attribute a_Color"
    );
    return -1; // error exit.
  }
  // Find All Uniforms
  this.u_ModelMatrixLoc = gl.getUniformLocation(
    this.shaderLoc,
    "u_ModelMatrix"
  );
  if (!this.u_ModelMatrixLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to get GPU location for u_ModelMat1 uniform"
    );
    return;
  }
};

VBObox0.prototype.switchToMe = function() {
  // a) select our shader program:
  gl.useProgram(this.shaderLoc);

  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program
  gl.vertexAttribPointer(
    this.a_PositionLoc, //index
    this.vboFcount_a_Position,
    gl.FLOAT, // type
    false, // fixed-point values not normalize
    this.vboStride,
    this.vboOffset_a_Position
  );
  gl.vertexAttribPointer(
    this.a_ColorLoc,
    this.vboFcount_a_Color,
    gl.FLOAT,
    false,
    this.vboStride,
    this.vboOffset_a_Color
  );

  // enable assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PositionLoc);
  gl.enableVertexAttribArray(this.a_ColorLoc);
};

VBObox0.prototype.isReady = function() {
  var isOK = true;

  if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
    console.log(
      this.constructor.name +
        ".isReady() false: shader program at this.shaderLoc not in use!"
    );
    isOK = false;
  }
  if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
    console.log(
      this.constructor.name + ".isReady() false: vbo at this.vboLoc not in use!"
    );
    isOK = false;
  }
  return isOK;
};

VBObox0.prototype.setView = function() {
  gl.viewport(
    0, // Viewport lower-left corner
    0, // location
    (g_canvas.width * 3) / 4, // viewport width,
    g_canvas.height
  ); // viewport height in pixels.

  this.ModelMatrix.setIdentity();
  this.ModelMatrix.perspective(42.0, 1.0, 0.5, 1000.0);

  if (g_freeCam) {
    var lookAt = getFreeLookAt();
    this.ModelMatrix.lookAt(
      g_freeCamPos[0],
      g_freeCamPos[1],
      g_freeCamPos[2], // center of projection
      lookAt[0],
      lookAt[1],
      lookAt[2], // look-at point
      g_upVec[0],
      g_upVec[1],
      g_upVec[2] // View UP vector.
    );
  } else {
    var camPosition = getThirdCamPos();
    this.ModelMatrix.lookAt(
      camPosition[0],
      camPosition[1],
      camPosition[2], // center of projection
      g_thirdLookAt[0],
      g_thirdLookAt[1],
      g_thirdLookAt[2], // look-at point
      g_upVec[0],
      g_upVec[1],
      g_upVec[2] // View UP vector.
    );
  }
  this.draw();

  // top down ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    g_canvas.height / 2, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  this.ModelMatrix.setIdentity(); // DEFINE 'world-space' coords.
  this.ModelMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  this.ModelMatrix.lookAt(0, 0, 5, 0, 0, 0, -1, 0, 0);
  this.draw();

  // horizontal ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    0, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  this.ModelMatrix.setIdentity(); // DEFINE 'world-space' coords.
  this.ModelMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  this.ModelMatrix.lookAt(5, 0, 0, 0, 0, 0, 0, 0, 1);
  this.draw();
};

VBObox0.prototype.draw = function() {
  if (this.isReady() == false) {
    console.log(
      "ERROR! before" +
        this.constructor.name +
        ".draw() call you needed to call this.switchToMe()!!"
    );
  }

  // start drawing
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.scale(0.5, 0.5, 0.5);

  gl.uniformMatrix4fv(
    this.u_ModelMatrixLoc, // GPU location of the uniform
    false, // use matrix transpose instead?
    this.ModelMatrix.elements
  );
  gl.drawArrays(
    gl.LINES, // select the drawing primitive to draw,
    // gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP,
    // gl.TRIANGLES, gl.TRIANGLE_STRIP, ...
    0, // location of 1st vertex to draw;
    this.vboVerts
  ); // number of vertices to draw on-screen.
  this.ModelMatrix = popMatrix();
};

VBObox0.prototype.reload = function() {
  gl.bufferSubData(
    gl.ARRAY_BUFFER, // GLenum target(same as 'bindBuffer()')
    0, // byte offset to where data replacement
    // begins in the VBO.
    this.vboContents
  ); // the JS source-data array used to fill VBO
};

VBObox0.prototype.empty = function() {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any
  // shader programs, attributes, uniforms, textures, samplers or other claims on
  // GPU memory.  However, make sure this step is reversible by a call to
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for
  // uniforms, all stride and offset values, etc.
};

VBObox0.prototype.restore = function() {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any
  // shader programs, attributes, uniforms, textures, samplers or other claims on
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms,
  // all stride and offset values, etc.
};

// Vertix arrays
var g_colorShapes;

var g_cylinderVertAry; // cylinder array

var g_giraffeBodyVertAry; // cylinder array
var g_giraffeLegVertAry; // cylinder array
var g_giraffeHeadVertAry; // Sphere array
var g_giraffeEarVertAry; // Cone array

var g_humanBodyVertAry; // cube array
var g_humanHeadVertAry; // sphere array
var g_humanArmVertAry; // cube array

// Vertix start for shapes
var g_cylinderStart;

var g_giraffeBodyStart;
var g_giraffeLegStart;
var g_giraffeHeadStart;
var g_giraffeEarStart;

var g_humanBodyStart;
var g_humanHeadStart;
var g_humanArmStart;

function initVerts7() {
  // make vertice arrays for objects
  g_cylinderVertAry = makeCylinder7(PINK, RED, PINK, RED);

  g_giraffeBodyVertAry = makeCylinder7(
    DARK_BROWN,
    DARK_BROWN,
    DARK_BROWN,
    DARK_BROWN
  );
  g_giraffeLegVertAry = makeCylinder7(LIGHT_GREY, BROWN, LIGHT_GREY, BROWN);
  g_giraffeHeadVertAry = makeSphere7(BLACK, BLACK, BLACK);
  g_giraffeEarVertAry = makeCone7(BROWN, BLACK);

  g_humanBodyVertAry = makeCube7(LIGHT_GREY, DARK_GREY, BLUE);
  g_humanHeadVertAry = makeSphere7(DARK_GREY, DARK_GREY, DARK_GREY);
  g_humanArmVertAry = makeCube7(LIGHT_GREY, BLUE, LIGHT_GREEN);

  var floatNum =
    g_cylinderVertAry.length +
    g_giraffeBodyVertAry.length +
    g_giraffeLegVertAry.length +
    g_giraffeHeadVertAry.length +
    g_giraffeEarVertAry.length +
    g_humanBodyVertAry.length +
    g_humanHeadVertAry.length +
    g_humanArmVertAry.length;

  // Copy all shapes into one big Float32 array:
  g_colorShapes = new Float32Array(floatNum);
  var i = 0;

  g_cylinderStart = i;
  for (j = 0; j < g_cylinderVertAry.length; i++, j++) {
    g_colorShapes[i] = g_cylinderVertAry[j];
  }

  g_giraffeBodyStart = i;
  for (j = 0; j < g_giraffeBodyVertAry.length; i++, j++) {
    g_colorShapes[i] = g_giraffeBodyVertAry[j];
  }
  g_giraffeLegStart = i;
  for (j = 0; j < g_giraffeLegVertAry.length; i++, j++) {
    g_colorShapes[i] = g_giraffeLegVertAry[j];
  }
  g_giraffeHeadStart = i;
  for (j = 0; j < g_giraffeHeadVertAry.length; i++, j++) {
    g_colorShapes[i] = g_giraffeHeadVertAry[j];
  }
  g_giraffeEarStart = i;
  for (j = 0; j < g_giraffeEarVertAry.length; i++, j++) {
    g_colorShapes[i] = g_giraffeEarVertAry[j];
  }

  g_humanBodyStart = i;
  for (j = 0; j < g_humanBodyVertAry.length; i++, j++) {
    g_colorShapes[i] = g_humanBodyVertAry[j];
  }
  g_humanHeadStart = i;
  for (j = 0; j < g_humanHeadVertAry.length; i++, j++) {
    g_colorShapes[i] = g_humanHeadVertAry[j];
  }
  g_humanArmStart = i;
  for (j = 0; j < g_humanArmVertAry.length; i++, j++) {
    g_colorShapes[i] = g_humanArmVertAry[j];
  }
}
initVerts7();

function VBObox1() {
  this.VERT_SRC = //--------------------- VERTEX SHADER source code
    "precision highp float;\n" +
    //
    "uniform mat4 u_ModelMatrix;\n" +
    "attribute vec4 a_Position;\n" +
    "attribute vec3 a_Color;\n" +
    "varying vec3 v_Color;\n" +
    //
    "void main() {\n" +
    "  gl_Position = u_ModelMatrix * a_Position;\n" +
    "	 v_Color = a_Color;\n" +
    " }\n";

  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code
    "precision mediump float;\n" +
    "varying vec3 v_Color;\n" +
    "void main() {\n" +
    "  gl_FragColor = vec4(v_Color, 1.0);\n" +
    "}\n";

  // vertex array
  this.vboContents = g_colorShapes;

  // number of floats per vertex
  this.floatsPerVertex = 7;

  // # of vertices held in 'vboContents' array
  this.vboVerts = this.vboContents.length / this.floatsPerVertex;

  // size of each element (bytes per float)
  this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;

  // total number of bytes stored in vboContents
  this.vboBytes = this.vboContents.length * this.FSIZE;

  // number of bytes to store one complete vertex
  this.vboStride = this.vboBytes / this.vboVerts;

  // # of floats for a_Position. (x,y,z,w values)
  this.vboFcount_a_Position = 4;

  // # of floats for a_Color (r,g,b values)
  this.vboFcount_a_Color = 3;

  console.assert(
    (this.vboFcount_a_Position + // check the size of each and
      this.vboFcount_a_Color) * // every attribute in our VBO
      this.FSIZE ==
      this.vboStride, // for agreeement with'stride'
    "Uh oh! VBObox1.vboStride disagrees with attribute-size values!"
  );

  //----------------------Attribute offsets
  this.vboOffset_a_Position = 0;
  this.vboOffset_a_Color = this.vboFcount_a_Position * this.FSIZE;
  this.vboLoc;
  this.shaderLoc;
  this.a_PositionLoc; // GPU location for 'a_Position' attribute
  this.a_ColorLoc; // GPU location for 'a_Color' attribute

  //---------------------- Uniform locations &values in our shaders
  this.ModelMatrix = new Matrix4();
  this.u_ModelMatrixLoc;
}

VBObox1.prototype.init = function() {
  // Compile,link,upload shaders
  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to create executable Shaders on the GPU. Bye!"
    );
    return;
  }

  gl.program = this.shaderLoc;

  // Create VBO on GPU
  this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log(
      this.constructor.name + ".init() failed to create VBO in GPU. Bye!"
    );
    return;
  }

  // Specify the purpose of our newly-created VBO on the GPU.
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

  // Fill the GPU's newly-created VBO object with the vertex data
  gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);

  // Find All Attributes
  this.a_PositionLoc = gl.getAttribLocation(this.shaderLoc, "a_Position");
  if (this.a_PositionLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() Failed to get GPU location of attribute a_Position"
    );
    return -1; // error exit.
  }
  this.a_ColorLoc = gl.getAttribLocation(this.shaderLoc, "a_Color");
  if (this.a_ColorLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() failed to get the GPU location of attribute a_Color"
    );
    return -1; // error exit.
  }
  // Find All Uniforms
  this.u_ModelMatrixLoc = gl.getUniformLocation(
    this.shaderLoc,
    "u_ModelMatrix"
  );
  if (!this.u_ModelMatrixLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to get GPU location for u_ModelMat1 uniform"
    );
    return;
  }
};

VBObox1.prototype.switchToMe = function() {
  // a) select our shader program:
  gl.useProgram(this.shaderLoc);

  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program
  gl.vertexAttribPointer(
    this.a_PositionLoc, //index
    this.vboFcount_a_Position,
    gl.FLOAT, // type
    false, // fixed-point values not normalize
    this.vboStride,
    this.vboOffset_a_Position
  );
  gl.vertexAttribPointer(
    this.a_ColorLoc,
    this.vboFcount_a_Color,
    gl.FLOAT,
    false,
    this.vboStride,
    this.vboOffset_a_Color
  );

  // enable assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PositionLoc);
  gl.enableVertexAttribArray(this.a_ColorLoc);
};

VBObox1.prototype.isReady = function() {
  var isOK = true;

  if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
    console.log(
      this.constructor.name +
        ".isReady() false: shader program at this.shaderLoc not in use!"
    );
    isOK = false;
  }
  if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
    console.log(
      this.constructor.name + ".isReady() false: vbo at this.vboLoc not in use!"
    );
    isOK = false;
  }
  return isOK;
};

VBObox1.prototype.setView = function() {
  gl.viewport(
    0, // Viewport lower-left corner
    0, // location
    (g_canvas.width * 3) / 4, // viewport width,
    g_canvas.height
  ); // viewport height in pixels.

  this.ModelMatrix.setIdentity();
  this.ModelMatrix.perspective(42.0, 1.0, 0.5, 1000.0);

  if (g_freeCam) {
    var lookAt = getFreeLookAt();
    this.ModelMatrix.lookAt(
      g_freeCamPos[0],
      g_freeCamPos[1],
      g_freeCamPos[2], // center of projection
      lookAt[0],
      lookAt[1],
      lookAt[2], // look-at point
      g_upVec[0],
      g_upVec[1],
      g_upVec[2] // View UP vector.
    );
  } else {
    var camPosition = getThirdCamPos();
    this.ModelMatrix.lookAt(
      camPosition[0],
      camPosition[1],
      camPosition[2], // center of projection
      g_thirdLookAt[0],
      g_thirdLookAt[1],
      g_thirdLookAt[2], // look-at point
      g_upVec[0],
      g_upVec[1],
      g_upVec[2] // View UP vector.
    );
  }
  this.draw();

  // top down ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    g_canvas.height / 2, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  this.ModelMatrix.setIdentity(); // DEFINE 'world-space' coords.
  this.ModelMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  this.ModelMatrix.lookAt(0, 0, 5, 0, 0, 0, -1, 0, 0);
  this.draw();

  // horizontal ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    0, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  this.ModelMatrix.setIdentity(); // DEFINE 'world-space' coords.
  this.ModelMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  this.ModelMatrix.lookAt(5, 0, 0, 0, 0, 0, 0, 0, 1);
  this.draw();
};

VBObox1.prototype.draw = function() {
  if (this.isReady() == false) {
    console.log(
      "ERROR! before" +
        this.constructor.name +
        ".draw() call you needed to call this.switchToMe()!!"
    );
  }

  // start drawing
  pushMatrix(this.ModelMatrix);

  this.drawCylinder();
  this.drawGiraffe();
  this.drawHuman();

  this.ModelMatrix = popMatrix();
};

VBObox1.prototype.drawHuman = function() {
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.translate(g_thirdLookAt[0], g_thirdLookAt[1], 0.54);
  this.ModelMatrix.rotate(180, 0, 0, 1);
  this.ModelMatrix.rotate((g_thirdTheta / Math.PI) * 180 - 90, 0, 0, 1);

  pushMatrix(this.ModelMatrix);

  // Body
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.scale(1 / 20, 1 / 20, 1 / 6);

  var vertexStartIndex = g_humanBodyStart / this.floatsPerVertex;
  var vertexCount = g_humanBodyVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Arm
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0.06, 0, -0.03);
  this.ModelMatrix.rotate(-20, 0, 1, 0);
  this.ModelMatrix.rotate(g_humanArmAngle, 1, 0, 0);
  this.ModelMatrix.scale(1 / 35, 1 / 35, 1 / 7);

  var vertexStartIndex = g_humanArmStart / this.floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.06, 0, -0.03);
  this.ModelMatrix.rotate(20, 0, 1, 0);
  this.ModelMatrix.rotate(-g_humanArmAngle, 1, 0, 0);
  this.ModelMatrix.scale(1 / 35, 1 / 35, 1 / 7);

  var vertexStartIndex = g_humanArmStart / this.floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Legs
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.025, 0, -0.3);
  this.ModelMatrix.scale(1 / 50, 1 / 50, 1 / 8);

  var vertexStartIndex = g_humanArmStart / this.floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0.025, 0, -0.3);
  this.ModelMatrix.scale(1 / 50, 1 / 50, 1 / 8);

  var vertexStartIndex = g_humanArmStart / this.floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Head
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.scale(1 / 15, 1 / 15, 1 / 15);
  this.ModelMatrix.translate(0, 0, 0.7);

  var vertexStartIndex = g_humanHeadStart / this.floatsPerVertex;
  var vertexCount = g_humanHeadVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();
};

VBObox1.prototype.drawGiraffe = function() {
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.translate(-1, -1, 0.25);
  this.ModelMatrix.rotate(90, 1, 0, 0);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / this.floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.translate(0, 0.05, 0.3);
  this.ModelMatrix.rotate(-45 + g_neckAngle, 1, 0, 0);
  this.ModelMatrix.scale(1 / 1.5, 1 / 1.5, 1 / 1.2);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / this.floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.scale(1.5, 1.5, 1.2);
  this.ModelMatrix.translate(0, 0, 0.25);
  this.ModelMatrix.rotate(g_neckAngle, 1, 0, 0);
  this.ModelMatrix.scale(1 / 1.5, 1 / 1.5, 1 / 1.5);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / this.floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.scale(1.5, 1.5, 1.2);
  this.ModelMatrix.translate(0, 0, 0.25);
  this.ModelMatrix.rotate(g_neckAngle, 1, 0, 0);
  this.ModelMatrix.scale(1 / 1.5, 1 / 1.5, 1 / 1.5);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / this.floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Head
  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.scale(1.5, 1.5, 1.2);
  this.ModelMatrix.translate(0, -0.025, 0.35);
  this.ModelMatrix.scale(1 / 1.1, 1.5, 1 / 1.1);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeHeadStart / this.floatsPerVertex;
  var vertexCount = g_giraffeHeadVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Ears
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.translate(0.5, 0.4, 0.5);
  this.ModelMatrix.rotate(30, 0, 1, 0);
  this.ModelMatrix.scale(0.5, 0.1, 0.5);

  var vertexStartIndex = g_giraffeEarStart / this.floatsPerVertex;
  var vertexCount = g_giraffeEarVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.5, 0.4, 0.5);
  this.ModelMatrix.rotate(-30, 0, 1, 0);
  this.ModelMatrix.scale(0.5, 0.1, 0.5);

  var vertexStartIndex = g_giraffeEarStart / this.floatsPerVertex;
  var vertexCount = g_giraffeEarVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Legs
  // Front
  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.translate(0.075, 0.05, 0.3);
  this.ModelMatrix.rotate(80, 1, 0, 0);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeLegStart / this.floatsPerVertex;
  var vertexCount = g_giraffeLegVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.translate(-0.075, 0.05, 0.3);
  this.ModelMatrix.rotate(80, 1, 0, 0);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeLegStart / this.floatsPerVertex;
  var vertexCount = g_giraffeLegVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Back
  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.translate(0.075, 0.05, 0.05);
  this.ModelMatrix.rotate(100, 1, 0, 0);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeLegStart / this.floatsPerVertex;
  var vertexCount = g_giraffeLegVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.translate(-0.075, 0.05, 0.05);
  this.ModelMatrix.rotate(100, 1, 0, 0);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeLegStart / this.floatsPerVertex;
  var vertexCount = g_giraffeLegVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();
};

VBObox1.prototype.drawCylinder = function() {
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.translate(-1, 1, 0);
  this.ModelMatrix.scale(0.25, 0.25, 0.25);

  var vertexStartIndex = g_cylinderStart / this.floatsPerVertex;
  var vertexCount = g_cylinderVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.translate(0, 0, 2);
  this.ModelMatrix.scale(0.67, 0.67, 0.67);

  var quatMatrix = new Matrix4(); // rotation matrix, made from latest qTot
  quatMatrix.setFromQuat(g_qTot.x, g_qTot.y, g_qTot.z, g_qTot.w); // Quaternion-->Matrix
  this.ModelMatrix.concat(quatMatrix); // apply that matrix.

  var vertexStartIndex = g_cylinderStart / this.floatsPerVertex;
  var vertexCount = g_cylinderVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();
};

VBObox1.prototype.reload = function() {
  gl.bufferSubData(
    gl.ARRAY_BUFFER, // GLenum target(same as 'bindBuffer()')
    0, // byte offset to where data replacement
    // begins in the VBO.
    this.vboContents
  ); // the JS source-data array used to fill VBO
};

VBObox1.prototype.empty = function() {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any
  // shader programs, attributes, uniforms, textures, samplers or other claims on
  // GPU memory.  However, make sure this step is reversible by a call to
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for
  // uniforms, all stride and offset values, etc.
};

VBObox1.prototype.restore = function() {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any
  // shader programs, attributes, uniforms, textures, samplers or other claims on
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms,
  // all stride and offset values, etc.
};

var g_shapes;

// vertex arrays
var g_sphereVertAry; // sphere array
var g_droneBodyVertAry; // sphere array
var g_droneArmVertAry; // cylinder array

var g_frogHeadVertAry; // sphere array
var g_frogEyeVertAry; // sphere array
var g_frogMouseVertAry; // parabola array

// vertex start
var g_sphereStart;
var g_droneBodyStart;
var g_droneArmStart;

var g_frogHeadStart;
var g_frogEyeStart;
var g_frogMouseStart;

function initVerts3() {
  // make vertice arrays for objects
  g_sphereVertAry = makeSphere3();

  g_droneBodyVertAry = makeSphere3();
  g_droneArmVertAry = makeCylinder3();

  g_frogHeadVertAry = makeSphere3();
  g_frogEyeVertAry = makeSphere3();
  g_frogMouseVertAry = makeCurve3();

  var floatNum =
    g_sphereVertAry.length +
    g_droneBodyVertAry.length +
    g_droneArmVertAry.length +
    g_frogHeadVertAry.length +
    g_frogEyeVertAry.length +
    g_frogMouseVertAry.length;

  // Copy all shapes into one big Float32 array:
  g_shapes = new Float32Array(floatNum);
  var i = 0;

  g_sphereStart = i;
  for (j = 0; j < g_sphereVertAry.length; i++, j++) {
    g_shapes[i] = g_sphereVertAry[j];
  }
  g_droneBodyStart = i;
  for (j = 0; j < g_droneBodyVertAry.length; i++, j++) {
    g_shapes[i] = g_droneBodyVertAry[j];
  }
  g_droneArmStart = i;
  for (j = 0; j < g_droneArmVertAry.length; i++, j++) {
    g_shapes[i] = g_droneArmVertAry[j];
  }

  g_frogHeadStart = i;
  for (j = 0; j < g_frogHeadVertAry.length; i++, j++) {
    g_shapes[i] = g_frogHeadVertAry[j];
  }
  g_frogEyeStart = i;
  for (j = 0; j < g_frogEyeVertAry.length; i++, j++) {
    g_shapes[i] = g_frogEyeVertAry[j];
  }
  g_frogMouseStart = i;
  for (j = 0; j < g_frogMouseVertAry.length; i++, j++) {
    g_shapes[i] = g_frogMouseVertAry[j];
  }
}
initVerts3();

// Phong Shading
// Blinn Phong Lighting
function VBObox2() {
  this.VERT_SRC = //--------------------- VERTEX SHADER source code
    "precision highp float;\n" +
    //
    "attribute vec4 a_Position;\n" +
    "attribute vec4 a_Normal;\n" +
    //
    "uniform mat4 u_ModelMatrix;\n" +
    "uniform mat4 u_NormalMatrix;\n" +
    "uniform mat4 u_MvpMatrix;\n" +
    "uniform vec3 u_Kd; \n" +
    //
    "varying vec4 v_Position; \n" +
    "varying vec3 v_Kd; \n" +
    "varying vec3 v_Normal; \n" +
    //
    "void main() {\n" +
    "  gl_Position = u_MvpMatrix * a_Position;\n" +
    "  v_Position = u_ModelMatrix * a_Position; \n" +
    "  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n" +
    "	 v_Kd = u_Kd; \n" +
    " }\n";

  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code
    "precision mediump float;\n" +
    //
    "uniform vec3 u_LightPos;\n" +
    "uniform vec3 u_LightAmb;\n" +
    "uniform vec3 u_LightDiff;\n" +
    "uniform vec3 u_LightSpec;\n" +
    //
    "uniform vec3 u_WorldLightDir;\n" +
    "uniform vec3 u_WorldLightAmb;\n" +
    "uniform vec3 u_WorldLightDiff;\n" +
    "uniform vec3 u_WorldLightSpec;\n" +
    //
    "uniform vec3 u_Ke;\n" +
    "uniform vec3 u_Ka;\n" +
    "uniform vec3 u_Ks;\n" +
    "uniform float u_Kshiny; \n" +
    "uniform vec3 u_CamPos; \n" +
    //
    "varying vec3 v_Normal;\n" +
    "varying vec4 v_Position;\n" +
    "varying vec3 v_Kd;	\n" +
    "void main() {\n" +
    "  vec3 normal = normalize(v_Normal); \n" +
    "  vec3 lightDirection = normalize(u_LightPos.xyz - v_Position.xyz);\n" +
    "  vec3 eyeDirection = normalize(u_CamPos.xyz - v_Position.xyz); \n" +
    "  vec3 H = normalize(lightDirection + eyeDirection); \n" +
    "  float nDotL = max(dot(lightDirection, normal), 0.0); \n" +
    "  float nDotH = max(dot(H, normal), 0.0); \n" +
    "  float e64 = pow(nDotH, u_Kshiny);\n" +
    //
    "	 vec3 emissive = u_Ke;" +
    "  vec3 ambient = u_LightAmb * u_Ka;\n" +
    "  vec3 diffuse = u_LightDiff * v_Kd * nDotL;\n" +
    "	 vec3 speculr = u_LightSpec * u_Ks * e64;\n" +
    //
    "  vec3 world_H = normalize(u_WorldLightDir + eyeDirection); \n" +
    "  float world_nDotL = max(dot(normalize(u_WorldLightDir), normal), 0.0); \n" +
    "  float world_nDotH = max(dot(world_H, normal), 0.0); \n" +
    "  float world_e64 = pow(world_nDotH, u_Kshiny);\n" +
    //
    "	 vec3 world_emissive = u_Ke;" +
    "  vec3 world_ambient = u_WorldLightAmb * u_Ka;\n" +
    "  vec3 world_diffuse = u_WorldLightDiff * v_Kd * world_nDotL;\n" +
    "	 vec3 world_speculr = u_WorldLightSpec * u_Ks * world_e64;\n" +
    //
    "  gl_FragColor = vec4(emissive + ambient + diffuse + speculr + world_emissive + world_ambient + world_diffuse + world_speculr , 1.0);\n" +
    "}\n";

  // vertex array
  this.vboContents = g_shapes;

  // number of floats per vertex
  this.floatsPerVertex = 3;

  // # of vertices held in 'vboContents' array
  this.vboVerts = this.vboContents.length / this.floatsPerVertex;

  // size of each element (bytes per float)
  this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;

  // total number of bytes stored in vboContents
  this.vboBytes = this.vboContents.length * this.FSIZE;

  // number of bytes to store one complete vertex
  this.vboStride = this.vboBytes / this.vboVerts;

  // # of floats for a_Position. (x,y,z values)
  this.vboFcount_a_Position = 3;

  // # of floats for a_Normal.
  this.vboFcount_a_Normal = 3;

  console.assert(
    this.vboFcount_a_Position * this.FSIZE == this.vboStride, // for agreeement with'stride'
    "Uh oh! VBObox2.vboStride disagrees with attribute-size values!"
  );

  //----------------------Attribute offsets
  this.vboOffset_a_Position = 0;
  this.vboLoc;
  this.shaderLoc;

  this.a_PositionLoc = false;
  this.a_NormalLoc = false;

  this.droneLight = new Light();
  this.worldLight = new Light();
  this.material = new Material();

  this.worldLightDirection = [0.5, 0.5, 1.0, 0.0];

  this.u_ModelMatrixLoc = false;
  this.u_NormalMatrixLoc = false;
  this.u_MvpMatrixLoc = false;
  this.u_KdLoc = false;

  this.u_KeLoc = false;
  this.u_KaLoc = false;
  this.u_KsLoc = false;
  this.u_KshinyLoc = false;
  this.u_CamPosLoc = false;

  this.ModelMatrix = new Matrix4();
  this.MvpMatrix = new Matrix4();
  this.NormalMatrix = new Matrix4();
}

VBObox2.prototype.init = function() {
  // Compile,link,upload shaders
  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to create executable Shaders on the GPU. Bye!"
    );
    return;
  }

  gl.program = this.shaderLoc;

  // Create VBO on GPU
  this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log(
      this.constructor.name + ".init() failed to create VBO in GPU. Bye!"
    );
    return;
  }

  // Specify the purpose of our newly-created VBO on the GPU.
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

  // Fill the GPU's newly-created VBO object with the vertex data
  gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);

  // Find All Attributes
  this.a_PositionLoc = gl.getAttribLocation(this.shaderLoc, "a_Position");
  if (this.a_PositionLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() Failed to get GPU location of attribute a_Position"
    );
    return -1; // error exit.
  }
  this.a_NormalLoc = gl.getAttribLocation(this.shaderLoc, "a_Normal");
  if (this.a_NormalLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() Failed to get GPU location of attribute a_Normal"
    );
    return -1; // error exit.
  }
  // Find All Uniforms
  this.u_ModelMatrixLoc = gl.getUniformLocation(
    this.shaderLoc,
    "u_ModelMatrix"
  );
  if (!this.u_ModelMatrixLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to get GPU location for u_ModelMatrix uniform"
    );
    return;
  }
  this.u_NormalMatrixLoc = gl.getUniformLocation(
    this.shaderLoc,
    "u_NormalMatrix"
  );
  if (!this.u_NormalMatrixLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to get GPU location for u_NormalMatrix uniform"
    );
    return;
  }
  this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, "u_MvpMatrix");
  if (!this.u_MvpMatrixLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to get GPU location for u_MvpMatrix uniform"
    );
    return;
  }

  // Lighting source and Material
  this.droneLight.init(
    "u_LightPos",
    "u_LightAmb",
    "u_LightDiff",
    "u_LightSpec"
  );
  this.worldLight.init(
    "u_WorldLightDir",
    "u_WorldLightAmb",
    "u_WorldLightDiff",
    "u_WorldLightSpec"
  );

  this.material.init("u_Ke", "u_Ka", "u_Kd", "u_Ks", "u_Kshiny");

  this.u_CamPosLoc = gl.getUniformLocation(gl.program, "u_CamPos");
  if (!this.u_CamPosLoc) {
    console.log("Failed to get the Camera Position");
    return;
  }
};

VBObox2.prototype.switchToMe = function() {
  // a) select our shader program:
  gl.useProgram(this.shaderLoc);

  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program
  gl.vertexAttribPointer(
    this.a_PositionLoc, //index
    this.vboFcount_a_Position,
    gl.FLOAT, // type
    false, // fixed-point values not normalize
    this.vboStride,
    0
  );
  gl.vertexAttribPointer(
    this.a_NormalLoc, //index
    this.vboFcount_a_Normal,
    gl.FLOAT, // type
    false, // fixed-point values not normalize
    this.vboStride,
    0
  );

  // enable assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PositionLoc);
  gl.enableVertexAttribArray(this.a_NormalLoc);
};

VBObox2.prototype.isReady = function() {
  var isOK = true;

  if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
    console.log(
      this.constructor.name +
        ".isReady() false: shader program at this.shaderLoc not in use!"
    );
    isOK = false;
  }
  if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
    console.log(
      this.constructor.name + ".isReady() false: vbo at this.vboLoc not in use!"
    );
    isOK = false;
  }
  return isOK;
};

VBObox2.prototype.setView = function() {
  gl.viewport(
    0, // Viewport lower-left corner
    0, // location
    (g_canvas.width * 3) / 4, // viewport width,
    g_canvas.height
  ); // viewport height in pixels.

  this.MvpMatrix.setIdentity();
  this.MvpMatrix.perspective(42.0, 1.0, 0.5, 1000.0);

  if (g_freeCam) {
    var lookAt = getFreeLookAt();
    this.MvpMatrix.lookAt(
      g_freeCamPos[0],
      g_freeCamPos[1],
      g_freeCamPos[2], // center of projection
      lookAt[0],
      lookAt[1],
      lookAt[2], // look-at point
      g_upVec[0],
      g_upVec[1],
      g_upVec[2] // View UP vector.
    );
  } else {
    var camPosition = getThirdCamPos();
    this.MvpMatrix.lookAt(
      camPosition[0],
      camPosition[1],
      camPosition[2], // center of projection
      g_thirdLookAt[0],
      g_thirdLookAt[1],
      g_thirdLookAt[2], // look-at point
      g_upVec[0],
      g_upVec[1],
      g_upVec[2] // View UP vector.
    );
  }
  this.draw();

  // top down ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    g_canvas.height / 2, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  this.MvpMatrix.setIdentity(); // DEFINE 'world-space' coords.
  this.MvpMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  this.MvpMatrix.lookAt(0, 0, 5, 0, 0, 0, -1, 0, 0);
  this.draw();

  // horizontal ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    0, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  this.MvpMatrix.setIdentity(); // DEFINE 'world-space' coords.
  this.MvpMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  this.MvpMatrix.lookAt(5, 0, 0, 0, 0, 0, 0, 0, 1);
  this.draw();
};

VBObox2.prototype.setViewOld = function() {
  gl.viewport(
    0, // Viewport lower-left corner
    0, // location
    (g_canvas.width * 3) / 4, // viewport width,
    g_canvas.height
  ); // viewport height in pixels.

  this.ModelMatrix.setIdentity();
  this.ModelMatrix.perspective(42.0, 1.0, 1.0, 1000.0);

  if (g_freeCam) {
    var lookAt = getFreeLookAt();
    this.ModelMatrix.lookAt(
      g_freeCamPos[0],
      g_freeCamPos[1],
      g_freeCamPos[2], // center of projection
      lookAt[0],
      lookAt[1],
      lookAt[2], // look-at point
      g_upVec[0],
      g_upVec[1],
      g_upVec[2] // View UP vector.
    );
  } else {
    var camPosition = getThirdCamPos();
    this.ModelMatrix.lookAt(
      camPosition[0],
      camPosition[1],
      camPosition[2], // center of projection
      g_thirdLookAt[0],
      g_thirdLookAt[1],
      g_thirdLookAt[2], // look-at point
      g_upVec[0],
      g_upVec[1],
      g_upVec[2] // View UP vector.
    );
  }
  this.draw();

  // top down ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    g_canvas.height / 2, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  this.ModelMatrix.setIdentity(); // DEFINE 'world-space' coords.
  this.ModelMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  this.ModelMatrix.lookAt(0, 0, 5, 0, 0, 0, -1, 0, 0);
  this.draw();

  // horizontal ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    0, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  this.ModelMatrix.setIdentity(); // DEFINE 'world-space' coords.
  this.ModelMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  this.ModelMatrix.lookAt(5, 0, 0, 0, 0, 0, 0, 0, 1);
  this.draw();
};

VBObox2.prototype.draw = function() {
  if (this.isReady() == false) {
    console.log(
      "ERROR! before" +
        this.constructor.name +
        ".draw() call you needed to call this.switchToMe()!!"
    );
  }

  // start drawing
  pushMatrix(this.ModelMatrix);

  this.worldLight.translate(this.worldLightDirection);
  this.worldLight.setLight(SUN_LIGHT);

  this.drawSphere();
  this.drawDrone();
  this.drawFrog();

  this.ModelMatrix = popMatrix();
};

VBObox2.prototype.drawSphere = function() {
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.scale(0.25, 0.25, 0.25);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_BRONZE_SHINY,
    g_sphereStart,
    g_sphereVertAry
  );

  this.ModelMatrix = popMatrix();
};

VBObox2.prototype.drawDrone = function() {
  pushMatrix(this.ModelMatrix);

  // Body
  this.ModelMatrix.translate(g_freeCamPos[0], g_freeCamPos[1], g_freeCamPos[2]);
  this.ModelMatrix.translate(0.0, 0.0, 0.2);
  this.ModelMatrix.rotate((g_freeTheta / Math.PI) * 180, 0, 0, 1);
  this.ModelMatrix.rotate((g_freePhi / Math.PI) * 180, 1, 0, 0);
  this.ModelMatrix.scale(1 / 6, 1 / 6, 1 / 20);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneBodyStart,
    g_droneBodyVertAry
  );

  this.ModelMatrix.scale(6, 6, 20);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);

  // Arms
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0.1, -0.1, 0);
  this.ModelMatrix.rotate(90, 1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, 1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.1, -0.1, 0);
  this.ModelMatrix.rotate(90, 1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, 1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.1, 0.1, 0);
  this.ModelMatrix.rotate(90, -1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, -1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0.1, 0.1, 0);
  this.ModelMatrix.rotate(90, -1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, -1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix = popMatrix();
};

VBObox2.prototype.drawFrog = function() {
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.translate(0.5, -0.5, 0.25);
  this.ModelMatrix.rotate(90, 1, 0, 0);
  this.ModelMatrix.rotate(g_testAngle * 10, 0, 1, 0);
  this.ModelMatrix.scale(0.25, 0.25, 0.25);

  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);

  // Head
  this.ModelMatrix.scale(0.5, 0.35, 0.35);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_GREEN_PLASTIC,
    g_frogHeadStart,
    g_frogHeadVertAry
  );

  // Mouse
  this.ModelMatrix.translate(0, -0.45, 0.9);
  this.ModelMatrix.rotate(180, 0, 1, 0);
  this.ModelMatrix.rotate(-25, 1, 0, 0);
  this.ModelMatrix.rotate(180, 0, 0, 1);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_RED_PLASTIC,
    g_frogMouseStart,
    g_frogMouseVertAry
  );

  // Eye

  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(0.35, 0.15, 0.2);
  this.ModelMatrix.scale(0.2, 0.2, 0.2);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_BLACK_EYE,
    g_frogEyeStart,
    g_frogEyeVertAry
  );

  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(-0.35, 0.15, 0.2);
  this.ModelMatrix.scale(0.2, 0.2, 0.2);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_BLACK_EYE,
    g_frogEyeStart,
    g_frogEyeVertAry
  );

  // Body
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0, -0.5, 0);
  this.ModelMatrix.scale(0.25, 0.35, 0.25);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_GREEN_PLASTIC,
    g_frogHeadStart,
    g_frogHeadVertAry
  );

  this.ModelMatrix = popMatrix();
};

VBObox2.prototype.pushTriangleStrip = function(
  lightPosition,
  light,
  material,
  vertexStart,
  vertexArray
) {
  if (this.droneLight.isLit) {
    this.droneLight.translate(lightPosition);
    this.droneLight.setLight(light);
    this.droneLight.push();
  }
  if (this.worldLight.isLit) {
    this.worldLight.push();
  }

  this.material.setMaterial(material);
  this.material.push();

  this.NormalMatrix.setInverseOf(this.ModelMatrix);
  this.NormalMatrix.transpose();
  gl.uniformMatrix4fv(
    this.u_NormalMatrixLoc,
    false,
    this.NormalMatrix.elements
  );

  pushMatrix(this.MvpMatrix);
  this.MvpMatrix.multiply(this.ModelMatrix);
  gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, this.MvpMatrix.elements);
  this.MvpMatrix = popMatrix();

  if (g_freeCam) {
    gl.uniform3fv(this.u_CamPosLoc, g_freeCamPos);
  } else {
    gl.uniform3fv(this.u_CamPosLoc, getThirdCamPos());
  }

  var vertexStartIndex = vertexStart / this.floatsPerVertex;
  var vertexCount = vertexArray.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);
};

VBObox2.prototype.reload = function() {
  gl.bufferSubData(
    gl.ARRAY_BUFFER, // GLenum target(same as 'bindBuffer()')
    0, // byte offset to where data replacement
    // begins in the VBO.
    this.vboContents
  ); // the JS source-data array used to fill VBO
};

VBObox2.prototype.empty = function() {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any
  // shader programs, attributes, uniforms, textures, samplers or other claims on
  // GPU memory.  However, make sure this step is reversible by a call to
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for
  // uniforms, all stride and offset values, etc.
};

VBObox2.prototype.restore = function() {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any
  // shader programs, attributes, uniforms, textures, samplers or other claims on
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms,
  // all stride and offset values, etc.
};

// Gouraud Shading
// Blinn Phong Lighting
function VBObox3() {
  this.VERT_SRC = //--------------------- VERTEX SHADER source code
    "precision highp float;\n" +
    //
    "attribute vec4 a_Position;\n" +
    "attribute vec4 a_Normal;\n" +
    //
    "uniform mat4 u_ModelMatrix;\n" +
    "uniform mat4 u_NormalMatrix;\n" +
    "uniform mat4 u_MvpMatrix;\n" +
    "uniform vec3 u_Kd; \n" +
    //
    "uniform vec3 u_LightPos;\n" +
    "uniform vec3 u_LightAmb;\n" +
    "uniform vec3 u_LightDiff;\n" +
    "uniform vec3 u_LightSpec;\n" +
    //
    "uniform vec3 u_WorldLightDir;\n" +
    "uniform vec3 u_WorldLightAmb;\n" +
    "uniform vec3 u_WorldLightDiff;\n" +
    "uniform vec3 u_WorldLightSpec;\n" +
    //
    "uniform vec3 u_Ke;\n" +
    "uniform vec3 u_Ka;\n" +
    "uniform vec3 u_Ks;\n" +
    "uniform float u_Kshiny; \n" +
    "uniform vec3 u_CamPos; \n" +
    //
    "varying vec4 v_Color;\n" +
    //
    "void main() {\n" +
    "  gl_Position = u_MvpMatrix * a_Position;\n" +
    "  vec4 position = u_ModelMatrix * a_Position; \n" +
    "  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n" +
    //
    "  vec3 lightDirection = normalize(u_LightPos.xyz - position.xyz);\n" +
    "  vec3 eyeDirection = normalize(u_CamPos.xyz - position.xyz); \n" +
    "  vec3 H = normalize(lightDirection + eyeDirection); \n" +
    "  float nDotL = max(dot(lightDirection, normal), 0.0); \n" +
    "  float nDotH = max(dot(H, normal), 0.0); \n" +
    "  float e64 = pow(nDotH, u_Kshiny);\n" +
    //
    "	 vec3 emissive = u_Ke;" +
    "  vec3 ambient = u_LightAmb * u_Ka;\n" +
    "  vec3 diffuse = u_LightDiff * u_Kd * nDotL;\n" +
    "	 vec3 speculr = u_LightSpec * u_Ks * e64;\n" +
    //
    "  vec3 world_H = normalize(u_WorldLightDir + eyeDirection); \n" +
    "  float world_nDotL = max(dot(normalize(u_WorldLightDir), normal), 0.0); \n" +
    "  float world_nDotH = max(dot(world_H, normal), 0.0); \n" +
    "  float world_e64 = pow(world_nDotH, u_Kshiny);\n" +
    //
    "	 vec3 world_emissive = u_Ke;" +
    "  vec3 world_ambient = u_WorldLightAmb * u_Ka;\n" +
    "  vec3 world_diffuse = u_WorldLightDiff * u_Kd * world_nDotL;\n" +
    "	 vec3 world_speculr = u_WorldLightSpec * u_Ks * world_e64;\n" +
    //
    "  v_Color = vec4(emissive + ambient + diffuse + speculr + world_emissive + world_ambient + world_diffuse + world_speculr , 1.0);\n" +
    //
    " }\n";

  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code
    "precision mediump float;\n" +
    //
    "varying vec4 v_Color;\n" +
    //
    "void main() {\n" +
    "  gl_FragColor = v_Color;\n" +
    "}\n";

  // vertex array
  this.vboContents = g_shapes;

  // number of floats per vertex
  this.floatsPerVertex = 3;

  // # of vertices held in 'vboContents' array
  this.vboVerts = this.vboContents.length / this.floatsPerVertex;

  // size of each element (bytes per float)
  this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;

  // total number of bytes stored in vboContents
  this.vboBytes = this.vboContents.length * this.FSIZE;

  // number of bytes to store one complete vertex
  this.vboStride = this.vboBytes / this.vboVerts;

  // # of floats for a_Position. (x,y,z values)
  this.vboFcount_a_Position = 3;

  // # of floats for a_Normal.
  this.vboFcount_a_Normal = 3;

  console.assert(
    this.vboFcount_a_Position * this.FSIZE == this.vboStride, // for agreeement with'stride'
    "Uh oh! VBObox3.vboStride disagrees with attribute-size values!"
  );

  //----------------------Attribute offsets
  this.vboOffset_a_Position = 0;
  this.vboLoc;
  this.shaderLoc;

  this.a_PositionLoc = false;
  this.a_NormalLoc = false;

  this.droneLight = new Light();
  this.worldLight = new Light();
  this.material = new Material();

  this.worldLightDirection = [0.5, 0.5, 1.0, 0.0];

  this.u_ModelMatrixLoc = false;
  this.u_NormalMatrixLoc = false;
  this.u_MvpMatrixLoc = false;
  this.u_KdLoc = false;

  this.u_KeLoc = false;
  this.u_KaLoc = false;
  this.u_KsLoc = false;
  this.u_KshinyLoc = false;
  this.u_CamPosLoc = false;

  this.ModelMatrix = new Matrix4();
  this.MvpMatrix = new Matrix4();
  this.NormalMatrix = new Matrix4();
}

VBObox3.prototype.init = function() {
  // Compile,link,upload shaders
  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to create executable Shaders on the GPU. Bye!"
    );
    return;
  }

  gl.program = this.shaderLoc;

  // Create VBO on GPU
  this.vboLoc = gl.createBuffer();
  if (!this.vboLoc) {
    console.log(
      this.constructor.name + ".init() failed to create VBO in GPU. Bye!"
    );
    return;
  }

  // Specify the purpose of our newly-created VBO on the GPU.
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

  // Fill the GPU's newly-created VBO object with the vertex data
  gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);

  // Find All Attributes
  this.a_PositionLoc = gl.getAttribLocation(this.shaderLoc, "a_Position");
  if (this.a_PositionLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() Failed to get GPU location of attribute a_Position"
    );
    return -1; // error exit.
  }
  this.a_NormalLoc = gl.getAttribLocation(this.shaderLoc, "a_Normal");
  if (this.a_NormalLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() Failed to get GPU location of attribute a_Normal"
    );
    return -1; // error exit.
  }
  // Find All Uniforms
  this.u_ModelMatrixLoc = gl.getUniformLocation(
    this.shaderLoc,
    "u_ModelMatrix"
  );
  if (!this.u_ModelMatrixLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to get GPU location for u_ModelMatrix uniform"
    );
    return;
  }
  this.u_NormalMatrixLoc = gl.getUniformLocation(
    this.shaderLoc,
    "u_NormalMatrix"
  );
  if (!this.u_NormalMatrixLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to get GPU location for u_NormalMatrix uniform"
    );
    return;
  }
  this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, "u_MvpMatrix");
  if (!this.u_MvpMatrixLoc) {
    console.log(
      this.constructor.name +
        ".init() failed to get GPU location for u_MvpMatrix uniform"
    );
    return;
  }

  // Lighting source and Material
  this.droneLight.init(
    "u_LightPos",
    "u_LightAmb",
    "u_LightDiff",
    "u_LightSpec"
  );
  this.worldLight.init(
    "u_WorldLightDir",
    "u_WorldLightAmb",
    "u_WorldLightDiff",
    "u_WorldLightSpec"
  );

  this.material.init("u_Ke", "u_Ka", "u_Kd", "u_Ks", "u_Kshiny");

  this.u_CamPosLoc = gl.getUniformLocation(gl.program, "u_CamPos");
  if (!this.u_CamPosLoc) {
    console.log("Failed to get the Camera Position");
    return;
  }
};

VBObox3.prototype.switchToMe = function() {
  // a) select our shader program:
  gl.useProgram(this.shaderLoc);

  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program
  gl.vertexAttribPointer(
    this.a_PositionLoc, //index
    this.vboFcount_a_Position,
    gl.FLOAT, // type
    false, // fixed-point values not normalize
    this.vboStride,
    0
  );
  gl.vertexAttribPointer(
    this.a_NormalLoc, //index
    this.vboFcount_a_Normal,
    gl.FLOAT, // type
    false, // fixed-point values not normalize
    this.vboStride,
    0
  );

  // enable assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PositionLoc);
  gl.enableVertexAttribArray(this.a_NormalLoc);
};

VBObox3.prototype.isReady = function() {
  var isOK = true;

  if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
    console.log(
      this.constructor.name +
        ".isReady() false: shader program at this.shaderLoc not in use!"
    );
    isOK = false;
  }
  if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
    console.log(
      this.constructor.name + ".isReady() false: vbo at this.vboLoc not in use!"
    );
    isOK = false;
  }
  return isOK;
};

VBObox3.prototype.setView = function() {
  gl.viewport(
    0, // Viewport lower-left corner
    0, // location
    (g_canvas.width * 3) / 4, // viewport width,
    g_canvas.height
  ); // viewport height in pixels.

  this.MvpMatrix.setIdentity();
  this.MvpMatrix.perspective(42.0, 1.0, 0.5, 1000.0);

  if (g_freeCam) {
    var lookAt = getFreeLookAt();
    this.MvpMatrix.lookAt(
      g_freeCamPos[0],
      g_freeCamPos[1],
      g_freeCamPos[2], // center of projection
      lookAt[0],
      lookAt[1],
      lookAt[2], // look-at point
      g_upVec[0],
      g_upVec[1],
      g_upVec[2] // View UP vector.
    );
  } else {
    var camPosition = getThirdCamPos();
    this.MvpMatrix.lookAt(
      camPosition[0],
      camPosition[1],
      camPosition[2], // center of projection
      g_thirdLookAt[0],
      g_thirdLookAt[1],
      g_thirdLookAt[2], // look-at point
      g_upVec[0],
      g_upVec[1],
      g_upVec[2] // View UP vector.
    );
  }
  this.draw();

  // top down ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    g_canvas.height / 2, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  this.MvpMatrix.setIdentity(); // DEFINE 'world-space' coords.
  this.MvpMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  this.MvpMatrix.lookAt(0, 0, 5, 0, 0, 0, -1, 0, 0);
  this.draw();

  // horizontal ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    0, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  this.MvpMatrix.setIdentity(); // DEFINE 'world-space' coords.
  this.MvpMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  this.MvpMatrix.lookAt(5, 0, 0, 0, 0, 0, 0, 0, 1);
  this.draw();
};

VBObox3.prototype.draw = function() {
  if (this.isReady() == false) {
    console.log(
      "ERROR! before" +
        this.constructor.name +
        ".draw() call you needed to call this.switchToMe()!!"
    );
  }

  // start drawing
  pushMatrix(this.ModelMatrix);

  this.worldLight.translate(this.worldLightDirection);
  this.worldLight.setLight(SUN_LIGHT);

  this.drawSphere();
  this.drawDrone();
  this.drawFrog();

  this.ModelMatrix = popMatrix();
};

VBObox3.prototype.drawSphere = function() {
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.scale(0.25, 0.25, 0.25);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_BRONZE_SHINY,
    g_sphereStart,
    g_sphereVertAry
  );

  this.ModelMatrix = popMatrix();
};

VBObox3.prototype.drawDrone = function() {
  pushMatrix(this.ModelMatrix);

  // Body
  this.ModelMatrix.translate(g_freeCamPos[0], g_freeCamPos[1], g_freeCamPos[2]);
  this.ModelMatrix.translate(0.0, 0.0, 0.2);
  this.ModelMatrix.rotate((g_freeTheta / Math.PI) * 180, 0, 0, 1);
  this.ModelMatrix.rotate((g_freePhi / Math.PI) * 180, 1, 0, 0);
  this.ModelMatrix.scale(1 / 6, 1 / 6, 1 / 20);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneBodyStart,
    g_droneBodyVertAry
  );

  this.ModelMatrix.scale(6, 6, 20);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);

  // Arms
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0.1, -0.1, 0);
  this.ModelMatrix.rotate(90, 1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, 1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.1, -0.1, 0);
  this.ModelMatrix.rotate(90, 1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, 1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.1, 0.1, 0);
  this.ModelMatrix.rotate(90, -1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, -1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0.1, 0.1, 0);
  this.ModelMatrix.rotate(90, -1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, -1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_COPPER_SHINY,
    g_droneArmStart,
    g_droneArmVertAry
  );

  this.ModelMatrix = popMatrix();
};

VBObox3.prototype.drawFrog = function() {
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.translate(0.5, -0.5, 0.25);
  this.ModelMatrix.rotate(90, 1, 0, 0);
  this.ModelMatrix.rotate(g_testAngle * 10, 0, 1, 0);
  this.ModelMatrix.scale(0.25, 0.25, 0.25);

  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);

  // Head
  this.ModelMatrix.scale(0.5, 0.35, 0.35);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_GREEN_PLASTIC,
    g_frogHeadStart,
    g_frogHeadVertAry
  );

  // Mouse
  this.ModelMatrix.translate(0, -0.45, 0.9);
  this.ModelMatrix.rotate(180, 0, 1, 0);
  this.ModelMatrix.rotate(-25, 1, 0, 0);
  this.ModelMatrix.rotate(180, 0, 0, 1);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_RED_PLASTIC,
    g_frogMouseStart,
    g_frogMouseVertAry
  );

  // Eye

  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(0.35, 0.15, 0.2);
  this.ModelMatrix.scale(0.2, 0.2, 0.2);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_BLACK_EYE,
    g_frogEyeStart,
    g_frogEyeVertAry
  );

  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(-0.35, 0.15, 0.2);
  this.ModelMatrix.scale(0.2, 0.2, 0.2);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_BLACK_EYE,
    g_frogEyeStart,
    g_frogEyeVertAry
  );

  // Body
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0, -0.5, 0);
  this.ModelMatrix.scale(0.25, 0.35, 0.25);

  this.pushTriangleStrip(
    g_freeCamPos,
    LIGHT_DEFAULT,
    MATL_GREEN_PLASTIC,
    g_frogHeadStart,
    g_frogHeadVertAry
  );

  this.ModelMatrix = popMatrix();
};

VBObox3.prototype.pushTriangleStrip = function(
  lightPosition,
  light,
  material,
  vertexStart,
  vertexArray
) {
  if (this.droneLight.isLit) {
    this.droneLight.translate(lightPosition);
    this.droneLight.setLight(light);
    this.droneLight.push();
  }
  if (this.worldLight.isLit) {
    this.worldLight.push();
  }

  this.material.setMaterial(material);
  this.material.push();

  this.NormalMatrix.setInverseOf(this.ModelMatrix);
  this.NormalMatrix.transpose();
  gl.uniformMatrix4fv(
    this.u_NormalMatrixLoc,
    false,
    this.NormalMatrix.elements
  );

  pushMatrix(this.MvpMatrix);
  this.MvpMatrix.multiply(this.ModelMatrix);
  gl.uniformMatrix4fv(this.u_MvpMatrixLoc, false, this.MvpMatrix.elements);
  this.MvpMatrix = popMatrix();

  if (g_freeCam) {
    gl.uniform3fv(this.u_CamPosLoc, g_freeCamPos);
  } else {
    gl.uniform3fv(this.u_CamPosLoc, getThirdCamPos());
  }

  var vertexStartIndex = vertexStart / this.floatsPerVertex;
  var vertexCount = vertexArray.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);
};

VBObox3.prototype.reload = function() {
  gl.bufferSubData(
    gl.ARRAY_BUFFER, // GLenum target(same as 'bindBuffer()')
    0, // byte offset to where data replacement
    // begins in the VBO.
    this.vboContents
  ); // the JS source-data array used to fill VBO
};

VBObox3.prototype.empty = function() {
  //=============================================================================
  // Remove/release all GPU resources used by this VBObox object, including any
  // shader programs, attributes, uniforms, textures, samplers or other claims on
  // GPU memory.  However, make sure this step is reversible by a call to
  // 'restoreMe()': be sure to retain all our Float32Array data, all values for
  // uniforms, all stride and offset values, etc.
};

VBObox3.prototype.restore = function() {
  //=============================================================================
  // Replace/restore all GPU resources used by this VBObox object, including any
  // shader programs, attributes, uniforms, textures, samplers or other claims on
  // GPU memory.  Use our retained Float32Array data, all values for  uniforms,
  // all stride and offset values, etc.
};
