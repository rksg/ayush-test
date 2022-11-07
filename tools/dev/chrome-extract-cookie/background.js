'use strict';

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("Extract cookie extension clicked");
  var source_domain = 'devalto.ruckuswireless.com';

  chrome.storage.sync.get({
    env: 'devalto.ruckuswireless.com'
  }, function(items) {
    source_domain = items.env;
    execute_copy(source_domain, tab);
  });

});

function execute_copy(source_domain, tab) {
  chrome.cookies.getAll({ domain: "localhost" }, function (cookies) {
    cookies.forEach(function (item, i) {
      chrome.cookies.remove({ url: "http://localhost" + cookies[i].path, name: cookies[i].name });
    });
  });

  chrome.cookies.getAll({"domain": source_domain}, function(cookie) {
    // Set to localhost
    cookie.forEach(function (item, index) {
      item.domain = '';
      let localCookieItem = {name: item.name, value: item.value, url: item.url ? item.url : 'http://localhost', path: item.path};
      chrome.cookies.set(localCookieItem);
    });

    var opt = {
      type: "basic",
      title: source_domain + ' cookies are copied to localhost',
      message: '',
      iconUrl: chrome.runtime.getURL("wallet.png")
    };

    chrome.notifications.create('', opt);
    open_localhost(tab);
  });
}

function open_localhost(tab) {
  console.log('Current tab URL = ' + tab.url);

  if (!tab.url) {
    console.log('No URL. Do not open new tab');
    return;
  }

  if (tab.url.indexOf('ruckus') === -1) {
    console.log('Not a ruckus cloud URL. Do not open new tab');
    return;
  }

  let tenantId;
  const regExArr = /\/[tv]\/([0-9a-f]*)/.exec(tab.url);
  if (regExArr && regExArr.length > 0) {
    tenantId = regExArr[1];
  }

  chrome.tabs.create({
    active: true,
    index: tab.index + 1,
    url: `http://localhost:3000/t/${tenantId}`
  }, (tab) => {
    console.log('tab opened');
  });

}
