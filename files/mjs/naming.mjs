/*\
title: $:/plugins/bj/simplifai/naming.mjs
type: application/javascript
module-type: library
\*/
const {init} = await import ("$:/plugins/bj/unchane/towidget.mjs")
const {getTextReference,setTextReference} = await import('$:/plugins/bj/unchane/store.js')
const {setfield} = await import ("$:/plugins/bj/unchane/utils.mjs");
const {getTiddler,deleteTiddler} = await import ("$:/plugins/bj/unchane/storeutils.js")
const makeTitle= function(prompt) {
	if (!prompt.length) return "New Chat";
	let title = "";
	
	let words = prompt.replaceAll('\n',"").match(/\b\w{1,}\b/g) || []; 
	for (let word of words) {
		if ((title + " " + word).trim().length > 60) break;
		title = (title + " " + word).trim();
	}
	return title.length ? title.charAt(0).toUpperCase() + title.slice(1) : "New Chat";
}

 const tiddlerExists= function(tidname) {

		var tiddler = getTiddler(tidname);
		return(!!tiddler);
}

const uniquetitle = function(baseTitle,ext) {
	var i,dot="";
	baseTitle =  baseTitle.replaceAll('\n',"").replace(/#|<|>|\:|\"|\||\?|\*|\/|\\|\^/g,"_");
	if (ext) dot = ".";
	ext = ext ||"";
	var c = 0,
	title = baseTitle +dot+ ext;
	while(tiddlerExists(title) ) {
		title = baseTitle + "-" + (++c) +dot+ ext;
	}
	return title;
}
	
export function newChatName(prompt) {
   
	let title = makeTitle(prompt)
	chatRename(title,"$:/temp/bj/newChat")
}
	
export function chatRename(newname, oldname) {
   
	let title = uniquetitle(newname)
	//changing title will make a complete copy
	setTextReference(`${oldname}!!title`,title)
	setTextReference("$:/temp/bj/simplifai/CurrentGeminiChat",title)
	deleteTiddler(oldname)
}


