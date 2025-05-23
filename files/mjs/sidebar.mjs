/*\
title: $:/plugins/bj/simplifai/sidebar.mjs
type: application/javascript
module-type: library
\*/
const {ibutton}=await import("$:/plugins/bj/simplifai/iconbutton.mjs")
const {html, render, useState} = await import ("$:/plugins/bj/unchane/preactsignal.mjs");
const {setfield,deletetiddler} = await import ("$:/plugins/bj/unchane/utils.mjs");

const {API_KEYS,aiType} = await import("$:/plugins/bj/simplifai/setting.mjs")

const {init} = await import ("$:/plugins/bj/unchane/towidget.mjs")

function mssg(modal, name, msg) {return {$message:"tm-modal", $param:modal, title:name, message:msg}}
let chatsmodal="$:/plugins/bj/simplifai/SelectModal", chatsname="chats",  chatsmsg="choose chat"	
let tagsmodal="$:/plugins/bj/simplifai/tagsModal", tagsname="tags",  tagsmsg="choose tags"	
let paramsmodal="$:/plugins/bj/simplifai/paramsModal", paramsname="params and roles",  paramsmsg="choose params"	
let forbiddenmodal="$:/plugins/bj/simplifai/forbiddenModal", forbiddenname="Download to Use",  forbiddenmsg=""	

const fobiddenURL ="..."//add url, to block usage 

const warnings ={gemini:"WARNING remember that data that are typed into gemini (and tiddlers that are read by gemini) are sent to google and in some cases are used by them to train the AI models and may be seen by their employees.",
				 claude:"WARNING remember that data that are typed into cluade (and tiddlers that are read by claude) are sent to Anthropic"
}
export function sidebar({history,__pwidget}) {
	const [extended, setExtended] = useState(false)
	const [hidKeyEntry, setHidKeyEntry] = useState(true);
	const [hidTemp, setHidTemp] = useState(true);
	const {sendmessage} = init(__pwidget)
	function invokeDelete(chat){
		if (window.confirm(`delete this chat`)){
			deletetiddler({$tiddler:chat})
			deletetiddler({$tiddler:"$:/temp/bj/simplifai/CurrentGeminiChat"})
			
		} 
	}
	return html`
	${!hidKeyEntry && html`
	  <div class="bj_warning-overlay"><div style="padding:1em;width:70%;background:yellow">${warnings[aiType.value]}</div></div>
	`}
    <div class="aic_sidebar">
		<div class="bottom-item btn">
		    <${ibutton}  name="hamburger_icon" alt="menu icon"  
			   onclick=${() => setExtended((prev) => !prev)}/>
		</div>
		<div class="bottom-item btn">
		    <${ibutton}  name="trashcan_icon" alt="trashcan icon"  
			   onclick=${() => (invokeDelete(__pwidget.toTiddlers['history']))}/>
			${extended ? html`<span>delete chat</span> `: null}
		</div>
		<div class="bottom-item btn">
		    <${ibutton}  name="cog_icon" alt="sysrole icon"  
			   onclick=${() => (sendmessage(mssg(paramsmodal, paramsname, paramsmsg)))}/>
			${extended ? html`<span>settings</span> `: null}
		</div>		<div class="bottom-item btn">
		    <${ibutton}  name="colorwheel_icon" alt="colorwheel icon"  
			   onclick=${() => (sendmessage(mssg(tagsmodal, tagsname, tagsmsg)))}/>
			${extended ? html`<span>add tags</span> `: null}
		</div>
		<div class="bottom-item btn">
		    <${ibutton}  name="tids_icon" alt="chats icon"  
			   onclick=${() => (sendmessage(mssg(chatsmodal, chatsname, chatsmsg)))}/>
			${extended ? html`<span>chats</span> `: null}
		</div>
  		<div class="bottom-item btn">
		    <${ibutton}  name="plus_icon" alt="newchat icon"  
			   onclick=${() => {setfield({$tiddler:"$:/temp/bj/simplifai/CurrentGeminiChat",text:"$:/temp/bj/newChat"})}}/>
			${extended ? html`<span>new</span> `: null}
		</div>

		<div class="bottom-item btn">
		  <${ibutton} name="key_icon" alt="enter key" visable="0.5"
		  onclick=${() => {if (window.location.hostname===fobiddenURL) {
			 sendmessage(mssg(forbiddenmodal, forbiddenname, forbiddenmsg))
			 return
			}
			setHidKeyEntry((prev) => !prev)}}/>
		  ${extended ? html`<span>Set Key</span> `: null}
		  ${!hidKeyEntry ? html`
			  <div class='bj_key-entry'>Enter Key:
			  <input autofocus type="password" onchange=${(e) => {
				API_KEYS[aiType.value].value=e.target.value		  
			  }}/>
			  <button onclick=${() => setHidKeyEntry((prev) => !prev)}>[x]</button>
			  </div> 
		  `: null}
		</div>
	</div>
  `;
}
