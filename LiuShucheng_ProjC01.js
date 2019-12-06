// Vertex shader program
var VSHADER_SOURCE =
  "uniform mat4 u_ModelMatrix;\n" +
  "attribute vec4 a_Position;\n" +
  "attribute vec4 a_Color;\n" +
  "varying vec4 v_Color;\n" +
  "void main() {\n" +
  "  gl_Position = u_ModelMatrix * a_Position;\n" +
  "  gl_PointSize = 10.0;\n" +
  "  v_Color = a_Color;\n" +
  "}\n";

// Fragment shader program
var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "varying vec4 v_Color;\n" +
  "void main() {\n" +
  "  gl_FragColor = v_Color;\n" +
  "}\n";

// Retrieve <g_canvas> element
var g_canvas = document.getElementById("webgl");
// Get the rendering context for WebGL
var gl = getWebGLContext(g_canvas);
if (!gl) {
  console.log("Failed to get the rendering context for WebGL");
}

// Admin
var g_vertNum; // number of all vertices
var g_floatsPerVertex = 7;

// Time
var g_last = Date.now();

// Model matrix
var g_ModelMatrix = new Matrix4();
var g_ModelMatrixLoc;

// Vertix arrays
var g_cylinderVertAry; // cylinder array
var g_groundVertAry; // grid array
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
var g_groundStart;
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

// Angles
var g_testAngle = 0;
var g_neckAngle = -15;
var g_droneAngle = 0; // For flying turbo
var g_humanArmAngle = 0;

// Quaternion
var g_qNew = new Quaternion(0, 0, 0, 1);
var g_qTot = new Quaternion(0, 0, 0, 1);

// Rate
var g_angleRate = 45;

// Status
var g_animating = true;
var g_isDrag = false;
var g_freeCam = false;

// Mouse
var g_xMdragTot;
var g_xMclik;
var g_yMdragTot;
var g_yMclik;

// VBO boxes
var g_worldBox = new VBObox0();

function main() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }
  //
  initVertexBuffer(); // create and fill Vertex Buffer Object.
  if (g_vertNum <= 0) {
    console.log("Failed to create & fill Vertex Buffer Object!");
    return;
  }

  g_canvas.onmousedown = function(ev) {
    mouseDown(ev);
  };
  g_canvas.onmousemove = function(ev) {
    mouseMove(ev, dragQuat);
  };
  g_canvas.onmouseup = function(ev) {
    mouseUp(ev, dragQuat);
  };

  window.onkeydown = function(ev) {
    keyDown(ev);
  };
  window.onkeyup = function(ev) {
    keyUp(ev);
  };

  // Specify the color for clearing <g_canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  // Get handle to graphics system's storage location of u_ModelMatrix
  g_ModelMatrixLoc = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!g_ModelMatrixLoc) {
    console.log("Failed to get the GPU storage location of u_ModelMatrix");
    return;
  }

  g_worldBox.init(gl);

  tick();
  drawResize();
  drawResize();
}

