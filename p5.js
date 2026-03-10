let discs = [];
let baseText = "CHICAGO ART BOOK FAIR";

const SHAPE_TYPES = [
  "radialTicks",
  "textCircle",
  "checkerSpiral",
  "radialArrows",
  "twistSpiral"
];

let selectedDisc = null;
let rubenFont;

// --- TEXT CONTROL VARIABLES (DEFAULTS) ---
let textSizeFactor = 0.15;
let lineHeightFactor = 1.15;
let textXOffset = 0.03;
let textYStartOffset = 0.25;

// --- SAVE CONTROL ---
let savingFrame = false;

// --- DISC COUNT CONTROL ---
const MIN_DISCS = 1;
const MAX_DISCS = 12;

// Specs used when adding new discs in order (no concentric)
const DISC_SPECS = [
  { r: 0.25, type: "radialTicks" },
  { r: 0.16, type: "textCircle" },
  { r: 0.22, type: "checkerSpiral" },
  { r: 0.18, type: "radialArrows" },
  { r: 0.20, type: "twistSpiral" }
];

// --- OPACITY CONTROL (DEFAULT) ---
let discOpacity = 220;

// --- COLOR CONTROL (DEFAULT) ---
let discColorMode = "tomato";

// --- INTERFACE TOGGLE ---
// start hidden; press "I" to show
let showInterface = false;

function preload() {
  rubenFont = loadFont("Sligoil-MicroMedium.otf");
}

// --------------------- NON-OVERLAP PLACEMENT ---------------------

function placeDiscNonOverlapping(existingDiscs, pixelRadius) {
  let maxAttempts = 200;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let px = random(0.15, 0.85);
    let py = random(0.15, 0.85);
    let x = px * width;
    let y = py * height;

    let valid = true;
    for (let d of existingDiscs) {
      let dx = x - d.x;
      let dy = y - d.y;
      let dist = sqrt(dx * dx + dy * dy);
      if (dist < pixelRadius + d.r) {
        valid = false;
        break;
      }
    }
    if (valid) return { px, py };
  }

  return { px: random(0.2, 0.8), py: random(0.2, 0.8) };
}

