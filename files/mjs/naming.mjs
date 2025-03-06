/*\
title: $:/plugins/bj/simplifai/naming.mjs
type: application/javascript
module-type: library
\*/
const {init} = await import ("$:/plugins/bj/unchane/towidget.mjs")
const {getTextReference,setTextReference} = await import('$:/plugins/bj/unchane/store.js')
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
	
export function newChatName(prompt,__pwidget) {
    const {invokeActionString} = init(__pwidget)
   
	let title = makeTitle(prompt)
	title = uniquetitle(title)
	// create a unique title from the returned title
	// by checking if title exist and if so appending a number
	invokeActionString(`<$action-sendmessage $message="tm-rename-tiddler" from="$:/temp/bj/newChat" to="""${title}""" renameInTags="no" renameInLists="no"/>`)
	// rename $:/temp/bj/newChat to the title
	invokeActionString(`<$action-setfield $tiddler="$:/temp/bj/simplifai/CurrentGeminiChat" text="""${title}"""/>`)
}
	
export function chatRename(newname, oldname,__pwidget) {
    const {invokeActionString} = init(__pwidget)
   
	let title = uniquetitle(newname)
	//changing title will make a complete copy
	setTextReference(`${oldname}!!title`,title)
	setTextReference("$:/temp/bj/simplifai/CurrentGeminiChat",title)
	deleteTiddler(oldname)
	
	//invokeActionString(`<$action-sendmessage $message="tm-rename-tiddler" from="""${oldname}""" to="""${title}""" renameInTags="no" renameInLists="no"/>`)
	
	//invokeActionString(`<$action-setfield $tiddler="$:/temp/bj/simplifai/CurrentGeminiChat" text="""${title}"""/>`)
}


