/*\
title: $:/bj/tc/aisend.js
type: application/javascript
module-type: library

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

let bjModuleLoader = require("$:/plugins/bj/unchane/mimport.js").bjModuleLoader;

exports.name = "aisend";

let params = {
  "temperature": 0.9,
  "topK": 1,
  "maxOutputTokens": 2048
}

var gemini
(async () => {
if (!gemini) gemini =await bjModuleLoader.loadModule ("$:/plugins/bj/simplifai/gemini.mjs");
})() 
var settings
(async () => {
if (!settings) settings = await bjModuleLoader.loadModule("$:/plugins/bj/simplifai/setting.mjs"); 
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
