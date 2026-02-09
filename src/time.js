let testTimeOverride = null;

export function setTestTimeOverride(seconds) {
  testTimeOverride = seconds;
}

export function getTimeProgress() {
  if (testTimeOverride !== null) {
    return testTimeOverride / 86400;
  }
  const now = new Date();
  const secondsSinceMidnight =
    now.getUTCHours() * 3600 +
    now.getUTCMinutes() * 60 +
    now.getUTCSeconds() +
    now.getUTCMilliseconds() / 1000;
  return secondsSinceMidnight / 86400;
}

export function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
