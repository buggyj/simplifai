/*\
title: $:/plugins/bj/simplifai/ai.mjs
type: application/javascript
module-type: library
\*/
const {signal,computed} = await import ("$:/plugins/bj/unchane/preactsignal.mjs")
const {getTextReference,getJsonTxtRef} = await import('$:/plugins/bj/unchane/store.js')

const {runChat:geminiRunChat,Search:geminiSearch} = await import ("$:/plugins/bj/simplifai/gemini.mjs")
const {runChat:claudeRunChat,Search:cluadeSearch} = await import ("$:/plugins/bj/simplifai/claude.mjs")
const {runChat:gptRunChat,Search:gptSearch} = await import ("$:/plugins/bj/simplifai/gpt.mjs")


export const {busy,Search,aiType,openType} = await import ("$:/plugins/bj/simplifai/signals.mjs")


const gemAIextra = `REMEMBER to use **tool_code** when CALLING TOOLS and The correct way to represent multiline strings in the Python code before calling the API is to use triple-quoted strings ('''...''' or """...""").
This preserves the line breaks directly within the string in the Python code, resulting in clean line breaks in the final tiddler text.`;


export function runChat(prompt, history, sysRole, toolset, params, prefixes, aModel, __pwidget, addtools, addsystool, destination) {
	
	if (aiType.value === 'gemini') {
	  var sysrole = sysRole + gemAIextra; console.log(sysrole);
	  return geminiRunChat(prompt, history, sysrole, toolset, params, prefixes, aModel, __pwidget, addtools, addsystool, destination);
	}
	else if (aiType.value === 'gpt') 
		return gptRunChat(prompt, history, sysRole, toolset, params, prefixes, aModel, __pwidget, addtools, addsystool, destination);
	return claudeRunChat(prompt, history, sysRole, toolset, params, prefixes, aModel, __pwidget, addtools, addsystool, destination);
}

export function goChat(prompt, history,  __pwidget, addsystool, destination) {
	var chatTid = __pwidget.toTiddlers['history'];
	var sysRole = getTextReference(getTextReference(`${chatTid}!!sysrole`));
	var toolset = getTextReference(`${chatTid}!!systools`);
	var params = getJsonTxtRef(getTextReference(`${chatTid}!!sysparams`));
	var prefixes = getJsonTxtRef(getTextReference(`${chatTid}!!sysprefix`));
	var aModel = getTextReference(getTextReference(`${chatTid}!!sysmodel`));
	var addtools = (getTextReference(`${chatTid}!!tools`) ==='y');

	if (aiType.value === 'gemini') {
	  var sysrole = sysRole + gemAIextra; console.log(sysrole);
	  addtools = (addsystool?false:addtools);
	  return geminiRunChat(prompt, history, sysrole, toolset, params, prefixes, aModel, __pwidget, addtools, addsystool, destination);
	} else if (aiType.value === 'gpt') 
		return gptRunChat(prompt, history, sysRole, toolset, params, prefixes, aModel, __pwidget, addtools, addsystool, destination);
	return claudeRunChat(prompt, history, sysRole, toolset, params, prefixes, aModel, __pwidget, addtools, addsystool, destination);
}


