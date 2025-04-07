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
const {setfield} = await import ("$:/plugins/bj/unchane/utils.mjs");



const save = {$message:"tm-save-wiki"}

let  ToTid = function(){ setfield({$tiddler:"$:/theme", text:"$:/themes/tiddlywiki/vanilla"});setfield({$tiddler:"$:/layout", text:"$:/core/ui/PageTemplate"})}

let  FromTid = function(){setfield({$tiddler:"$:/theme", text:"$:/themes/bj/cssreset"});setfield({$tiddler:"$:/layout", text:"$:/plugins/bj/simplifai/AiApp"})}
 
let  nokey = {$message:"tm-modal", $param:"$:/plugins/bj/simplifai/nokeyModal", title:"", message:""}

const makeTitlePrompt = 'Give this chat a title, as summary of approx 60 to 80 characters, but do not mention "chat title", . Give only you top answer.'


function modStartString(str) {
  if (str=="$:/temp/bj/newChat") {
    return "New Chat"
  }
  return str;
}

function ai({__state,__pwidget,enabletools}) {
	const {sendmessage} = init(__pwidget)
	const addtools = (enabletools ==="y")
	function switchMode() {
		if (getTextReference("$:/layout") == "$:/core/ui/PageTemplate") FromTid()
		else ToTid()
	} 
	const onNoKey = () => {sendmessage(nokey)}
	async function  invokeRename(){
		const newtitle={title:""}
		if ( __state["history"].value.length==0) return;//nothing to base title on.
		if (!API_KEY.value){onNoKey();return}
		const error = await runChat(makeTitlePrompt, __state["history"],"",__state["params"],__state["prefixes"],__pwidget,addtools,false,newtitle)
		if (error) return; 
		chatRename(newtitle.title,__pwidget.toTiddlers['history'],__pwidget)
		busy.value=false
	}
	
	return html`
	<div class="aic_nav" style="background:${ (() => {if (busy.value) return "pink"; return "#e2e6eb";})() }"> 
		<${ibutton} class='aic_nav__btn' name="exit_icon" 
					alt="menu icon"  onclick=${() =>switchMode()}/>
		<p>Gemini<span style="color:red;" onclick=${()=>invokeRename()}>@</span> ${modStartString(__pwidget.toTiddlers['history'])}</p>
		<div><${ibutton} name="dirty_icon" alt="" class="show-on-dirty" onclick=${()=>sendmessage(save)}/>
		<${ibutton} name="clean_icon" alt="" class="show-on-clean"/></div>
	</div>
	<div class="aic_content_container">
		    <${sidebar} __pwidget=${__pwidget} history=${__state["history"]}/><${Main} history=${__state["history"]} sysRole=${__state["sysRole"]} params=${__state["params"]} prefixes=${__state["prefixes"]} addtools=${addtools} __pwidget=${__pwidget}/>
	</div>
  `;
}

//check binding for
export var psignals = [":history", "sysRole",":params",":prefixes"]
export  {ai as start};