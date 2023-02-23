chrome.storage.sync.get('jwt', function(items) {
  if (items.jwt) {
    sessionStorage.setItem('jwt', items.jwt)
  }
});
