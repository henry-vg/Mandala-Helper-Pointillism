let mandala,
  config,
  curPoints;

function setup() {
  createCanvas(windowWidth, windowHeight);

  mandala = new mandalaObject();
  config = new configObject(createVector(width, height));

  noFill();
}

function draw() {
  background(config.bgPicker.color());

  cursor(ARROW);

  curPoints = undefined;

  mandala.show();

  if (mouseY > config.barHeight) {
    if (!config.eraser) {
      const col = config.ptPicker.color();

      stroke(red(col), green(col), blue(col), 100);
      strokeWeight(config.pxSlider.value());

      curPoints = getSymmetryPoints(createVector(mouseX, mouseY), config.bsSlider.value(), mandala.center, config.pxSlider.value());

      for (let i = 0; i < curPoints.length; i++) {
        point(curPoints[i].x, curPoints[i].y);
      }
    }
    else {
      noCursor();
      mandala.over = -1;
      for (let i = 0; i < mandala.points.length; i++) {
        for (let j = 0; j < mandala.points[i].length; j++) {
          if (dist(mouseX, mouseY, mandala.points[i][j].pos.x, mandala.points[i][j].pos.y) < mandala.points[i][j].size / 2) {
            mandala.over = i;
          }
        }
      }

      const bgPickerI = color(255 - red(config.bgPicker.color()), 255 - green(config.bgPicker.color()), 255 - blue(config.bgPicker.color()));

      stroke(bgPickerI);
      strokeWeight(4);
      noFill();
      const crossSize = 20;
      line(mouseX - crossSize / 2, mouseY - crossSize / 2, mouseX + crossSize / 2, mouseY + crossSize / 2);
      line(mouseX + crossSize / 2, mouseY - crossSize / 2, mouseX - crossSize / 2, mouseY + crossSize / 2);
    }
  }

  config.show();
}

class mandalaObject {
  constructor() {
    this.points = [];
    this.center = createVector(width / 2, height / 2);
    this.over = -1;
  }
  show() {
    for (let i = 0; i < this.points.length; i++) {
      for (let j = 0; j < this.points[i].length; j++) {
        const c = this.points[i][j].col;
        stroke((this.over == i) ? color(red(c), green(c), blue(c), 100) : c);
        strokeWeight(this.points[i][j].size);
        point(this.points[i][j].pos.x, this.points[i][j].pos.y);
      }
    }
  }
  addPoints(ps) {
    const seq = [];

    for (let i = 0; i < ps.length; i++) {
      seq.push({ pos: ps[i], col: config.ptPicker.color(), size: config.pxSlider.value() });
    }
    this.points.push(seq);
  }
  getOuterPoints(ps) {
    let pMin,
      pMax;
    for (let i = 0; i < ps.length; i++) {
      for (let j = 0; j < ps[i].length; j++) {
        if (!pMin || ps[i][j].pos.x < pMin.pos.x) {
          pMin = ps[i][j];
        }
        if (!pMax || ps[i][j].pos.x > pMax.pos.x) {
          pMax = ps[i][j];
        }
      }
    }

    return [pMin, pMax];
  }
}

