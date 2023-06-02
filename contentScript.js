	var callbacks = {};
	callbacks["__TSN__"] = null;


	function getMeta() {
		var doc = document;
		var metaTags = doc.getElementsByTagName("meta");
	    var tw5 = false, description= "", mediaImage = "";
		for(var t=0; t<metaTags.length; t++) {
			if(metaTags[t].name === "description") description = metaTags[t].content;
			else if ( metaTags[t].getAttribute('property')=="og:image") mediaImage = metaTags[t].content;
			else if ( metaTags[t].getAttribute('property')=="og:description") description = metaTags[t].content;
		}
		return {description:description, mediaImage:mediaImage};
	}
	

	var handler = null;
	function injectMessageBox(doc) {
		// Inject the message box
		var messageBox = doc.getElementById("tiddlyclip-message-box");
		if(!messageBox) {
			messageBox = doc.createElement("div");
			messageBox.id = "tiddlyclip-message-box";
			messageBox.style.display = "none";
			doc.body.appendChild(messageBox);
			//just for debug
			messageBox["data-install"] = "1";
			install = 1;
			console.log ("install:" + install);
			// Attach the event handler to the message box
			
		}
		else {
			//just of debug
			if (messageBox["data-install"]) {
				install = parseInt (messageBox["data-install"])+1;
				messageBox["data-install"] = install;
				console.log ("install:" + install);
			} else {
				install = "1";
				messageBox["data-install"] = install;
				console.log ("install:" + install);
			}
			
		}
		messageBox.removeEventListener("tc-send-event",handler);
		messageBox.addEventListener("tc-send-event",handler = function(event) {
				
				// Get the details from the message
				var message = event.target,
				 msg = {};
				
				msg.txt = message.getAttribute("data-text");
				msg.aux = message.getAttribute("data-aux");
				msg.extra = message.getAttribute("data-extra");
				msg.action = message.getAttribute("data-action");
				msg.version = message.getAttribute("data-version");
				msg.url = window.location.href;
				if (msg.action.substring(0,5) !== "__TSN") {console.log (msg.action);return  false;}
				//console.log ("got show" + msg.action );
				//event.currentTarget.parentNode.removeChild(message);
				// Save the file
				message.parentNode.removeChild(message);
				if (msg.action in callbacks) {callbacks[msg.action](msg);return false;}
				return false;
			},false);
		
	};



	function getDetails (data, opts){
						// Find the message box element
		data.section='__sys__';
		data.__callback__="__TSN__"
		data.category='TSN';
		if (opts) data.opts = opts;//console.log("---------------",data.url);
		var messageBox = document.getElementById("tiddlyclip-message-box");
		if(messageBox) {
			// Create the message element and put it in the message box
			var message = document.createElement("div");
			message.setAttribute("data-tiddlyclip-category",'TSN');
			message.setAttribute("data-tiddlyclip-pageData",JSON.stringify({data:data}));
			message.setAttribute("data-tiddlyclip-currentsection",0);
			messageBox.appendChild(message);
			//console.log("start get ");
			// Create and dispatch the custom event to the extension
			var event = document.createEvent("Events");
			event.initEvent("tiddlyclip-save-file",true,false);
			message.dispatchEvent(event);
			//console.log("paste event sent");
		}
	}
	
		function putDetails (data, opts){
						// Find the message box element
		data.section='__sys__';
		data.__callback__="__TSNput__"
		data.category='TSNput';
		data.opts = opts;//console.log("---------------",data.url)
		var messageBox = document.getElementById("tiddlyclip-message-box");
		if(messageBox) {
			// Create the message element and put it in the message box
			var message = document.createElement("div");
			message.setAttribute("data-tiddlyclip-category",'TSNput');
			message.setAttribute("data-tiddlyclip-pageData",JSON.stringify({data:data}));
			message.setAttribute("data-tiddlyclip-currentsection",0);
			messageBox.appendChild(message);
			//console.log("start put ");
			// Create and dispatch the custom event to the extension
			var event = document.createEvent("Events");
			event.initEvent("tiddlyclip-save-file",true,false);
			message.dispatchEvent(event);
			//console.log("paste event sent");
		}
	}


	   chrome.runtime.onMessage.addListener(
			  function(request, sender, sendResponse) {console.log("action",request.action)
				//here we need to check that the tiddlywiki is open for cuts - in the new interactive way.
				if (request.action == 'getTid') {
					injectMessageBox(document);
					// first stage send back url
					//console.log("get tid sidpanel");

					callbacks["__TSN__"]= function (x){
						var resp = {};
						console.log("gettid callback  "+x.txt);
						resp.data = x.txt;
						resp.aux = x.aux;
						resp.extra = x.extra;
						sendResponse(resp);
						callbacks["__TSN__"] = null;
					}
					getDetails(request.data, request.opts);
					return true;
				} 
				if (request.action == 'putTid') {
					injectMessageBox(document);
					// first stage send back url
					//console.log("put tid sidpanel");

					callbacks["__TSNput__"]= function (x){
						//console.log("puttid callback  ");
						sendResponse("saved");
						callbacks["__TSNput__"] = null;
					}
					putDetails(request.data, request.opts);
					return true;
				}
				if (request.action == 'getMeta') {
					sendResponse(getMeta());
				}
		});
		
