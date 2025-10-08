let _long = null; // global variable the user asked for
var geoWatchId = null;

// Custom event for longitude changes
const longitudeChangedEvent = new CustomEvent("longitudeChange", {
  detail: { longitude: null },
});

function startWatchingLong() {
  if (!("geolocation" in navigator)) {
    console.warn("Geolocation API not available");
    return;
  }

  // initial read
  navigator.geolocation.getCurrentPosition(
    function (p) {
      setLong(p.coords.longitude);
    },
    function (e) {
      console.warn("getCurrentPosition error:", e);
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
  );

  // live updates
  geoWatchId = navigator.geolocation.watchPosition(
    function (p) {
      setLong(p.coords.longitude);
    },
    function (e) {
      console.warn("watchPosition error:", e);
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
}

function stopWatchingLong() {
  if (geoWatchId !== null && "geolocation" in navigator) {
    navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
  }
}

function setLong(v) {
  var n = Number(v);
  if (Number.isNaN(n)) return;
  if (_long === n) return;
  _long = n;
  try {
    window.long = _long;
  } catch (e) {}
  longitudeChangedEvent.detail.longitude = _long;
  window.dispatchEvent(longitudeChangedEvent);
}

// start automatically
startWatchingLong();