function initVertexBuffer() {
  g_cylinderVertAry = makeCylinder(PINK, RED, PINK, RED);
  g_groundVertAry = makeGroundGrid();
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

  var mySiz =
    g_cylinderVertAry.length +
    g_groundVertAry.length +
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

  g_vertNum = mySiz / g_floatsPerVertex;

  // Copy all shapes into one big Float32 array:
  var colorShapes = new Float32Array(mySiz);
  var i = 0;

  g_cylinderStart = 0;
  for (j = 0; j < g_cylinderVertAry.length; i++, j++) {
    colorShapes[i] = g_cylinderVertAry[j];
  }
  g_groundStart = i;
  for (j = 0; j < g_groundVertAry.length; i++, j++) {
    colorShapes[i] = g_groundVertAry[j];
  }
  g_axisStart = i;
  for (j = 0; j < g_axisVertAry.length; i++, j++) {
    colorShapes[i] = g_axisVertAry[j];
  }

  g_giraffeBodyStart = i;
  for (j = 0; j < g_giraffeBodyVertAry.length; i++, j++) {
    colorShapes[i] = g_giraffeBodyVertAry[j];
  }
  g_giraffeLegStart = i;
  for (j = 0; j < g_giraffeLegVertAry.length; i++, j++) {
    colorShapes[i] = g_giraffeLegVertAry[j];
  }
  g_giraffeHeadStart = i;
  for (j = 0; j < g_giraffeHeadVertAry.length; i++, j++) {
    colorShapes[i] = g_giraffeHeadVertAry[j];
  }
  g_giraffeEarStart = i;
  for (j = 0; j < g_giraffeEarVertAry.length; i++, j++) {
    colorShapes[i] = g_giraffeEarVertAry[j];
  }

  g_frogHeadStart = i;
  for (j = 0; j < g_frogHeadVertAry.length; i++, j++) {
    colorShapes[i] = g_frogHeadVertAry[j];
  }
  g_frogEyeStart = i;
  for (j = 0; j < g_frogEyeVertAry.length; i++, j++) {
    colorShapes[i] = g_frogEyeVertAry[j];
  }
  g_frogMouseStart = i;
  for (j = 0; j < g_frogMouseVertAry.length; i++, j++) {
    colorShapes[i] = g_frogMouseVertAry[j];
  }

  g_humanBodyStart = i;
  for (j = 0; j < g_humanBodyVertAry.length; i++, j++) {
    colorShapes[i] = g_humanBodyVertAry[j];
  }
  g_humanHeadStart = i;
  for (j = 0; j < g_humanHeadVertAry.length; i++, j++) {
    colorShapes[i] = g_humanHeadVertAry[j];
  }
  g_humanArmStart = i;
  for (j = 0; j < g_humanArmVertAry.length; i++, j++) {
    colorShapes[i] = g_humanArmVertAry[j];
  }

  g_droneBodyStart = i;
  for (j = 0; j < g_droneBodyVertAry.length; i++, j++) {
    colorShapes[i] = g_droneBodyVertAry[j];
  }
  g_droneArmStart = i;
  for (j = 0; j < g_droneArmVertAry.length; i++, j++) {
    colorShapes[i] = g_droneArmVertAry[j];
  }

  // Create a buffer object on the graphics hardware:
  var shapeBufferHandle = gl.createBuffer();
  if (!shapeBufferHandle) {
    console.log("Failed to create the shape buffer object");
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  // Get graphics system's handle for our Vertex Shader's position-input variable:
  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return -1;
  }

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?

  // Use handle to specify how to retrieve **POSITION** data from our VBO:
  gl.vertexAttribPointer(
    a_Position, // choose Vertex Shader attribute to fill with data
    4, // x,y,z,w
    gl.FLOAT, // data type for each value: usually gl.FLOAT
    false,
    FSIZE * g_floatsPerVertex, // Stride -- (x,y,z,w, r,g,b) * bytes/value
    0
  );

  gl.enableVertexAttribArray(a_Position);

  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, "a_Color");
  if (a_Color < 0) {
    console.log("Failed to get the storage location of a_Color");
    return -1;
  }
  // Use handle to specify how to retrieve **COLOR** data from our VBO:
  gl.vertexAttribPointer(
    a_Color, // choose Vertex Shader attribute to fill with data
    3, // R,G,B
    gl.FLOAT, // data type for each value: usually gl.FLOAT
    false,
    FSIZE * 7, // Stride -- (x,y,z,w, r,g,b) * bytes/value
    FSIZE * 4
  ); // Offset -- x,y,z,w

  gl.enableVertexAttribArray(a_Color);
  // Enable assignment of vertex buffer object's position data

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  // Unbind the buffer object
}

function animate() {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  g_testAngle = (g_testAngle + (g_angleRate * elapsed) / 15000.0) % 360;
  g_neckAngle = (Math.sin(g_testAngle) * -90) / 5;
  g_droneAngle = g_testAngle * 15;
  g_humanArmAngle = (Math.sin(g_testAngle) * 90) / 5;
}

function tick() {
  doKeys(); // Do key events based on pressed
  animate(); // Update the animation angle(s)
  drawAll(); // Draw all shapes using new angles.
  requestAnimationFrame(tick, g_canvas);
}

