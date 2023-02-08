const jwt = sessionStorage.getItem("jwt")

if (jwt) {
  chrome.storage.sync.set({ jwt });
}
