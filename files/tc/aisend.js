/*\
title: $:/bj/tc/aisend.js
type: application/javascript
module-type: library
tags: $:/tags/tiddlyclip
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

let loadModule = require("$:/plugins/bj/unchane/mimport.js").bjModuleLoader.loadModule;

exports.name = "aisend";

let params = {
  "temperature": 0.9,
  "topK": 1,
  "maxOutputTokens": 2048
}

var gemini
(async () => {
if (!gemini) gemini = await loadModule ("$:/plugins/bj/simplifai/gemini.mjs");
})() 
var settings
(async () => {
if (!settings) settings = await loadModule("$:/plugins/bj/simplifai/setting.mjs"); 
})()
var signals
(async () => {
if (!signals) signals = await loadModule("$:/plugins/bj/simplifai/signals.mjs"); 
})()
exports.run = async function(model,callback,question,...options) {
    const {runChat} = gemini
    const {busy} = signals
    const answer={title:""}
    const {API_KEY} = settings
    if (!API_KEY.value){return}
    const history ={value:[]}
    const error = await runChat(question, history,"","",params,[],model,null,false,true,answer)
    busy.value=false
    if (error) return; 
    if (!tiddlyclip.macro.callback) {
		console.log(callback," not found");
		return;	
	}

	tiddlyclip.macro[callback](answer.title,question,...options)
}
})();
