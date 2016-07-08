// Saves options to chrome.storage
function save_options() {
  var overdueTodayValue = document.getElementById('overdueToday').checked;
  chrome.storage.sync.set({
	  overdueToday: overdueTodayValue
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Настройки сохранены.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores checkbox state using the preferences stored in chrome.storage.
function restore_options() {
  // Use default value overdueToday = true.
  chrome.storage.sync.get({
    overdueToday: true
  }, function(items) {
    document.getElementById('overdueToday').checked = items.overdueToday;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
