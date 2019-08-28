const fs = require('fs');
const path = require('path');
const url = require('url');
const { shell } = require('electron');
// my changes to producthunt's css
const producthuntCSS = fs.readFileSync(path.join(__dirname, '/producthunt.css')).toString();

// Main webview this is the only webview
const webview = document.getElementById('webview');
webview.addEventListener('dom-ready', function() {
	//Called only on initial load
	webview.getWebContents().executeJavaScript('window.localStorage').then((result) => {
		// got Product Hunt localstorage here
		// we can decide to show login or feed based on this values
	});
	webview.insertCSS(producthuntCSS);
	webview.style.opacity = '1';
});
webview.addEventListener('will-navigate', (e) => {
	console.log('will nave');
	webview.style.opacity = '0';
});
webview.addEventListener('did-navigate-in-page', (e) => {
	console.log('did nave');
	console.log(e);
})
webview.addEventListener('new-window', (e) => {
	const protocol = url.parse(e.url).protocol
	if (protocol === 'http:' || protocol === 'https:') {
		shell.openExternal(e.url)
	}
})
