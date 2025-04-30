/*\
title: $:/bj/tc/setapikey.js
type: application/javascript
module-type: library
tags: $:/tags/tiddlyclip
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

let loadModule = require("$:/plugins/bj/unchane/mimport.js").bjModuleLoader.loadModule;

var keyapi
(async () => {
if (!keyapi) keyapi = await loadModule ("$:/plugins/bj/simplifai/setting.mjs");
})() 


exports.name = "setApiKey";

exports.run = async function(key) {
	keyapi.API_KEY.value = key;
}
})();
