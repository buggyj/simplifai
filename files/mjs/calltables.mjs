/*\
title: $:/plugins/bj/simplifai/calltables.mjs
type: application/javascript
module-type: library
\*/
const {html,useSignal,useComputed} =  await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs")
const {getTiddlerData,filterTiddlers,parseStringArray} = await import ("$:/plugins/bj/tiddlywiki-preact/storeutils.js")

const {getTextReference} = await import ("$:/plugins/bj/tiddlywiki-preact/store.js")
const { tables} =  await import ("$:/plugins/bj/simplifai/tables.mjs")

function filterObjectKeys(obj, keysToExclude) {
  if (!obj || typeof obj !== 'object') {
    return {}; // Or throw an error, for invalid input
  }

  if (!Array.isArray(keysToExclude)) {
    return { ...obj }; // Or throw an error, for invalid input
  }

  const filteredObject = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && !keysToExclude.includes(key)) {
      filteredObject[key] = obj[key];
    }
  }

  return filteredObject;
}

function App({__state, __pwidget,hashtags}) {
  const tids=parseStringArray(hashtags)
  const initialHashtagData = {}
  for (const tid of tids) {
  let name = getTextReference(`${tid}!!caption`,tid)
  let ignore =  parseStringArray (getTextReference(`${tid}!!ignore`,""))
  initialHashtagData[tid]={name:name,values:filterObjectKeys(getTiddlerData(tid),ignore)}
  }
  
  
  return html`
<${tables} hashtagData=${initialHashtagData} selectedHashtags=${__state["tags"]} __pwidget=${__pwidget}/>
  `;
}



export  {App as start};