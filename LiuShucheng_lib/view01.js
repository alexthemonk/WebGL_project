// setting camera moving, with key down and key up
// setting mouse drag

// Camera
var g_freeCamPos = [2.5, 2.5, 0.5];
var g_thirdLookAt = [0.5, 0.5, 0.5];
var g_upVec = [0, 0, 1];
var g_freeTheta = (225 * Math.PI) / 180; // xy angle
var g_freePhi = (-15 * Math.PI) / 180; // z angle
var g_thirdTheta = (225 * Math.PI) / 180; // xy angle
var g_thirdPhi = (-45 * Math.PI) / 180; // z angle

// Quaternion
var g_qNew = new Quaternion(0, 0, 0, 1);
var g_qTot = new Quaternion(0, 0, 0, 1);

// Mouse
var g_xMdragTot;
var g_xMclik;
var g_yMdragTot;
var g_yMclik;

// rate
var g_viewRotateRate = (1 * Math.PI) / 180;
var g_cameraMoveRate = 0.01;

// state
var g_freeCam = true;
var g_isDrag = false;

// key
var g_keyPool = [];

function getFreeLookAt() {
  // normalize
  var len = Math.sqrt(
    Math.pow(Math.sin(g_freeTheta), 2) +
      Math.pow(Math.cos(g_freeTheta), 2) +
      Math.pow(Math.sin(g_freePhi), 2)
  );
  return [
    g_freeCamPos[0] + Math.sin(g_freeTheta) / len,
    g_freeCamPos[1] + Math.cos(g_freeTheta) / len,
    g_freeCamPos[2] + Math.sin(g_freePhi) / len
  ];
}

function getThirdCamPos() {
  // normalize
  var len = Math.sqrt(
    Math.pow(Math.sin(g_thirdTheta), 2) +
      Math.pow(Math.cos(g_thirdTheta), 2) +
      Math.pow(Math.sin(g_thirdPhi), 2)
  );
  return [
    g_thirdLookAt[0] - (2 * Math.sin(g_thirdTheta)) / len,
    g_thirdLookAt[1] - (2 * Math.cos(g_thirdTheta)) / len,
    g_thirdLookAt[2] - (2 * Math.sin(g_thirdPhi)) / len
  ];
}

function doKeys() {
  if (g_keyPool[38]) {
    // up arrow
    moveView(1);
  }
  if (g_keyPool[40]) {
    // down arrow
    moveView(2);
  }
  if (g_keyPool[37]) {
    // left arrow
    moveView(3);
  }
  if (g_keyPool[39]) {
    // right arrow
    moveView(4);
  }
  if (g_keyPool[87]) {
    // W
    rotateView(1);
  }
  if (g_keyPool[83]) {
    // S
    rotateView(2);
  }
  if (g_keyPool[65]) {
    // A
    rotateView(3);
  }
  if (g_keyPool[68]) {
    // D
    rotateView(4);
  }
}

function keyDown(ev) {
  ev.preventDefault();
  g_keyPool[ev.keyCode] = true;
  switch (ev.code) {
    //----------------Arrow keys------------------------
    case "ArrowLeft":
      console.log("left-arrow.");
      break;
    case "KeyA":
      console.log("A");
      break;
    case "ArrowRight":
      console.log("right-arrow.");
      break;
    case "KeyD":
      console.log("D");
      break;
    case "ArrowUp":
      console.log("up-arrow.");
      break;
    case "KeyW":
      console.log("W");
      break;
    case "ArrowDown":
      console.log("down-arrow.");
      break;
    case "KeyS":
      console.log("S");
      break;
    default:
      console.log("UNUSED!");
      break;
  }
}

function keyUp(ev) {
  g_keyPool[ev.keyCode] = false;
}

function mouseDown(ev) {
  // Create right-handed 'pixel' coords with origin at WebGL g_canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get g_canvas corners in pixels
  var xp = ev.clientX - rect.left; // x==0 at g_canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top); // y==0 at g_canvas bottom edge
  //  console.log('mouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);

  // Convert to Canonical View Volume (CVV) coordinates too:
  var x =
    (xp - g_canvas.width / 2) / // move origin to center of g_canvas and
    (g_canvas.width / 2); // normalize g_canvas to -1 <= x < +1,
  var y =
    (yp - g_canvas.height / 2) / //										 -1 <= y < +1.
    (g_canvas.height / 2);
  //	console.log('mouseDown(CVV coords  ):  x, y=\t',x,',\t',y);

  g_isDrag = true; // set our mouse-dragging flag
  g_xMclik = x; // record where mouse-dragging began
  g_yMclik = y;
}

