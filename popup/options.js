
// Saves options to chrome.storage.sync.
function save_options() {
  var timeout = document.getElementById('timeout').value;
  var url = document.getElementById('url').value;
  chrome.storage.sync.set({
    timeout: int(timeout),
    url: url
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    timeout: 10,
    url: ""
  }, function(items) {
    document.getElementById('timeout').value = items.timeout;
    document.getElementById('url').value = items.url;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
