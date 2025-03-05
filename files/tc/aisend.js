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

exports.run = async function(mode,title,question) {
    const {busy,runChat} = gemini
    const answer={title:""}
    const {API_KEY} = settings
    if (!API_KEY.value){return}
    const history ={value:[]}
    const error = await runChat(question, history,"",params,null,answer)
    busy.value=false
    if (error) return; 
   
    tiddlyclip.macro["send"](mode,title,answer.title)
}
})();
