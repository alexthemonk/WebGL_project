function VBObox0() {
  this.VERT_SRC = //--------------------- VERTEX SHADER source code
    "precision highp float;\n" +
    //
    "uniform mat4 u_ModelMat;\n" +
    "attribute vec4 a_Pos;\n" +
    "attribute vec3 a_Colr;\n" +
    "varying vec3 v_Colr;\n" +
    //
    "void main() {\n" +
    "  gl_Position = u_ModelMat * a_Pos;\n" +
    "	 v_Colr = a_Colr;\n" +
    " }\n";

  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code
    "precision mediump float;\n" +
    "varying vec3 v_Colr;\n" +
    "void main() {\n" +
    "  gl_FragColor = vec4(v_Colr, 1.0);\n" +
    "}\n";

  // vertex array
  this.vboContents = makeGroundGrid();

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

  // # of floats for a_Pos. (x,y,z,w values)
  this.vboFcount_a_Pos = 4;

  // # of floats for a_Colr (r,g,b values)
  this.vboFcount_a_Colr = 3;

  console.assert(
    (this.vboFcount_a_Pos + // check the size of each and
      this.vboFcount_a_Colr) * // every attribute in our VBO
      this.FSIZE ==
      this.vboStride, // for agreeement with'stride'
    "Uh oh! VBObox0.vboStride disagrees with attribute-size values!"
  );

  //----------------------Attribute offsets
  this.vboOffset_a_Pos = 0;
  this.vboOffset_a_Colr = this.vboFcount_a_Pos * this.FSIZE;
  this.vboLoc;
  this.shaderLoc;
  this.a_PosLoc; // GPU location for 'a_Pos' attribute
  this.a_ColrLoc; // GPU location for 'a_Colr' attribute

  //---------------------- Uniform locations &values in our shaders
  this.ModelMatrix = new Matrix4();
  this.u_ModelMatLoc;
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
  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, "a_Pos");
  if (this.a_PosLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() Failed to get GPU location of attribute a_Pos"
    );
    return -1; // error exit.
  }
  this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, "a_Colr");
  if (this.a_ColrLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() failed to get the GPU location of attribute a_Colr"
    );
    return -1; // error exit.
  }
  // Find All Uniforms
  this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, "u_ModelMat");
  if (!this.u_ModelMatLoc) {
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
    this.a_PosLoc, //index
    this.vboFcount_a_Pos,
    gl.FLOAT, // type
    false, // fixed-point values not normalize
    this.vboStride,
    this.vboOffset_a_Pos
  );
  gl.vertexAttribPointer(
    this.a_ColrLoc,
    this.vboFcount_a_Colr,
    gl.FLOAT,
    false,
    this.vboStride,
    this.vboOffset_a_Colr
  );

  // enable assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_ColrLoc);
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
    var camPos = getThirdCamPos();
    this.ModelMatrix.lookAt(
      camPos[0],
      camPos[1],
      camPos[2], // center of projection
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
    this.u_ModelMatLoc, // GPU location of the uniform
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
var g_axisVertAry; // axis array

var g_giraffeBodyVertAry; // cylinder array
var g_giraffeLegVertAry; // cylinder array
var g_giraffeHeadVertAry; // Sphere array
var g_giraffeEarVertAry; // Cone array

var g_frogHeadVertAry; // sphere array
var g_frogEyeVertAry; // sphere array
var g_frogMouseVertAry; // parabola array

var g_humanBodyVertAry; // cube array
var g_humanHeadVertAry; // sphere array
var g_humanArmVertAry; // cube array

var g_droneBodyVertAry; // sphere array
var g_droneArmVertAry; // cylinder array

// Vertix start for shapes
var g_cylinderStart;
var g_axisStart;

var g_giraffeBodyStart;
var g_giraffeLegStart;
var g_giraffeHeadStart;
var g_giraffeEarStart;

var g_frogHeadStart;
var g_frogEyeStart;
var g_frogMouseStart;

var g_humanBodyStart;
var g_humanHeadStart;
var g_humanArmStart;

var g_droneBodyStart;
var g_droneArmStart;

function initVerts() {
  // make vertice arrays for objects
  g_cylinderVertAry = makeCylinder(PINK, RED, PINK, RED);
  g_axisVertAry = makeAxis();

  g_giraffeBodyVertAry = makeCylinder(LIGHT_GREY, BROWN, LIGHT_GREY, BROWN);
  g_giraffeLegVertAry = makeCylinder(BROWN, DARK_GREY, BROWN, DARK_GREY);
  g_giraffeHeadVertAry = makeSphere(BLACK, BLACK, BLACK);
  g_giraffeEarVertAry = makeCone(BROWN, BLACK);

  g_frogHeadVertAry = makeSphere(GREEN, GREEN, GREEN);
  g_frogEyeVertAry = makeSphere(LIGHT_GREY, BLACK, BLACK);
  g_frogMouseVertAry = makeCurve(BLUE);

  g_humanBodyVertAry = makeCube(LIGHT_GREY, DARK_GREY, BLUE);
  g_humanHeadVertAry = makeSphere(DARK_GREY, DARK_GREY, DARK_GREY);
  g_humanArmVertAry = makeCube(LIGHT_GREY, BLUE, LIGHT_GREEN);

  g_droneBodyVertAry = makeSphere(WHITE, WHITE, WHITE);
  g_droneArmVertAry = makeCylinder(
    LIGHT_GREY,
    LIGHT_GREY,
    LIGHT_GREY,
    LIGHT_GREY
  );

  var floatNum =
    g_cylinderVertAry.length +
    g_axisVertAry.length +
    g_giraffeBodyVertAry.length +
    g_giraffeLegVertAry.length +
    g_giraffeHeadVertAry.length +
    g_giraffeEarVertAry.length +
    g_frogHeadVertAry.length +
    g_frogEyeVertAry.length +
    g_frogMouseVertAry.length +
    g_humanBodyVertAry.length +
    g_humanHeadVertAry.length +
    g_humanArmVertAry.length +
    g_droneBodyVertAry.length +
    g_droneArmVertAry.length;

  // Copy all shapes into one big Float32 array:
  g_colorShapes = new Float32Array(floatNum);
  var i = 0;

  g_cylinderStart = 0;
  for (j = 0; j < g_cylinderVertAry.length; i++, j++) {
    g_colorShapes[i] = g_cylinderVertAry[j];
  }
  g_axisStart = i;
  for (j = 0; j < g_axisVertAry.length; i++, j++) {
    g_colorShapes[i] = g_axisVertAry[j];
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

  g_frogHeadStart = i;
  for (j = 0; j < g_frogHeadVertAry.length; i++, j++) {
    g_colorShapes[i] = g_frogHeadVertAry[j];
  }
  g_frogEyeStart = i;
  for (j = 0; j < g_frogEyeVertAry.length; i++, j++) {
    g_colorShapes[i] = g_frogEyeVertAry[j];
  }
  g_frogMouseStart = i;
  for (j = 0; j < g_frogMouseVertAry.length; i++, j++) {
    g_colorShapes[i] = g_frogMouseVertAry[j];
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

  g_droneBodyStart = i;
  for (j = 0; j < g_droneBodyVertAry.length; i++, j++) {
    g_colorShapes[i] = g_droneBodyVertAry[j];
  }
  g_droneArmStart = i;
  for (j = 0; j < g_droneArmVertAry.length; i++, j++) {
    g_colorShapes[i] = g_droneArmVertAry[j];
  }
}
initVerts();

function VBObox1() {
  this.VERT_SRC = //--------------------- VERTEX SHADER source code
    "precision highp float;\n" +
    //
    "uniform mat4 u_ModelMat;\n" +
    "attribute vec4 a_Pos;\n" +
    "attribute vec3 a_Colr;\n" +
    "varying vec3 v_Colr;\n" +
    //
    "void main() {\n" +
    "  gl_Position = u_ModelMat * a_Pos;\n" +
    "	 v_Colr = a_Colr;\n" +
    " }\n";

  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code
    "precision mediump float;\n" +
    "varying vec3 v_Colr;\n" +
    "void main() {\n" +
    "  gl_FragColor = vec4(v_Colr, 1.0);\n" +
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

  // # of floats for a_Pos. (x,y,z,w values)
  this.vboFcount_a_Pos = 4;

  // # of floats for a_Colr (r,g,b values)
  this.vboFcount_a_Colr = 3;

  console.assert(
    (this.vboFcount_a_Pos + // check the size of each and
      this.vboFcount_a_Colr) * // every attribute in our VBO
      this.FSIZE ==
      this.vboStride, // for agreeement with'stride'
    "Uh oh! VBObox1.vboStride disagrees with attribute-size values!"
  );

  //----------------------Attribute offsets
  this.vboOffset_a_Pos = 0;
  this.vboOffset_a_Colr = this.vboFcount_a_Pos * this.FSIZE;
  this.vboLoc;
  this.shaderLoc;
  this.a_PosLoc; // GPU location for 'a_Pos' attribute
  this.a_ColrLoc; // GPU location for 'a_Colr' attribute

  //---------------------- Uniform locations &values in our shaders
  this.ModelMatrix = new Matrix4();
  this.u_ModelMatLoc;
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
  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, "a_Pos");
  if (this.a_PosLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() Failed to get GPU location of attribute a_Pos"
    );
    return -1; // error exit.
  }
  this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, "a_Colr");
  if (this.a_ColrLoc < 0) {
    console.log(
      this.constructor.name +
        ".init() failed to get the GPU location of attribute a_Colr"
    );
    return -1; // error exit.
  }
  // Find All Uniforms
  this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, "u_ModelMat");
  if (!this.u_ModelMatLoc) {
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
    this.a_PosLoc, //index
    this.vboFcount_a_Pos,
    gl.FLOAT, // type
    false, // fixed-point values not normalize
    this.vboStride,
    this.vboOffset_a_Pos
  );
  gl.vertexAttribPointer(
    this.a_ColrLoc,
    this.vboFcount_a_Colr,
    gl.FLOAT,
    false,
    this.vboStride,
    this.vboOffset_a_Colr
  );

  // enable assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_ColrLoc);
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
    var camPos = getThirdCamPos();
    this.ModelMatrix.lookAt(
      camPos[0],
      camPos[1],
      camPos[2], // center of projection
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
  this.drawFrog();
  this.drawHuman();
  this.drawDrone();

  this.ModelMatrix = popMatrix();
};

