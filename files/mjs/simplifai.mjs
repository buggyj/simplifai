/*\
title: $:/plugins/bj/simplifai/simplifai.mjs
type: application/javascript
module-type: library

\*/



const {html, render, signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs");
const { sidebar } = await import ('$:/plugins/bj/simplifai/sidebar.mjs');
const { Main } = await import ('$:/plugins/bj/simplifai/main.mjs');
const {ibutton}=await import("$:/plugins/bj/simplifai/iconbutton.mjs")
const {getTextReference,setTextReference,getJsonTxtRef} = await import('$:/plugins/bj/unchane/store.js')
const {init} = await import ("$:/plugins/bj/unchane/towidget.mjs")
const {busy,runChat,aiType} = await import ("$:/plugins/bj/simplifai/ai.mjs")
const {chatRename} = await import('$:/plugins/bj/simplifai/naming.mjs')
const {API_KEY} = await import("$:/plugins/bj/simplifai/setting.mjs"); 
const {setfield} = await import ("$:/plugins/bj/unchane/utils.mjs");



const save = {$message:"tm-save-wiki"}



let  ToTid = function(){ setfield({$tiddler:"$:/theme", text:"$:/themes/tiddlywiki/vanilla"});setfield({$tiddler:"$:/layout", text:"$:/core/ui/PageTemplate"})}

let  FromTid = function(){setfield({$tiddler:"$:/theme", text:"$:/themes/bj/cssreset"});setfield({$tiddler:"$:/layout", text:"$:/plugins/bj/simplifai/AiApp"})}
 
let  nokey = {$message:"tm-modal", $param:"$:/plugins/bj/simplifai/nokeyModal", title:"", message:""}

const makeTitlePrompt = 'Give this chat a title, as summary of approx 60 to 80 characters, but do not mention "chat title", . Give only you top answer.'

let AIName = "Gemini"

function modStartString(str) {
  if (str=="$:/temp/bj/newChat") {
    return "New Chat"
  }
  return str;
}

function ai({__state,__pwidget}) {
	const {sendmessage} = init(__pwidget)
	
	if (__state['model'].value.includes("claude")) {
		aiType.value="claude"
		AIName = "Claude"
		setTextReference("$:/temp/bj/simplifai/claude/color.css!!tags","$:/tags/Stylesheet")
		setTextReference("$:/temp/bj/simplifai/gemini/color.css!!tags","")
	}
	else {
		aiType.value="gemini"
		AIName = "Gemini";
		setTextReference("$:/temp/bj/simplifai/gemini/color.css!!tags","$:/tags/Stylesheet")
		setTextReference("$:/temp/bj/simplifai/claude/color.css!!tags","")
	}
	function switchMode() {
		if (getTextReference("$:/layout") == "$:/core/ui/PageTemplate") FromTid()
		else ToTid()
	} 
	const onNoKey = () => {sendmessage(nokey)}
	async function  invokeRenameByAI(){
		const newtitle={title:""}
		if ( __state["history"].value.length==0) return;//nothing to base title on.
		if (!API_KEY.value){onNoKey();return}
		const chatTid = __pwidget.toTiddlers['history'];
		const error = await runChat(makeTitlePrompt, __state["history"],"","",getJsonTxtRef(getTextReference(`${chatTid}!!sysparams`)),"",getTextReference(getTextReference(`${chatTid}!!sysmodel`)),__pwidget,false,false,newtitle)
		if (error) return; 
		chatRename(newtitle.title,chatTid)
		busy.value=false
	}
	async function  invokeRename(){
		var newtitle=prompt ("enter name");
		if (newtitle == null || newtitle =="") return;
		chatRename(newtitle,__pwidget.toTiddlers['history'])
	}
	//®✎
	return html`
	<div class="aic_nav" style="background:${ (() => {if (busy.value) return "pink"; return "var(--bj-simplifai-heading)";})() }"> 
		<${ibutton} class='aic_nav__btn' name="exit_icon" 
					alt="menu icon"  onclick=${() =>switchMode()}/>
		<p>${AIName}<span style="color:red;" onclick=${()=>invokeRenameByAI()}>@</span> ${modStartString(__pwidget.toTiddlers['history'])} <span style="color:red;" onclick=${()=>invokeRename()}>✎</span></p> 
		<div><${ibutton} name="dirty_icon" alt="" class="show-on-dirty" onclick=${()=>sendmessage(save)}/>
		<${ibutton} name="clean_icon" alt="" class="show-on-clean"/></div>
	</div>
	<div class="aic_content_container">
		    <${sidebar} __pwidget=${__pwidget} history=${__state["history"]}/><${Main} history=${__state["history"]}  __pwidget=${__pwidget}/>
	</div>
  `;
}

//check binding for
export var psignals = [":history","model"]
export  {ai as start};
