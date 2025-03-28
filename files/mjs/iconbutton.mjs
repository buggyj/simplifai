/*\
title: $:/plugins/bj/simplifai/iconbutton.mjs
type: application/javascript
module-type: library
\*/
const {html} = await import ("$:/plugins/bj/unchane/preactsignal.mjs");
const {getTextReference} =  await import("$:/plugins/bj/unchane/store.js");


function geticon(iconname) {
	let txtref="$:/plugins/bj/simplifai/"+iconname+".png"
	return "data:image/png;base64,"+getTextReference(txtref)
}

export const ibutton =function({name,visable=1,...props}) {
	return html`<img src=${geticon(name)} style="opacity:${visable}" ...${props}/>`
}