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
		

		var el = document.querySelector("link[rel='icon'], link[rel='shortcut icon']");
		if (el) {
		var faviconUrl = new URL(el.href, window.location.href).href;
		if (faviconUrl.startsWith("http") || faviconUrl.startsWith("//") ||faviconUrl.startsWith("data:")) {
			//ok
		} else {
		  faviconUrl= new URL(faviconUrl, window.location.origin).href;
		}
		} else {
		  faviconUrl = "";
		}


		return {description:description, mediaImage:mediaImage, faviconUrl:faviconUrl||""};
	}
	

	var handler = null;
	function injectMessageBox(doc) {
		// Inject the message box
	var parentMB, messageBox = document.getElementById("tiddlyclip-message-box-send");//send to this addon
	if (!messageBox) {
		parentMB = document.getElementById("tiddlyclip-message-box");
		if(!parentMB) {
			parentMB = doc.createElement("div");
			parentMB.id = "tiddlyclip-message-box";
			parentMB.style.display = "none";
			doc.body.appendChild(parentMB);
		}
			
		messageBox = doc.createElement("div");
		messageBox.id = "tiddlyclip-message-box-send";
		messageBox.style.display = "none";
		parentMB.appendChild(messageBox);
	}
	messageBox.removeEventListener("tc-send-event",handler);
	messageBox.addEventListener("tc-send-event",handler = function(event) {
			
			// Get the details from the message
			var parent, message = event.target,
			 msg = {};
			console.log(event);
			msg.action = message.getAttribute("data-action")||"";
			if (msg.action.substring(0,5) !== "__TSN") return;
			
			msg.txt = message.getAttribute("data-text");
			msg.aux = message.getAttribute("data-aux");
			msg.extra = message.getAttribute("data-extra");
			msg.action = message.getAttribute("data-action");
			msg.version = message.getAttribute("data-version");
			msg.url = window.location.href;

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
			var event = new CustomEvent("tiddlyclip-save-file", { bubbles: true });
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
			var event = new CustomEvent("tiddlyclip-save-file", { bubbles: true });
			message.dispatchEvent(event);
			//console.log("paste event sent");
		}
	}

		function putPaste (data, opts){
						// Find the message box element
		data.section='__sys__';
		data.opts = opts;//console.log("---------------",data.url)
		var messageBox = document.getElementById("tiddlyclip-message-box");
		if(messageBox) {
			// Create the message element and put it in the message box
			var message = document.createElement("div");
			message.setAttribute("data-tiddlyclip-category",data.category);
			message.setAttribute("data-tiddlyclip-pageData",JSON.stringify({data:data}));
			message.setAttribute("data-tiddlyclip-currentsection",0);
			messageBox.appendChild(message);
			//console.log("start put ");
			// Create and dispatch the custom event to the extension
			var event = new CustomEvent("tiddlyclip-save-file", { bubbles: true });
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
						console.log("puttid callback  "+x.txt);
						sendResponse("saved");
						callbacks["__TSNput__"] = null;
					}
					putDetails(request.data, request.opts);
					return true;
				}
				if (request.action == 'getMeta') {
					sendResponse(getMeta());
					return;
				}
				if (request.action == 'paste') {
					injectMessageBox(document);
					putPaste(request.data, request.opts);
					sendResponse();
					return;
				}
		});
		
