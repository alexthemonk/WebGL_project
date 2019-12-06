function VBObox0() {
  this.VERT_SRC = //--------------------- VERTEX SHADER source code
    "precision highp float;\n" + // req'd in OpenGL ES if we use 'float'
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

  this.vboContents = makeGroundGrid();
  // vertex array

  this.floatPerVertex = 7;
  // number of floats per vertex

  this.vboVerts = this.vboContents.length / this.floatPerVertex;
  // # of vertices held in 'vboContents' array

  this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
  // size of each element (bytes per float)

  this.vboBytes = this.vboContents.length * this.FSIZE;
  // total number of bytes stored in vboContents

  this.vboStride = this.vboBytes / this.vboVerts;
  // number of bytes to store one complete vertex

  this.vboFcount_a_Pos = 4;
  // # of floats for a_Pos. (x,y,z,w values)

  this.vboFcount_a_Colr = 3;
  // # of floats for a_Colr (r,g,b values)

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
/*
VBObox0.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
}

VBObox0.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
}
*/
