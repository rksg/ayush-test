// Saves options to chrome.storage
function save_options() {
  var env = document.getElementById('environment').value;
  chrome.storage.sync.set({
    env: env,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    env: 'devalto.ruckuswireless.com'
  }, function(items) {
    document.getElementById('environment').value = items.env;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
  save_options);
