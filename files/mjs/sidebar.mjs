/*\
title: $:/plugins/bj/simplifai/sidebar.mjs
type: application/javascript
module-type: library
\*/
const {ibutton}=await import("$:/plugins/bj/simplifai/iconbutton.mjs")
const {html, render, useState} = await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs");
const {API_KEY} = await import("$:/plugins/bj/simplifai/setting.mjs")

const {init} = await import ("$:/plugins/bj/tiddlywiki-preact/towidget.mjs")

function mssg(modal, name, msg) {return `<$action-sendmessage $message="tm-modal" $param="${modal}" title="${name}" message="${msg}"/>`}
let chatsmodal="$:/plugins/bj/simplifai/SelectModal", chatsname="chats",  chatsmsg="choose chat"	
let rolemodal="$:/plugins/bj/simplifai/roleModal", rolename="role",  rolemsg="choose role"	
let paramsmodal="$:/plugins/bj/simplifai/paramsModal", paramsname="params",  paramsmsg="choose params"	

function newChat(){return `<$action-setfield $tiddler="$:/temp/bj/simplifai/CurrentGeminiChat" text="$:/temp/bj/newChat"/>`}

export function sidebar({history,__pwidget}) {
	const [extended, setExtended] = useState(false)
	const [hidKeyEntry, setHidKeyEntry] = useState(true);
	const [hidTemp, setHidTemp] = useState(true);
	const {dispatchEvent, invokeActionString} = init(__pwidget)
	
	return html`
	${!hidKeyEntry && html`
	<div class="bj_key-entry-overlay "></div>
	`}
    <div class="aic_sidebar">
		<div class="bottom-item btn">
		    <${ibutton}  name="hamburger_icon" alt="menu icon"  
			   onclick=${() => setExtended((prev) => !prev)}/>
		</div>
		<div class="bottom-item btn">
		    <${ibutton}  name="colorwheel_icon" alt="sysrole icon"  
			   onclick=${() => (invokeActionString(mssg(rolemodal, rolename, rolemsg)))}/>
			${extended ? html`<span>select role</span> `: null}
		</div>
		<div class="bottom-item btn">
		    <${ibutton}  name="cog_icon" alt="sysrole icon"  
			   onclick=${() => (invokeActionString(mssg(paramsmodal, paramsname, paramsmsg)))}/>
			${extended ? html`<span>select role</span> `: null}
		</div>
		<div class="bottom-item btn">
		    <${ibutton}  name="tids_icon" alt="chats icon"  
			   onclick=${() => (invokeActionString(mssg(chatsmodal, chatsname, chatsmsg)))}/>
			${extended ? html`<span>select chat</span> `: null}
		</div>
  		<div class="bottom-item btn">
		    <${ibutton}  name="plus_icon" alt="newchat icon"  
			   onclick=${() => {invokeActionString(newChat())}}/>
			${extended ? html`<span>new chat</span> `: null}
		</div>

		<div class="bottom-item btn">
		  <${ibutton} name="key_icon" alt="enter key" visable="0.5"
		  onclick=${() => setHidKeyEntry((prev) => !prev)}/>
		  ${extended ? html`<span>Set Key</span> `: null}
		  ${!hidKeyEntry ? html`
			  <div class='bj_key-entry'>Enter Key:
			  <input autofocus type="password" onchange=${(e) => {
				API_KEY.value=e.target.value		  
			  }}/>
			  <button onclick=${() => setHidKeyEntry((prev) => !prev)}>[x]</button>
			  </div> 
		  `: null}
		</div>
	</div>
  `;
}


      