function drawAll() {
  // Clear <g_canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(
    0, // Viewport lower-left corner
    0, // location
    (g_canvas.width * 3) / 4, // viewport width,
    g_canvas.height
  ); // viewport height in pixels.

  g_ModelMatrix.setIdentity(); // DEFINE 'world-space' coords.

  // set view
  g_ModelMatrix.perspective(
    45.0, // FOVY: top-to-bottom vertical image angle, in degrees
    1.0, // Image Aspect Ratio: camera lens width/height
    0.5, // camera z-near distance (always positive; frustum begins at z = -znear)
    10.0
  ); // camera z-far distance (always positive; frustum ends at z = -zfar)

  if (g_freeCam) {
    var lookAt = getFreeLookAt();
    g_ModelMatrix.lookAt(
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
    g_ModelMatrix.lookAt(
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

  drawCylinder();
  drawAxis();
  drawGround();
  drawGiraffe();
  drawFrog();
  drawHuman();
  drawDrone();

  // top down ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    g_canvas.height / 2, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  g_ModelMatrix.setIdentity(); // DEFINE 'world-space' coords.
  g_ModelMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  g_ModelMatrix.lookAt(0, 0, 5, 0, 0, 0, -1, 0, 0);

  drawCylinder();
  drawAxis();
  drawGround();
  drawGiraffe();
  drawFrog();
  drawHuman();
  drawDrone();

  // horizontal ortho view
  gl.viewport(
    (g_canvas.width * 3) / 4, // Viewport lower-left corner
    0, // location
    g_canvas.width / 4, // viewport width,
    g_canvas.height / 2
  ); // viewport height in pixels.

  g_ModelMatrix.setIdentity(); // DEFINE 'world-space' coords.
  g_ModelMatrix.ortho(-2.0, 2.0, -2.0, 2.0, 1, 10);
  g_ModelMatrix.lookAt(5, 0, 0, 0, 0, 0, 0, 0, 1);

  drawCylinder();
  drawAxis();
  drawGround();
  drawGiraffe();
  drawFrog();
  drawHuman();
  drawDrone();
}

function drawDrone() {
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.translate(g_freeCamPos[0], g_freeCamPos[1], g_freeCamPos[2]);
  g_ModelMatrix.rotate((-g_freeTheta / Math.PI) * 180, 0, 0, 1);
  g_ModelMatrix.rotate((g_freePhi / Math.PI) * 180, 1, 0, 0);
  g_ModelMatrix.scale(1 / 6, 1 / 6, 1 / 20);

  // Body
  var vertexStartIndex = g_droneBodyStart / g_floatsPerVertex;
  var vertexCount = g_droneBodyVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix.scale(6, 6, 20);
  pushMatrix(g_ModelMatrix);
  pushMatrix(g_ModelMatrix);
  pushMatrix(g_ModelMatrix);
  pushMatrix(g_ModelMatrix);

  // Axis for debugging
  g_ModelMatrix.scale(1 / 20, 1 / 20, 1 / 20);
  var vertexStartIndex = g_axisStart / g_floatsPerVertex;
  var vertexCount = g_axisVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.LINES, vertexStartIndex, vertexCount);

  // Arms
  g_ModelMatrix = popMatrix();

  g_ModelMatrix.translate(0.1, -0.1, 0);
  g_ModelMatrix.rotate(90, 1, 1, 0);
  g_ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  var vertexStartIndex = g_droneArmStart / g_floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix.scale(40, 40, 20);

  g_ModelMatrix.translate(0, 0, 0.075);
  g_ModelMatrix.rotate(-90, 1, 1, 0);
  g_ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  var vertexStartIndex = g_droneArmStart / g_floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();

  g_ModelMatrix.translate(-0.1, -0.1, 0);
  g_ModelMatrix.rotate(90, 1, -1, 0);
  g_ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  var vertexStartIndex = g_droneArmStart / g_floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix.scale(40, 40, 20);

  g_ModelMatrix.translate(0, 0, 0.075);
  g_ModelMatrix.rotate(-90, 1, -1, 0);
  g_ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  var vertexStartIndex = g_droneArmStart / g_floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();

  g_ModelMatrix.translate(-0.1, 0.1, 0);
  g_ModelMatrix.rotate(90, -1, -1, 0);
  g_ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  var vertexStartIndex = g_droneArmStart / g_floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix.scale(40, 40, 20);

  g_ModelMatrix.translate(0, 0, 0.075);
  g_ModelMatrix.rotate(-90, -1, -1, 0);
  g_ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  var vertexStartIndex = g_droneArmStart / g_floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();

  g_ModelMatrix.translate(0.1, 0.1, 0);
  g_ModelMatrix.rotate(90, -1, 1, 0);
  g_ModelMatrix.scale(1 / 40, 1 / 40, 1 / 20);

  var vertexStartIndex = g_droneArmStart / g_floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix.scale(40, 40, 20);

  g_ModelMatrix.translate(0, 0, 0.075);
  g_ModelMatrix.rotate(-90, -1, 1, 0);
  g_ModelMatrix.scale(1 / 40, 1 / 40, 1 / 10);

  var vertexStartIndex = g_droneArmStart / g_floatsPerVertex;
  var vertexCount = g_droneArmVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();
}

function drawHuman() {
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.translate(g_thirdLookAt[0], g_thirdLookAt[1], 0.54);
  g_ModelMatrix.rotate(180, 0, 0, 1);
  g_ModelMatrix.rotate((-g_thirdTheta / Math.PI) * 180, 0, 0, 1);

  pushMatrix(g_ModelMatrix);

  // Body
  pushMatrix(g_ModelMatrix);
  pushMatrix(g_ModelMatrix);
  pushMatrix(g_ModelMatrix);
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.scale(1 / 20, 1 / 20, 1 / 6);

  var vertexStartIndex = g_humanBodyStart / g_floatsPerVertex;
  var vertexCount = g_humanBodyVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Arm
  g_ModelMatrix = popMatrix();

  g_ModelMatrix.translate(0.06, 0, -0.03);
  g_ModelMatrix.rotate(-20, 0, 1, 0);
  g_ModelMatrix.rotate(g_humanArmAngle, 1, 0, 0);
  g_ModelMatrix.scale(1 / 35, 1 / 35, 1 / 7);

  var vertexStartIndex = g_humanArmStart / g_floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();

  g_ModelMatrix.translate(-0.06, 0, -0.03);
  g_ModelMatrix.rotate(20, 0, 1, 0);
  g_ModelMatrix.rotate(-g_humanArmAngle, 1, 0, 0);
  g_ModelMatrix.scale(1 / 35, 1 / 35, 1 / 7);

  var vertexStartIndex = g_humanArmStart / g_floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Legs
  g_ModelMatrix = popMatrix();

  g_ModelMatrix.translate(-0.025, 0, -0.3);
  g_ModelMatrix.scale(1 / 50, 1 / 50, 1 / 8);

  var vertexStartIndex = g_humanArmStart / g_floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();

  g_ModelMatrix.translate(0.025, 0, -0.3);
  g_ModelMatrix.scale(1 / 50, 1 / 50, 1 / 8);

  var vertexStartIndex = g_humanArmStart / g_floatsPerVertex;
  var vertexCount = g_humanArmVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Head
  g_ModelMatrix = popMatrix();

  g_ModelMatrix.scale(1 / 15, 1 / 15, 1 / 15);
  g_ModelMatrix.translate(0, 0, 0.7);

  var vertexStartIndex = g_humanHeadStart / g_floatsPerVertex;
  var vertexCount = g_humanHeadVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();
}

function drawFrog() {
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.translate(0.5, -0.5, 0.25);
  g_ModelMatrix.rotate(90, 1, 0, 0);
  g_ModelMatrix.rotate(g_testAngle * 10, 0, 1, 0);
  g_ModelMatrix.scale(0.25, 0.25, 0.25);

  pushMatrix(g_ModelMatrix);
  pushMatrix(g_ModelMatrix);
  pushMatrix(g_ModelMatrix);

  // Head
  g_ModelMatrix.scale(0.5, 0.35, 0.35);

  var vertexStartIndex = g_frogHeadStart / g_floatsPerVertex;
  var vertexCount = g_frogHeadVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Mouse
  var vertexStartIndex = g_frogMouseStart / g_floatsPerVertex;
  var vertexCount = g_frogMouseVertAry.length / g_floatsPerVertex;
  g_ModelMatrix.translate(0, -0.45, 0.9);
  g_ModelMatrix.rotate(180, 0, 1, 0);
  g_ModelMatrix.rotate(-25, 1, 0, 0);
  g_ModelMatrix.rotate(180, 0, 0, 1);
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Eye
  var vertexStartIndex = g_frogEyeStart / g_floatsPerVertex;
  var vertexCount = g_frogEyeVertAry.length / g_floatsPerVertex;

  g_ModelMatrix = popMatrix();
  g_ModelMatrix.translate(0.35, 0.15, 0.2);
  g_ModelMatrix.scale(0.2, 0.2, 0.2);
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();
  g_ModelMatrix.translate(-0.35, 0.15, 0.2);
  g_ModelMatrix.scale(0.2, 0.2, 0.2);
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Body
  g_ModelMatrix = popMatrix();

  g_ModelMatrix.translate(0, -0.5, 0);
  g_ModelMatrix.scale(0.25, 0.35, 0.25);

  var vertexStartIndex = g_frogHeadStart / g_floatsPerVertex;
  var vertexCount = g_frogHeadVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();
}

function drawGiraffe() {
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.translate(-1, -1, 0.25);
  g_ModelMatrix.rotate(90, 1, 0, 0);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / g_floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.scale(10, 10, 6);
  g_ModelMatrix.translate(0, 0.05, 0.3);
  g_ModelMatrix.rotate(-45 + g_neckAngle, 1, 0, 0);
  g_ModelMatrix.scale(1 / 1.5, 1 / 1.5, 1 / 1.2);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / g_floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix.scale(10, 10, 6);
  g_ModelMatrix.scale(1.5, 1.5, 1.2);
  g_ModelMatrix.translate(0, 0, 0.25);
  g_ModelMatrix.rotate(g_neckAngle, 1, 0, 0);
  g_ModelMatrix.scale(1 / 1.5, 1 / 1.5, 1 / 1.5);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / g_floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix.scale(10, 10, 6);
  g_ModelMatrix.scale(1.5, 1.5, 1.2);
  g_ModelMatrix.translate(0, 0, 0.25);
  g_ModelMatrix.rotate(g_neckAngle, 1, 0, 0);
  g_ModelMatrix.scale(1 / 1.5, 1 / 1.5, 1 / 1.5);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeBodyStart / g_floatsPerVertex;
  var vertexCount = g_giraffeBodyVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Head
  g_ModelMatrix.scale(10, 10, 6);
  g_ModelMatrix.scale(1.5, 1.5, 1.2);
  g_ModelMatrix.translate(0, -0.025, 0.35);
  g_ModelMatrix.scale(1 / 1.1, 1.5, 1 / 1.1);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeHeadStart / g_floatsPerVertex;
  var vertexCount = g_giraffeHeadVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Ears
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.translate(0.5, 0.4, 0.5);
  g_ModelMatrix.rotate(30, 0, 1, 0);
  g_ModelMatrix.scale(0.5, 0.1, 0.5);

  var vertexStartIndex = g_giraffeEarStart / g_floatsPerVertex;
  var vertexCount = g_giraffeEarVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();

  g_ModelMatrix.translate(-0.5, 0.4, 0.5);
  g_ModelMatrix.rotate(-30, 0, 1, 0);
  g_ModelMatrix.scale(0.5, 0.1, 0.5);

  var vertexStartIndex = g_giraffeEarStart / g_floatsPerVertex;
  var vertexCount = g_giraffeEarVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Legs
  // Front
  g_ModelMatrix = popMatrix();
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.scale(10, 10, 6);
  g_ModelMatrix.translate(0.075, 0.05, 0.3);
  g_ModelMatrix.rotate(80, 1, 0, 0);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeLegStart / g_floatsPerVertex;
  var vertexCount = g_giraffeLegVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.scale(10, 10, 6);
  g_ModelMatrix.translate(-0.075, 0.05, 0.3);
  g_ModelMatrix.rotate(80, 1, 0, 0);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeLegStart / g_floatsPerVertex;
  var vertexCount = g_giraffeLegVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  // Back
  g_ModelMatrix = popMatrix();
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.scale(10, 10, 6);
  g_ModelMatrix.translate(0.075, 0.05, 0.05);
  g_ModelMatrix.rotate(100, 1, 0, 0);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeLegStart / g_floatsPerVertex;
  var vertexCount = g_giraffeLegVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();

  g_ModelMatrix.scale(10, 10, 6);
  g_ModelMatrix.translate(-0.075, 0.05, 0.05);
  g_ModelMatrix.rotate(100, 1, 0, 0);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1);
  g_ModelMatrix.scale(1 / 10, 1 / 10, 1 / 6);

  var vertexStartIndex = g_giraffeLegStart / g_floatsPerVertex;
  var vertexCount = g_giraffeLegVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();
}

