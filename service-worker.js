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
	chrome.tabs.sendMessage(tab.id, {action : 'getTid', data:{pageRef:tab.url},opts:"render"},function(res){
		if (res) chrome.storage.session.set({'conected': tab.title, 'homeTab':tab.id}, function() {
			console.log("connected var set");

			});
	  });
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));