// ------------------------------- SETUP --------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(rubenFont);
  textAlign(LEFT, CENTER);
  noStroke();

  discs = [];

  // INITIAL DISC COUNT
  let initialCount = 4;

  for (let i = 0; i < initialCount; i++) {
    let spec = DISC_SPECS[i % DISC_SPECS.length];
    let pixelRadius = spec.r * min(width, height);
    let pos = placeDiscNonOverlapping(discs, pixelRadius);
    discs.push(new Disc(pos.px, pos.py, spec.r, spec.type));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ------------------------------- DRAW --------------------------------

function draw() {
  if (savingFrame) {
    background(255);
    drawBackgroundText();
    for (let d of discs) d.display();
    saveCanvas("CABF", "png");
    savingFrame = false;
    return;
  }

  background(255);
  drawBackgroundText();
  for (let d of discs) d.display();
  if (showInterface) drawTextDebug();
}

// ----------------------- BACKGROUND TEXT RENDER -----------------------

function drawBackgroundText() {
  fill(30);
  let fontSize = height * textSizeFactor;
  textSize(fontSize);
  let lineHeight = fontSize * lineHeightFactor;

  let y = lineHeight * textYStartOffset;
  while (y < height + lineHeight) {
    text(baseText, width * textXOffset, y);
    y += lineHeight;
  }
}

// -------------------------- UI OVERLAY --------------------------

function drawTextDebug() {
  push();
  noStroke();
  fill(255, 220);
  rect(10, 10, 340, 170);
  fill(0);
  textAlign(LEFT, TOP);
  textSize(14);

  text(
    "TEXT CONTROLS (I: TOGGLE UI):\n" +
    "U/D SIZE: " + nf(textSizeFactor, 1, 2) + "\n" +
    "L/R LINE: " + nf(lineHeightFactor, 1, 2) + "\n" +
    "A/D XOFF: " + nf(textXOffset, 1, 2) + "\n" +
    "W/S YOFF: " + nf(textYStartOffset, 1, 2) + "\n" +
    "Z/X DISCS: " + discs.length + " (- / +)\n" +
    "OPACITY (< />): " + discOpacity + "\n" +
    "COLOR (1/2/3): " + discColorMode.toUpperCase() + "\n" +
    "SAVE (P): PNG WITHOUT UI",
    18, 16
  );
  pop();
}

// -------------------------- KEYBOARD CONTROLS --------------------------

function keyPressed() {
  // Toggle UI
  if (key === "i" || key === "I") {
    showInterface = !showInterface;
    return;
  }

  // SAVE FRAME
  if (key === "p" || key === "P") {
    savingFrame = true;
    return;
  }

  // TEXT SIZE
  if (keyCode === UP_ARROW) textSizeFactor += 0.01;
  if (keyCode === DOWN_ARROW) textSizeFactor -= 0.01;

  // LINE HEIGHT
  if (keyCode === RIGHT_ARROW) lineHeightFactor += 0.05;
  if (keyCode === LEFT_ARROW) lineHeightFactor -= 0.05;

  // X OFFSET
  if (key === "a" || key === "A") textXOffset -= 0.01;
  if (key === "d" || key === "D") textXOffset += 0.01;

  // Y OFFSET
  if (key === "w" || key === "W") textYStartOffset -= 0.05;
  if (key === "s" || key === "S") textYStartOffset += 0.05;

  // DISC COUNT
  if (key === "z" || key === "Z") {
    if (discs.length > MIN_DISCS) discs.pop();
  }
  if (key === "x" || key === "X") {
    if (discs.length < MAX_DISCS) addNewDisc();
  }

  // OPACITY
  if (key === ",") discOpacity -= 10;
  if (key === ".") discOpacity += 10;

  // COLOR
  if (key === "1") discColorMode = "black";
  if (key === "2") discColorMode = "kelly";
  if (key === "3") discColorMode = "tomato";

  // LIMITS
  textSizeFactor = constrain(textSizeFactor, 0.02, 0.6);
  lineHeightFactor = constrain(lineHeightFactor, 0.5, 2.0);
  textXOffset = constrain(textXOffset, -0.5, 1.0);
  textYStartOffset = constrain(textYStartOffset, -2.0, 2.0);
  discOpacity = constrain(discOpacity, 10, 255);
}

// -------------------------- DISC ADD FUNCTION --------------------------

function addNewDisc() {
  let spec = DISC_SPECS[discs.length % DISC_SPECS.length];
  let pixelRadius = spec.r * min(width, height);
  let pos = placeDiscNonOverlapping(discs, pixelRadius);
  discs.push(new Disc(pos.px, pos.py, spec.r, spec.type));
}

// -------------------------- MOUSE INTERACTION --------------------------

function mousePressed() {
  for (let i = discs.length - 1; i >= 0; i--) {
    if (discs[i].contains(mouseX, mouseY)) {
      selectedDisc = discs[i];
      selectedDisc.cycleType();
      break;
    }
  }
}

function mouseDragged() {
  if (selectedDisc) {
    selectedDisc.px = constrain(mouseX / width, 0, 1);
    selectedDisc.py = constrain(mouseY / height, 0, 1);
  }
}

function mouseReleased() {
  selectedDisc = null;
}

// ------------------------------ DISC CLASS ------------------------------

class Disc {
  constructor(px, py, pr, type) {
    this.px = px;
    this.py = py;
    this.pr = pr;
    this.type = type;
    this.rotationSpeed = random([-1, 1]) * random(0.001, 0.004);
  }

  get x() { return this.px * width; }
  get y() { return this.py * height; }
  get r() { return this.pr * min(width, height); }

  display() {
    push();
    translate(this.x, this.y);
    rotate(frameCount * this.rotationSpeed);
    switch (this.type) {
      case "radialTicks": this.drawRadialTicks(); break;
      case "textCircle": this.drawTextCircle(); break;
      case "checkerSpiral": this.drawCheckerSpiral(); break;
      case "radialArrows": this.drawRadialArrows(); break;
      case "twistSpiral": this.drawTwistSpiral(); break;
    }
    pop();
  }

  // hit test
  contains(mx, my) {
    let dx = mx - this.x, dy = my - this.y;
    return sqrt(dx*dx + dy*dy) <= this.r;
  }

  cycleType() {
    let idx = SHAPE_TYPES.indexOf(this.type);
    this.type = SHAPE_TYPES[(idx + 1) % SHAPE_TYPES.length];
  }

  // Pick correct fill color
  applyFill() {
    if (discColorMode === "kelly") fill(76, 187, 23, discOpacity);
    else if (discColorMode === "tomato") fill(255, 99, 71, discOpacity);
    else fill(0, discOpacity);
  }

  drawRadialTicks() {
    let spokes = 10;
    let inner = this.r * 0.35;
    let outer = this.r;

    for (let i = 0; i < spokes; i++) {
      let a1 = (TWO_PI / spokes) * i;
      let a2 = (TWO_PI / spokes) * (i + 0.17);

      this.applyFill();
      beginShape();
      vertex(inner * cos(a1), inner * sin(a1));
      vertex(outer * cos(a1), outer * sin(a1));
      vertex(outer * cos(a2), outer * sin(a2));
      vertex(inner * cos(a2), inner * sin(a2));
      endShape(CLOSE);
    }
  }

  drawTextCircle() {
    let radius = this.r * 1.55;
    let dots = 36;

    this.applyFill();
    for (let i = 0; i < dots; i++) {
      let a = (TWO_PI / dots) * i;
      circle(radius * cos(a), radius * sin(a), this.r * 0.1);
    }
  }

  drawCheckerSpiral() {
    let steps = 120, turns = 20;
    noStroke();

    for (let i = 0; i < steps; i++) {
      let a1 = map(i, 0, steps, 0, TWO_PI * turns);
      let a2 = map(i + 1, 0, steps, 0, TWO_PI * turns);
      let r1 = map(i, 0, steps, 0, this.r);
      let r2 = map(i + 1, 0, steps, 0, this.r);

      this.applyFill();
      beginShape();
      vertex(r1 * cos(a1), r1 * sin(a1));
      vertex(r2 * cos(a1), r2 * sin(a1));
      vertex(r2 * cos(a2), r2 * sin(a2));
      vertex(r1 * cos(a2), r1 * sin(a2));
      endShape(CLOSE);
    }
  }

  drawRadialArrows() {
    let spokes = 10;
    let outer = this.r;

    for (let i = 0; i < spokes; i++) {
      let a = (TWO_PI / spokes) * i;

      this.applyFill();
      beginShape();
      vertex(0, 0);
      vertex(outer * cos(a - 0.1), outer * sin(a - 0.1));
      vertex(outer * cos(a + 0.1), outer * sin(a + 0.1));
      endShape(CLOSE);
    }
  }

  drawTwistSpiral() {
    let bands = 3;
    let inner = this.r;

    noStroke();
    for (let i = 0; i < bands; i++) {
      let a1 = (TWO_PI / bands) * i;
      let a2 = (TWO_PI / bands) * (i + 1);

      this.applyFill();
      beginShape();
      vertex(inner * cos(a1), inner * sin(a1));
      vertex(this.r * cos(a1 + 0.25), this.r * sin(a1 + 0.25));
      vertex(this.r * cos(a2 + 0.25), this.r * sin(a2 + 0.25));
      vertex(inner * cos(a2), inner * sin(a2));
      endShape(CLOSE);
    }
  }
}
