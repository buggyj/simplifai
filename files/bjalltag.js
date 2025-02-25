/*\
title: $:/bj/modules/filters/bjalltag.js
type: application/javascript
module-type: filteroperator

AND tags filter

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

  exports.bjalltag = function(source,operator,options) {
	var results = [];
    var start = true
	source(function(tiddler,title) {
      const result = [];
       if (start) {start=false; results=options.wiki.getTiddlersWithTag(title);return}
      const set2 = new Set(options.wiki.getTiddlersWithTag(title)); // Using a Set for faster lookups in arr2
   
      for (const element of results) {
		if (set2.has(element)) {
		  result.push(element);
		}
      } 
      results = result 
    })        
	return results;
  }
})();