'use strict';

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("Extract cookie extension clicked");
  var source_domain = 'dev.ruckus.cloud';

  chrome.storage.sync.get({
    env: 'dev.ruckus.cloud'
  }, function(items) {
    source_domain = items.env;
    execute_copy(source_domain, tab);
  });

});

function execute_copy(source_domain, tab) {
  const url = new URL(tab.url)
  const isRAI = /^\/(analytics|ai)/gi.test(url.pathname)
  const domain = isRAI
    ? url.hostname
    : source_domain

  console.log('copying cookies from domain', domain)
  chrome.cookies.getAll({ domain: "localhost" }, function (cookies) {
    cookies.forEach(function (item, i) {
      chrome.cookies.remove({ url: "http://localhost" + cookies[i].path, name: cookies[i].name });
    });
  });

  chrome.cookies.getAll({"domain": domain}, function(cookie) {
    // Set to localhost
    cookie.forEach(function (item, index) {
      item.domain = '';
      let localCookieItem = {name: item.name, value: item.value, url: item.url ? item.url : 'http://localhost', path: item.path};
      chrome.cookies.set(localCookieItem);
    });

    var opt = {
      type: "basic",
      title: domain + ' cookies are copied to localhost',
      message: '',
      iconUrl: chrome.runtime.getURL("wallet.png")
    };

    chrome.notifications.create('', opt);
    if (isRAI) {
      open_localhostRA(tab)
    } else {
      open_localhost(tab);// ACX/R1
    }
  });
}

function open_localhost(tab) {
  console.log('Current tab URL = ' + tab.url);

  if (!tab.url) {
    console.log('No URL. Do not open new tab');
    return;
  }

  if (tab.url.indexOf('ruckus') === -1) {
    console.log('Not a RUCKUS One URL. Do not open new tab');
    return;
  }

  let redirectUrl;

  const matchedIds = tab.url.match(/[a-f0-9]{32}/)
  const matchedMspIds = tab.url.match(/[a-f0-9]{32}\/v\//)

  if (matchedIds) {
    redirectUrl = matchedMspIds
      ? `http://localhost:3000/${matchedIds[0]}/v`
      : `http://localhost:3000/${matchedIds[0]}/t`
  } else {
    console.log('Tenant id not found in url');
    return;
  }

  chrome.tabs.create({
    active: true,
    index: tab.index + 1,
    url: redirectUrl
  }, (tab) => {
    console.log('tab opened');
  });

}
function open_localhostRA(tab) {
  const url = new URL(tab.url)
  console.log('Current tab URL = ' + tab.url);

  if (!tab.url) {
    console.log('No URL. Do not open new tab');
    return;
  }

  chrome.tabs.create({
    active: true,
    index: tab.index + 1,
    url: `http://localhost:3333${url.pathname}${url.search}`
  }, (tab) => {
    console.log('tab opened');
  });
}
