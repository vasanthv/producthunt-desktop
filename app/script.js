const fs = require('fs');
const path = require('path');
const url = require('url');
const { shell } = require('electron');
// my changes to producthunt's css
const producthuntCSS = fs.readFileSync(path.join(__dirname, '/producthunt.css')).toString();

// Main webview this is the only webview
const webview = document.getElementById('webview');
webview.addEventListener('dom-ready', function() {
	console.log('--DOM Ready');
	//Called only on initial load
	setTimeout(() => {
		webview.getWebContents().executeJavaScript('window.localStorage').then((result) => {
			// got Product Hunt localstorage here
			// we can decide to show login or feed based on this values
			if (result.ajs_user_traits) {
				const userInfo = JSON.parse(result.ajs_user_traits);
				if (userInfo.user_id) phApp.userId = userInfo.user_id;
				if (userInfo.username) phApp.userName = userInfo.username;
				phApp.userInfo = userInfo;
			}
		});
		webview.getWebContents().executeJavaScript('document.querySelector("a[class^=\'notificationsButton\']") ? document.querySelector("a[class^=\'notificationsButton\']").textContent : 0').then((result) => {
			phApp.notificationCount = result;
		});
	}, 1000);
	webview.insertCSS(producthuntCSS);
	webview.style.opacity = '1';
	phApp.hideLoading();
});
webview.addEventListener('did-navigate-in-page', (e) => {
	console.log('--Did Nav');
	phApp.hideLoading();
	webview.style.opacity = '1';
});
webview.addEventListener('new-window', (e) => {
	const protocol = url.parse(e.url).protocol
	if (protocol === 'http:' || protocol === 'https:') {
		shell.openExternal(e.url)
	}
});

const phApp = new Vue({
	el: '#navBar',
	data: {
		isLoggedIn: false,
		page: 'home', // home | notifications | search | profile
		userInfo: {},
		userId: null,
		userName: null,
		notificationCount: 0
	},
	methods: {
		homeClick: function() {
			searchApp.showSearch = false;
			webview.style.opacity = '0';
			webview.loadURL('https://www.producthunt.com');
			this.page = 'home';
			this.showLoading();
		},
		bellClick: function() {
			searchApp.showSearch = false;
			webview.style.opacity = '0';
			webview.loadURL('https://www.producthunt.com/notifications');
			this.page = 'notifications';
			this.showLoading();
		},
		searchClick: function() {
			this.page = 'search';
			searchApp.showSearch = true;
			searchApp.query = '';
			setTimeout(() => {
				document.querySelector('#search input').focus();
			}, 0);
		},
		refreshClick: function() {
			webview.style.opacity = '0';
			this.showLoading();
			webview.reload();
		},
		exitClick: function() {
			if (confirm("Are you sure you want to logout?")) {
				webview.style.opacity = '0';
				webview.getWebContents().executeJavaScript('window.localStorage.ajs_user_traits = "{}"').then((result) => {
					webview.loadURL('https://www.producthunt.com/logout');
					this.userInfo = {};
					this.userId = null;
					this.userName = null;
				});
				this.page = 'home';
				this.showLoading();
			}
		},
		profileClick: function() {
			searchApp.showSearch = false;
			webview.style.opacity = '0';
			webview.loadURL('https://www.producthunt.com/@' + this.userName);
			this.page = 'profile';
			this.showLoading();
		},
		showLoading: function() {
			document.getElementById('loading').style.display = 'block';
		},
		hideLoading: function() {
			document.getElementById('loading').style.display = 'none';
		}
	}
});
const searchApp = new Vue({
	el: '#search',
	data: {
		showSearch: false,
		query: ''
	},
	methods: {
		onSearch: function() {
			console.log(this.query);
			webview.style.opacity = '0';
			phApp.showLoading();
			webview.loadURL('https://www.producthunt.com/search?q=' + this.query);
		},
		closeSearch: function() {
			console.log('-----Close');
			this.showSearch = false;
		}
	}
});
