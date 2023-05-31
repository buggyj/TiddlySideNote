


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

var current= {};
current.url  = null;
//-------------GET----------------
var getTid = function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  var currUrl = tabs[0].url;
		chrome.storage.local.get({homeTab:""}, function(items){  
			chrome.tabs.sendMessage(items.homeTab, {action : 'getTid', data:{url:currUrl}, opts:"edit"},function(res){
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
			chrome.tabs.sendMessage(items.homeTab, {action : 'putTid', data:{url:currUrl, text:x.value, title:tabs[0].title, favIconUrl:tabs[0].favIconUrl}, opts:"put"},function(res){
				//console.log(res);
				chrome.tabs.sendMessage(items.homeTab, {action : 'getTid', data:{url:currUrl},opts:"render"},function(res){
					y.innerHTML=res.msg;
					y.style.display = "block";
					x.value = "";
					//console.log("reloaded new");
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
	//console.log("emptybox ");
	x.value="";
	x.style.display = "none";
	y.style.display = "block";
});	
//-----------------------------

function getNote(tabs) {
  let x = document.querySelector('#edit');
  let y = document.querySelector('#content');
  let z = document.querySelector('#icon');
  let editvalue = x.value;
  x.value = "";//this stops multiple calls to save 
  x.style.display = "none";
  //first save note
  chrome.storage.local.get({homeTab:""}, function(items){  
	  current.text = editvalue;
		if (current.url && editvalue) chrome.tabs.sendMessage(items.homeTab, {action : 'putTid', opts:"puts",data:current},function(res){
			//console.log(res);
		});
		current.url = tabs[0].url;
		current.favIconUrl=tabs[0].favIconUrl;
		current.title=tabs[0].title;
		current.text = "";
		z.src=tabs[0].favIconUrl;
		chrome.tabs.sendMessage(items.homeTab, {action : 'getTid',data:{url:current.url} ,opts:"render"},function(res){
			//console.log("res.msg ",res.msg);
			y.innerHTML=res.msg;
			y.style.display = "block";
			
		});
  });
  //console.log(tabs[0].url);
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
	  chrome.windows.getCurrent({} ,function(Window) {//console.log("onActivated");
		if (actTabInfo.windowId == Window.id) getNote([tab]);
	});
  });
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && (changeInfo.url || changeInfo.status)) {//console.log("onUpdated");
	  chrome.windows.getCurrent({} ,function(Window) { 
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