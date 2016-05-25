chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (tab.url.startsWith("https://maxdone.micromiles.co") && changeInfo.status == "complete") {
		chrome.tabs.insertCSS(tab.id, {
			file : "maxdone.css"
		});
		chrome.tabs.insertCSS(tab.id, {
			file : "maxdone-local.css"
		});
		chrome.tabs.executeScript(tab.id, {
			file : 'maxdone.js'
		});
	}
});