VBObox1.prototype.drawDrone = function() {
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.translate(g_freeCamPos[0], g_freeCamPos[1], g_freeCamPos[2]);
  this.ModelMatrix.rotate((-g_freeTheta / Math.PI) * 180, 0, 0, 1);
  this.ModelMatrix.rotate((g_freePhi / Math.PI) * 180, 1, 0, 0);
  this.ModelMatrix.scale(1 / 6, 1 / 6, 1 / 20);

  // Body
  var vertexStartIndex = g_droneBodyStart / this.floatsPerVertex;
  var vertexCount = g_droneBodyVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.scale(6, 6, 20);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);
  pushMatrix(this.ModelMatrix);

  // Axis for debugging
  this.ModelMatrix.scale(1 / 20, 1 / 20, 1 / 20);
  var vertexStartIndex = g_axisStart / this.floatsPerVertex;
  var vertexCount = g_axisVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.LINES, vertexStartIndex, vertexCount);

  // Arms
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0.1, -0.1, 0);
  this.ModelMatrix.rotate(90, 1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  var vertexStartIndex = g_droneArmStart / this.floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, 1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  var vertexStartIndex = g_droneArmStart / this.floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.1, -0.1, 0);
  this.ModelMatrix.rotate(90, 1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  var vertexStartIndex = g_droneArmStart / this.floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, 1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  var vertexStartIndex = g_droneArmStart / this.floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.1, 0.1, 0);
  this.ModelMatrix.rotate(90, -1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  var vertexStartIndex = g_droneArmStart / this.floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, -1, -1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  var vertexStartIndex = g_droneArmStart / this.floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0.1, 0.1, 0);
  this.ModelMatrix.rotate(90, -1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  var vertexStartIndex = g_droneArmStart / this.floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.scale(40, 40, 20);

  this.ModelMatrix.translate(0, 0, 0.075);
  this.ModelMatrix.rotate(-90, -1, 1, 0);
  this.ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  var vertexStartIndex = g_droneArmStart / this.floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

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

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Arm
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0.06, 0, -0.03);
  this.ModelMatrix.rotate(-20, 0, 1, 0);
  this.ModelMatrix.rotate(g_humanArmAngle, 1, 0, 0);
  this.ModelMatrix.scale(1 / 35, 1 / 35, 1 / 7);

  var vertexStartIndex = g_humanArmStart / this.floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.06, 0, -0.03);
  this.ModelMatrix.rotate(20, 0, 1, 0);
  this.ModelMatrix.rotate(-g_humanArmAngle, 1, 0, 0);
  this.ModelMatrix.scale(1 / 35, 1 / 35, 1 / 7);

  var vertexStartIndex = g_humanArmStart / this.floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Legs
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.025, 0, -0.3);
  this.ModelMatrix.scale(1 / 50, 1 / 50, 1 / 8);

  var vertexStartIndex = g_humanArmStart / this.floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0.025, 0, -0.3);
  this.ModelMatrix.scale(1 / 50, 1 / 50, 1 / 8);

  var vertexStartIndex = g_humanArmStart / this.floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Head
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.scale(1 / 15, 1 / 15, 1 / 15);
  this.ModelMatrix.translate(0, 0, 0.7);

  var vertexStartIndex = g_humanHeadStart / this.floatsPerVertex;
  var vertexCount = g_humanHeadVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();
};

