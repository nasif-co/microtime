let oneSecondInDegrees = 0.00416667;
let secondsAwayFromZeroMeridian = 0;
let long = null; // global variable the user asked for
let isDST = isObservingDST();
let earthRadius = 300;

let microtime = {
  year: null,
  month: null,
  date: null,
  hour: null,
  minute: null,
  second: null,
  millisecond: null,
}

window.addEventListener("longitudeChange", (e) => {
  long = e.detail.longitude;
  if (long !== null) {
    secondsAwayFromZeroMeridian = long / oneSecondInDegrees;
    secondsAwayFromZeroMeridian = Math.round(secondsAwayFromZeroMeridian);
  }
});

window.addEventListener("utc-second", (e) => {
  let now = Date.now();
  now += secondsAwayFromZeroMeridian * 1000; // make it milliseconds
  const d = new Date(now);

  microtime = {
    year: d.getUTCFullYear(),
    month: new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(d), // Month name in 3 characters
    date: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    millisecond: d.getUTCMilliseconds(),
  };

  if(isDST) {
    // if the user is in DST, adjust hour by +1
    microtime.hour += 1;
    if(microtime.hour === 24) {
      microtime.hour = 0;
      microtime.date += 1;
      // ignoring month-end and year-end overflow for simplicity
    }
  }

  updateTimeDisplay()
});

let img;

async function setup() {
  img = await loadImage('unwrap-md.jpg');
  createCanvas(windowWidth, windowHeight, WEBGL);
  earthRadius = min(windowWidth, windowHeight) / 2.5;
}

let primeMeridian = -90;
let currentLong = -90;

function draw() {
  orbitControl(1,1,0, {
    disableTouchActions: true,
  });
  background(255);
  noStroke();
  rotateY(radians(currentLong - 90)); //-180 is centered
  texture(img);
  sphere(earthRadius, 80, 80);

  const targetLon = primeMeridian - (long !== null ? long : 0);
  if (currentLong === null) currentLong = targetLon;
  // smooth transition
  currentLong += (targetLon - currentLong) * 0.001;
  currentLong = lerp(currentLong, targetLon, 0.01);
  beginShape();
  stroke(248, 79, 0);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let lat = -90; lat <= 90; lat += 2) {
    const p = lonLatToCartesian(currentLong, lat, earthRadius + 0.001); // +0.001 to avoid z-fighting
    vertex(p.x, p.y, p.z);
  }
  endShape();
}

function lonLatToCartesian(lonDeg, latDeg, radius) {
  const lon = radians(lonDeg);
  const lat = radians(latDeg);
  const x = radius * Math.cos(lat) * Math.cos(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.sin(lon);
  return { x, y, z };
}

function updateTimeDisplay(){
  document.querySelector('.longitude').textContent = long;
  document.querySelector('.hour').textContent = microtime.hour >= 12 ? (microtime.hour - 12).toString().padStart(2, '0') : microtime.hour.toString().padStart(2, '0');
  document.querySelector('.minute').textContent = microtime.minute.toString().padStart(2, '0');
  document.querySelector('.seconds').textContent = microtime.second.toString().padStart(2, '0');
  document.querySelector('.month').textContent = microtime.month;
  document.querySelector('.day').textContent = microtime.date.toString().padStart(2, '0');
  document.querySelector('.year').textContent = microtime.year;
  document.querySelector('.ampm').textContent = microtime.hour >= 12 ? 'PM' : 'AM';
  document.querySelector('time').classList.remove('not-set');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
