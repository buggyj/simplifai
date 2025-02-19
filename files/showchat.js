/*\
title: $:/plugins/bj/simplifai/showchat.js
type: application/javascript
module-type: macro
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

const marked = require("$:/plugins/bj/plugins/marked/markdown.js");

function getimg(tidimage){
    return `data:image/png;base64,${$tw.wiki.getTiddlerText(tidimage)}`
}
exports.name = "showchat";

exports.params = [
	{name: "chattid"}
];
exports.run = function renderHistory(chattid) {
    var history = this.wiki.getTiddlerDataCached(chattid,{})
    return "\\rules only entity html\n"+ history.map((message) => {
        if (message.role === "user") {
            return `
                <div class="result-title">
                    <img src="${getimg('$:/plugins/bj/simplifai/user_icon.png')}"/>
                    <pre style="background: #eafffe;"><code>${$tw.utils.htmlEncode(message.parts[0].text)}</code></pre>
                </div>
            `;
        } else {
            return `
                <div class="result-data">
                    <img src="${getimg('$:/plugins/bj/simplifai/gemini_icon.png')}"/>
                    ${message.parts.map(part => `<p>${marked(part.text)}</p>`).join('')}
                </div>
            `;
        }
    }).join('');
}
})();
