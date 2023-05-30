


var offset;
function addAutoResize() {
  document.querySelectorAll('[data-autoresize]').forEach(function (element) {
    element.style.boxSizing = 'border-box';
    offset = element.offsetHeight - element.clientHeight;
    element.addEventListener('input', function (event) {
      event.target.style.height = 0;
      event.target.style.height = event.target.scrollHeight + offset + 'px';
      //console.log("trigger")
    });
    element.removeAttribute('data-autoresize');
  });
}
 addAutoResize();


//-------------GET----------------
var getTid = function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  var currUrl = tabs[0].url;
		chrome.storage.local.get({homeTab:""}, function(items){  
			chrome.tabs.sendMessage(items.homeTab, {action : 'getTid', url:currUrl, opts:"edit"},function(res){
				let y = document.querySelector('#content');
				let x = document.querySelector('#edit');
				y.style.display = "none";
				//console.log("res.msg ",res.msg);
				x.value=res.msg;
				x.style.display = "block";
				x.dispatchEvent(new Event("input"))

			});
		});
	});
}


document.querySelector('#get').addEventListener('click', getTid);	

//-------------PUT--------------

document.querySelector('#put').addEventListener('click', function() {
	let x = document.querySelector('#edit')
	let y = document.querySelector('#content');
	//console.log("emptybox ");
	//x.value="";
	//y.style.display = "block";
	x.style.display = "none";
								
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  var currUrl = tabs[0].url;
		chrome.storage.local.get({homeTab:""}, function(items){  
			chrome.tabs.sendMessage(items.homeTab, {action : 'putTid', url:currUrl, opts:"put", payload:x.value},function(res){
				console.log(res);
				chrome.tabs.sendMessage(items.homeTab, {action : 'getTid', url:currUrl,opts:"render"},function(res){
					y.innerHTML=res.msg;
					y.style.display = "block";
					console.log("reloaded new");
				});
				
				
				//console.log("res.msg ",res.msg);(document.querySelector('#content')).innerHTML=res.msg;
			});
		});
	});
});	

//-----------CANCEL--------------

document.querySelector('#cancel').addEventListener('click', function() {
	let x = document.querySelector('#edit');
	let y = document.querySelector('#content');
	console.log("emptybox ");
	x.value="";
	x.style.display = "none";
	y.style.display = "block";
});	
//-----------------------------

function getNote(tabs) {
  var currUrl = tabs[0].url;
	chrome.storage.local.get({homeTab:""}, function(items){  
		chrome.tabs.sendMessage(items.homeTab, {action : 'getTid', url:currUrl,opts:"render"},function(res){
			//console.log("res.msg ",res.msg);
			(document.querySelector('#content')).innerHTML=res.msg;
		});
  });
  console.log(tabs[0].url);
}

function onError(error) {
  console.error(`Error: ${error}`);
}

chrome.tabs
  .query({ currentWindow: true, active: true })
  .then(getNote, onError);


 


chrome.runtime.onMessage.addListener(({ name, data }) => {
  if (name === 'doit') {
	chrome.storage.local.get({conected:"not here again"}, function(items){
				document.querySelector('#home').innerHTML = items.conected;
		} 
	);
  }
});

chrome.tabs.onActivated.addListener((actTabInfo) => {
  chrome.tabs.get(actTabInfo.tabId, (tab) => {
	  chrome.windows.getCurrent({} ,function(Window) {console.log(actTabInfo.windowId ,"==", Window.id);
		if (actTabInfo.windowId == Window.id) getNote([tab]);
	});
  });
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && (changeInfo.url || changeInfo.status)) {
	  chrome.windows.getCurrent({} ,function(Window) { console.log(tab.windowId ,"==", Window.id);
		if (tab.windowId == Window.id) getNote([tab]);
	});
  }
});

main();
function main(){
	chrome.storage.local.get({conected:"not here"}, function(items){
				document.querySelector('#home').innerHTML = items.conected;
		} 


	);

	
	
}