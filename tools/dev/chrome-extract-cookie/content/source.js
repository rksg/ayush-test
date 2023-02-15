const jwt = sessionStorage.getItem("jwt")
chrome.storage.sync.set({ jwt });