VBObox1.prototype.drawFrog = function() {
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

  var vertexStartIndex = g_frogHeadStart / this.floatsPerVertex;
  var vertexCount = g_frogHeadVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Mouse
  var vertexStartIndex = g_frogMouseStart / this.floatsPerVertex;
  var vertexCount = g_frogMouseVertAry.length / this.floatsPerVertex;
  this.ModelMatrix.translate(0, -0.45, 0.9);
  this.ModelMatrix.rotate(180, 0, 1, 0);
  this.ModelMatrix.rotate(-25, 1, 0, 0);
  this.ModelMatrix.rotate(180, 0, 0, 1);
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Eye
  var vertexStartIndex = g_frogEyeStart / this.floatsPerVertex;
  var vertexCount = g_frogEyeVertAry.length / this.floatsPerVertex;

  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(0.35, 0.15, 0.2);
  this.ModelMatrix.scale(0.2, 0.2, 0.2);
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();
  this.ModelMatrix.translate(-0.35, 0.15, 0.2);
  this.ModelMatrix.scale(0.2, 0.2, 0.2);
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Body
  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(0, -0.5, 0);
  this.ModelMatrix.scale(0.25, 0.35, 0.25);

  var vertexStartIndex = g_frogHeadStart / this.floatsPerVertex;
  var vertexCount = g_frogHeadVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
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
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.translate(0, 0.05, 0.3);
  this.ModelMatrix.rotate(-45 + g_neckAngle, 1, 0, 0);
  this.ModelMatrix.scale(1 / 1.5, 1 / 1.5, 1 / 1.2);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / this.floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.scale(1.5, 1.5, 1.2);
  this.ModelMatrix.translate(0, 0, 0.25);
  this.ModelMatrix.rotate(g_neckAngle, 1, 0, 0);
  this.ModelMatrix.scale(1 / 1.5, 1 / 1.5, 1 / 1.5);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / this.floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.scale(1.5, 1.5, 1.2);
  this.ModelMatrix.translate(0, 0, 0.25);
  this.ModelMatrix.rotate(g_neckAngle, 1, 0, 0);
  this.ModelMatrix.scale(1 / 1.5, 1 / 1.5, 1 / 1.5);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / this.floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Head
  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.scale(1.5, 1.5, 1.2);
  this.ModelMatrix.translate(0, -0.025, 0.35);
  this.ModelMatrix.scale(1 / 1.1, 1.5, 1 / 1.1);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeHeadStart / this.floatsPerVertex;
  var vertexCount = g_giraffeHeadVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Ears
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.translate(0.5, 0.4, 0.5);
  this.ModelMatrix.rotate(30, 0, 1, 0);
  this.ModelMatrix.scale(0.5, 0.1, 0.5);

  var vertexStartIndex = g_giraffeEarStart / this.floatsPerVertex;
  var vertexCount = g_giraffeEarVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.translate(-0.5, 0.4, 0.5);
  this.ModelMatrix.rotate(-30, 0, 1, 0);
  this.ModelMatrix.scale(0.5, 0.1, 0.5);

  var vertexStartIndex = g_giraffeEarStart / this.floatsPerVertex;
  var vertexCount = g_giraffeEarVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
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
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
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
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
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
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();

  this.ModelMatrix.scale(10, 10, 6);
  this.ModelMatrix.translate(-0.075, 0.05, 0.05);
  this.ModelMatrix.rotate(100, 1, 0, 0);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1);
  this.ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeLegStart / this.floatsPerVertex;
  var vertexCount = g_giraffeLegVertAry.length / this.floatsPerVertex;
  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix = popMatrix();
};

VBObox1.prototype.drawCylinder = function() {
  pushMatrix(this.ModelMatrix);

  this.ModelMatrix.translate(-1, 1, 0);
  this.ModelMatrix.scale(0.25, 0.25, 0.25);

  var vertexStartIndex = g_cylinderStart / this.floatsPerVertex;
  var vertexCount = g_cylinderVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  this.ModelMatrix.translate(0, 0, 2);
  this.ModelMatrix.scale(0.67, 0.67, 0.67);

  var quatMatrix = new Matrix4(); // rotation matrix, made from latest qTot
  quatMatrix.setFromQuat(g_qTot.x, g_qTot.y, g_qTot.z, g_qTot.w); // Quaternion-->Matrix
  this.ModelMatrix.concat(quatMatrix); // apply that matrix.

  var vertexStartIndex = g_cylinderStart / this.floatsPerVertex;
  var vertexCount = g_cylinderVertAry.length / this.floatsPerVertex;

  gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMatrix.elements);
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
