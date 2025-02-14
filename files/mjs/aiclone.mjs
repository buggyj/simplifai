/*\
title: $:/plugins/bj/aiclone/aiclone.mjs
type: application/javascript
module-type: library
\*/

const {html, render} = await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs");

const { sidebar } = await import ('$:/plugins/bj/aiclone/sidebar.mjs');
 const { Main } = await import ('$:/plugins/bj/aiclone/main.mjs');
const {ibutton}=await import("$:/plugins/bj/aiclone/iconbutton.mjs")
const {getTextReference} = await import('$:/plugins/bj/tiddlywiki-preact/store.js')
const {init} = await import ("$:/plugins/bj/tiddlywiki-preact/towidget.mjs")

let  ToTid= `<$action-setfield $tiddler="$:/theme" text="$:/themes/tiddlywiki/vanilla"/><$action-setfield $tiddler="$:/layout" text="$:/core/ui/PageTemplate"/>`

let  FromTid= `<$action-setfield $tiddler="$:/theme" text="$:/themes/bj/cssreset"/><$action-setfield $tiddler="$:/layout" text="GeminiApp"/>`


function ai({__state,__pwidget}) {
const {invokeActionString} = init(__pwidget)
function switchMode() {
if (getTextReference("$:/layout") == "$:/core/ui/PageTemplate") invokeActionString(FromTid)
 else invokeActionString(ToTid)
} 
	return html`
	<div class="aic_nav"> 
		<${ibutton} class='aic_nav__btn' name="exit_icon" 
					alt="menu icon"  onclick=${() =>switchMode()}/>
		<p>Gemini ${__pwidget.toTiddlers['history']}</p>
		<${ibutton} name="user_icon" alt="" />
	</div>
	<div class="aic_content_container">
		    <${sidebar} __pwidget=${__pwidget} history=${__state["history"]}/><${Main} history=${__state["history"]} __pwidget=${__pwidget}/>
	</div>
  `;
}

//check binding for
export var psignals = [":history"]
export  {ai as start};