/*\
title: $:/plugins/bj/simplifai/simplifai.mjs
type: application/javascript
module-type: library
\*/

const {html, render, signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs");
const { sidebar } = await import ('$:/plugins/bj/simplifai/sidebar.mjs');
const { Main } = await import ('$:/plugins/bj/simplifai/main.mjs');
const {ibutton}=await import("$:/plugins/bj/simplifai/iconbutton.mjs")
const {getTextReference} = await import('$:/plugins/bj/unchane/store.js')
const {init} = await import ("$:/plugins/bj/unchane/towidget.mjs")
const {busy,runChat} = await import ("$:/plugins/bj/simplifai/gemini.mjs")
const {chatRename} = await import('$:/plugins/bj/simplifai/naming.mjs')
const {API_KEY} = await import("$:/plugins/bj/simplifai/setting.mjs"); 

let  ToTid= `<$action-setfield $tiddler="$:/theme" text="$:/themes/tiddlywiki/vanilla"/><$action-setfield $tiddler="$:/layout" text="$:/core/ui/PageTemplate"/>`

let  FromTid= `<$action-setfield $tiddler="$:/theme" text="$:/themes/bj/cssreset"/><$action-setfield $tiddler="$:/layout" text="$:/plugins/bj/simplifai/AiApp"/>`
 
let  nokey=  `<$action-sendmessage $message="tm-modal" $param="$:/plugins/bj/simplifai/nokeyModal" title="" message=""/>`
const makeTitlePrompt = 'Give this chat a title, as summary of approx 60 to 80 characters, but do not mention "chat title", . Give only you top answer.'
let params = {
  "temperature": 0.9,
  "topK": 1,
  "maxOutputTokens": 2048
}
function ai({__state,__pwidget}) {
	const {invokeActionString} = init(__pwidget)
	function switchMode() {
		if (getTextReference("$:/layout") == "$:/core/ui/PageTemplate") invokeActionString(FromTid)
		else invokeActionString(ToTid)
	} 
	const onNoKey = () => {invokeActionString(nokey)}
	async function  invokeRename(){
		const newtitle={title:""}
		if ( __state["history"].value.length==0) return;//nothing to base title on.
		if (!API_KEY.value){onNoKey();return}
		const error = await runChat(makeTitlePrompt, __state["history"],"",params,__pwidget,newtitle)
		if (error) return; 
		chatRename(newtitle.title,__pwidget.toTiddlers['history'],__pwidget)
		busy.value=false
	}
	return html`
	<div class="aic_nav" style="background:${ (() => {if (busy.value) return "pink"; return "#e2e6eb";})() }"> 
		<${ibutton} class='aic_nav__btn' name="exit_icon" 
					alt="menu icon"  onclick=${() =>switchMode()}/>
		<p>Gemini<span style="color:red;" onclick=${()=>invokeRename()}>@</span> ${__pwidget.toTiddlers['history']}</p>
		<${ibutton} name="user_icon" alt="" />
	</div>
	<div class="aic_content_container">
		    <${sidebar} __pwidget=${__pwidget} history=${__state["history"]}/><${Main} history=${__state["history"]} sysRole=${__state["sysRole"]} params=${__state["params"]} __pwidget=${__pwidget}/>
	</div>
  `;
}

//check binding for
export var psignals = [":history", "sysRole",":params"]
export  {ai as start};