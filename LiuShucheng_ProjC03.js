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

// Mouse
var g_xMdragTot;
var g_xMclik;
var g_yMdragTot;
var g_yMclik;

// Lighting and shading
var g_LightingType = 1; // 0 for Phong, 1 for BlinnPhong
var g_ShadingType = 1; // 0 for Phong, 1 for Gouraud

// VBO boxes
var g_worldBox = new VBObox0();
// var g_Gouraud_BlinnPhongBox = new VBObox3();
var g_Phong_BlinnPhongBox = new VBObox2();

function main() {
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
  // g_Gouraud_BlinnPhongBox.init(gl);
  g_Phong_BlinnPhongBox.init(gl);

  tick();
  drawResize();
  drawResize();
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

  // if (g_ShadingType == 1 && g_LightingType == 1) {
  //   // Gouraud shading and Blinn Phong lighting
  //   g_Gouraud_BlinnPhongBox.switchToMe();
  //   g_Gouraud_BlinnPhongBox.isReady();
  //   g_Gouraud_BlinnPhongBox.setView();
  // } else if (g_ShadingType == 0 && g_LightingType == 1) {
  // Phong shading and Blinn Phong lighting
  g_Phong_BlinnPhongBox.switchToMe();
  g_Phong_BlinnPhongBox.isReady();
  g_Phong_BlinnPhongBox.setView();
  // }
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

  // if (g_ShadingType == 1 && g_LightingType == 1) {
  //   // Gouraud shading and Blinn Phong lighting
  //   g_Gouraud_BlinnPhongBox.switchToMe();
  //   g_Gouraud_BlinnPhongBox.isReady();
  //   g_Gouraud_BlinnPhongBox.setView();
  // } else if (g_ShadingType == 0 && g_LightingType == 1) {
  // Phong shading and Blinn Phong lighting
  g_Phong_BlinnPhongBox.switchToMe();
  g_Phong_BlinnPhongBox.isReady();
  g_Phong_BlinnPhongBox.setView();
  // }
}

function switchWorldLight() {
  // if (g_Gouraud_BlinnPhongBox) {
  //   g_Gouraud_BlinnPhongBox.worldLight.switch();
  // }
  if (g_Phong_BlinnPhongBox) {
    g_Phong_BlinnPhongBox.worldLight.switch();
  }
}

function switchDroneLight() {
  // if (g_Gouraud_BlinnPhongBox) {
  //   g_Gouraud_BlinnPhongBox.droneLight.switch();
  // }
  if (g_Phong_BlinnPhongBox) {
    g_Phong_BlinnPhongBox.droneLight.switch();
  }
}

// function changeShading() {
//   g_ShadingType += 1;
//   g_ShadingType %= 2;
//   console.log(g_ShadingType);
// }

// function changeLighting() {
//   g_LightingType += 1;
//   g_LightingType %= 2;
//   console.log(g_LightingType);
// }
