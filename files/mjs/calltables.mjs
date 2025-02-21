/*\
title: $:/plugins/bj/simplifai/calltables.mjs
type: application/javascript
module-type: library
\*/
const {html,useSignal,useComputed} =  await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs")
const {getTiddlerData,filterTiddlers,parseStringArray} = await import ("$:/plugins/bj/tiddlywiki-preact/storeutils.js")

const {getTextReference} = await import ("$:/plugins/bj/tiddlywiki-preact/store.js")
const { tables} =  await import ("$:/plugins/bj/simplifai/tables.mjs")
 
function App({__state, hashtags}) {
  console.log(hashtags)
  const tids=parseStringArray(hashtags)
   console.log(tids)
  const initialHashtagData = {}
  for (const tid of tids) {
  let name = getTextReference(`${tid}!!caption`,tid)
  initialHashtagData[name]=getTiddlerData(tid)
  }
  console.log(initialHashtagData)
  
  return html`
<${tables} hashtagData=${initialHashtagData} selectedHashtags=${__state["tags"]}  />
  `;
}



export  {App as start};