const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d', {
  willReadFrequently: true,
});

(function initCanvasSize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}) ();

function Random(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

class Particle {
  constructor() {
    const r = Math.min(canvas.width, canvas.height) / 2;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rad = Random(0, 360) * Math.PI / 180;
    this.x = cx + r * Math.cos(rad);
    this.y = cy + r * Math.sin(rad);
    this.size = Random(2 * devicePixelRatio , 9 * devicePixelRatio);
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = '#5445544d';
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  moveTo(tx, ty) {
    const duration = 500;
    const startX = this.x, startY = this.y;
    const xSpeed = (tx - startX) / duration;
    const ySpeed = (ty - startY) / duration;
    const startTime = Date.now();
    const _move = () => {
      const t = Date.now() - startTime;
      const x = startX + xSpeed * t;
      const y = startY + ySpeed * t;
      this.x = x;
      this.y = y;
      if (t > duration) {
        this.x = tx;
        this.y = ty;
        return;
      }
      requestAnimationFrame(_move);
    }
    _move();
  }
}

let text = null;
const particles = [];
// for (let i = 0; i < 10; i++){
//   particles.push(new Particle());
// }
function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function draw() {
  clear();
  update();
  particles.forEach(p => p.draw());
  requestAnimationFrame(draw);
}

draw();

function getText() {
  return new Date().toTimeString().substring(0, 8);
}

function update() {
  const newText = getText();
  if (newText === text) {
    return;
  }
  clear();
  const { width, height } = canvas;
  text = newText;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'middle';
  ctx.font = `${220 * devicePixelRatio}px 'DS-Digital',sans-serif`;
  ctx.fillText(text, (width - ctx.measureText(text).width) / 2, height / 2);
  const points = getPoints();
  clear();
  for (let i = 0; i < points.length; i++){
    let p = particles[i];
    if (!p) {
      p = new Particle();
      particles.push(p);
    }
    const [x, y] = points[i];
    p.moveTo(x, y);
  }
  if (points.length < particles.length) {
    particles.splice(points.length);
  }

}
function getPoints() {
  const { width, height, data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const points = [];
  const gap = 3;
  for (let i = 0; i < width; i+=gap){
    for (let j = 0; j < height; j+=gap){
      const index = (i + j * width) * 4;
      const r = data[index], g = data[index + 1], b = data[index + 2], a = data[index + 3];
      if (a == 255 && r == 0 && g == 0 && b == 0) {
        points.push([i, j]);
      }
    }
  }
  return points;
}