function drawGround() {
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.scale(0.1, 0.1, 0.1);

  var vertexStartIndex = g_groundStart / g_floatsPerVertex;
  var vertexCount = g_groundVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.LINES, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();
}

function drawAxis() {
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.scale(0.1, 0.1, 0.1);

  var vertexStartIndex = g_axisStart / g_floatsPerVertex;
  var vertexCount = g_axisVertAry.length / g_floatsPerVertex;
  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.LINES, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix(); // RESTORE 'world' drawing coords.
}

function drawCylinder() {
  pushMatrix(g_ModelMatrix);

  g_ModelMatrix.translate(-1, 1, 0);
  g_ModelMatrix.scale(0.25, 0.25, 0.25);

  var vertexStartIndex = g_cylinderStart / g_floatsPerVertex;
  var vertexCount = g_cylinderVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix.translate(0, 0, 2);
  g_ModelMatrix.scale(0.67, 0.67, 0.67);

  var quatMatrix = new Matrix4(); // rotation matrix, made from latest qTot
  quatMatrix.setFromQuat(g_qTot.x, g_qTot.y, g_qTot.z, g_qTot.w); // Quaternion-->Matrix
  g_ModelMatrix.concat(quatMatrix); // apply that matrix.

  var vertexStartIndex = g_cylinderStart / g_floatsPerVertex;
  var vertexCount = g_cylinderVertAry.length / g_floatsPerVertex;

  gl.uniformMatrix4fv(g_ModelMatrixLoc, false, g_ModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexStartIndex, vertexCount);

  g_ModelMatrix = popMatrix();
}

