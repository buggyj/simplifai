/*\
title: $:/bj/tc/callsend.js
type: application/javascript
module-type: library
tags: $:/tags/tiddlyclip
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";



exports.name = "callSend";

exports.run = function(answer,question,...options) {
	console.log(options)
	tiddlyclip.macro["send"](options[0],options[1],answer)//mode, title, answser
}
})();
