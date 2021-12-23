function save_options() {
  console.log("saving");
  var status = document.getElementById('status');
  var public_options = {};
  $("#public input[type=checkbox]").each(function(index) {
  	var name = this.id;
  	var value = this.checked;
  	console.log("saving: " + name + "=" + value);
  	public_options[name] = value;
  });
  var member_options = {};
  $("#member input[type=checkbox]").each(function(index) {
  	var name = this.id;
  	var value = this.checked;
  	console.log("saving: " + name + "=" + value);
  	member_options[name] = value;
  });
  var options = {
  	public: public_options,
  	member: member_options
  };
  console.log('Settings saved:'+JSON.stringify(options));
  chrome.storage.local.set(options, function() {
      status.textContent = 'Talletettu';
  });
}

function restore_options() {
  console.log("restoring");
  chrome.storage.local.get(null, function(options) {
      console.log('Settings retrieved:'+JSON.stringify(options));
      for (type in options) {
	      for (name in options[type]) {
			console.log("restoring: "+ type+":"+name + "=" + options[type][name]);
			$("#" + type + " input[id=" + name +"]").prop("checked",options[type][name]);
//			var elem = document.getElementById(name);
//			if (elem) elem.checked = options[name];
	  	  }
	  }
      var status = document.getElementById('status');
      //status.textContent = 'Options restored';
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
    
