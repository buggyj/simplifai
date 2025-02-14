/*\
title: $:/plugins/bj/aiclone/iconbutton.mjs
type: application/javascript
module-type: library
\*/
const {html} = await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs");
const {getTextReference} =  await import("$:/plugins/bj/tiddlywiki-preact/store.js");


function geticon(iconname) {
	let txtref="$:/plugins/bj/aiclone/"+iconname+".png"
	return "data:image/png;base64,"+getTextReference(txtref)
}

export const ibutton =function({name,visable=1,...props}) {console.log(name)
	return html`<img src=${geticon(name)} style="opacity:${visable}" ...${props}/>`
}