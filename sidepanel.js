


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
var tags;
var taglist = [];

function restorTags() {
	tags = unedittags;
	redoTags();
	removeDropDown();
}

function addDropDown(arr){
	var options=`<select id="selectdd"><option value="" disabled hidden selected>add tag</option>`;
	arr.map((op,i)=>{
	 options+=`<option value="${op}" id="${i}" style="border-radius: 5px;"">${op}</option>`
	})
	options+='</select>';
	document.getElementById("dropdown").innerHTML=options;
	document.querySelector('#selectdd').onchange = function(e){
		console.log("val is",e.target.value)
		if (!tags.includes(e.target.value)) {
			tags.push(e.target.value);
			redoTags(true);
		}
		addDropDown(arr);
	}
}
function removeDropDown(){
	console.log ("remove dropdown");
  document.getElementById("dropdown").innerHTML="";
}
function puttags(fields, edit){
	let w = document.querySelector('#tags');
	let items = JSON.parse(fields);
	
	let html = 'tags: ';
	tags=items.tags||[];
	unedittags = tags;
	for (i in tags) {
		if (edit) html += `<scan  class="tagpillfalse">${tags[i]}<button id="tags${i}" class="reset-button">[x]</button></scan>`;
		else html +=  `<button class="tagpill">${tags[i]}</button>`;
	}
			
	w.innerHTML = html;
	
	if (edit) {
		for (i in tags) {
				(function (j) {document.querySelector('#tags'+i).onclick = function(e){
					console.log('removetag', tags[j]);
					let value = tags[j];
					tags = tags.filter(item => item !== value);
					redoTags(true);
				}})(i)
			}
	addDropDown(taglist);
	} else removeDropDown();

}

function redoTags(edit){
	var i;
	let w = document.querySelector('#tags');

	
	let html = 'tags: ';

	for (i in tags) {
		if (edit) html += `<scan  class="tagpillfalse">${tags[i]}<button id="tags${i}" class="reset-button">[x]</button></scan>`;
		else html +=  `<button class="tagpill">${tags[i]}</button>`;
	}	
	w.innerHTML = html;
	if (edit) {
		for (i in tags) {
				(function (j) {document.querySelector('#tags'+i).onclick = function(e){
					console.log('removetag', tags[j]);
					let value = tags[j];
					tags = tags.filter(item => item !== value);
					redoTags(true);
				}})(i)
			}
	}
}

//-------------GET----------------
var getTid = function() {
	document.querySelector('#get').style.display = "none";
	document.querySelector('#put').style.display = "block";
	document.querySelector('#cancel').style.display = "block";
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  var currUrl = tabs[0].url;
		chrome.storage.local.get({homeTab:""}, function(items){  
			chrome.tabs.sendMessage(items.homeTab, {action : 'getTid', data:{url:currUrl}, opts:"edit"},function(res){
				let y = document.querySelector('#content');
				let x = document.querySelector('#edit');
				y.style.display = "none";
				taglist = (JSON.parse(res.aux)).taglist;
				puttags(res.data,true);
				//console.log("res.data ",res.data);
				x.value=(JSON.parse(res.data)).text;
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
	document.querySelector('#get').style.display = "block";
	document.querySelector('#put').style.display = "none";
	document.querySelector('#cancel').style.display = "none";
	//console.log("emptybox ");
	//x.value="";
	//y.style.display = "block";
	x.style.display = "none";
							
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		  var currUrl = tabs[0].url;
		  	chrome.tabs.sendMessage( tabs[0].id, {action : 'getMeta'}, function (meta)	{ 
				console.log("meta",meta.description,meta.mediaImage);
			chrome.storage.local.get({homeTab:""}, function(items){  
				chrome.tabs.sendMessage(items.homeTab, {action : 'putTid', 
					data:{url:currUrl, tags:JSON.stringify(tags),description:meta.description, mediaImage:meta.mediaImage, text:x.value, title:tabs[0].title, favIconUrl:tabs[0].favIconUrl}, opts:"put"},function(res){
					//console.log(res);
					chrome.tabs.sendMessage(items.homeTab, {action : 'getTid', data:{url:currUrl},opts:"render"},function(res){
						y.innerHTML=(JSON.parse(res.data)).text;
						taglist = (JSON.parse(res.aux)).taglist;
						puttags(res.data);
						y.style.display = "block";
						x.value = "";
						//console.log("reloaded new");
					});
					
					
					//console.log("res.data ",res.data);(document.querySelector('#content')).innerHTML=res.data;
				});
			});
		});
	});
});	

//-----------CANCEL--------------

document.querySelector('#cancel').addEventListener('click', function() {
	let x = document.querySelector('#edit');
	let y = document.querySelector('#content');
	document.querySelector('#get').style.display = "block";
	document.querySelector('#put').style.display = "none";
	document.querySelector('#cancel').style.display = "none";
	//console.log("emptybox ");
	x.value="";
	x.style.display = "none";
	y.style.display = "block";
	restorTags();
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
		  current.tags = JSON.stringify(tags);
			if (current.url && editvalue) chrome.tabs.sendMessage(items.homeTab, {action : 'putTid', opts:"puts",data:current},function(res){
				//console.log(res);
			});
			chrome.tabs.sendMessage(tabs[0].id, {action : 'getMeta'}, function (meta)	{ 
				console.log("meta",meta.description,meta.mediaImage);
			current.mediaImage=meta.mediaImage;
			current.description=meta.description;
			current.url = tabs[0].url;
			current.favIconUrl=tabs[0].favIconUrl;
			current.title=tabs[0].title;
			current.text = "";
			current.tags = [];
			//z.src=tabs[0].favIconUrl;
			chrome.tabs.sendMessage(items.homeTab, {action : 'getTid',data:{url:current.url} ,opts:"render"},function(res){
				console.log("res.aux ",res.aux);
				taglist = (JSON.parse(res.aux)).taglist;
				y.innerHTML=(JSON.parse(res.data)).text;
				puttags(res.data);
				y.style.display = "block";
				
			});
	  });
  });
  //console.log(tabs[0].url);
}


//	chrome.tabs.sendMessage(tab.id, {action : 'getMeta'}, function (meta)	{ 
//			 console.log("meta",meta.description,meta.mediaImage);
			 
//	})
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