function dragQuat(xdrag, ydrag) {
  var res = 5;
  var qTmp = new Quaternion(0, 0, 0, 1);

  var dist = Math.sqrt(xdrag * xdrag + ydrag * ydrag);
  // console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
  g_qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist * 150.0);
  // -- to rotate around +x axis, drag mouse in -y direction.
  // -- to rotate around +y axis, drag mouse in +x direction.

  qTmp.multiply(g_qNew, g_qTot);
  qTmp.normalize(); // normalize to ensure we stay at length==1.0.
  g_qTot.copy(qTmp);
}

var g_temp;
function changeAnimating() {
  if (g_animating) {
    g_animating = false;
    g_temp = g_angleRate;
    g_angleRate = 0;
  } else {
    g_angleRate = g_temp;
    g_animating = true;
  }
}

function speedUp() {
  g_angleRate += 15;
}
function speedDown() {
  g_angleRate -= 15;
}
function changeCam() {
  if (g_freeCam) {
    g_freeCam = false;
  } else {
    g_freeCam = true;
  }
}

function drawResize() {
  //Make g_canvas fill the top 3/4 of our browser window:
  g_canvas.width = window.innerWidth - 16;
  g_canvas.height = (window.innerHeight * 3) / 4;
  drawAll(); // draw in all viewports.
}