class configObject {
  constructor(s) {
    this.elementsGap = 20;
    this.barHeight = 35;
    this.barStrokeWeight = 2;

    this.initialSize = s;
    this.saveSize = createVector(2160, 2160);

    textSize(this.barHeight / 2);

    this.bgPicker = createColorPicker('#000000');
    this.bgPicker.size(this.bgPicker.width * 0.75, this.bgPicker.height);
    this.bgPicker.position(this.elementsGap, (this.barHeight - this.bgPicker.height) / 2);

    this.ptPicker = createColorPicker('#ffffff');
    this.ptPicker.size(this.bgPicker.width, this.bgPicker.height);
    this.ptPicker.position(this.bgPicker.position().x + this.bgPicker.width, (this.barHeight - this.ptPicker.height) / 2);

    this.pxSliderMin = 1;
    this.pxSliderMax = 75;
    this.bsSliderMin = 2;
    this.bsSliderMax = 75;

    const pxTextWidth = textWidth(`${Array(str(this.pxSliderMax).length + 1).join(8)}.8px`),
      bsTextWidth = textWidth(`${Array(str(this.bsSliderMax).length + 1).join(8)}`),
      slidersWidth = (width - 8 * this.elementsGap - 5.5 * this.ptPicker.width - pxTextWidth - bsTextWidth) / 2;

    this.pxSlider = createSlider(this.pxSliderMin, this.pxSliderMax, 20, 0.5);
    this.pxSlider.size(slidersWidth, this.pxSlider.height);
    this.pxSlider.position(this.ptPicker.position().x + this.ptPicker.width + this.elementsGap, (this.barHeight - this.pxSlider.height) / 2 - 2);

    this.bsSlider = createSlider(this.bsSliderMin, this.bsSliderMax, 8, 1);
    this.bsSlider.size(slidersWidth, this.bsSlider.height);
    this.bsSlider.position(this.pxSlider.position().x + this.pxSlider.width + this.elementsGap + pxTextWidth + this.elementsGap, (this.barHeight - this.bsSlider.height) / 2 - 2);

    this.eraserButton = createButton('Eraser off');
    this.eraserButton.position(this.bsSlider.position().x + this.bsSlider.width + this.elementsGap + bsTextWidth + this.elementsGap, (this.barHeight - this.eraserButton.height) / 2);
    this.eraserButton.size(this.ptPicker.width * 2, this.eraserButton.height);
    this.eraser = false;
    this.eraserButton.mousePressed(function () { config.eraserPressed(); });

    this.saveButton = createButton('Save');
    this.saveButton.size(this.ptPicker.width * 1.5, this.saveButton.height);
    this.saveButton.position(width - this.elementsGap - this.saveButton.width, (this.barHeight - this.saveButton.height) / 2);
    this.saveButton.mousePressed(function () { config.savePressed(); });
  }
  show() {
    push();
    resetMatrix();
    const bgPickerI = color(255 - red(this.bgPicker.color()), 255 - green(this.bgPicker.color()), 255 - blue(this.bgPicker.color()));

    stroke(bgPickerI);
    strokeWeight(this.barStrokeWeight);
    fill(this.bgPicker.color());
    rect(-this.barStrokeWeight / 2, -this.barStrokeWeight / 2, width + this.barStrokeWeight, this.barHeight + this.barStrokeWeight);

    noStroke();
    fill(bgPickerI);

    const scalar = 0.8;

    text(`${this.pxSlider.value()}${(this.pxSlider.value() - floor(this.pxSlider.value()) == 0) ? '.0' : ''}px`, this.pxSlider.position().x + this.pxSlider.width + this.elementsGap, (this.barHeight + textAscent() * scalar) / 2);

    text(`${this.bsSlider.value()}`, this.bsSlider.position().x + this.bsSlider.width + this.elementsGap, (this.barHeight + textAscent() * scalar) / 2);

    pop();
  }
  eraserPressed() {
    this.eraser = !this.eraser;
    this.eraserButton.html(`Eraser ${(this.eraser) ? 'on' : 'off'}`);
  }
  savePressed() {
    resizeCanvas(this.saveSize.x, this.saveSize.y);

    background(this.bgPicker.color());

    translate(this.saveSize.x / 2, this.saveSize.y / 2);

    const outerPoints = mandala.getOuterPoints(mandala.points),
      d = abs(outerPoints[0].pos.x - outerPoints[1].pos.x);

    scale(this.saveSize.x / (d + outerPoints[0].size));

    translate(-this.initialSize.x / 2, -this.initialSize.y / 2);

    mandala.show();

    saveCanvas('Mandala', 'png');

    resizeCanvas(this.initialSize.x, this.initialSize.y);

    console.log('Image saved in Downloads folder.')
  }
}

function mouseClicked() {
  if (!config.eraser) {
    if (curPoints) {
      mandala.addPoints(curPoints);
    }
  }
  else if (mandala.over != -1) {
    mandala.points.splice(mandala.over, 1);
  }
}

function getSymmetryPoints(p, b, c, s) {
  const seq = [],
    r = dist(p.x, p.y, c.x, c.y);
  let a = atan2(p.x - c.x, p.y - c.y);

  for (let i = 0; i < b; i++) {
    const x = c.x + r * sin(a),
      y = c.y + r * cos(a);

    a += TWO_PI / b;

    seq.push(createVector(x, y));
    seq.push(createVector(2 * c.x - x, y));
  }

  seq.sort(function (a, b) {
    return atan2(a.x - mandala.center.x, a.y - mandala.center.y) - atan2(b.x - mandala.center.x, b.y - mandala.center.y);
  });

  const newSeq = [],
    maxDist = s / 2;

  const joiningB = dist(seq[0].x, seq[0].y, seq[seq.length - 1].x, seq[seq.length - 1].y) < maxDist,
    joiningA = dist(seq[0].x, seq[0].y, seq[1].x, seq[1].y) < maxDist;

  if (!joiningB && !joiningA) {
    return seq;
  }

  for (let i = 0; i < seq.length; i += 2) {
    if (joiningA && joiningB && config.bsSlider.value() == 2) {
      const newX = (seq[(i + 1) % seq.length].x + seq[(i + seq.length - 1) % seq.length].x) / 2,
        newY = (seq[(i + 1) % seq.length].y + seq[(i + seq.length - 1) % seq.length].y) / 2;
      newSeq.push(createVector(newX, newY));
      i += 2;
    }
    else if (joiningB) {
      const newX = (seq[i].x + seq[(i + seq.length - 1) % seq.length].x) / 2,
        newY = (seq[i].y + seq[(i + seq.length - 1) % seq.length].y) / 2;
      newSeq.push(createVector(newX, newY));
    }
    else if (joiningA) {
      const newX = (seq[i].x + seq[(i + 1) % seq.length].x) / 2,
        newY = (seq[i].y + seq[(i + 1) % seq.length].y) / 2;
      newSeq.push(createVector(newX, newY));
    }
  }

  return newSeq;
}