function mouseMove(ev) {
  if (g_isDrag == false) return; // IGNORE all mouse-moves except 'dragging'

  // Create right-handed 'pixel' coords with origin at WebGL g_canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get g_canvas corners in pixels
  var xp = ev.clientX - rect.left; // x==0 at g_canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top); // y==0 at g_canvas bottom edge
  //  console.log('mouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);

  // Convert to Canonical View Volume (CVV) coordinates too:
  var x =
    (xp - g_canvas.width / 2) / // move origin to center of g_canvas and
    (g_canvas.width / 2); // normalize g_canvas to -1 <= x < +1,
  var y =
    (yp - g_canvas.height / 2) / //										 -1 <= y < +1.
    (g_canvas.height / 2);

  // find how far we dragged the mouse:
  g_xMdragTot += x - g_xMclik; // Accumulate change-in-mouse-position,&
  g_yMdragTot += y - g_yMclik;
  // AND use any mouse-dragging we found to update quaternions qNew and qTot.
  dragQuat(x - g_xMclik, y - g_yMclik);

  g_xMclik = x;
  g_yMclik = y;
}

function mouseUp(ev) {
  // Create right-handed 'pixel' coords with origin at WebGL g_canvas LOWER left;
  var rect = ev.target.getBoundingClientRect(); // get g_canvas corners in pixels
  var xp = ev.clientX - rect.left; // x==0 at g_canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top); // y==0 at g_canvas bottom edge
  //  console.log('mouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);

  // Convert to Canonical View Volume (CVV) coordinates too:
  var x =
    (xp - g_canvas.width / 2) / // move origin to center of g_canvas and
    (g_canvas.width / 2); // normalize g_canvas to -1 <= x < +1,
  var y =
    (yp - g_canvas.height / 2) / //										 -1 <= y < +1.
    (g_canvas.height / 2);

  g_isDrag = false; // CLEAR our mouse-dragging flag, and
  // accumulate any final bit of mouse-dragging we did:
  g_xMdragTot += x - g_xMclik;
  g_yMdragTot += y - g_yMclik;
  //	console.log('mouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);

  // AND use any mouse-dragging we found to update quaternions qNew and qTot;
  dragQuat(x - g_xMclik, y - g_yMclik);
}

function rotateView(direction) {
  var free_angle_limit = (60 * Math.PI) / 180;
  var third_angle_limit = (45 * Math.PI) / 180;
  switch (direction) {
    case 1:
      // Up
      if (g_freeCam) {
        if (g_freePhi + g_viewRotateRate < free_angle_limit) {
          g_freePhi += g_viewRotateRate;
        }
      } else {
        if (g_thirdPhi + g_viewRotateRate < third_angle_limit) {
          g_thirdPhi += g_viewRotateRate;
        }
      }
      break;
    case 2:
      // Down
      if (g_freeCam) {
        if (g_freePhi - g_viewRotateRate > -free_angle_limit) {
          g_freePhi -= g_viewRotateRate;
        }
      } else {
        if (g_thirdPhi - g_viewRotateRate > -third_angle_limit) {
          g_thirdPhi -= g_viewRotateRate;
        }
      }
      break;
    case 3:
      // Left
      if (g_freeCam) {
        g_freeTheta -= g_viewRotateRate;
      } else {
        g_thirdTheta -= g_viewRotateRate;
      }
      break;
    case 4:
      // Right
      if (g_freeCam) {
        g_freeTheta += g_viewRotateRate;
      } else {
        g_thirdTheta += g_viewRotateRate;
      }
      break;
  }
}

function moveView(direction) {
  switch (direction) {
    case 1:
      // Forwards
      if (g_freeCam) {
        g_freeCamPos = [
          g_freeCamPos[0] + g_cameraMoveRate * Math.sin(g_freeTheta),
          g_freeCamPos[1] + g_cameraMoveRate * Math.cos(g_freeTheta),
          g_freeCamPos[2] + g_cameraMoveRate * Math.sin(g_freePhi)
        ];
      } else {
        g_thirdLookAt = [
          g_thirdLookAt[0] + g_cameraMoveRate * Math.sin(g_thirdTheta),
          g_thirdLookAt[1] + g_cameraMoveRate * Math.cos(g_thirdTheta),
          0.5
        ];
      }
      break;
    case 2:
      // Backwards
      if (g_freeCam) {
        g_freeCamPos = [
          g_freeCamPos[0] - g_cameraMoveRate * Math.sin(g_freeTheta),
          g_freeCamPos[1] - g_cameraMoveRate * Math.cos(g_freeTheta),
          g_freeCamPos[2] - g_cameraMoveRate * Math.sin(g_freePhi)
        ];
      } else {
        g_thirdLookAt = [
          g_thirdLookAt[0] - g_cameraMoveRate * Math.sin(g_thirdTheta),
          g_thirdLookAt[1] - g_cameraMoveRate * Math.cos(g_thirdTheta),
          0.5
        ];
      }
      break;
    case 3:
      // Left
      break;
    case 4:
      // Right
      break;
  }
}
