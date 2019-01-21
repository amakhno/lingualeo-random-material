// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let currentTabId = -1;
let generatedValue;
let items = [];

const sync = (addValue) => {
  chrome.storage.sync.get(function (storage) {
    items = storage["known"];
    if (items == null) {
      items = [];
    }
    if (addValue != null && items.indexOf(addValue) === -1) {
      items.push(addValue);
    }    
    chrome.storage.sync.set({"known": items});
  });  
}

const generateRandomValue = () => {
  let min=1; 
  let max=600000;  
  generatedValue = Math.floor(Math.random() * (+max - +min)) + +min; 
  while(items.indexOf(generatedValue) != -1) {
    generatedValue = generatedValue + 1;
  }
}

const updatePage = () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    currentTabId = tabs[0].id;
    generateRandomValue();
    chrome.tabs.update(tabs[0].id, {url: `https://lingualeo.com/ru/jungle/${generatedValue}`});
  });
}

changeColor.onclick = function(_) {
  updatePage();  
};

chrome.tabs.onUpdated.addListener(function (tabId , info) {
  if (info.status === 'complete' && tabId == currentTabId) {
    chrome.tabs.executeScript(tabId, {file: 'check-logic.js'}, (res) => {
      if (res != null && res[0] != null && res[0].toString() == 'true') {
        updatePage();
      } 
      sync(generatedValue);
    });
  }
});