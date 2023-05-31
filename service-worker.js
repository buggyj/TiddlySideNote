function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'connect',
    title: 'connect',
    contexts: ["all"]
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
	console.log("url",tab.url);


  chrome.storage.local.set({'conected': tab.url, 'homeTab':tab.id}, function() {
	  console.log("connected var set");
	  //chrome.runtime.sendMessage({
    //name: 'doit'
  //});  
	  
	  });
  
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));