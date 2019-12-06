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
var g_objectPhoneBox = new VBObox1();

function main() {
  // // Initialize shaders
  // if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  //   console.log("Failed to intialize shaders.");
  //   return;
  // }
  // initVertexBuffer(); // create and fill Vertex Buffer Object.
  // if (g_vertNum <= 0) {
  //   console.log("Failed to create & fill Vertex Buffer Object!");
  //   return;
  // }

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

  g_worldBox.init(gl);
  g_objectPhoneBox.init(gl);

  tick();
  drawResize();
  drawResize();
}

function initVertexBuffer() {
  // Get handle to graphics system's storage location of u_ModelMatrix
  g_ModelMatrixLoc = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!g_ModelMatrixLoc) {
    console.log("Failed to get the GPU storage location of u_ModelMatrix");
    return;
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
  drawAllVBO();
  requestAnimationFrame(tick, g_canvas);
}

function drawAllVBO() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  g_worldBox.switchToMe();
  g_worldBox.isReady();
  g_worldBox.setView();

  g_objectPhoneBox.switchToMe();
  g_objectPhoneBox.isReady();
  g_objectPhoneBox.setView();
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

  // drawAll(); // draw in all viewports.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  g_worldBox.switchToMe();
  g_worldBox.isReady();
  g_worldBox.setView();
  g_worldBox.draw();
}
