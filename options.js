function save_options() {
  var status = document.getElementById('status');
  var options = {};
  $("input[type=checkbox]").each(function(index) {
  	var name = this.id;
  	var value = this.checked;
  	console.log("saving: " + name + "=" + value);
  	options[name] = value;
  });
  chrome.storage.local.set(options, function() {
      status.textContent = 'Talletettu';
  });
}

function restore_options() {
  chrome.storage.local.get(null, function(options) {
      console.log('Settings retrieved:'+JSON.stringify(options));
      for (name in options) {
		console.log("restoring: "+ name + "=" + options[name]);
		var elem = document.getElementById(name);
		if (elem) elem.checked = options[name];
  	  }
      var status = document.getElementById('status');
      //status.textContent = 'Options restored';
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
    