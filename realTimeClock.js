// UTC-second ticker: aligns to real second and then fires every 1000ms
let _utcSecInterval = null;
let _utcSecTimeout = null;

const secondTickEvent = new CustomEvent("utc-second", {
  detail: { date: null },
});

function _startUtcSecondTicker() {
  _stopUtcSecondTicker();
  const now = Date.now();
  const msToNextSec = 1000 - (now % 1000);
  // initial aligned start
  _utcSecTimeout = setTimeout(() => {
    _dispatchUtcSecond();
    _utcSecInterval = setInterval(_dispatchUtcSecond, 1000);
    _utcSecTimeout = null;
  }, msToNextSec);
}

function _stopUtcSecondTicker() {
  if (_utcSecInterval !== null) { clearInterval(_utcSecInterval); _utcSecInterval = null; }
  if (_utcSecTimeout !== null) { clearTimeout(_utcSecTimeout); _utcSecTimeout = null; }
}

function _dispatchUtcSecond() {
  const d = new Date();
  secondTickEvent.detail.date = d;
  window.dispatchEvent(secondTickEvent);
}

// auto-start
_startUtcSecondTicker();



/* Helper to check if user is on daylight savings */
// returns true if the user's current local time is observing DST
function isObservingDST(date = new Date()) {
  const year = date.getFullYear();
  const offsets = [];
  for (let m = 0; m < 12; m++) {
    offsets.push(new Date(year, m, 1).getTimezoneOffset());
  }
  const standardOffset = Math.max(...offsets); // largest offset (minutes) = standard time
  return date.getTimezoneOffset() !== standardOffset;
}

// extra helper to get human-readable info
function dstInfo(date = new Date()) {
  const current = date.getTimezoneOffset();
  const year = date.getFullYear();
  const offsets = Array.from({length:12}, (_,m) => new Date(year, m, 1).getTimezoneOffset());
  const standard = Math.max(...offsets);
  const inDst = current !== standard;
  return {
    inDst,
    currentOffsetMinutes: current,
    standardOffsetMinutes: standard,
    differenceMinutes: current - standard
  };
}